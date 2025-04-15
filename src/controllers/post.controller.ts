import asyncHandler from 'express-async-handler';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { prisma } from '@/utils/db';
import { createPostSchema } from '@/validators/postSchemas';
import { z } from 'zod';

type createPostRequestBodyData = z.infer<typeof createPostSchema>;

const createPost = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.user;
  const { communityName } = req.params;
  const { title, content, isNSFW, isSpoiler } =
    req.body as createPostRequestBodyData;

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

  res.status(StatusCodes.CREATED).json(createdPost);
});

const getPostById = asyncHandler(async (req: Request, res: Response) => {
  const { communityName, postId } = req.params;

  const post = await prisma.post.findUnique({
    where: {
      id: postId,
      community: {
        normalizedName: communityName.toLowerCase(),
      },
    },
    include: {
      comments: {
        select: {
          author: {
            select: {
              id: true,
              username: true,
            },
          },
          content: true,
          upvotes: {
            include: {
              _count: true,
            },
          },
          downvotes: {
            include: {
              _count: true,
            },
          },
          replies: true,
          createdAt: true,
        },
      },
      upvotes: {
        include: {
          _count: true,
        },
      },
      downvotes: {
        include: {
          _count: true,
        },
      },
    },
  });

  if (!post) {
    res.status(StatusCodes.NOT_FOUND).json({ message: 'post does not exist!' });
    return;
  }

  res.status(StatusCodes.ACCEPTED).json(post);
});

export { createPost, getPostById };
