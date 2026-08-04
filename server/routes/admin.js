import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { supabase } from '../db/supabase.js';
import irecService from '../services/irecService.js';
import notificationService from '../services/notificationService.js';

const router = Router();

// All admin routes require admin role
router.use(authenticate);
router.use(requireRole('admin', 'pharmacist'));

// =============================================
// AUDIT LOG HELPER
// =============================================
async function logAudit(req, action, entityType, entityId = null, details = {}) {
  try {
    await supabase.from('audit_logs').insert({
      user_id: req.user.id,
      action,
      entity_type: entityType,
      entity_id: entityId,
      details,
      ip_address: req.ip,
      user_agent: req.headers['user-agent'],
    });
  } catch (err) {
    console.error('Audit log error:', err.message);
  }
}

// =============================================
// DASHBOARD & ANALYTICS
// =============================================

// GET /api/admin/dashboard - Dashboard stats
router.get(
  '/dashboard',
  asyncHandler(async (req, res) => {
    // Today's date range
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // This week
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    // This month
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

    // Get counts
    const [
      { count: totalOrders },
      { count: pendingOrders },
      { count: totalProducts },
      { count: pendingPrescriptions },
      { count: todayOrders },
      { count: weekOrders },
      { count: totalCustomers },
      { count: totalAdmins },
      { data: recentOrders },
      { data: syncLogs },
      { data: lowStockProducts },
    ] = await Promise.all([
      supabase.from('orders').select('*', { count: 'exact', head: true }),
      supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('products').select('*', { count: 'exact', head: true }).eq('is_active', true),
      supabase.from('prescriptions').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('orders').select('*', { count: 'exact', head: true }).gte('created_at', today.toISOString()),
      supabase.from('orders').select('*', { count: 'exact', head: true }).gte('created_at', weekAgo.toISOString()),
      supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'customer'),
      supabase.from('users').select('*', { count: 'exact', head: true }).in('role', ['admin', 'pharmacist']),
      supabase.from('orders').select('*, order_items(*), users!orders_user_id_fkey(id, email, full_name)').order('created_at', { ascending: false }).limit(10),
      supabase.from('sync_logs').select('*').order('started_at', { ascending: false }).limit(5),
      supabase.from('products').select('id, name, stock_quantity, price').eq('is_active', true).lte('stock_quantity', 10).order('stock_quantity', { ascending: true }).limit(10),
    ]);

    // Calculate revenue
    const { data: paidOrders } = await supabase
      .from('orders')
      .select('total, created_at')
      .in('status', ['paid', 'processing', 'shipped', 'delivered']);

    const totalRevenue = (paidOrders || []).reduce(
      (sum, order) => sum + parseFloat(order.total || 0),
      0
    );

    // Monthly revenue
    const monthlyRevenue = (paidOrders || [])
      .filter((o) => new Date(o.created_at) >= monthStart)
      .reduce((sum, order) => sum + parseFloat(order.total || 0), 0);

    // Weekly revenue
    const weeklyRevenue = (paidOrders || [])
      .filter((o) => new Date(o.created_at) >= weekAgo)
      .reduce((sum, order) => sum + parseFloat(order.total || 0), 0);

    res.json({
      stats: {
        totalOrders: totalOrders || 0,
        pendingOrders: pendingOrders || 0,
        totalProducts: totalProducts || 0,
        pendingPrescriptions: pendingPrescriptions || 0,
        todayOrders: todayOrders || 0,
        weekOrders: weekOrders || 0,
        totalCustomers: totalCustomers || 0,
        totalAdmins: totalAdmins || 0,
        totalRevenue,
        weeklyRevenue,
        monthlyRevenue,
      },
      recentOrders: recentOrders || [],
      syncLogs: syncLogs || [],
      lowStockProducts: lowStockProducts || [],
    });
  })
);

// GET /api/admin/analytics/sales - Sales analytics
router.get(
  '/analytics/sales',
  asyncHandler(async (req, res) => {
    const { period = 'monthly', startDate, endDate, limit = 12 } = req.query;

    let start = startDate ? new Date(startDate) : new Date();
    let end = endDate ? new Date(endDate) : new Date();

    if (!startDate) {
      start.setFullYear(start.getFullYear() - 1);
    }

    // Get all orders in date range
    const { data: orders } = await supabase
      .from('orders')
      .select('total, status, created_at')
      .in('status', ['paid', 'processing', 'shipped', 'delivered'])
      .gte('created_at', start.toISOString())
      .lte('created_at', end.toISOString())
      .order('created_at', { ascending: true });

    // Group by period
    const grouped = {};
    (orders || []).forEach((order) => {
      const date = new Date(order.created_at);
      let key;
      if (period === 'daily') {
        key = date.toISOString().split('T')[0];
      } else if (period === 'weekly') {
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        key = weekStart.toISOString().split('T')[0];
      } else {
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      }

      if (!grouped[key]) {
        grouped[key] = { period: key, revenue: 0, orders: 0 };
      }
      grouped[key].revenue += parseFloat(order.total || 0);
      grouped[key].orders += 1;
    });

    const salesData = Object.values(grouped).slice(-parseInt(limit));

    // Top products
    const { data: orderItems } = await supabase
      .from('order_items')
      .select('product_name, quantity, subtotal')
      .gte('created_at', start.toISOString());

    const productSales = {};
    (orderItems || []).forEach((item) => {
      if (!productSales[item.product_name]) {
        productSales[item.product_name] = { name: item.product_name, quantity: 0, revenue: 0 };
      }
      productSales[item.product_name].quantity += item.quantity;
      productSales[item.product_name].revenue += parseFloat(item.subtotal || 0);
    });

    const topProducts = Object.values(productSales)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    res.json({
      salesData,
      topProducts,
      summary: {
        totalRevenue: salesData.reduce((s, d) => s + d.revenue, 0),
        totalOrders: salesData.reduce((s, d) => s + d.orders, 0),
        period,
        startDate: start.toISOString(),
        endDate: end.toISOString(),
      },
    });
  })
);

