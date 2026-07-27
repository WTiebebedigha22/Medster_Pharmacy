import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { supabase } from '../db/supabase.js';

const router = Router();

// GET /api/reviews/product/:id - Get reviews for a product
router.get(
  '/product/:productId',
  asyncHandler(async (req, res) => {
    const { productId } = req.params;

    const { data: reviews, error } = await supabase
      .from('reviews')
      .select('*, users!reviews_user_id_fkey(id, email, full_name)')
      .eq('product_id', productId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Calculate average rating
    const avgRating = reviews?.length
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

    res.json({
      reviews: reviews || [],
      averageRating: Math.round(avgRating * 10) / 10,
      totalReviews: reviews?.length || 0,
    });
  })
);

// POST /api/reviews - Write a review (authenticated)
router.post(
  '/',
  authenticate,
  asyncHandler(async (req, res) => {
    const { productId, rating, comment } = req.body;

    if (!productId || !rating || !comment) {
      return res.status(400).json({ message: 'Product ID, rating, and comment are required' });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    // Check if user already reviewed this product
    const { data: existing } = await supabase
      .from('reviews')
      .select('id')
      .eq('user_id', req.user.id)
      .eq('product_id', productId)
      .maybeSingle();

    if (existing) {
      return res.status(409).json({ message: 'You have already reviewed this product' });
    }

    const { data: review, error } = await supabase
      .from('reviews')
      .insert({
        user_id: req.user.id,
        product_id: productId,
        rating,
        comment,
      })
      .select('*, users!reviews_user_id_fkey(id, email, full_name)')
      .single();

    if (error) throw error;
    res.status(201).json({ review });
  })
);

// PUT /api/reviews/:id - Edit review
router.put(
  '/:id',
  authenticate,
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { rating, comment } = req.body;

    // Verify ownership
    const { data: existing } = await supabase
      .from('reviews')
      .select('id')
      .eq('id', id)
      .eq('user_id', req.user.id)
      .single();

    if (!existing) {
      return res.status(404).json({ message: 'Review not found' });
    }

    const updates = {};
    if (rating !== undefined) {
      if (rating < 1 || rating > 5) {
        return res.status(400).json({ message: 'Rating must be between 1 and 5' });
      }
      updates.rating = rating;
    }
    if (comment !== undefined) updates.comment = comment;

    const { data: review, error } = await supabase
      .from('reviews')
      .update(updates)
      .eq('id', id)
      .select('*, users!reviews_user_id_fkey(id, email, full_name)')
      .single();

    if (error) throw error;
    res.json({ review });
  })
);

// DELETE /api/reviews/:id
router.delete(
  '/:id',
  authenticate,
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    const { data: existing } = await supabase
      .from('reviews')
      .select('id')
      .eq('id', id)
      .eq('user_id', req.user.id)
      .single();

    if (!existing) {
      return res.status(404).json({ message: 'Review not found' });
    }

    await supabase.from('reviews').delete().eq('id', id);
    res.json({ message: 'Review deleted' });
  })
);

export default router;

