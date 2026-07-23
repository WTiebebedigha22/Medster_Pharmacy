import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { validate, schemas } from '../middleware/validate.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { supabase } from '../db/supabase.js';

const router = Router();
router.use(authenticate);

// GET /api/addresses
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const { data: addresses, error } = await supabase
      .from('addresses')
      .select('*')
      .eq('user_id', req.user.id)
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ addresses: addresses || [] });
  })
);

// POST /api/addresses
router.post(
  '/',
  validate(schemas.address),
  asyncHandler(async (req, res) => {
    const addressData = {
      user_id: req.user.id,
      label: req.body.label || 'Home',
      address_line1: req.body.addressLine1,
      address_line2: req.body.addressLine2 || null,
      city: req.body.city,
      state: req.body.state,
      postal_code: req.body.postalCode || null,
      country: req.body.country || 'Nigeria',
      is_default: req.body.isDefault || false,
    };

    // If setting as default, unset other defaults
    if (addressData.is_default) {
      await supabase
        .from('addresses')
        .update({ is_default: false })
        .eq('user_id', req.user.id);
    }

    const { data: address, error } = await supabase
      .from('addresses')
      .insert(addressData)
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ address });
  })
);

// PUT /api/addresses/:id
router.put(
  '/:id',
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Verify ownership
    const { data: existing } = await supabase
      .from('addresses')
      .select('id')
      .eq('id', id)
      .eq('user_id', req.user.id)
      .single();

    if (!existing) {
      return res.status(404).json({ message: 'Address not found' });
    }

    const updates = {};
    if (req.body.label) updates.label = req.body.label;
    if (req.body.addressLine1) updates.address_line1 = req.body.addressLine1;
    if (req.body.addressLine2 !== undefined) updates.address_line2 = req.body.addressLine2;
    if (req.body.city) updates.city = req.body.city;
    if (req.body.state) updates.state = req.body.state;
    if (req.body.postalCode !== undefined) updates.postal_code = req.body.postalCode;
    if (req.body.country) updates.country = req.body.country;
    if (req.body.isDefault !== undefined) updates.is_default = req.body.isDefault;

    if (updates.is_default) {
      await supabase
        .from('addresses')
        .update({ is_default: false })
        .eq('user_id', req.user.id);
    }

    const { data: address, error } = await supabase
      .from('addresses')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json({ address });
  })
);

// DELETE /api/addresses/:id
router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    const { data: existing } = await supabase
      .from('addresses')
      .select('id')
      .eq('id', id)
      .eq('user_id', req.user.id)
      .single();

    if (!existing) {
      return res.status(404).json({ message: 'Address not found' });
    }

    await supabase.from('addresses').delete().eq('id', id);
    res.json({ message: 'Address deleted' });
  })
);

export default router;