// GET /api/admin/analytics/customers - Customer insights
router.get(
  '/analytics/customers',
  asyncHandler(async (req, res) => {
    const { data: customers } = await supabase
      .from('users')
      .select('id, created_at')
      .eq('role', 'customer')
      .order('created_at', { ascending: true });

    // Group by month
    const registrations = {};
    (customers || []).forEach((c) => {
      const month = new Date(c.created_at).toISOString().slice(0, 7);
      if (!registrations[month]) registrations[month] = 0;
      registrations[month]++;
    });

    // Get total orders per customer
    const { data: orderCounts } = await supabase
      .from('orders')
      .select('user_id');

    const customerOrderCounts = {};
    (orderCounts || []).forEach((o) => {
      customerOrderCounts[o.user_id] = (customerOrderCounts[o.user_id] || 0) + 1;
    });

    const totalCustomers = customers?.length || 0;
    const customersWithOrders = Object.keys(customerOrderCounts).length;

    res.json({
      totalCustomers,
      customersWithOrders,
      customerRegistrationRate: totalCustomers > 0
        ? Math.round((customersWithOrders / totalCustomers) * 100) : 0,
      monthlyRegistrations: Object.entries(registrations).map(([month, count]) => ({ month, count })),
    });
  })
);

// GET /api/admin/reports - Generate report
router.get(
  '/reports',
  asyncHandler(async (req, res) => {
    const { type = 'summary', startDate, endDate } = req.query;

    let start = startDate ? new Date(startDate) : new Date();
    let end = endDate ? new Date(endDate) : new Date();

    if (!startDate) start.setMonth(start.getMonth() - 1);

    const { data: orders } = await supabase
      .from('orders')
      .select('*, order_items(*), users!orders_user_id_fkey(id, email, full_name)')
      .gte('created_at', start.toISOString())
      .lte('created_at', end.toISOString())
      .order('created_at', { ascending: false });

    const totalRevenue = (orders || []).reduce(
      (s, o) => s + (['paid', 'processing', 'shipped', 'delivered'].includes(o.status) ? parseFloat(o.total || 0) : 0),
      0
    );

    const statusCounts = { pending: 0, paid: 0, processing: 0, shipped: 0, delivered: 0, cancelled: 0 };
    (orders || []).forEach((o) => { if (statusCounts[o.status] !== undefined) statusCounts[o.status]++; });

    res.json({
      reportType: type,
      period: { start: start.toISOString(), end: end.toISOString() },
      summary: {
        totalOrders: orders?.length || 0,
        totalRevenue,
        averageOrderValue: orders?.length > 0 ? totalRevenue / orders.length : 0,
        ...statusCounts,
      },
      orders: orders || [],
    });
  })
);

// =============================================
// PRODUCT MANAGEMENT (CRUD)
// =============================================

// GET /api/admin/products - View all products (including inactive)
router.get(
  '/products',
  asyncHandler(async (req, res) => {
    const { category, search, page = 1, limit = 20, isActive } = req.query;

    let query = supabase
      .from('products')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    if (category) query = query.eq('category', category);
    if (isActive !== undefined) query = query.eq('is_active', isActive === 'true');
    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%,brand.ilike.%${search}%`);
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);
    query = query.range(offset, offset + parseInt(limit) - 1);

    const { data: products, count, error } = await query;
    if (error) return res.status(500).json({ message: 'Failed to fetch products' });

    res.json({
      products: products || [],
      total: count || 0,
      page: parseInt(page),
      totalPages: Math.ceil((count || 0) / parseInt(limit)),
    });
  })
);

// POST /api/admin/products - Create product
router.post(
  '/products',
  asyncHandler(async (req, res) => {
    const {
      irec_id, name, description, category, brand, price,
      compare_at_price, currency, stock_quantity, is_rx,
      images, thumbnail_url, attributes, manufacturer,
    } = req.body;

    if (!name || price === undefined) {
      return res.status(400).json({ message: 'Product name and price are required' });
    }

    const { data: product, error } = await supabase
      .from('products')
      .insert({
        irec_id: irec_id || `manual-${Date.now()}`,
        name,
        description: description || '',
        category: category || 'General',
        brand: brand || 'Generic',
        price: parseFloat(price),
        compare_at_price: compare_at_price ? parseFloat(compare_at_price) : null,
        currency: currency || 'NGN',
        stock_quantity: parseInt(stock_quantity || 0),
        is_rx: is_rx || false,
        images: images || [],
        thumbnail_url: thumbnail_url || null,
        attributes: attributes || {},
        manufacturer: manufacturer || null,
        is_active: true,
      })
      .select()
      .single();

    if (error) return res.status(500).json({ message: 'Failed to create product' });

    await logAudit(req, 'create_product', 'products', product.id, { name });

    res.status(201).json({ product });
  })
);

// PUT /api/admin/products/:id - Update product
router.put(
  '/products/:id',
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const updates = req.body;

    // Remove non-updateable fields
    delete updates.id;
    delete updates.created_at;

    // Parse numeric fields
    if (updates.price) updates.price = parseFloat(updates.price);
    if (updates.compare_at_price) updates.compare_at_price = parseFloat(updates.compare_at_price);
    if (updates.stock_quantity) updates.stock_quantity = parseInt(updates.stock_quantity);
    if (updates.is_rx !== undefined) updates.is_rx = Boolean(updates.is_rx);
    if (updates.is_active !== undefined) updates.is_active = Boolean(updates.is_active);

    const { data: product, error } = await supabase
      .from('products')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error || !product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    await logAudit(req, 'update_product', 'products', id, { updates: Object.keys(updates) });

    res.json({ product });
  })
);

// DELETE /api/admin/products/:id - Delete product (soft delete)
router.delete(
  '/products/:id',
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    const { data: product, error } = await supabase
      .from('products')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error || !product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    await logAudit(req, 'delete_product', 'products', id, { name: product.name });

    res.json({ message: 'Product deactivated', product });
  })
);

// POST /api/admin/products/bulk-import - Bulk import products
router.post(
  '/products/bulk-import',
  asyncHandler(async (req, res) => {
    const { products: productsToImport } = req.body;

    if (!Array.isArray(productsToImport) || productsToImport.length === 0) {
      return res.status(400).json({ message: 'Products array is required' });
    }

    let imported = 0;
    let failed = 0;
    const errors = [];

    for (const product of productsToImport) {
      try {
        if (!product.name || product.price === undefined) {
          failed++;
          errors.push({ name: product.name || 'unknown', error: 'Name and price required' });
          continue;
        }

        const { error } = await supabase.from('products').insert({
          irec_id: product.irec_id || `bulk-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          name: product.name,
          description: product.description || '',
          category: product.category || 'General',
          brand: product.brand || 'Generic',
          price: parseFloat(product.price),
          compare_at_price: product.compare_at_price ? parseFloat(product.compare_at_price) : null,
          currency: product.currency || 'NGN',
          stock_quantity: parseInt(product.stock_quantity || 0),
          is_rx: product.is_rx || false,
          images: product.images || [],
          manufacturer: product.manufacturer || null,
        });

        if (error) {
          failed++;
          errors.push({ name: product.name, error: error.message });
        } else {
          imported++;
        }
      } catch (err) {
        failed++;
        errors.push({ name: product.name || 'unknown', error: err.message });
      }
    }

    await logAudit(req, 'bulk_import_products', 'products', null, { imported, failed });

    res.json({ imported, failed, errors: errors.slice(0, 20) });
  })
);

