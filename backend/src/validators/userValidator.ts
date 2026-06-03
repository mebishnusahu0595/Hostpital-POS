import { z } from 'zod';

export const createUserSchema = z.object({
  hospitalId: z.string().optional(),
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Invalid email'),
  phone: z.string().optional(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['hospital_admin', 'engineer', 'staff', 'scm_manager']),
});

export const updateUserSchema = z.object({
  name: z.string().min(2).optional(),
  phone: z.string().optional(),
  role: z.enum(['hospital_admin', 'engineer', 'staff', 'scm_manager']).optional(),
  isActive: z.boolean().optional(),
});

export const resetUserPasswordSchema = z.object({
  newPassword: z.string().min(6, 'Password must be at least 6 characters'),
});
