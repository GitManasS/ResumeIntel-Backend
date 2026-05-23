import { authService } from '../services/auth.service.js';
import { emailService } from '../services/email.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const register = asyncHandler(async (req, res) => {
  const { user, accessToken, refreshToken } = await authService.register(req.body);
  res.status(201).json({
    success: true,
    data: { user, accessToken, refreshToken },
  });
});

export const login = asyncHandler(async (req, res) => {
  const { user, accessToken, refreshToken } = await authService.login(req.body);
  res.json({
    success: true,
    data: { user, accessToken, refreshToken },
  });
});

export const refresh = asyncHandler(async (req, res) => {
  const { user, accessToken, refreshToken } = await authService.refreshToken(
    req.body.refreshToken
  );
  res.json({
    success: true,
    data: { user, accessToken, refreshToken },
  });
});

export const logout = asyncHandler(async (req, res) => {
  await authService.logout(req.user._id);
  res.json({ success: true, message: 'Logged out successfully' });
});

export const me = asyncHandler(async (req, res) => {
  res.json({ success: true, data: { user: req.user } });
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const result = await authService.forgotPassword(req.body.email);
  if (result.resetToken) {
    await emailService.sendPasswordReset(result.user, result.resetToken);
  }
  res.json({
    success: true,
    message: 'If email exists, reset link has been sent',
  });
});

export const resetPassword = asyncHandler(async (req, res) => {
  await authService.resetPassword(req.body.token, req.body.password);
  res.json({ success: true, message: 'Password reset successful' });
});
