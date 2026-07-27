import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { supabase } from '../db/supabase.js';

const router = Router();
router.use(authenticate);

// GET /api/wishlist
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const { data: items, error } = await supabase
      .from('wishlist')
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ wishlist: items || [] });
  })
);

// POST /api/wishlist - Add item
router.post(
  '/',
  asyncHandler(async (req, res) => {
    const { productId } = req.body;
    if (!productId) {
      return res.status(400).json({ message: 'Product ID is required' });
    }

    // Check if already exists
    const { data: existing } = await supabase
      .from('wishlist')
      .select('id')
      .eq('user_id', req.user.id)
      .eq('product_id', productId)
      .maybeSingle();

    if (existing) {
      // Remove if already in wishlist
      await supabase.from('wishlist').delete().eq('id', existing.id);
      return res.json({ action: 'removed', success: true });
    }

    // Add to wishlist
    const { error } = await supabase
      .from('wishlist')
      .insert([{ user_id: req.user.id, product_id: productId }]);

    if (error) throw error;
    res.json({ action: 'added', success: true });
  })
);

// DELETE /api/wishlist/:id
router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    const { data: existing } = await supabase
      .from('wishlist')
      .select('id')
      .eq('id', id)
      .eq('user_id', req.user.id)
      .single();

    if (!existing) {
      return res.status(404).json({ message: 'Wishlist item not found' });
    }

    await supabase.from('wishlist').delete().eq('id', id);
    res.json({ message: 'Removed from wishlist' });
  })
);

export default router;

