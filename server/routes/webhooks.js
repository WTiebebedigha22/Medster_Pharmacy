import { Router } from 'express';
import crypto from 'crypto';
import { asyncHandler } from '../middleware/errorHandler.js';
import { supabase } from '../db/supabase.js';
import paymentService from '../services/paymentService.js';
import irecService from '../services/irecService.js';
import config from '../config/index.js';

const router = Router();

// POST /api/webhooks/paystack - Paystack payment webhook
router.post(
  '/paystack',
  asyncHandler(async (req, res) => {
    // Verify webhook signature
    const signature = req.headers['x-paystack-signature'];
    
    if (config.paystack.webhookSecret) {
      const hash = crypto
        .createHmac('sha512', config.paystack.webhookSecret)
        .update(JSON.stringify(req.body))
        .digest('hex');

      if (hash !== signature) {
        return res.status(401).json({ message: 'Invalid signature' });
      }
    }

    const event = req.body;
    
    // Process the event
    const result = await paymentService.handleWebhook(event);
    
    if (result.event === 'payment.success') {
      // Update order status
      const { data: order } = await supabase
        .from('orders')
        .update({
          status: 'paid',
          paystack_reference: result.reference,
          updated_at: new Date().toISOString(),
        })
        .eq('paystack_reference', result.reference)
        .select()
        .single();

      if (order) {
        // Update payment log
        await supabase
          .from('payment_logs')
          .update({
            status: 'success',
            gateway_response: event.data,
          })
          .eq('paystack_reference', result.reference);

        // Create order in iRECPlus
        try {
          const { data: orderItems } = await supabase
            .from('order_items')
            .select('*, products!inner(irec_id)')
            .eq('order_id', order.id);

          const { data: user } = await supabase
            .from('users')
            .select('email, full_name, phone')
            .eq('id', order.user_id)
            .single();

          const { data: address } = await supabase
            .from('addresses')
            .select('*')
            .eq('id', order.shipping_address_id)
            .single();

          const irecOrder = await irecService.createIRECOrder({
            customerName: user?.full_name || 'Customer',
            customerEmail: user?.email,
            customerPhone: user?.phone,
            items: (orderItems || []).map((item) => ({
              irecId: item.products.irec_id,
              quantity: item.quantity,
              price: item.price,
            })),
            shippingAddress: address
              ? `${address.address_line1}, ${address.city}, ${address.state}, ${address.country}`
              : '',
            paymentMethod: 'card',
            notes: order.notes,
            orderId: order.id,
          });

          // Update order with iREC reference
          await supabase
            .from('orders')
            .update({
              irec_order_id: irecOrder.irecOrderId,
              status: 'processing',
            })
            .eq('id', order.id);

          console.log(`✅ Order ${order.order_number} created in iRECPlus: ${irecOrder.irecOrderId}`);
        } catch (error) {
          console.error('⚠️ Failed to create order in iRECPlus:', error.message);
          // Order remains 'paid' status, admin can retry
        }
      }
    }

    if (result.event === 'payment.failed') {
      await supabase
        .from('orders')
        .update({ status: 'cancelled' })
        .eq('paystack_reference', result.reference);

      await supabase
        .from('payment_logs')
        .update({
          status: 'failed',
          gateway_response: event.data,
        })
        .eq('paystack_reference', result.reference);
    }

    // Always acknowledge Paystack webhook
    res.json({ status: 'received' });
  })
);

export default router;
