-- =====================================================
-- Medster Pharmacy - Admin Account Seed
-- =====================================================
-- Run this SQL in your Supabase SQL Editor
-- Creates an admin account so you can log in to the admin dashboard
-- 
-- Admin Credentials:
--   Email:    admin@medster.com
--   Password: admin123
-- =====================================================

-- Insert admin user (password_hash is bcrypt of 'admin123')
INSERT INTO users (email, password_hash, full_name, phone, role, is_active, email_verified)
VALUES (
  'admin@medster.com',
  '$2b$12$u4gu5pw50m/Y8xqfLisUnenv5VILmtOiwsTadh0eLiOf56NWIHHv2',
  'Medster Admin',
  '+234 800 000 0000',
  'admin',
  true,
  true
)
ON CONFLICT (email) DO UPDATE 
SET role = 'admin', is_active = true, email_verified = true;

-- Also add to admin_roles table for permissions management
INSERT INTO admin_roles (user_id, role_label, permissions)
SELECT 
  id,
  'super_admin',
  '["products.manage", "orders.manage", "users.manage", "admins.manage", "prescriptions.manage", "coupons.manage", "reports.view", "settings.manage", "audit.view", "inventory.manage", "categories.manage"]'
FROM users 
WHERE email = 'admin@medster.com'
ON CONFLICT (user_id) DO UPDATE 
SET role_label = 'super_admin', 
    permissions = '["products.manage", "orders.manage", "users.manage", "admins.manage", "prescriptions.manage", "coupons.manage", "reports.view", "settings.manage", "audit.view", "inventory.manage", "categories.manage"]';

-- =====================================================
-- OPTIONAL: Create a second admin (pharmacist role)
-- Email:    pharmacist@medster.com
-- Password: pharmacist123
-- =====================================================

-- INSERT INTO users (email, password_hash, full_name, phone, role, is_active, email_verified)
-- VALUES (
--   'pharmacist@medster.com',
--   '$2b$12$u4gu5pw50m/Y8xqfLisUnenv5VILmtOiwsTadh0eLiOf56NWIHHv2',
--   'Medster Pharmacist',
--   '+234 800 000 0001',
--   'pharmacist',
--   true,
--   true
-- )
-- ON CONFLICT (email) DO UPDATE 
-- SET role = 'pharmacist', is_active = true, email_verified = true;

