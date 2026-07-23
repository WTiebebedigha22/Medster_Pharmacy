import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { validate, schemas } from '../middleware/validate.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import authService from '../services/authService.js';

const router = Router();

// POST /api/auth/register
router.post(
  '/register',
  validate(schemas.register),
  asyncHandler(async (req, res) => {
    const result = await authService.registerUser(req.body);
    res.status(201).json(result);
  })
);

// POST /api/auth/login
router.post(
  '/login',
  validate(schemas.login),
  asyncHandler(async (req, res) => {
    const result = await authService.loginUser(req.body);
    res.json(result);
  })
);

// POST /api/auth/refresh
router.post(
  '/refresh',
  asyncHandler(async (req, res) => {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ message: 'Refresh token is required' });
    }
    const tokens = await authService.refreshAccessToken(refreshToken);
    res.json(tokens);
  })
);

// POST /api/auth/logout
router.post(
  '/logout',
  asyncHandler(async (req, res) => {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;
    await authService.logoutUser(token);
    res.json({ message: 'Logged out successfully' });
  })
);

// GET /api/auth/me
router.get(
  '/me',
  authenticate,
  asyncHandler(async (req, res) => {
    const user = await authService.getUserProfile(req.user.id);
    res.json({ user });
  })
);

// PUT /api/auth/me
router.put(
  '/me',
  authenticate,
  asyncHandler(async (req, res) => {
    const user = await authService.updateUserProfile(req.user.id, req.body);
    res.json({ user });
  })
);

// PUT /api/auth/change-password
router.put(
  '/change-password',
  authenticate,
  asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Both passwords are required' });
    }
    if (newPassword.length < 8) {
      return res.status(400).json({ message: 'New password must be at least 8 characters' });
    }
    await authService.changePassword(req.user.id, currentPassword, newPassword);
    res.json({ message: 'Password changed successfully' });
  })
);

export default router;
