import asyncHandler from 'express-async-handler';
import { body, validationResult } from 'express-validator';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { prisma } from '@/utils/db';

const createPost = asyncHandler(async (req: Request, res: Response) => {
  const { communityName } = req.params;
  const { title, content, isNSFW, isSpoiler } = req.body;
  const { userId } = req.user;

  const createdPost = await prisma.post.create({
    data: {
      title,
      content,
      author: {
        connect: { id: userId },
      },
      community: { connect: { normalizedName: communityName.toLowerCase() } },
      isNSFW,
      isSpoiler,
    },
  });
});

const getPostById = asyncHandler(async (req: Request, res: Response) => {});

export { createPost, getPostById };
