import { z } from 'zod';

export const createPostSchema = z.object({
  title: z.string().min(12).max(150),
  content: z.string().optional(),
  youtubeUrl: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^https?:\/\/(www\.)?youtube\.com|youtu\.be/.test(val),
      {
        message: 'Must be a valid YouTube URL',
      }
    ),
  isNSFW: z
    .string()
    .transform((val) => val === 'true')
    .pipe(z.boolean()),
  isSpoiler: z
    .string()
    .transform((val) => val === 'true')
    .pipe(z.boolean()),
});

export const handleVotingSchema = z.object({
  voteValue: z.literal(1).or(z.literal(-1)),
});

export const createCommentSchema = z.object({
  content: z.string().min(1),
});
