import { Router } from 'express';
import { authenticate, optionalAuth } from '../middleware/auth.js';
import { validate, schemas } from '../middleware/validate.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { supabase } from '../db/supabase.js';
import irecService from '../services/irecService.js';

const router = Router();

// GET /api/products - List with filters
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const {
      category, search, brand, minPrice, maxPrice,
      page = 1, limit = 20, sort, isRx, inStock,
    } = req.query;

    let query = supabase
      .from('products')
      .select('*', { count: 'exact' })
      .eq('is_active', true);

    // Apply filters
    if (category) query = query.eq('category', category);
    if (brand) query = query.ilike('brand', `%${brand}%`);
    if (minPrice) query = query.gte('price', parseFloat(minPrice));
    if (maxPrice) query = query.lte('price', parseFloat(maxPrice));
    if (isRx !== undefined) query = query.eq('is_rx', isRx === 'true');
    if (inStock === 'true') query = query.gt('stock_quantity', 0);
    
    // Search
    if (search) {
      query = query.or(
        `name.ilike.%${search}%,description.ilike.%${search}%,brand.ilike.%${search}%`
      );
    }

    // Sort
    switch (sort) {
      case 'price_asc': query = query.order('price', { ascending: true }); break;
      case 'price_desc': query = query.order('price', { ascending: false }); break;
      case 'name': query = query.order('name', { ascending: true }); break;
      case 'newest': query = query.order('created_at', { ascending: false }); break;
      default: query = query.order('name', { ascending: true });
    }

    // Pagination
    const offset = (parseInt(page) - 1) * parseInt(limit);
    query = query.range(offset, offset + parseInt(limit) - 1);

    const { data: products, count, error } = await query;

    if (error) {
      return res.status(500).json({ message: 'Failed to fetch products' });
    }

    // Get categories for filter options
    const { data: categories } = await supabase
      .from('products')
      .select('category')
      .eq('is_active', true)
      .not('category', 'is', null);

    const uniqueCategories = [...new Set((categories || []).map(c => c.category).filter(Boolean))];

    res.json({
      products: products || [],
      total: count || 0,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil((count || 0) / parseInt(limit)),
      filters: {
        categories: uniqueCategories,
      },
    });
  })
);

// GET /api/products/:id
router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Try UUID first, then irec_id
    let query = supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    let { data: product, error } = await query;

    // If not found by UUID, try irec_id
    if (error || !product) {
      const result = await supabase
        .from('products')
        .select('*')
        .eq('irec_id', id)
        .single();
      product = result.data;
      error = result.error;
    }

    if (error || !product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Fetch related products (same category)
    const { data: related } = await supabase
      .from('products')
      .select('id, name, price, images, category, irec_id')
      .eq('category', product.category)
      .eq('is_active', true)
      .neq('id', product.id)
      .limit(4);

    res.json({
      product,
      relatedProducts: related || [],
    });
  })
);

// POST /api/products/sync - Trigger manual sync (admin)
router.post(
  '/sync',
  asyncHandler(async (req, res) => {
    res.json({ message: 'Sync started', status: 'processing' });
    
    // Run sync in background
    irecService.syncProducts().catch((err) => {
      console.error('Background sync failed:', err.message);
    });
  })
);

// GET /api/products/sync/status - Check sync status
router.get(
  '/sync/status',
  asyncHandler(async (req, res) => {
    const { data: logs } = await supabase
      .from('sync_logs')
      .select('*')
      .eq('sync_type', 'products')
      .order('started_at', { ascending: false })
      .limit(1);

    res.json({
      lastSync: logs?.[0] || null,
    });
  })
);

export default router;
