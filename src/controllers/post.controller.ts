import asyncHandler from 'express-async-handler';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { prisma } from '@/utils/db';
import { createPostSchema, handleVotingSchema } from '@/validators/postSchemas';
import { z } from 'zod';
import { prismaPostQueryFieldSelection } from '@/utils/prismaUtils';

type createPostRequestBodyData = z.infer<typeof createPostSchema>;

type handleVotingRequestBodyData = z.infer<typeof handleVotingSchema>;

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

  res.status(StatusCodes.CREATED).json({
    message: `Post has been created successfully!`,
    postId: createdPost.id,
  });
});

const getPostById = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.user;
  const { communityName, postId } = req.params;

  const isPostBookmarkedByUser = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      bookmarkedPosts: {
        where: {
          id: postId,
          community: {
            normalizedName: communityName.toLowerCase(),
          },
        },
        select: {
          id: true,
        },
      },
    },
  });

  const post = await prisma.post.findUnique({
    where: {
      id: postId,
      community: {
        normalizedName: communityName.toLowerCase(),
      },
    },
    select: { ...prismaPostQueryFieldSelection(userId), content: true },
  });

  if (!post) {
    res.status(StatusCodes.NOT_FOUND).json({ message: 'post does not exist!' });
    return;
  }

  const { upvotes, downvotes, bookmarks, community, ...newPost } = post;
  const formattedPost = {
    ...newPost,
    communityNormalizedName: community.normalizedName,
    isPostBookmarked: !!isPostBookmarkedByUser?.bookmarkedPosts.length,
    isPostUpvoted: !!upvotes.length,
    isPostDownvoted: !!downvotes.length,
  };

  res.status(StatusCodes.OK).json(formattedPost);
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
      ...prismaPostQueryFieldSelection(userId),
    },
  });

  if (!updatedVotedPost) {
    res
      .status(StatusCodes.NOT_FOUND)
      .json({ message: 'Updated voted post does not exist!' });
    return;
  }

  const { upvotes, downvotes, bookmarks, community, ...newUpdatedVotedPost } =
    updatedVotedPost;
  const formattedUpdatedVotedPost = {
    ...newUpdatedVotedPost,
    communityNormalizedName: community.normalizedName,
    isPostBookmarked: !!bookmarks.length,
    isPostUpvoted: !!upvotes.length,
    isPostDownvoted: !!downvotes.length,
  };

  res
    .status(StatusCodes.OK)
    .json({ message: `Post has been voted!`, ...formattedUpdatedVotedPost });
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
            profile_img_url: true,
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

const handlePostBookmark = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.user;
  const { communityName, postId } = req.params;

  const isPostBookmarkedByUser = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      bookmarkedPosts: {
        where: {
          id: postId,
          community: {
            normalizedName: communityName.toLowerCase(),
          },
        },
        select: {
          id: true,
        },
      },
    },
  });

  if (!!isPostBookmarkedByUser?.bookmarkedPosts.length) {
    await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        bookmarkedPosts: {
          disconnect: { id: postId },
        },
      },
    });

    res.status(StatusCodes.OK).json({
      message: `Post bookmark has been deleted!`,
      isPostBookmarked: false,
    });
    return;
  }

  await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      bookmarkedPosts: {
        connect: { id: postId },
      },
    },
  });

  res.status(StatusCodes.OK).json({
    message: `Post bookmark has been added!`,
    isPostBookmarked: true,
  });
});

export {
  createPost,
  getPostById,
  handlePostVoting,
  getCommentsByPostId,
  handlePostBookmark,
};
