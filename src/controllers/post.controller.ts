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
      createdAt: true,
      comments: {
        where: {
          parentCommentId: null,
        },
        select: {
          id: true,
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
          replies: {
            where: {
              parentCommentId: { not: null },
            },
            select: {
              id: true,
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
            },
          },
          createdAt: true,
        },
      },
      _count: {
        select: {
          upvotes: true,
          downvotes: true,
        },
      },
    },
  });

  if (!post) {
    res.status(StatusCodes.NOT_FOUND).json({ message: 'post does not exist!' });
    return;
  }

  res.status(StatusCodes.OK).json(post);
});

const handlePostVoting = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.user;
  const { communityName, postId } = req.params;
  const { voteValue } = req.body as handleVotingRequestBodyData;
  // voteValue = 1 (Upvote)
  // voteValue = -1 (Downvote)

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

  res.status(StatusCodes.OK).json({ message: `Post has been voted!` });
});

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
  });

  res.status(StatusCodes.CREATED).json(createdComment);
});

const handleCommentVoting = asyncHandler(
  async (req: Request, res: Response) => {
    const { userId } = req.user;
    const { communityName, postId, commentId } = req.params;
    const { voteValue } = req.body as handleVotingRequestBodyData;

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

    const comment = await prisma.comment.findUnique({
      where: {
        id: commentId,
        postId,
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
            postId,
          },
          data: {
            upvotes: { disconnect: { id: userId } },
          },
        });
      } else {
        await prisma.comment.update({
          where: {
            id: commentId,
            postId,
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
            postId,
          },
          data: {
            downvotes: { disconnect: { id: userId } },
          },
        });
      } else {
        await prisma.comment.update({
          where: {
            id: commentId,
            postId,
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

    res
      .status(StatusCodes.OK)
      .json({ message: `Comment/Reply has been voted!` });
  }
);

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
  });

  res.status(StatusCodes.CREATED).json(createdReply);
});

export {
  createPost,
  getPostById,
  handlePostVoting,
  createComment,
  handleCommentVoting,
  createCommentReply,
};
