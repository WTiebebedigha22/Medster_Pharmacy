import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import config from '../config/index.js';
import { supabase } from '../db/supabase.js';

const SALT_ROUNDS = 12;

/**
 * Register a new user
 */
export async function registerUser({ email, password, fullName, phone }) {
  // Check if user already exists
  const { data: existing } = await supabase
    .from('users')
    .select('id')
    .eq('email', email.toLowerCase())
    .maybeSingle();

  if (existing) {
    throw Object.assign(new Error('An account with this email already exists'), {
      statusCode: 409,
    });
  }

  // Hash password
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  // Insert user
  const { data: user, error } = await supabase
    .from('users')
    .insert({
      email: email.toLowerCase(),
      password_hash: passwordHash,
      full_name: fullName,
      phone: phone || null,
      role: 'customer',
    })
    .select('id, email, full_name, phone, role')
    .single();

  if (error) {
    throw new Error('Failed to create account');
  }

  // Generate tokens
  const tokens = generateTokens(user.id, user.role);

  return {
    user: sanitizeUser(user),
    ...tokens,
  };
}

/**
 * Login user
 */
export async function loginUser({ email, password }) {
  const { data: user, error } = await supabase
    .from('users')
    .select('id, email, password_hash, full_name, phone, role, is_active')
    .eq('email', email.toLowerCase())
    .single();

  if (error || !user) {
    throw Object.assign(new Error('Invalid email or password'), {
      statusCode: 401,
    });
  }

  if (!user.is_active) {
    throw Object.assign(new Error('Account has been disabled'), {
      statusCode: 403,
    });
  }

  // Verify password
  const isValid = await bcrypt.compare(password, user.password_hash);
  if (!isValid) {
    throw Object.assign(new Error('Invalid email or password'), {
      statusCode: 401,
    });
  }

  // Generate tokens
  const tokens = generateTokens(user.id, user.role);

  return {
    user: sanitizeUser(user),
    ...tokens,
  };
}

/**
 * Refresh access token
 */
export async function refreshAccessToken(refreshToken) {
  try {
    const decoded = jwt.verify(refreshToken, config.jwt.secret);
    
    // Verify user still exists and is active
    const { data: user } = await supabase
      .from('users')
      .select('id, role, is_active')
      .eq('id', decoded.userId)
      .single();

    if (!user || !user.is_active) {
      throw new Error('User not found or inactive');
    }

    const tokens = generateTokens(user.id, user.role);
    return tokens;
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw Object.assign(new Error('Refresh token expired'), { statusCode: 401 });
    }
    throw Object.assign(new Error('Invalid refresh token'), { statusCode: 401 });
  }
}

/**
 * Logout (blacklist the token)
 */
export async function logoutUser(token) {
  if (!token) return;

  try {
    const decoded = jwt.decode(token);
    if (!decoded || !decoded.exp) return;

    await supabase.from('token_blacklist').insert({
      token_hash: hashToken(token),
      expires_at: new Date(decoded.exp * 1000).toISOString(),
    });
  } catch {
    // Silently fail - blacklisting is best effort
  }
}

/**
 * Get user profile
 */
export async function getUserProfile(userId) {
  const { data: user, error } = await supabase
    .from('users')
    .select('id, email, full_name, phone, role, created_at')
    .eq('id', userId)
    .single();

  if (error) throw new Error('User not found');
  return user;
}

/**
 * Update user profile
 */
export async function updateUserProfile(userId, updates) {
  const allowedUpdates = ['full_name', 'phone'];
  const sanitizedUpdates = {};
  
  for (const key of allowedUpdates) {
    if (updates[key] !== undefined) {
      sanitizedUpdates[key] = updates[key];
    }
  }

  if (Object.keys(sanitizedUpdates).length === 0) {
    throw Object.assign(new Error('No valid fields to update'), { statusCode: 400 });
  }

  const { data: user, error } = await supabase
    .from('users')
    .update(sanitizedUpdates)
    .eq('id', userId)
    .select('id, email, full_name, phone, role')
    .single();

  if (error) throw new Error('Failed to update profile');
  return user;
}

/**
 * Change password
 */
export async function changePassword(userId, currentPassword, newPassword) {
  // Get current password hash
  const { data: user } = await supabase
    .from('users')
    .select('password_hash')
    .eq('id', userId)
    .single();

  if (!user) throw new Error('User not found');

  // Verify current password
  const isValid = await bcrypt.compare(currentPassword, user.password_hash);
  if (!isValid) {
    throw Object.assign(new Error('Current password is incorrect'), { statusCode: 400 });
  }

  // Update password
  const newHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
  const { error } = await supabase
    .from('users')
    .update({ password_hash: newHash })
    .eq('id', userId);

  if (error) throw new Error('Failed to update password');
  return { success: true };
}

// =============================================
// HELPERS
// =============================================

function generateTokens(userId, role) {
  const accessToken = jwt.sign(
    { userId, role },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn }
  );

  const refreshToken = jwt.sign(
    { userId, role, type: 'refresh' },
    config.jwt.secret,
    { expiresIn: config.jwt.refreshExpiresIn }
  );

  return { accessToken, refreshToken };
}

function sanitizeUser(user) {
  const { password_hash, is_active, ...safeUser } = user;
  return safeUser;
}

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex').substring(0, 32);
}

export default {
  registerUser,
  loginUser,
  refreshAccessToken,
  logoutUser,
  getUserProfile,
  updateUserProfile,
  changePassword,
};
