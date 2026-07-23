import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { validate, schemas } from '../middleware/validate.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { supabase } from '../db/supabase.js';

const router = Router();

// All cart routes require authentication
router.use(authenticate);

// GET /api/cart - Get user's cart
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const { data: items, error } = await supabase
      .from('cart_items')
      .select(`
        id,
        quantity,
        product_id,
        products:product_id (
          id, irec_id, name, price, images, thumbnail_url,
          stock_quantity, is_rx, category, brand
        )
      `)
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({ message: 'Failed to fetch cart' });
    }

    // Transform to flat structure
    const cartItems = (items || []).map((item) => ({
      id: item.id,
      productId: item.product_id,
      quantity: item.quantity,
      product: item.products,
    }));

    // Calculate totals
    const subtotal = cartItems.reduce(
      (sum, item) => sum + (parseFloat(item.product?.price || 0) * item.quantity),
      0
    );

    res.json({
      items: cartItems,
      subtotal,
      itemCount: cartItems.reduce((sum, item) => sum + item.quantity, 0),
    });
  })
);

// POST /api/cart - Add item to cart
router.post(
  '/',
  validate(schemas.addToCart),
  asyncHandler(async (req, res) => {
    const { productId, quantity } = req.body;

    // Verify product exists and is active
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('id, stock_quantity, is_active')
      .eq('id', productId)
      .single();

    if (productError || !product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (!product.is_active) {
      return res.status(400).json({ message: 'Product is not available' });
    }

    // Check if item already in cart
    const { data: existing } = await supabase
      .from('cart_items')
      .select('id, quantity')
      .eq('user_id', req.user.id)
      .eq('product_id', productId)
      .maybeSingle();

    let result;
    if (existing) {
      // Update quantity
      const newQty = existing.quantity + quantity;
      if (newQty > product.stock_quantity) {
        return res.status(400).json({
          message: `Only ${product.stock_quantity} items available in stock`,
        });
      }

      const { data, error } = await supabase
        .from('cart_items')
        .update({ quantity: newQty })
        .eq('id', existing.id)
        .select()
        .single();

      if (error) throw error;
      result = data;
    } else {
      // Insert new item
      if (quantity > product.stock_quantity) {
        return res.status(400).json({
          message: `Only ${product.stock_quantity} items available in stock`,
        });
      }

      const { data, error } = await supabase
        .from('cart_items')
        .insert({
          user_id: req.user.id,
          product_id: productId,
          quantity,
        })
        .select()
        .single();

      if (error) throw error;
      result = data;
    }

    res.status(201).json({ item: result });
  })
);

// PUT /api/cart/:itemId - Update cart item quantity
router.put(
  '/:itemId',
  validate(schemas.updateCartItem),
  asyncHandler(async (req, res) => {
    const { itemId } = req.params;
    const { quantity } = req.body;

    // Verify item belongs to user
    const { data: item } = await supabase
      .from('cart_items')
      .select('id, product_id')
      .eq('id', itemId)
      .eq('user_id', req.user.id)
      .single();

    if (!item) {
      return res.status(404).json({ message: 'Cart item not found' });
    }

    if (quantity === 0) {
      // Remove item
      await supabase.from('cart_items').delete().eq('id', itemId);
      return res.json({ message: 'Item removed from cart' });
    }

    // Check stock
    const { data: product } = await supabase
      .from('products')
      .select('stock_quantity')
      .eq('id', item.product_id)
      .single();

    if (product && quantity > product.stock_quantity) {
      return res.status(400).json({
        message: `Only ${product.stock_quantity} items available`,
      });
    }

    const { data, error } = await supabase
      .from('cart_items')
      .update({ quantity })
      .eq('id', itemId)
      .select()
      .single();

    if (error) throw error;
    res.json({ item: data });
  })
);

// DELETE /api/cart/:itemId - Remove item from cart
router.delete(
  '/:itemId',
  asyncHandler(async (req, res) => {
    const { itemId } = req.params;

    const { data: item } = await supabase
      .from('cart_items')
      .select('id')
      .eq('id', itemId)
      .eq('user_id', req.user.id)
      .single();

    if (!item) {
      return res.status(404).json({ message: 'Cart item not found' });
    }

    await supabase.from('cart_items').delete().eq('id', itemId);
    res.json({ message: 'Item removed from cart' });
  })
);

// DELETE /api/cart - Clear entire cart
router.delete(
  '/',
  asyncHandler(async (req, res) => {
    await supabase
      .from('cart_items')
      .delete()
      .eq('user_id', req.user.id);

    res.json({ message: 'Cart cleared' });
  })
);

export default router;
