import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { supabase } from '../db/supabase.js';

const router = Router();

// All notification routes require authentication
router.use(authenticate);

// GET /api/notifications - Get user's notifications
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const { type, page = 1, limit = 20, unread = false } = req.query;

    let query = supabase
      .from('notifications')
      .select('*', { count: 'exact' })
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    if (type) query = query.eq('type', type);
    if (unread === 'true') query = query.eq('is_read', false);

    const offset = (parseInt(page) - 1) * parseInt(limit);
    query = query.range(offset, offset + parseInt(limit) - 1);

    const { data: notifications, count, error } = await query;

    if (error) {
      return res.status(500).json({ message: 'Failed to fetch notifications' });
    }

    // Get unread count
    const { data: unreadNotifs } = await supabase
      .from('notifications')
      .select('id')
      .eq('user_id', req.user.id)
      .eq('is_read', false);

    res.json({
      notifications: notifications || [],
      total: count || 0,
      unreadCount: unreadNotifs?.length || 0,
      page: parseInt(page),
      totalPages: Math.ceil((count || 0) / parseInt(limit)),
    });
  })
);

// GET /api/notifications/unread-count - Get unread count
router.get(
  '/unread-count',
  asyncHandler(async (req, res) => {
    const { count, error } = await supabase
      .from('notifications')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', req.user.id)
      .eq('is_read', false);

    if (error) {
      return res.status(500).json({ message: 'Failed to fetch unread count' });
    }

    res.json({ unreadCount: count || 0 });
  })
);

// PUT /api/notifications/:id/read - Mark a notification as read
router.put(
  '/:id/read',
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    const { data: notification, error } = await supabase
      .from('notifications')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', req.user.id)
      .select()
      .single();

    if (error || !notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.json({ notification });
  })
);

// PUT /api/notifications/read-all - Mark all as read
router.put(
  '/read-all',
  asyncHandler(async (req, res) => {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('user_id', req.user.id)
      .eq('is_read', false);

    if (error) {
      return res.status(500).json({ message: 'Failed to mark notifications as read' });
    }

    res.json({ message: 'All notifications marked as read' });
  })
);

// DELETE /api/notifications/:id - Delete a notification
router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    const { data: notification } = await supabase
      .from('notifications')
      .select('id')
      .eq('id', id)
      .eq('user_id', req.user.id)
      .single();

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    await supabase.from('notifications').delete().eq('id', id);
    res.json({ message: 'Notification deleted' });
  })
);

export default router;
