import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User';
import { asyncHandler } from '../utils/asyncWrapper';
import { AppError } from '../utils/AppError';

// @desc    Get all users
// @route   GET /api/v1/users
// @access  Super Admin / Hospital Admin
export const getUsers = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  let query: any = {};

  if (req.user?.role !== 'super_admin') {
    query.hospitalId = req.user?.hospitalId;
  } else if (req.query.hospitalId) {
    query.hospitalId = req.query.hospitalId;
  }

  const users = await User.find(query)
    .populate('hospitalId', 'name code')
    .select('-passwordHash -refreshToken');

  console.log(`[DEBUG] getUsers for role ${req.user?.role}: Found ${users.length} users with query:`, JSON.stringify(query));

  res.status(200).json({
    success: true,
    count: users.length,
    data: users,
  });
});

// @desc    Create a user
// @route   POST /api/v1/users
// @access  Super Admin / Hospital Admin
export const createUser = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { hospitalId, name, email, phone, password, role } = req.body;

  // Enforce hospital scope on creation
  let targetHospitalId = hospitalId;
  if (req.user?.role !== 'super_admin') {
    targetHospitalId = req.user?.hospitalId;
  }

  if (!targetHospitalId && role !== 'super_admin') {
    return next(new AppError('Hospital ID is required', 400));
  }

  // Check if email exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new AppError('User with this email already exists', 400));
  }

  const salt = await bcrypt.genSalt(12);
  const passwordHash = await bcrypt.hash(password, salt);

  const user = await User.create({
    hospitalId: targetHospitalId,
    name,
    email,
    phone,
    passwordHash,
    role,
    createdBy: req.user?._id,
  });

  res.status(201).json({
    success: true,
    data: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      hospitalId: user.hospitalId,
    },
  });
});

// @desc    Get single user
// @route   GET /api/v1/users/:id
// @access  Super Admin / Hospital Admin
export const getUser = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const user = await User.findById(req.params.id).select('-passwordHash -refreshToken');

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  // Tenant isolation check
  if (req.user?.role !== 'super_admin' && user.hospitalId?.toString() !== req.user?.hospitalId?.toString()) {
    return next(new AppError('Not authorized to access this user', 403));
  }

  res.status(200).json({
    success: true,
    data: user,
  });
});

// @desc    Update user
// @route   PATCH /api/v1/users/:id
// @access  Super Admin / Hospital Admin
export const updateUser = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const userToUpdate = await User.findById(req.params.id);

  if (!userToUpdate) {
    return next(new AppError('User not found', 404));
  }

  // Tenant isolation check
  if (req.user?.role !== 'super_admin' && userToUpdate.hospitalId?.toString() !== req.user?.hospitalId?.toString()) {
    return next(new AppError('Not authorized to update this user', 403));
  }

  const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  }).select('-passwordHash -refreshToken');

  res.status(200).json({
    success: true,
    data: updatedUser,
  });
});

// @desc    Deactivate user (soft delete)
// @route   DELETE /api/v1/users/:id
// @access  Super Admin / Hospital Admin
export const deleteUser = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  // Tenant isolation check
  if (req.user?.role !== 'super_admin' && user.hospitalId?.toString() !== req.user?.hospitalId?.toString()) {
    return next(new AppError('Not authorized to delete this user', 403));
  }

  user.isActive = false;
  await user.save();

  res.status(200).json({
    success: true,
    data: {},
    message: 'User deactivated',
  });
});

// @desc    Force reset password
// @route   POST /api/v1/users/:id/reset-password
// @access  Super Admin / Hospital Admin
export const forceResetPassword = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { newPassword } = req.body;
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  // Tenant isolation check
  if (req.user?.role !== 'super_admin' && user.hospitalId?.toString() !== req.user?.hospitalId?.toString()) {
    return next(new AppError('Not authorized to reset password for this user', 403));
  }

  const salt = await bcrypt.genSalt(12);
  user.passwordHash = await bcrypt.hash(newPassword, salt);
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Password reset successfully',
  });
});

// @desc    Update current user profile
// @route   PATCH /api/v1/users/me
// @access  Protected
export const updateMe = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { name, phone } = req.body;

  const updates: { name?: string; phone?: string } = {};
  if (name !== undefined) updates.name = name;
  if (phone !== undefined) updates.phone = phone;

  const user = await User.findByIdAndUpdate(req.user?._id, updates, {
    new: true,
    runValidators: true,
  }).select('-passwordHash -refreshToken');

  res.status(200).json({
    success: true,
    data: user,
  });
});

// @desc    Upload/update current user avatar
// @route   POST /api/v1/users/me/avatar
// @access  Protected
export const updateMyAvatar = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  if (!req.file) {
    return next(new AppError('Please upload an image', 400));
  }

  const avatar = `/uploads/${req.file.filename}`;

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    { avatar },
    { new: true }
  ).select('-passwordHash -refreshToken');

  res.status(200).json({
    success: true,
    data: user,
  });
});