// =============================================
// CATEGORY MANAGEMENT
// =============================================

// GET /api/admin/categories
router.get(
  '/categories',
  asyncHandler(async (req, res) => {
    const { data: categories, error } = await supabase
      .from('categories')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('name', { ascending: true });

    if (error) return res.status(500).json({ message: 'Failed to fetch categories' });

    res.json({ categories: categories || [] });
  })
);

// POST /api/admin/categories - Create category
router.post(
  '/categories',
  asyncHandler(async (req, res) => {
    const { name, slug, description, image_url, parent_id, sort_order } = req.body;

    if (!name || !slug) {
      return res.status(400).json({ message: 'Category name and slug are required' });
    }

    const { data: category, error } = await supabase
      .from('categories')
      .insert({
        name,
        slug,
        description: description || '',
        image_url: image_url || null,
        parent_id: parent_id || null,
        sort_order: parseInt(sort_order || 0),
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') return res.status(409).json({ message: 'Category slug already exists' });
      return res.status(500).json({ message: 'Failed to create category' });
    }

    await logAudit(req, 'create_category', 'categories', category.id, { name });

    res.status(201).json({ category });
  })
);

// PUT /api/admin/categories/:id - Update category
router.put(
  '/categories/:id',
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const updates = req.body;
    delete updates.id;

    const { data: category, error } = await supabase
      .from('categories')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error || !category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    await logAudit(req, 'update_category', 'categories', id, { updates: Object.keys(updates) });

    res.json({ category });
  })
);

// DELETE /api/admin/categories/:id
router.delete(
  '/categories/:id',
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) return res.status(500).json({ message: 'Failed to delete category' });

    await logAudit(req, 'delete_category', 'categories', id);

    res.json({ message: 'Category deleted' });
  })
);

// =============================================
// INVENTORY MANAGEMENT
// =============================================

// GET /api/admin/inventory - View all inventory
router.get(
  '/inventory',
  asyncHandler(async (req, res) => {
    const { page = 1, limit = 20, lowStock } = req.query;

    let query = supabase
      .from('products')
      .select('id, irec_id, name, category, price, stock_quantity, is_active, last_synced_at, updated_at', { count: 'exact' })
      .order('name', { ascending: true });

    if (lowStock === 'true') {
      query = query.lte('stock_quantity', 10);
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);
    query = query.range(offset, offset + parseInt(limit) - 1);

    const { data: products, count, error } = await query;
    if (error) return res.status(500).json({ message: 'Failed to fetch inventory' });

    res.json({
      products: products || [],
      total: count || 0,
      page: parseInt(page),
      totalPages: Math.ceil((count || 0) / parseInt(limit)),
    });
  })
);

// PUT /api/admin/inventory/:id - Update stock
router.put(
  '/inventory/:id',
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { stock_quantity } = req.body;

    if (stock_quantity === undefined || stock_quantity < 0) {
      return res.status(400).json({ message: 'Valid stock quantity is required' });
    }

    const { data: product, error } = await supabase
      .from('products')
      .update({
        stock_quantity: parseInt(stock_quantity),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error || !product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    await logAudit(req, 'update_inventory', 'products', id, {
      previous_stock: product.stock_quantity,
      new_stock: parseInt(stock_quantity),
    });

    res.json({ product });
  })
);

