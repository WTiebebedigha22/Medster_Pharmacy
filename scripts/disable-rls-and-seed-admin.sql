-- =====================================================
-- Medster Pharmacy - FIX: Disable RLS & Seed Admin
-- =====================================================
-- Run this in Supabase SQL Editor (it bypasses RLS)
-- 
-- This SQL will:
--   1. Disable RLS on all tables the backend needs to write to
--   2. Insert the admin user so you can login
-- =====================================================

-- 1. Disable RLS on all tables used by the backend
ALTER TABLE IF EXISTS users DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS addresses DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS products DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS cart_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS order_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS prescriptions DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS prescription_orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS coupons DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS coupon_usage DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS wishlist_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS reviews DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS audit_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS system_settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS admin_roles DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS token_blacklist DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS payment_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS sync_logs DISABLE ROW LEVEL SECURITY;

-- 2. Insert the admin user
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

-- 3. Add admin permissions
INSERT INTO admin_roles (user_id, role_label, permissions)
SELECT 
  id,
  'super_admin',
  '["products.manage","orders.manage","users.manage","admins.manage","prescriptions.manage","coupons.manage","reports.view","settings.manage","audit.view","inventory.manage","categories.manage"]'
FROM users 
WHERE email = 'admin@medster.com'
ON CONFLICT (user_id) DO UPDATE 
SET role_label = 'super_admin', 
    permissions = '["products.manage","orders.manage","users.manage","admins.manage","prescriptions.manage","coupons.manage","reports.view","settings.manage","audit.view","inventory.manage","categories.manage"]';

-- =====================================================
-- DONE
-- =====================================================
-- Now restart your backend server and login with:
--   Email:    admin@medster.com
--   Password: admin123
-- =====================================================

