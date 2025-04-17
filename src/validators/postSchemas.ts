import { z } from 'zod';

export const createPostSchema = z.object({
  title: z.string().min(12).max(150),
  content: z.string().optional(),
  isNSFW: z.boolean(),
  isSpoiler: z.boolean(),
});

export const handleVotingSchema = z.object({
  voteValue: z.literal(1).or(z.literal(-1)),
});

export const createCommentSchema = z.object({
  content: z.string().min(1),
});