// GET /api/admin/inventory/low-stock
router.get(
  '/inventory/low-stock',
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

// =============================================
// ORDER MANAGEMENT
// =============================================

// GET /api/admin/orders - All orders
router.get(
  '/orders',
  asyncHandler(async (req, res) => {
    const { status, page = 1, limit = 20, search } = req.query;

    let query = supabase
      .from('orders')
      .select('*, order_items(*), users!orders_user_id_fkey(id, email, full_name, phone)', { count: 'exact' })
      .order('created_at', { ascending: false });

    if (status) query = query.eq('status', status);
    if (search) {
      query = query.or(
        `order_number.ilike.%${search}%,users.full_name.ilike.%${search}%,users.email.ilike.%${search}%`
      );
    }

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

// GET /api/admin/orders/:id - Order details
router.get(
  '/orders/:id',
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    const { data: order, error } = await supabase
      .from('orders')
      .select('*, order_items(*), addresses(*), payment_logs(*), users!orders_user_id_fkey(id, email, full_name, phone)')
      .eq('id', id)
      .single();

    if (error || !order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json({ order });
  })
);

// PUT /api/admin/orders/:id/status
router.put(
  '/orders/:id/status',
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'awaiting_payment', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'];
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

    await logAudit(req, 'update_order_status', 'orders', id, { status });

    res.json({ order });
  })
);

// PUT /api/admin/orders/:id/process - Mark as processing
router.put(
  '/orders/:id/process',
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    const { data: order, error } = await supabase
      .from('orders')
      .update({ status: 'processing', updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('status', 'paid')
      .select()
      .single();

    if (error || !order) {
      return res.status(400).json({ message: 'Order cannot be processed or not found' });
    }

    await logAudit(req, 'process_order', 'orders', id);
    res.json({ order });
  })
);

// PUT /api/admin/orders/:id/ship - Mark as shipped
router.put(
  '/orders/:id/ship',
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    const { data: order, error } = await supabase
      .from('orders')
      .update({ status: 'shipped', updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('status', 'processing')
      .select()
      .single();

    if (error || !order) {
      return res.status(400).json({ message: 'Order cannot be shipped or not found' });
    }

await logAudit(req, 'ship_order', 'orders', id);

    // Send delivery notice (shipped)
    notificationService
      .notifyDeliveryNotice({
        userId: order.user_id,
        orderId: order.id,
        orderNumber: order.order_number,
        status: 'shipped',
        trackingNumber: order.tracking_number,
      })
      .catch((err) => console.error('[NOTIFICATION] Ship notice failed:', err.message));

    res.json({ order });
  })
);

// PUT /api/admin/orders/:id/deliver - Mark as delivered
router.put(
  '/orders/:id/deliver',
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    const { data: order, error } = await supabase
      .from('orders')
      .update({ status: 'delivered', updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('status', 'shipped')
      .select()
      .single();

if (error || !order) {
      return res.status(400).json({ message: 'Order cannot be delivered or not found' });
    }

    await logAudit(req, 'deliver_order', 'orders', id);

    // Send delivery notice (delivered)
    notificationService
      .notifyDeliveryNotice({
        userId: order.user_id,
        orderId: order.id,
        orderNumber: order.order_number,
        status: 'delivered',
        trackingNumber: order.tracking_number,
      })
      .catch((err) => console.error('[NOTIFICATION] Deliver notice failed:', err.message));

    // Send return window reminder
    notificationService
      .notifyReturnWarning({
        userId: order.user_id,
        orderId: order.id,
        orderNumber: order.order_number,
      })
      .catch((err) => console.error('[NOTIFICATION] Return warning failed:', err.message));

    res.json({ order });
  })
);

// PUT /api/admin/orders/:id/cancel - Cancel order
router.put(
  '/orders/:id/cancel',
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { reason } = req.body;

    const { data: order } = await supabase
      .from('orders')
      .select('status')
      .eq('id', id)
      .single();

    if (!order) return res.status(404).json({ message: 'Order not found' });

    if (['delivered', 'cancelled', 'refunded'].includes(order.status)) {
      return res.status(400).json({ message: `Order cannot be cancelled (status: ${order.status})` });
    }

    const { data: updated, error } = await supabase
      .from('orders')
      .update({
        status: 'cancelled',
        notes: reason ? `${order.notes || ''}\nCancellation reason: ${reason}`.trim() : order.notes,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

if (error) return res.status(500).json({ message: 'Failed to cancel order' });

    await logAudit(req, 'cancel_order', 'orders', id, { reason });

    // Send order cancellation notification (in-app + email)
    notificationService
      .notifyOrderCancellation({
        userId: updated.user_id,
        orderId: updated.id,
        orderNumber: updated.order_number,
        reason,
      })
      .catch((err) => console.error('[NOTIFICATION] Cancel notice failed:', err.message));

    res.json({ order: updated });
  })
);

// PUT /api/admin/orders/:id/tracking - Add tracking info
router.put(
  '/orders/:id/tracking',
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { tracking_number, carrier } = req.body;

    if (!tracking_number) {
      return res.status(400).json({ message: 'Tracking number is required' });
    }

    const { data: order, error } = await supabase
      .from('orders')
      .update({
        tracking_number,
        carrier: carrier || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error || !order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    await logAudit(req, 'add_tracking', 'orders', id, { tracking_number });

    res.json({ order });
  })
);

// GET /api/admin/orders/:id/print - Generate order receipt
router.get(
  '/orders/:id/print',
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    const { data: order, error } = await supabase
      .from('orders')
      .select('*, order_items(*), addresses(*), users!orders_user_id_fkey(id, email, full_name, phone)')
      .eq('id', id)
      .single();

    if (error || !order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Return formatted receipt data
    res.json({
      receipt: {
        pharmacyName: 'Medster Pharmacy',
        pharmacyAddress: '123 Pharmacy Street, Lagos, Nigeria',
        pharmacyPhone: '+234 800 MEDSTER',
        pharmacyEmail: 'info@medsterpharmacy.com',
        orderNumber: order.order_number,
        orderDate: order.created_at,
        customer: order.users,
        shippingAddress: order.addresses,
        items: order.order_items,
        subtotal: order.subtotal,
        deliveryFee: order.delivery_fee,
        discount: order.discount,
        tax: order.tax,
        total: order.total,
        status: order.status,
        paymentMethod: order.payment_method,
        trackingNumber: order.tracking_number,
      },
    });
  })
);

// =============================================
// USER MANAGEMENT (Customers)
// =============================================

// GET /api/admin/users - All customers
router.get(
  '/users',
  asyncHandler(async (req, res) => {
    const { page = 1, limit = 20, search, isActive, sortBy = 'created_at' } = req.query;

    let query = supabase
      .from('users')
      .select('id, email, full_name, phone, role, is_active, email_verified, created_at, updated_at', { count: 'exact' })
      .eq('role', 'customer')
      .order(sortBy || 'created_at', { ascending: false });

    if (isActive !== undefined) query = query.eq('is_active', isActive === 'true');
    if (search) {
      query = query.or(`email.ilike.%${search}%,full_name.ilike.%${search}%,phone.ilike.%${search}%`);
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);
    query = query.range(offset, offset + parseInt(limit) - 1);

    const { data: users, count, error } = await query;

    if (error) return res.status(500).json({ message: 'Failed to fetch users' });

    // Get order counts for each user
    const userIds = (users || []).map((u) => u.id);
    let orderCounts = {};
    if (userIds.length > 0) {
      const { data: orders } = await supabase
        .from('orders')
        .select('user_id')
        .in('user_id', userIds);
      (orders || []).forEach((o) => {
        orderCounts[o.user_id] = (orderCounts[o.user_id] || 0) + 1;
      });
    }

    const usersWithStats = (users || []).map((u) => ({
      ...u,
      orderCount: orderCounts[u.id] || 0,
    }));

    res.json({
      users: usersWithStats,
      total: count || 0,
      page: parseInt(page),
      totalPages: Math.ceil((count || 0) / parseInt(limit)),
    });
  })
);

