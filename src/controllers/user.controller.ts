import asyncHandler from 'express-async-handler';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { prisma } from '@/utils/db';

const getUserSubscribedCommunities = asyncHandler(
  async (req: Request, res: Response) => {
    const { userId } = req.user;
    const communities = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        subscribedCommunities: {
          select: {
            community: {
              select: {
                name: true,
                normalizedName: true,
              },
            },
          },
        },
      },
    });

    const formattedCommunities = communities?.subscribedCommunities.map(
      (com) => ({ ...com.community })
    );

    res.status(StatusCodes.OK).json(formattedCommunities);
  }
);

const getUserProfile = asyncHandler(async (req: Request, res: Response) => {
  const { username } = req.user;
  const { username: usernameParam } = req.params;

  const isProfileOfCurrentUser = username === usernameParam;

  const user = await prisma.user.findUnique({
    where: {
      username: usernameParam,
    },
    select: {
      id: true,
      email: isProfileOfCurrentUser,
      comments: {
        select: {
          _count: {
            select: {
              upvotes: true,
              downvotes: true,
            },
          },
        },
      },
      posts: {
        select: {
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
  });

  if (!user) {
    res.status(StatusCodes.NOT_FOUND).json({ message: 'User does not exist!' });
    return;
  }

  const totalCommentCredit = user.comments.reduce(
    (totalCredit, comment) =>
      totalCredit + (comment._count.upvotes - comment._count.downvotes),
    0
  );

  const totalPostCredit = user.posts.reduce(
    (totalCredit, post) =>
      totalCredit + (post._count.upvotes - post._count.downvotes),
    0
  );

  const formattedUserProfileResponse = {
    id: user.id,
    email: user.email,
    totalCommentCredit,
    totalPostCredit,
    createdAt: user.createdAt,
  };

  res.status(StatusCodes.OK).json(formattedUserProfileResponse);
});

const getUserSubmittedPosts = asyncHandler(
  async (req: Request, res: Response) => {
    const { username: usernameParam } = req.params;

    const limit = Number(req.query.limit as string) || 6;
    const cursor = req.query.cursor as string | undefined;

    const userSubmittedPosts = await prisma.user.findUnique({
      where: {
        username: usernameParam,
      },
      select: {
        posts: {
          orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
          ...(cursor && {
            cursor: { id: cursor },
          }),
          take: limit + 1,
          select: {
            id: true,
            title: true,
            community: {
              select: {
                normalizedName: true,
              },
            },
            isNSFW: true,
            isSpoiler: true,
            createdAt: true,
            _count: {
              select: {
                upvotes: true,
                downvotes: true,
                comments: true,
              },
            },
          },
        },
      },
    });

    if (!userSubmittedPosts?.posts) {
      res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: "User hasn't submitted any posts!" });
      return;
    }

    const formattedUserSubmittedPosts = userSubmittedPosts.posts.map(
      (submittedPost) => {
        const { community, ...newSubmittedPost } = submittedPost;
        return {
          ...newSubmittedPost,
          communityNormalizedName: community.normalizedName,
        };
      }
    );

    const hasNextPage = formattedUserSubmittedPosts.length > limit;
    const nextCursor = hasNextPage
      ? formattedUserSubmittedPosts[formattedUserSubmittedPosts.length - 1].id
      : null;

    res.status(StatusCodes.OK).json({
      data: hasNextPage
        ? formattedUserSubmittedPosts.slice(0, -1)
        : formattedUserSubmittedPosts,
      meta: {
        nextCursor,
      },
    });
  }
);

const getUserBookmarks = asyncHandler(async (req: Request, res: Response) => {
  const { username } = req.user;
  const { username: usernameParam } = req.params;

  const isProfileOfCurrentUser = username === usernameParam;

  if (!isProfileOfCurrentUser) {
    res
      .status(StatusCodes.FORBIDDEN)
      .json({ message: "User's bookmarks are private!" });
    return;
  }

  const limit = Number(req.query.limit as string) || 6;
  const cursor = req.query.cursor as string | undefined;

  const userBookmarks = await prisma.user.findUnique({
    where: {
      username: usernameParam,
    },
    select: {
      bookmarkedPosts: {
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        ...(cursor && {
          cursor: { id: cursor },
        }),
        take: limit + 1,
        select: {
          id: true,
          title: true,
          community: {
            select: {
              normalizedName: true,
            },
          },
          isNSFW: true,
          isSpoiler: true,
          createdAt: true,
          _count: {
            select: {
              upvotes: true,
              downvotes: true,
              comments: true,
            },
          },
        },
      },
    },
  });

  if (!userBookmarks?.bookmarkedPosts) {
    res
      .status(StatusCodes.NOT_FOUND)
      .json({ message: "User doesn't have any bookmarks!" });
    return;
  }

  const formattedUserBookmarks = userBookmarks.bookmarkedPosts.map(
    (bookmark) => {
      const { community, ...newBookmark } = bookmark;
      return {
        ...newBookmark,
        communityNormalizedName: community.normalizedName,
      };
    }
  );

  const hasNextPage = formattedUserBookmarks.length > limit;
  const nextCursor = hasNextPage
    ? formattedUserBookmarks[formattedUserBookmarks.length - 1].id
    : null;

  res.status(StatusCodes.OK).json({
    data: hasNextPage
      ? formattedUserBookmarks.slice(0, -1)
      : formattedUserBookmarks,
    meta: {
      nextCursor,
    },
  });
});

export {
  getUserSubscribedCommunities,
  getUserProfile,
  getUserSubmittedPosts,
  getUserBookmarks,
};
