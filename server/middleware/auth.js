import jwt from 'jsonwebtoken';
import config from '../config/index.js';
import { supabase } from '../db/supabase.js';

// Verify JWT token and attach user to request
export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const token = authHeader.split(' ')[1];
    
    // Check if token is blacklisted
    const { data: blacklisted } = await supabase
      .from('token_blacklist')
      .select('id')
      .eq('token_hash', hashToken(token))
      .maybeSingle();

    if (blacklisted) {
      return res.status(401).json({ message: 'Token has been revoked' });
    }

    const decoded = jwt.verify(token, config.jwt.secret);
    
    // Get user from database
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, full_name, phone, role, is_active')
      .eq('id', decoded.userId)
      .single();

    if (error || !user) {
      return res.status(401).json({ message: 'User not found' });
    }

    if (!user.is_active) {
      return res.status(403).json({ message: 'Account is disabled' });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    return res.status(500).json({ message: 'Authentication error' });
  }
};

// Require specific roles
export const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `Access denied. Required role: ${roles.join(' or ')}` 
      });
    }
    next();
  };
};

// Optional auth (attaches user if token present, but doesn't require it)
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      req.user = null;
      return next();
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, config.jwt.secret);
    
    const { data: user } = await supabase
      .from('users')
      .select('id, email, full_name, role, is_active')
      .eq('id', decoded.userId)
      .single();

    req.user = user || null;
  } catch {
    req.user = null;
  }
  next();
};

// Simple hash function for token blacklisting
function hashToken(token) {
  let hash = 0;
  for (let i = 0; i < token.length; i++) {
    const char = token.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return hash.toString(36);
}
