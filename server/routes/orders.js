import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { validate, schemas } from '../middleware/validate.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { supabase } from '../db/supabase.js';
import irecService from '../services/irecService.js';
import paymentService from '../services/paymentService.js';
import notificationService from '../services/notificationService.js';

const router = Router();
router.use(authenticate);

// GET /api/orders - Get user's orders
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const { status, page = 1, limit = 10 } = req.query;

    let query = supabase
      .from('orders')
      .select('*, order_items(*)', { count: 'exact' })
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    if (status) query = query.eq('status', status);

    const offset = (parseInt(page) - 1) * parseInt(limit);
    query = query.range(offset, offset + parseInt(limit) - 1);

    const { data: orders, count, error } = await query;

    if (error) {
      return res.status(500).json({ message: 'Failed to fetch orders' });
    }

    // Get order counts by status
    const { data: statusCounts } = await supabase
      .from('orders')
      .select('status')
      .eq('user_id', req.user.id);

    const counts = {
      all: count || 0,
      pending: 0,
      paid: 0,
      processing: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
    };

    (statusCounts || []).forEach((o) => {
      if (counts[o.status] !== undefined) counts[o.status]++;
    });

    res.json({
      orders: orders || [],
      total: count || 0,
      page: parseInt(page),
      totalPages: Math.ceil((count || 0) / parseInt(limit)),
      counts,
    });
  })
);

// GET /api/orders/:id
router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    const { data: order, error } = await supabase
      .from('orders')
      .select('*, order_items(*), addresses(*), payment_logs(*)')
      .eq('id', id)
      .eq('user_id', req.user.id)
      .single();

    if (error || !order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json({ order });
  })
);

// POST /api/orders - Create new order (checkout)
router.post(
  '/',
  validate(schemas.createOrder),
  asyncHandler(async (req, res) => {
    const { shippingAddressId, paymentMethod, notes, couponCode } = req.body;

    // Get user's cart items with product details
    const { data: cartItems, error: cartError } = await supabase
      .from('cart_items')
      .select(`
        quantity,
        product_id,
        products:product_id (id, irec_id, name, price, stock_quantity, is_rx, images)
      `)
      .eq('user_id', req.user.id);

    if (cartError || !cartItems || cartItems.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    // Verify stock with iRECPlus in real-time
    const stockCheck = await irecService.verifyBulkStock(
      cartItems.map((item) => ({
        irecId: item.products.irec_id,
        name: item.products.name,
        quantity: item.quantity,
      }))
    );

    const outOfStock = stockCheck.filter((s) => !s.sufficient);
    if (outOfStock.length > 0) {
      return res.status(409).json({
        message: 'Some items are out of stock or have insufficient quantity',
        outOfStock: outOfStock.map((s) => ({
          name: s.name,
          available: s.availableQuantity,
          requested: s.requestedQuantity,
        })),
      });
    }

    // Calculate totals
    const subtotal = cartItems.reduce(
      (sum, item) => sum + (parseFloat(item.products.price) * item.quantity),
      0
    );
    const deliveryFee = subtotal >= 10000 ? 0 : 1500; // Free delivery over ₦10,000
    const discount = 0; // TODO: Apply coupon logic
    const total = subtotal + deliveryFee - discount;

    // Generate order number
    const orderNumber = `MED-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    // Create order in database
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: req.user.id,
        order_number: orderNumber,
        status: 'pending',
        subtotal,
        delivery_fee: deliveryFee,
        discount,
        total,
        shipping_address_id: shippingAddressId,
        payment_method: paymentMethod,
        notes: notes || null,
      })
      .select()
      .single();

    if (orderError) {
      return res.status(500).json({ message: 'Failed to create order' });
    }

    // Create order items
    const orderItems = cartItems.map((item) => ({
      order_id: order.id,
      product_id: item.product_id,
      product_name: item.products.name,
      price: parseFloat(item.products.price),
      quantity: item.quantity,
      subtotal: parseFloat(item.products.price) * item.quantity,
      is_rx: item.products.is_rx,
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) {
      // Cleanup order if items fail
      await supabase.from('orders').delete().eq('id', order.id);
      return res.status(500).json({ message: 'Failed to create order items' });
    }

    // Clear cart
    await supabase.from('cart_items').delete().eq('user_id', req.user.id);

    // Initialize payment
    const payment = await paymentService.initializePayment({
      email: req.user.email,
      amount: total,
      orderId: order.id,
      metadata: {
        customer_name: req.user.full_name,
        customer_phone: req.user.phone,
      },
    });

    // Log payment initiation
    await supabase.from('payment_logs').insert({
      order_id: order.id,
      paystack_reference: payment.reference,
      amount: total,
      status: 'initiated',
    });

    // Send order confirmation notification (in-app + email)
    notificationService
      .notifyOrderConfirmation({
        userId: req.user.id,
        orderId: order.id,
        orderNumber,
        total,
        items: orderItems,
      })
      .catch((err) => console.error('[NOTIFICATION] Order confirmation failed:', err.message));

    res.status(201).json({
      order,
      payment: {
        authorizationUrl: payment.authorizationUrl,
        reference: payment.reference,
      },
    });
  })
);

// POST /api/orders/:id/cancel
router.post(
  '/:id/cancel',
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    const { data: order } = await supabase
      .from('orders')
      .select('id, status, order_number')
      .eq('id', id)
      .eq('user_id', req.user.id)
      .single();

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (!['pending', 'awaiting_payment'].includes(order.status)) {
      return res.status(400).json({
        message: 'Order cannot be cancelled at this stage',
      });
    }

    await supabase
      .from('orders')
      .update({ status: 'cancelled' })
      .eq('id', id);

    // Send order cancellation notification (in-app + email)
    notificationService
      .notifyOrderCancellation({
        userId: req.user.id,
        orderId: order.id,
        orderNumber: order.order_number,
      })
      .catch((err) => console.error('[NOTIFICATION] Order cancellation failed:', err.message));

    res.json({ message: 'Order cancelled successfully' });
  })
);

export default router;
