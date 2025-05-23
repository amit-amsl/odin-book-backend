import asyncHandler from 'express-async-handler';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { prisma } from '@/utils/db';
import {
  createCommentSchema,
  createPostSchema,
  handleVotingSchema,
} from '@/validators/postSchemas';
import { z } from 'zod';

type createPostRequestBodyData = z.infer<typeof createPostSchema>;

type handleVotingRequestBodyData = z.infer<typeof handleVotingSchema>;

type createCommentRequestBodyData = z.infer<typeof createCommentSchema>;

const createPost = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.user;
  const { communityName } = req.params;
  const { title, content, isNSFW, isSpoiler } =
    req.body as createPostRequestBodyData;

  const communityExists = await prisma.community.findUnique({
    where: {
      normalizedName: communityName.toLowerCase(),
    },
  });

  if (!communityExists) {
    res
      .status(StatusCodes.NOT_FOUND)
      .json({ message: 'Community does not exist!' });
    return;
  }

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
  const { userId } = req.user;
  const { communityName, postId } = req.params;

  const post = await prisma.post.findUnique({
    where: {
      id: postId,
      community: {
        normalizedName: communityName.toLowerCase(),
      },
    },
    select: {
      title: true,
      content: true,
      author: {
        select: {
          id: true,
          username: true,
        },
      },
      isNSFW: true,
      isSpoiler: true,
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
      comments: {
        where: {
          parentCommentId: null,
        },
        orderBy: {
          createdAt: 'desc',
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
          _count: {
            select: {
              upvotes: true,
              downvotes: true,
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
          replies: {
            where: {
              parentCommentId: { not: null },
            },
            orderBy: {
              createdAt: 'desc',
            },
            select: {
              id: true,
              parentCommentId: true,
              author: {
                select: {
                  id: true,
                  username: true,
                },
              },
              content: true,
              _count: {
                select: {
                  upvotes: true,
                  downvotes: true,
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
          },
          createdAt: true,
        },
      },
      _count: {
        select: {
          upvotes: true,
          downvotes: true,
          comments: true,
        },
      },
    },
  });

  if (!post) {
    res.status(StatusCodes.NOT_FOUND).json({ message: 'post does not exist!' });
    return;
  }

  res
    .status(StatusCodes.OK)
    .json({ ...post, normalizedCommunityName: communityName.toLowerCase() });
});

const handlePostVoting = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.user;
  const { communityName, postId } = req.params;
  const { voteValue } = req.body as handleVotingRequestBodyData;
  /*
  voteValue = 1 (Upvote)
  voteValue = -1 (Downvote)
  */

  const communityExists = await prisma.community.findUnique({
    where: {
      normalizedName: communityName.toLowerCase(),
    },
  });

  const post = await prisma.post.findUnique({
    where: {
      id: postId,
      community: {
        normalizedName: communityName.toLowerCase(),
      },
    },
    include: {
      upvotes: { where: { id: userId } },
      downvotes: { where: { id: userId } },
    },
  });

  if (!communityExists || !post) {
    res
      .status(StatusCodes.NOT_FOUND)
      .json({ message: 'Community or Post does not exist!' });
    return;
  }

  const userAlreadyUpvoted = post.upvotes.length > 0;
  const userAlreadyDownvoted = post.downvotes.length > 0;
  const isUpvote = voteValue === 1;
  const isDownvote = voteValue === -1;

  if (isUpvote) {
    if (userAlreadyUpvoted) {
      await prisma.post.update({
        where: {
          id: postId,
          community: {
            normalizedName: communityName.toLowerCase(),
          },
        },
        data: {
          upvotes: { disconnect: { id: userId } },
        },
      });
    } else {
      await prisma.post.update({
        where: {
          id: postId,
          community: {
            normalizedName: communityName.toLowerCase(),
          },
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
      await prisma.post.update({
        where: {
          id: postId,
          community: {
            normalizedName: communityName.toLowerCase(),
          },
        },
        data: {
          downvotes: { disconnect: { id: userId } },
        },
      });
    } else {
      await prisma.post.update({
        where: {
          id: postId,
          community: {
            normalizedName: communityName.toLowerCase(),
          },
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

  const updatedVotedPost = await prisma.post.findUnique({
    where: {
      id: postId,
      community: {
        normalizedName: communityName.toLowerCase(),
      },
    },
    select: {
      id: true,
      title: true,
      author: {
        select: {
          id: true,
          username: true,
        },
      },
      isNSFW: true,
      isSpoiler: true,
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
          comments: true,
        },
      },
    },
  });

  res
    .status(StatusCodes.OK)
    .json({ message: `Post has been voted!`, ...updatedVotedPost });
});

const getCommentsByPostId = asyncHandler(
  async (req: Request, res: Response) => {
    const { userId } = req.user;
    const { communityName, postId } = req.params;

    const limit = Number(req.query.limit as string) || 10;
    const cursor = req.query.cursor as string | undefined;

    const postComments = await prisma.comment.findMany({
      where: {
        postId,
        Post: {
          community: { normalizedName: communityName },
        },
        parentCommentId: null,
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
        createdAt: true,
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
      },
    });

    const hasNextPage = postComments.length > limit;
    const nextCursor = hasNextPage
      ? postComments[postComments.length - 1].id
      : null;

    res.status(StatusCodes.OK).json({
      data: hasNextPage ? postComments.slice(0, -1) : postComments,
      meta: {
        nextCursor,
      },
    });
  }
);

const createComment = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.user;
  const { communityName, postId } = req.params;
  const { content } = req.body as createCommentRequestBodyData;

  const communityExists = await prisma.community.findUnique({
    where: {
      normalizedName: communityName.toLowerCase(),
    },
  });

  const postExists = await prisma.post.findUnique({
    where: {
      id: postId,
      community: {
        normalizedName: communityName.toLowerCase(),
      },
    },
  });

  if (!communityExists || !postExists) {
    res
      .status(StatusCodes.NOT_FOUND)
      .json({ message: 'Community or Post does not exist!' });
    return;
  }

  const createdComment = await prisma.comment.create({
    data: {
      content,
      userId,
      postId,
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
        },
      },
    },
  });

  res.status(StatusCodes.CREATED).json(createdComment);
});

const createCommentReply = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.user;
  const { communityName, postId, commentId } = req.params;
  const { content } = req.body as createCommentRequestBodyData;

  const communityExists = await prisma.community.findUnique({
    where: {
      normalizedName: communityName.toLowerCase(),
    },
  });

  const postExists = await prisma.post.findUnique({
    where: {
      id: postId,
      community: {
        normalizedName: communityName.toLowerCase(),
      },
    },
  });

  if (!communityExists || !postExists) {
    res
      .status(StatusCodes.NOT_FOUND)
      .json({ message: 'Community or Post does not exist!' });
    return;
  }

  const createdReply = await prisma.comment.create({
    data: {
      content,
      userId,
      postId,
      parentCommentId: commentId,
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

  res.status(StatusCodes.CREATED).json(createdReply);
});

export {
  createPost,
  getPostById,
  handlePostVoting,
  getCommentsByPostId,
  createComment,
  createCommentReply,
};
