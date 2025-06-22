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

export const communitiesFeedSchema = z.object({
  sort: z.union([
    z.literal('new'),
    z.literal('trending_day'),
    z.literal('trending_week'),
    z.literal('top'),
  ]),
  cursor: z.string().optional(),
  limit: z.string().optional(),
});
