import { z } from 'zod';

export const createPostSchema = z.object({
  title: z.string().min(12).max(150),
  content: z.string().optional(),
  isNSFW: z.boolean(),
  isSpoiler: z.boolean(),
});
