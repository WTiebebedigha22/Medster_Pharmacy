import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import crypto from 'crypto';
import { authenticate, requireRole } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { supabase } from '../db/supabase.js';

// File upload configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/prescriptions/');
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, and PDF are allowed.'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

const router = Router();

// All routes require authentication
router.use(authenticate);

// POST /api/prescriptions/upload
router.post(
  '/upload',
  upload.single('prescription'),
  asyncHandler(async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: 'Prescription file is required' });
    }

    const { doctorName, prescriptionDate, notes } = req.body;

    // In production, upload to Cloudinary/S3 instead of local storage
    const imageUrl = `/uploads/prescriptions/${req.file.filename}`;

    const { data: prescription, error } = await supabase
      .from('prescriptions')
      .insert({
        user_id: req.user.id,
        image_url: imageUrl,
        doctor_name: doctorName || null,
        prescription_date: prescriptionDate || null,
        notes: notes || null,
        status: 'pending',
      })
      .select()
      .single();

    if (error) {
      return res.status(500).json({ message: 'Failed to save prescription' });
    }

    res.status(201).json({ prescription });
  })
);

// GET /api/prescriptions - Get user's prescriptions
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const { status } = req.query;

    let query = supabase
      .from('prescriptions')
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    if (status) query = query.eq('status', status);

    const { data: prescriptions, error } = await query;

    if (error) {
      return res.status(500).json({ message: 'Failed to fetch prescriptions' });
    }

    res.json({ prescriptions: prescriptions || [] });
  })
);

// GET /api/prescriptions/:id
router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    const { data: prescription, error } = await supabase
      .from('prescriptions')
      .select('*')
      .eq('id', id)
      .eq('user_id', req.user.id)
      .single();

    if (error || !prescription) {
      return res.status(404).json({ message: 'Prescription not found' });
    }

    res.json({ prescription });
  })
);

// DELETE /api/prescriptions/:id
router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    const { data: prescription } = await supabase
      .from('prescriptions')
      .select('id')
      .eq('id', id)
      .eq('user_id', req.user.id)
      .single();

    if (!prescription) {
      return res.status(404).json({ message: 'Prescription not found' });
    }

    await supabase.from('prescriptions').delete().eq('id', id);
    res.json({ message: 'Prescription deleted' });
  })
);

// =============================================
// ADMIN/PHARMACIST ROUTES
// =============================================

// GET /api/prescriptions/admin/all - Get all pending prescriptions
router.get(
  '/admin/all',
  requireRole('pharmacist', 'admin'),
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

    if (error) {
      return res.status(500).json({ message: 'Failed to fetch prescriptions' });
    }

    res.json({
      prescriptions: prescriptions || [],
      total: count || 0,
      page: parseInt(page),
      totalPages: Math.ceil((count || 0) / parseInt(limit)),
    });
  })
);

// PUT /api/prescriptions/admin/:id/review - Approve or reject
router.put(
  '/admin/:id/review',
  requireRole('pharmacist', 'admin'),
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status, rejectionReason } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Status must be approved or rejected' });
    }

    if (status === 'rejected' && !rejectionReason) {
      return res.status(400).json({ message: 'Rejection reason is required' });
    }

    const { data: prescription, error } = await supabase
      .from('prescriptions')
      .update({
        status,
        reviewed_by: req.user.id,
        reviewed_at: new Date().toISOString(),
        rejection_reason: rejectionReason || null,
      })
      .eq('id', id)
      .select()
      .single();

    if (error || !prescription) {
      return res.status(404).json({ message: 'Prescription not found' });
    }

    res.json({ prescription });
  })
);

export default router;