// GET /api/admin/users/:id - Customer details
router.get(
  '/users/:id',
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, full_name, phone, role, is_active, email_verified, created_at, updated_at')
      .eq('id', id)
      .single();

    if (error || !user) return res.status(404).json({ message: 'User not found' });

    // Get user's orders
    const { data: orders } = await supabase
      .from('orders')
      .select('id, order_number, status, total, created_at')
      .eq('user_id', id)
      .order('created_at', { ascending: false })
      .limit(20);

    // Get user's addresses
    const { data: addresses } = await supabase
      .from('addresses')
      .select('*')
      .eq('user_id', id);

    // Get user's prescriptions
    const { data: prescriptions } = await supabase
      .from('prescriptions')
      .select('id, status, created_at')
      .eq('user_id', id);

    res.json({
      user,
      stats: {
        totalOrders: orders?.length || 0,
        totalAddresses: addresses?.length || 0,
        totalPrescriptions: prescriptions?.length || 0,
      },
      orders: orders || [],
      addresses: addresses || [],
      prescriptions: prescriptions || [],
    });
  })
);

// PUT /api/admin/users/:id - Update customer
router.put(
  '/users/:id',
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { full_name, phone, email } = req.body;

    const updates = {};
    if (full_name) updates.full_name = full_name;
    if (phone) updates.phone = phone;
    if (email) updates.email = email.toLowerCase();

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: 'No fields to update' });
    }

    const { data: user, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', id)
      .select('id, email, full_name, phone, role, is_active')
      .single();

    if (error || !user) return res.status(404).json({ message: 'User not found' });

    await logAudit(req, 'update_user', 'users', id, { updates: Object.keys(updates) });

    res.json({ user });
  })
);

// DELETE /api/admin/users/:id - Delete user
router.delete(
  '/users/:id',
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    const { error } = await supabase.from('users').delete().eq('id', id);
    if (error) return res.status(500).json({ message: 'Failed to delete user' });

    await logAudit(req, 'delete_user', 'users', id);
    res.json({ message: 'User deleted permanently' });
  })
);

// PUT /api/admin/users/:id/suspend - Suspend account
router.put(
  '/users/:id/suspend',
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    const { data: user, error } = await supabase
      .from('users')
      .update({ is_active: false })
      .eq('id', id)
      .select('id, email, full_name, is_active')
      .single();

    if (error || !user) return res.status(404).json({ message: 'User not found' });

    await logAudit(req, 'suspend_user', 'users', id);
    res.json({ user, message: 'Account suspended' });
  })
);

// PUT /api/admin/users/:id/activate - Reactivate account
router.put(
  '/users/:id/activate',
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    const { data: user, error } = await supabase
      .from('users')
      .update({ is_active: true })
      .eq('id', id)
      .select('id, email, full_name, is_active')
      .single();

    if (error || !user) return res.status(404).json({ message: 'User not found' });

    await logAudit(req, 'activate_user', 'users', id);
    res.json({ user, message: 'Account reactivated' });
  })
);

// GET /api/admin/users/:id/orders - User's order history
router.get(
  '/users/:id/orders',
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    const { data: orders, error } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('user_id', id)
      .order('created_at', { ascending: false });

    if (error) return res.status(500).json({ message: 'Failed to fetch orders' });

    res.json({ orders: orders || [] });
  })
);

// POST /api/admin/users/:id/notify - Send notification to user
router.post(
  '/users/:id/notify',
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { subject, message } = req.body;

    if (!subject || !message) {
      return res.status(400).json({ message: 'Subject and message are required' });
    }

    // Get user email
    const { data: user } = await supabase
      .from('users')
      .select('email, full_name')
      .eq('id', id)
      .single();

    if (!user) return res.status(404).json({ message: 'User not found' });

    // TODO: Integrate with email service (SendGrid, etc.)
    console.log(`[NOTIFICATION] To: ${user.email} | Subject: ${subject} | Message: ${message}`);

    await logAudit(req, 'notify_user', 'users', id, { subject });

    res.json({ message: 'Notification sent', notifiedUser: user.email });
  })
);

// =============================================
// ADMIN USER MANAGEMENT
// =============================================

// GET /api/admin/admins - All admin users
router.get(
  '/admins',
  asyncHandler(async (req, res) => {
    const { data: admins, error } = await supabase
      .from('users')
      .select('id, email, full_name, phone, role, is_active, created_at')
      .in('role', ['admin', 'pharmacist'])
      .order('created_at', { ascending: false });

    if (error) return res.status(500).json({ message: 'Failed to fetch admins' });

    // Get admin roles/permissions
    const adminIds = (admins || []).map((a) => a.id);
    let roleMap = {};
    if (adminIds.length > 0) {
      const { data: adminRoles } = await supabase
        .from('admin_roles')
        .select('*')
        .in('user_id', adminIds);
      (adminRoles || []).forEach((r) => {
        roleMap[r.user_id] = r;
      });
    }

    const adminsWithRoles = (admins || []).map((a) => ({
      ...a,
      adminRole: roleMap[a.id] || null,
    }));

    res.json({ admins: adminsWithRoles });
  })
);

// POST /api/admin/admins - Create admin
router.post(
  '/admins',
  asyncHandler(async (req, res) => {
    const { email, password, full_name, phone, role, permissions } = req.body;

    if (!email || !password || !full_name) {
      return res.status(400).json({ message: 'Email, password, and full name are required' });
    }

    // Import auth service
    const authService = (await import('../services/authService.js')).default;

    const result = await authService.registerUser({
      email,
      password,
      fullName: full_name,
      phone,
    });

    // Update role to admin
    const { data: user } = await supabase
      .from('users')
      .update({ role: role || 'admin' })
      .eq('id', result.user.id)
      .select()
      .single();

    // Create admin role entry
    await supabase.from('admin_roles').insert({
      user_id: result.user.id,
      role_label: role || 'admin',
      permissions: permissions || ['all'],
      created_by: req.user.id,
    });

    await logAudit(req, 'create_admin', 'users', result.user.id, { email });

    res.status(201).json({ user });
  })
);

