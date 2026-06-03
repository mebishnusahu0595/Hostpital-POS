import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from '../utils/AppError';
import User from '../models/User';
import { asyncHandler } from '../utils/asyncWrapper';

// Verify JWT token and attach user to req
export const verifyToken = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new AppError('Not authorized to access this route', 401));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as any;
    const user = await User.findById(decoded.id);
    
    if (!user || !user.isActive) {
      return next(new AppError('User not found or deactivated', 401));
    }

    req.user = user;
    next();
  } catch (error) {
    return next(new AppError('Not authorized to access this route', 401));
  }
});

// Enforce specific roles
export const requireRole = (roles: Array<'super_admin' | 'hospital_admin' | 'engineer' | 'staff' | 'scm_manager'>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new AppError(`Role ${req.user?.role} is not authorized to access this route`, 403));
    }
    next();
  };
};

// Enforce hospital scope (tenant isolation)
export const enforceHospitalScope = (req: Request, res: Response, next: NextFunction) => {
  const user = req.user;

  if (!user) {
    return next(new AppError('Authentication required to access this resource', 401));
  }

  // super_admin bypasses hospital scope
  if (user.role === 'super_admin') {
    return next();
  }

  // Ensure they belong to a hospital if not super_admin
  const userHospitalId = user.hospitalId?.toString();
  if (!userHospitalId) {
    return next(new AppError('User profile is incomplete (missing Hospital ID). Please contact your administrator.', 403));
  }

  // Validate hospitalId if provided in request parameters, body, or query
  const requestHospitalId = (req.params?.hospitalId || req.body?.hospitalId || req.query?.hospitalId)?.toString();

  if (requestHospitalId && requestHospitalId !== userHospitalId) {
    return next(new AppError('Security Violation: You do not have permission to access data from other facilities.', 403));
  }

  next();
};
