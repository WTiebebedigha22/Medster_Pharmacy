import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { supabase } from '../db/supabase.js';
import irecService from '../services/irecService.js';

const router = Router();

// All admin routes require admin role
router.use(authenticate);
router.use(requireRole('admin', 'pharmacist'));

// GET /api/admin/dashboard - Dashboard stats
router.get(
  '/dashboard',
  asyncHandler(async (req, res) => {
    // Today's date range
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get counts
    const [
      { count: totalOrders },
      { count: pendingOrders },
      { count: totalProducts },
      { count: pendingPrescriptions },
      { count: todayOrders },
      { data: recentOrders },
      { data: syncLogs },
    ] = await Promise.all([
      supabase.from('orders').select('*', { count: 'exact', head: true }),
      supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('products').select('*', { count: 'exact', head: true }).eq('is_active', true),
      supabase.from('prescriptions').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('orders').select('*', { count: 'exact', head: true }).gte('created_at', today.toISOString()).lt('created_at', tomorrow.toISOString()),
      supabase.from('orders').select('*, order_items(*)').order('created_at', { ascending: false }).limit(10),
      supabase.from('sync_logs').select('*').order('started_at', { ascending: false }).limit(5),
    ]);

    // Calculate revenue
    const { data: paidOrders } = await supabase
      .from('orders')
      .select('total')
      .in('status', ['paid', 'processing', 'shipped', 'delivered']);

    const totalRevenue = (paidOrders || []).reduce(
      (sum, order) => sum + parseFloat(order.total || 0),
      0
    );

    res.json({
      stats: {
        totalOrders: totalOrders || 0,
        pendingOrders: pendingOrders || 0,
        totalProducts: totalProducts || 0,
        pendingPrescriptions: pendingPrescriptions || 0,
        todayOrders: todayOrders || 0,
        totalRevenue,
      },
      recentOrders: recentOrders || [],
      syncLogs: syncLogs || [],
    });
  })
);

// GET /api/admin/orders - All orders
router.get(
  '/orders',
  asyncHandler(async (req, res) => {
    const { status, page = 1, limit = 20 } = req.query;

    let query = supabase
      .from('orders')
      .select('*, order_items(*), users!orders_user_id_fkey(id, email, full_name)', { count: 'exact' })
      .order('created_at', { ascending: false });

    if (status) query = query.eq('status', status);

    const offset = (parseInt(page) - 1) * parseInt(limit);
    query = query.range(offset, offset + parseInt(limit) - 1);

    const { data: orders, count, error } = await query;

    if (error) throw error;

    res.json({
      orders: orders || [],
      total: count || 0,
      page: parseInt(page),
      totalPages: Math.ceil((count || 0) / parseInt(limit)),
    });
  })
);

// PUT /api/admin/orders/:id/status
router.put(
  '/orders/:id/status',
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const { data: order, error } = await supabase
      .from('orders')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error || !order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json({ order });
  })
);

// POST /api/admin/sync/products - Trigger product sync
router.post(
  '/sync/products',
  asyncHandler(async (req, res) => {
    // Start sync in background
    res.json({ message: 'Product sync started' });

    irecService.syncProducts().catch((err) => {
      console.error('Manual sync failed:', err.message);
    });
  })
);

// GET /api/admin/sync/status
router.get(
  '/sync/status',
  asyncHandler(async (req, res) => {
    const { data: logs } = await supabase
      .from('sync_logs')
      .select('*')
      .order('started_at', { ascending: false })
      .limit(10);

    res.json({ syncLogs: logs || [] });
  })
);

// GET /api/admin/prescriptions
router.get(
  '/prescriptions',
  asyncHandler(async (req, res) => {
    const { status = 'pending', page = 1, limit = 20 } = req.query;

    let query = supabase
      .from('prescriptions')
      .select('*, users!prescriptions_user_id_fkey(id, email, full_name)', { count: 'exact' })
      .order('created_at', { ascending: false });

    if (status) query = query.eq('status', status);

    const offset = (parseInt(page) - 1) * parseInt(limit);
    query = query.range(offset, offset + parseInt(limit) - 1);

    const { data: prescriptions, count, error } = await query;

    if (error) throw error;

    res.json({
      prescriptions: prescriptions || [],
      total: count || 0,
      page: parseInt(page),
      totalPages: Math.ceil((count || 0) / parseInt(limit)),
    });
  })
);

// GET /api/admin/products/low-stock
router.get(
  '/products/low-stock',
  asyncHandler(async (req, res) => {
    const threshold = parseInt(req.query.threshold || '10');

    const { data: products, error } = await supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .lte('stock_quantity', threshold)
      .order('stock_quantity', { ascending: true });

    if (error) throw error;

    res.json({
      products: products || [],
      total: products?.length || 0,
      threshold,
    });
  })
);

export default router;
