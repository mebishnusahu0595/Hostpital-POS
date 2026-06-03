import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/User';
import { asyncHandler } from '../utils/asyncWrapper';
import { AppError } from '../utils/AppError';
import { sendEmail } from '../utils/email';

const hashToken = (token: string) => crypto.createHash('sha256').update(token).digest('hex');

// Generate Access Token
const generateAccessToken = (id: string) => {
  return jwt.sign({ id }, process.env.JWT_SECRET as string, {
    expiresIn: (process.env.JWT_ACCESS_EXPIRY || '15m') as any,
  });
};

// Generate Refresh Token
const generateRefreshToken = (id: string) => {
  return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET as string, {
    expiresIn: (process.env.JWT_REFRESH_EXPIRY || '7d') as any,
  });
};

// @desc    Login user
// @route   POST /api/v1/auth/login
// @access  Public
export const login = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user || !user.isActive) {
    return next(new AppError('Invalid credentials or deactivated account', 401));
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    return next(new AppError('Invalid credentials', 401));
  }

  const accessToken = generateAccessToken(user._id.toString());
  const refreshToken = generateRefreshToken(user._id.toString());

  user.refreshToken = refreshToken;
  user.lastLogin = new Date();
  await user.save();

  // Send refresh token in HTTP-only cookie
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 90 * 24 * 60 * 60 * 1000, // 90 days
  });

  res.status(200).json({
    success: true,
    data: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      hospitalId: user.hospitalId,
      phone: user.phone,
      avatar: user.avatar,
      accessToken,
    },
  });
});

// @desc    Refresh access token
// @route   POST /api/v1/auth/refresh
// @access  Public
export const refresh = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const refreshToken = req.cookies?.refreshToken || req.body.refreshToken;

  if (!refreshToken) {
    return next(new AppError('Not authorized, no refresh token', 401));
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET as string) as any;
    const user = await User.findById(decoded.id);

    if (!user || user.refreshToken !== refreshToken || !user.isActive) {
      return next(new AppError('Not authorized, invalid refresh token', 401));
    }

    const newAccessToken = generateAccessToken(user._id.toString());
    const newRefreshToken = generateRefreshToken(user._id.toString());

    user.refreshToken = newRefreshToken;
    await user.save();

    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 90 * 24 * 60 * 60 * 1000, // 90 days
    });

    res.status(200).json({
      success: true,
      accessToken: newAccessToken,
    });
  } catch (error) {
    return next(new AppError('Not authorized, refresh token failed', 401));
  }
});

// @desc    Logout user
// @route   POST /api/v1/auth/logout
// @access  Protected
export const logout = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  if (req.user) {
    await User.findByIdAndUpdate(req.user._id, { refreshToken: '' });
  }

  res.cookie('refreshToken', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    message: 'User logged out successfully',
  });
});

// @desc    Get current logged in user
// @route   GET /api/v1/auth/me
// @access  Protected
export const getMe = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const user = await User.findById(req.user?._id).select('-passwordHash -refreshToken');
  
  res.status(200).json({
    success: true,
    data: user,
  });
});

// @desc    Change own password
// @route   PATCH /api/v1/auth/change-password
// @access  Protected
export const changePassword = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user?._id);

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!isMatch) {
    return next(new AppError('Incorrect current password', 401));
  }

  const salt = await bcrypt.genSalt(12);
  user.passwordHash = await bcrypt.hash(newPassword, salt);
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Password changed successfully',
  });
});

// @desc    Forgot Password — issue a reset token and email a reset link
// @route   POST /api/v1/auth/forgot-password
// @access  Public
export const forgotPassword = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { email } = req.body;

  // Always respond the same way to avoid leaking which emails exist.
  const genericResponse = () =>
    res.status(200).json({
      success: true,
      message: 'If an account with that email exists, a reset link has been sent.',
    });

  const user = await User.findOne({ email });
  if (!user || !user.isActive) {
    return genericResponse();
  }

  const rawToken = crypto.randomBytes(32).toString('hex');
  user.resetPasswordToken = hashToken(rawToken);
  user.resetPasswordExpire = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
  await user.save();

  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${rawToken}`;

  // In development, also surface the link in the server log for easy testing.
  if (process.env.NODE_ENV !== 'production') {
    console.log(`[forgot-password] Reset link for ${email}: ${resetUrl}`);
  }

  try {
    await sendEmail({
      to: email,
      subject: 'Reset your Centralized Medical Solutions password',
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #0A1628;">
          <h2 style="color:#0EA5E9;">Password Reset Request</h2>
          <p>We received a request to reset your password. This link expires in 1 hour.</p>
          <a href="${resetUrl}" style="background:#0A1628;color:#fff;padding:12px 24px;text-decoration:none;border-radius:8px;display:inline-block;margin:16px 0;">Reset Password</a>
          <p style="font-size:12px;color:#64748b;">If you didn't request this, you can safely ignore this email.</p>
        </div>
      `,
    });
  } catch (err) {
    // Email delivery problems shouldn't break the flow (or leak info).
    console.error('Failed to send reset email:', err);
  }

  return genericResponse();
});

// @desc    Reset Password using a valid token
// @route   POST /api/v1/auth/reset-password
// @access  Public
export const resetPassword = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { token, password } = req.body;

  if (!token || !password) {
    return next(new AppError('Token and new password are required', 400));
  }
  if (password.length < 6) {
    return next(new AppError('Password must be at least 6 characters', 400));
  }

  const user = await User.findOne({
    resetPasswordToken: hashToken(token),
    resetPasswordExpire: { $gt: new Date() },
  });

  if (!user) {
    return next(new AppError('Invalid or expired reset token', 400));
  }

  const salt = await bcrypt.genSalt(12);
  user.passwordHash = await bcrypt.hash(password, salt);
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  user.refreshToken = ''; // force re-login everywhere
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Password reset successfully. You can now log in.',
  });
});