// PUT /api/admin/admins/:id - Update admin
router.put(
  '/admins/:id',
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { full_name, phone, role } = req.body;

    const updates = {};
    if (full_name) updates.full_name = full_name;
    if (phone) updates.phone = phone;
    if (role) updates.role = role;

    const { data: user, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', id)
      .in('role', ['admin', 'pharmacist'])
      .select('id, email, full_name, phone, role, is_active')
      .single();

    if (error || !user) return res.status(404).json({ message: 'Admin not found' });

    await logAudit(req, 'update_admin', 'users', id, { updates: Object.keys(updates) });

    res.json({ user });
  })
);

// DELETE /api/admin/admins/:id - Remove admin
router.delete(
  '/admins/:id',
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Downgrade to customer instead of deleting
    const { data: user, error } = await supabase
      .from('users')
      .update({ role: 'customer' })
      .eq('id', id)
      .in('role', ['admin', 'pharmacist'])
      .select()
      .single();

    if (error || !user) return res.status(404).json({ message: 'Admin not found' });

    // Remove admin role entry
    await supabase.from('admin_roles').delete().eq('user_id', id);

    await logAudit(req, 'remove_admin', 'users', id);

    res.json({ message: 'Admin privileges removed', user });
  })
);

// PUT /api/admin/admins/:id/permissions - Set permissions
router.put(
  '/admins/:id/permissions',
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { permissions, role_label } = req.body;

    if (!Array.isArray(permissions)) {
      return res.status(400).json({ message: 'Permissions must be an array' });
    }

    const { data: adminRole, error } = await supabase
      .from('admin_roles')
      .upsert({
        user_id: id,
        role_label: role_label || 'admin',
        permissions,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) return res.status(500).json({ message: 'Failed to update permissions' });

    await logAudit(req, 'update_admin_permissions', 'admin_roles', id, { permissions });

    res.json({ adminRole });
  })
);

// =============================================
// PRESCRIPTION MANAGEMENT
// =============================================

// GET /api/admin/prescriptions - All prescriptions
router.get(
  '/prescriptions',
  asyncHandler(async (req, res) => {
    const { status, page = 1, limit = 20 } = req.query;

    let query = supabase
      .from('prescriptions')
      .select('*, users!prescriptions_user_id_fkey(id, email, full_name, phone), reviewer:reviewed_by(id, email, full_name)', { count: 'exact' })
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

// PUT /api/admin/prescriptions/:id/verify - Verify or reject
router.put(
  '/prescriptions/:id/verify',
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status, rejection_reason } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Status must be approved or rejected' });
    }

    if (status === 'rejected' && !rejection_reason) {
      return res.status(400).json({ message: 'Rejection reason is required' });
    }

    const { data: prescription, error } = await supabase
      .from('prescriptions')
      .update({
        status,
        reviewed_by: req.user.id,
        reviewed_at: new Date().toISOString(),
        rejection_reason: rejection_reason || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error || !prescription) {
      return res.status(404).json({ message: 'Prescription not found' });
    }

    await logAudit(req, 'verify_prescription', 'prescriptions', id, { status });

    res.json({ prescription });
  })
);

// PUT /api/admin/prescriptions/:id/notes - Add pharmacist notes
router.put(
  '/prescriptions/:id/notes',
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { notes } = req.body;

    if (!notes) return res.status(400).json({ message: 'Notes are required' });

    const { data: prescription, error } = await supabase
      .from('prescriptions')
      .update({ notes, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error || !prescription) {
      return res.status(404).json({ message: 'Prescription not found' });
    }

    await logAudit(req, 'add_prescription_notes', 'prescriptions', id);

    res.json({ prescription });
  })
);

// GET /api/admin/prescriptions/:id/image - Get prescription image
router.get(
  '/prescriptions/:id/image',
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    const { data: prescription, error } = await supabase
      .from('prescriptions')
      .select('image_url')
      .eq('id', id)
      .single();

    if (error || !prescription) {
      return res.status(404).json({ message: 'Prescription not found' });
    }

    res.json({ imageUrl: prescription.image_url });
  })
);

// =============================================
// COUPON MANAGEMENT
// =============================================

// GET /api/admin/coupons - All coupons
router.get(
  '/coupons',
  asyncHandler(async (req, res) => {
    const { isActive, page = 1, limit = 20 } = req.query;

    let query = supabase
      .from('coupons')
      .select('*, creator:created_by(id, email, full_name)', { count: 'exact' })
      .order('created_at', { ascending: false });

    if (isActive !== undefined) query = query.eq('is_active', isActive === 'true');

    const offset = (parseInt(page) - 1) * parseInt(limit);
    query = query.range(offset, offset + parseInt(limit) - 1);

    const { data: coupons, count, error } = await query;
    if (error) return res.status(500).json({ message: 'Failed to fetch coupons' });

    res.json({
      coupons: coupons || [],
      total: count || 0,
      page: parseInt(page),
      totalPages: Math.ceil((count || 0) / parseInt(limit)),
    });
  })
);

// POST /api/admin/coupons - Create coupon
router.post(
  '/coupons',
  asyncHandler(async (req, res) => {
    const {
      code, description, discount_type, discount_value,
      min_order_amount, max_discount, usage_limit,
      per_user_limit, applicable_products, applicable_categories,
      starts_at, expires_at,
    } = req.body;

    if (!code || !discount_type || discount_value === undefined) {
      return res.status(400).json({ message: 'Code, discount type, and discount value are required' });
    }

    if (!['percentage', 'fixed_amount'].includes(discount_type)) {
      return res.status(400).json({ message: 'Discount type must be percentage or fixed_amount' });
    }

    const { data: coupon, error } = await supabase
      .from('coupons')
      .insert({
        code: code.toUpperCase(),
        description: description || '',
        discount_type,
        discount_value: parseFloat(discount_value),
        min_order_amount: min_order_amount ? parseFloat(min_order_amount) : 0,
        max_discount: max_discount ? parseFloat(max_discount) : null,
        usage_limit: parseInt(usage_limit || 0),
        per_user_limit: parseInt(per_user_limit || 1),
        applicable_products: applicable_products || [],
        applicable_categories: applicable_categories || [],
        is_active: true,
        starts_at: starts_at || null,
        expires_at: expires_at || null,
        created_by: req.user.id,
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') return res.status(409).json({ message: 'Coupon code already exists' });
      return res.status(500).json({ message: 'Failed to create coupon' });
    }

    await logAudit(req, 'create_coupon', 'coupons', coupon.id, { code });

    res.status(201).json({ coupon });
  })
);

// PUT /api/admin/coupons/:id - Update coupon
router.put(
  '/coupons/:id',
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const updates = req.body;
    delete updates.id;
    delete updates.created_by;
    delete updates.created_at;

    if (updates.code) updates.code = updates.code.toUpperCase();

    const { data: coupon, error } = await supabase
      .from('coupons')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error || !coupon) return res.status(404).json({ message: 'Coupon not found' });

    await logAudit(req, 'update_coupon', 'coupons', id, { updates: Object.keys(updates) });

    res.json({ coupon });
  })
);

