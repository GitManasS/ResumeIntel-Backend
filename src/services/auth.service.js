import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { env } from '../config/env.js';
import User from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';

const generateTokens = (userId) => {
  const accessToken = jwt.sign({ id: userId }, env.jwt.secret, {
    expiresIn: env.jwt.expiresIn,
  });
  const refreshToken = jwt.sign({ id: userId }, env.jwt.refreshSecret, {
    expiresIn: env.jwt.refreshExpiresIn,
  });
  return { accessToken, refreshToken };
};

export const authService = {
  async register({ name, email, password, role }) {
    const existing = await User.findOne({ email });
    if (existing) throw ApiError.conflict('Email already registered');

    const user = await User.create({
      name,
      email,
      password,
      role: role || 'candidate',
    });

    const tokens = generateTokens(user._id);
    user.refreshToken = tokens.refreshToken;
    await user.save({ validateBeforeSave: false });

    return { user, ...tokens };
  },

  async login({ email, password }) {
    const user = await User.findOne({ email })
      .select('+password +refreshToken')
      .populate('organization', 'name slug industry branding website isActive');
    if (!user || !(await user.comparePassword(password))) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    if (!user.isActive) throw ApiError.forbidden('Account deactivated');

    const tokens = generateTokens(user._id);
    user.refreshToken = tokens.refreshToken;
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    return { user, ...tokens };
  },

  async refreshToken(token) {
    if (!token) throw ApiError.unauthorized('Refresh token required');

    const decoded = jwt.verify(token, env.jwt.refreshSecret);
    const user = await User.findById(decoded.id).select('+refreshToken');

    if (!user || user.refreshToken !== token) {
      throw ApiError.unauthorized('Invalid refresh token');
    }

    const tokens = generateTokens(user._id);
    user.refreshToken = tokens.refreshToken;
    await user.save({ validateBeforeSave: false });

    return { user, ...tokens };
  },

  async logout(userId) {
    await User.findByIdAndUpdate(userId, { refreshToken: null });
  },

  async forgotPassword(email) {
    const user = await User.findOne({ email });
    if (!user) return { message: 'If email exists, reset link sent' };

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.passwordResetExpires = Date.now() + 3600000;
    await user.save({ validateBeforeSave: false });

    return { resetToken, user };
  },

  async resetPassword(token, newPassword) {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    }).select('+password');

    if (!user) throw ApiError.badRequest('Invalid or expired reset token');

    user.password = newPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    return user;
  },
};
