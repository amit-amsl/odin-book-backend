import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().trim().email('Invalid email address format'),
  password: z.string().min(8),
});

export const registerSchema = z.object({
  email: z.string().trim().email('Invalid email address format'),
  username: z
    .string()
    .min(6, 'Username must be at least 6 characters long')
    .max(20, 'Username must not exceed 20 characters')
    .regex(
      /^[a-zA-Z0-9_-]+$/,
      'Username can only contain letters, numbers, hyphens, and underscores'
    )
    .refine((value) => !/^\d+$/.test(value), {
      message: 'Username cannot be only numbers',
    })
    .refine((value) => !/[@$!%*?&]/.test(value), {
      message: 'Username cannot contain special characters like @$!%*?&',
    }),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters long')
    .regex(/[A-Z]/, 'Password must include at least one uppercase letter')
    .regex(/[a-z]/, 'Password must include at least one lowercase letter')
    .regex(/[0-9]/, 'Password must include at least one number')
    .regex(/[@$!%*?&]/, 'Password must include at least one special character'),
});