// DELETE /api/admin/coupons/:id - Delete coupon
router.delete(
  '/coupons/:id',
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    const { error } = await supabase.from('coupons').delete().eq('id', id);
    if (error) return res.status(500).json({ message: 'Failed to delete coupon' });

    await logAudit(req, 'delete_coupon', 'coupons', id);
    res.json({ message: 'Coupon deleted' });
  })
);

// PUT /api/admin/coupons/:id/toggle - Toggle coupon active status
router.put(
  '/coupons/:id/toggle',
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    const { data: current } = await supabase
      .from('coupons')
      .select('is_active')
      .eq('id', id)
      .single();

    if (!current) return res.status(404).json({ message: 'Coupon not found' });

    const { data: coupon, error } = await supabase
      .from('coupons')
      .update({ is_active: !current.is_active, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) return res.status(500).json({ message: 'Failed to toggle coupon' });

    await logAudit(req, 'toggle_coupon', 'coupons', id, { is_active: coupon.is_active });

    res.json({ coupon });
  })
);

// GET /api/admin/coupons/:id/usage - Coupon usage statistics
router.get(
  '/coupons/:id/usage',
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    const { data: coupon } = await supabase.from('coupons').select('*').eq('id', id).single();
    if (!coupon) return res.status(404).json({ message: 'Coupon not found' });

    const { data: usage } = await supabase
      .from('coupon_usage')
      .select('*, users!coupon_usage_user_id_fkey(id, email, full_name), orders!coupon_usage_order_id_fkey(order_number)')
      .eq('coupon_id', id)
      .order('used_at', { ascending: false });

    const totalDiscount = (usage || []).reduce((s, u) => s + parseFloat(u.discount_amount || 0), 0);

    res.json({
      coupon,
      usage: usage || [],
      stats: {
        totalUsed: coupon.used_count,
        totalDiscount,
        remainingUses: coupon.usage_limit > 0 ? Math.max(0, coupon.usage_limit - coupon.used_count) : 'unlimited',
      },
    });
  })
);

// =============================================
// AUDIT LOGS
// =============================================

// GET /api/admin/audit-logs
router.get(
  '/audit-logs',
  asyncHandler(async (req, res) => {
    const { action, entityType, userId, page = 1, limit = 50 } = req.query;

    let query = supabase
      .from('audit_logs')
      .select('*, users!audit_logs_user_id_fkey(id, email, full_name)', { count: 'exact' })
      .order('created_at', { ascending: false });

    if (action) query = query.eq('action', action);
    if (entityType) query = query.eq('entity_type', entityType);
    if (userId) query = query.eq('user_id', userId);

    const offset = (parseInt(page) - 1) * parseInt(limit);
    query = query.range(offset, offset + parseInt(limit) - 1);

    const { data: logs, count, error } = await query;
    if (error) return res.status(500).json({ message: 'Failed to fetch audit logs' });

    // Get unique actions for filter dropdown
    const { data: actions } = await supabase
      .from('audit_logs')
      .select('action')
      .limit(100);

    const uniqueActions = [...new Set((actions || []).map((a) => a.action))];

    res.json({
      logs: logs || [],
      total: count || 0,
      page: parseInt(page),
      totalPages: Math.ceil((count || 0) / parseInt(limit)),
      filters: { actions: uniqueActions },
    });
  })
);

// =============================================
// SYSTEM SETTINGS
// =============================================

// GET /api/admin/settings - Get all settings
router.get(
  '/settings',
  asyncHandler(async (req, res) => {
    const { data: settings, error } = await supabase
      .from('system_settings')
      .select('*')
      .order('setting_key', { ascending: true });

    if (error) return res.status(500).json({ message: 'Failed to fetch settings' });

    // Convert to key-value object
    const settingsMap = {};
    (settings || []).forEach((s) => {
      settingsMap[s.setting_key] = s.setting_value;
    });

    res.json({ settings: settingsMap, settingsList: settings || [] });
  })
);

// PUT /api/admin/settings - Update settings
router.put(
  '/settings',
  asyncHandler(async (req, res) => {
    const { settings } = req.body;

    if (!settings || typeof settings !== 'object') {
      return res.status(400).json({ message: 'Settings object is required' });
    }

    const results = [];
    for (const [key, value] of Object.entries(settings)) {
      const { error } = await supabase.from('system_settings').upsert(
        {
          setting_key: key,
          setting_value: typeof value === 'string' ? value : value,
          updated_by: req.user.id,
        },
        { onConflict: 'setting_key' }
      );

      if (error) {
        results.push({ key, error: error.message });
      } else {
        results.push({ key, success: true });
      }
    }

    await logAudit(req, 'update_settings', 'system_settings', null, { keys: Object.keys(settings) });

    res.json({ results });
  })
);

// POST /api/admin/maintenance - Toggle maintenance mode
router.put(
  '/maintenance',
  asyncHandler(async (req, res) => {
    const { enabled, message } = req.body;

    const { error } = await supabase.from('system_settings').upsert(
      {
        setting_key: 'maintenance_mode',
        setting_value: {
          enabled: Boolean(enabled),
          message: message || 'Site is under maintenance. Please check back later.',
          updated_at: new Date().toISOString(),
        },
        updated_by: req.user.id,
      },
      { onConflict: 'setting_key' }
    );

    if (error) return res.status(500).json({ message: 'Failed to update maintenance mode' });

    await logAudit(req, 'toggle_maintenance', 'system_settings', null, { enabled });

    res.json({
      maintenance: Boolean(enabled),
      message: `Maintenance mode ${enabled ? 'enabled' : 'disabled'}`,
    });
  })
);

