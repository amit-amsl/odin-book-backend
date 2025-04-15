import { z } from 'zod';

export const createCommunitySchema = z.object({
  name: z
    .string()
    .trim()
    .min(4)
    .max(16)
    .regex(
      /^[a-zA-Z0-9_]+$/,
      'Community names can only contain letters, numbers and underscores'
    ),
  description: z.string().optional(),
});
