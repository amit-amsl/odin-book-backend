import asyncHandler from 'express-async-handler';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { prisma } from '@/utils/db';
import { handleVotingSchema } from '@/validators/postSchemas';
import { z } from 'zod';

type handleVotingRequestBodyData = z.infer<typeof handleVotingSchema>;

const getRepliesByCommentId = asyncHandler(
  async (req: Request, res: Response) => {
    const { userId } = req.user;
    const { commentId } = req.params;

    const limit = Number(req.query.limit as string) || 4;
    const cursor = req.query.cursor as string | undefined;

    const commentReplies = await prisma.comment.findMany({
      where: {
        parentCommentId: commentId,
      },
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      ...(cursor && {
        cursor: { id: cursor },
      }),
      take: limit + 1,
      select: {
        id: true,
        author: {
          select: {
            id: true,
            username: true,
          },
        },
        parentCommentId: true,
        content: true,
        _count: {
          select: {
            upvotes: true,
            downvotes: true,
            replies: true,
          },
        },
        upvotes: {
          where: {
            id: userId,
          },
          select: {
            id: true,
          },
        },
        downvotes: {
          where: {
            id: userId,
          },
          select: {
            id: true,
          },
        },
        createdAt: true,
      },
    });

    const hasNextPage = commentReplies.length > limit;
    const nextCursor = hasNextPage
      ? commentReplies[commentReplies.length - 1].id
      : null;

    res.status(StatusCodes.OK).json({
      data: hasNextPage ? commentReplies.slice(0, -1) : commentReplies,
      meta: {
        nextCursor,
      },
    });
  }
);

const handleCommentVoting = asyncHandler(
  async (req: Request, res: Response) => {
    const { userId } = req.user;
    const { commentId } = req.params;
    const { voteValue } = req.body as handleVotingRequestBodyData;

    const comment = await prisma.comment.findUnique({
      where: {
        id: commentId,
      },
      include: {
        upvotes: { where: { id: userId } },
        downvotes: { where: { id: userId } },
      },
    });

    if (!comment) {
      res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: 'Comment/Reply does not exist!' });
      return;
    }

    const userAlreadyUpvoted = comment.upvotes.length > 0;
    const userAlreadyDownvoted = comment.downvotes.length > 0;
    const isUpvote = voteValue === 1;
    const isDownvote = voteValue === -1;

    if (isUpvote) {
      if (userAlreadyUpvoted) {
        await prisma.comment.update({
          where: {
            id: commentId,
          },
          data: {
            upvotes: { disconnect: { id: userId } },
          },
        });
      } else {
        await prisma.comment.update({
          where: {
            id: commentId,
          },
          data: {
            downvotes: userAlreadyDownvoted
              ? { disconnect: { id: userId } }
              : undefined,
            upvotes: { connect: { id: userId } },
          },
        });
      }
    } else if (isDownvote) {
      if (userAlreadyDownvoted) {
        await prisma.comment.update({
          where: {
            id: commentId,
          },
          data: {
            downvotes: { disconnect: { id: userId } },
          },
        });
      } else {
        await prisma.comment.update({
          where: {
            id: commentId,
          },
          data: {
            upvotes: userAlreadyUpvoted
              ? { disconnect: { id: userId } }
              : undefined,
            downvotes: { connect: { id: userId } },
          },
        });
      }
    }

    const updatedVotedComment = await prisma.comment.findUnique({
      where: {
        id: commentId,
      },
      select: {
        id: true,
        author: {
          select: {
            id: true,
            username: true,
          },
        },
        parentCommentId: true,
        content: true,
        upvotes: {
          where: {
            id: userId,
          },
          select: {
            id: true,
          },
        },
        downvotes: {
          where: {
            id: userId,
          },
          select: {
            id: true,
          },
        },
        createdAt: true,
        _count: {
          select: {
            upvotes: true,
            downvotes: true,
            replies: true,
          },
        },
      },
    });

    res.status(StatusCodes.OK).json({
      message: `Comment/Reply has been voted!`,
      ...updatedVotedComment,
    });
  }
);

export { getRepliesByCommentId, handleCommentVoting };