// =============================================
// BACKUP & EXPORT
// =============================================

// POST /api/admin/backup - Trigger backup
router.post(
  '/backup',
  asyncHandler(async (req, res) => {
    // Collect data for backup
    const [
      { data: users },
      { data: products },
      { data: orders },
      { data: prescriptions },
      { data: coupons },
      { data: categories },
    ] = await Promise.all([
      supabase.from('users').select('*'),
      supabase.from('products').select('*'),
      supabase.from('orders').select('*'),
      supabase.from('prescriptions').select('*'),
      supabase.from('coupons').select('*'),
      supabase.from('categories').select('*'),
    ]);

    const backup = {
      timestamp: new Date().toISOString(),
      generatedBy: req.user.email,
      stats: {
        users: users?.length || 0,
        products: products?.length || 0,
        orders: orders?.length || 0,
        prescriptions: prescriptions?.length || 0,
        coupons: coupons?.length || 0,
        categories: categories?.length || 0,
      },
      data: {
        users,
        products,
        orders,
        prescriptions,
        coupons,
        categories,
      },
    };

    await logAudit(req, 'backup_data', 'system', null, { stats: backup.stats });

    res.json({
      message: 'Backup generated successfully',
      backup,
    });
  })
);

// GET /api/admin/export - Export data
router.get(
  '/export',
  asyncHandler(async (req, res) => {
    const { type = 'orders', format = 'json', startDate, endDate } = req.query;

    let data = [];
    let filename = type;

    switch (type) {
      case 'orders': {
        let query = supabase
          .from('orders')
          .select('*, order_items(*), users!orders_user_id_fkey(id, email, full_name, phone)')
          .order('created_at', { ascending: false });

        if (startDate) query = query.gte('created_at', new Date(startDate).toISOString());
        if (endDate) query = query.lte('created_at', new Date(endDate).toISOString());

        const { data: orders } = await query;
        data = orders || [];
        break;
      }
      case 'products': {
        const { data: products } = await supabase.from('products').select('*').order('name');
        data = products || [];
        break;
      }
      case 'users': {
        const { data: users } = await supabase
          .from('users')
          .select('id, email, full_name, phone, role, is_active, created_at')
          .order('created_at', { ascending: false });
        data = users || [];
        break;
      }
      case 'prescriptions': {
        const { data: prescriptions } = await supabase
          .from('prescriptions')
          .select('*, users!prescriptions_user_id_fkey(id, email, full_name)')
          .order('created_at', { ascending: false });
        data = prescriptions || [];
        break;
      }
      default:
        return res.status(400).json({ message: `Unknown export type: ${type}` });
    }

    await logAudit(req, 'export_data', type, null, { format, count: data.length });

    if (format === 'csv') {
      // Simple CSV conversion for orders
      if (type === 'orders') {
        const headers = 'Order Number,Status,Customer,Email,Total,Date\n';
        const rows = data.map((o) =>
          `"${o.order_number}","${o.status}","${o.users?.full_name || ''}","${o.users?.email || ''}",${o.total},"${o.created_at}"`
        ).join('\n');
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=${filename}.csv`);
        return res.send(headers + rows);
      }
    }

    res.json({
      exportType: type,
      format,
      count: data.length,
      data,
    });
  })
);

// =============================================
// SYNC MANAGEMENT
// =============================================

// =============================================
// NOTIFICATION MANAGEMENT
// =============================================

// POST /api/admin/notifications/broadcast - Send promotion to all customers
router.post(
  '/notifications/broadcast',
  asyncHandler(async (req, res) => {
    const { title, message, sendEmail = true, data = {} } = req.body;

    if (!title || !message) {
      return res.status(400).json({ message: 'Title and message are required' });
    }

    // Get all active customers
    const { data: customers, error } = await supabase
      .from('users')
      .select('id, email, full_name')
      .eq('role', 'customer')
      .eq('is_active', true);

    if (error) {
      return res.status(500).json({ message: 'Failed to fetch customers' });
    }

    if (!customers || customers.length === 0) {
      return res.status(400).json({ message: 'No active customers found' });
    }

    // Send promotion notification to each customer
    let sent = 0;
    let failed = 0;
    const errors = [];

    await Promise.all(
      customers.map(async (customer) => {
        try {
          await notificationService.notifyPromotion({
            userId: customer.id,
            title,
            message,
            data: { ...data, broadcastBy: req.user.id },
            sendEmail,
          });
          sent++;
        } catch (err) {
          failed++;
          errors.push({ userId: customer.id, error: err.message });
        }
      })
    );

    await logAudit(req, 'broadcast_notification', 'notifications', null, {
      title,
      recipients: customers.length,
      sent,
      failed,
    });

    res.json({
      message: `Promotion broadcast to ${sent} customer(s)`,
      recipients: customers.length,
      sent,
      failed,
      errors: errors.slice(0, 20),
    });
  })
);

// GET /api/admin/notifications - Get sent notifications (for admin view)
router.get(
  '/notifications',
  asyncHandler(async (req, res) => {
    const { type, page = 1, limit = 20 } = req.query;

    let query = supabase
      .from('notifications')
      .select('*, users!notifications_user_id_fkey(id, email, full_name)', { count: 'exact' })
      .order('created_at', { ascending: false });

    if (type) query = query.eq('type', type);

    const offset = (parseInt(page) - 1) * parseInt(limit);
    query = query.range(offset, offset + parseInt(limit) - 1);

    const { data: notifications, count, error } = await query;
    if (error) return res.status(500).json({ message: 'Failed to fetch notifications' });

    res.json({
      notifications: notifications || [],
      total: count || 0,
      page: parseInt(page),
      totalPages: Math.ceil((count || 0) / parseInt(limit)),
    });
  })
);

// =============================================
// SYNC MANAGEMENT
// =============================================

// POST /api/admin/sync/products - Trigger product sync
router.post(
  '/sync/products',
  asyncHandler(async (req, res) => {
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

export default router;
