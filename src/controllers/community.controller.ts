import asyncHandler from 'express-async-handler';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { prisma } from '@/utils/db';
import { z } from 'zod';
import { createCommunitySchema } from '@/validators/communitySchemas';
import { prismaPostQueryFieldSelection } from '@/utils/prismaUtils';

type createCommunityRequestBodyData = z.infer<typeof createCommunitySchema>;

const createCommunity = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.user;
  const { name, description } = req.body as createCommunityRequestBodyData;
  const normalizedInputName = name.toLowerCase();

  const communityExists = await prisma.community.findUnique({
    where: {
      normalizedName: normalizedInputName,
    },
  });

  if (communityExists) {
    res.status(StatusCodes.BAD_REQUEST).json({
      message:
        'Community with the same name already exists, please choose another name.',
    });
    return;
  }

  const createdCommunity = await prisma.community.create({
    data: {
      name,
      normalizedName: normalizedInputName,
      description,
      subscribers: {
        create: {
          userId,
          isModerator: true,
        },
      },
    },
  });

  res.status(StatusCodes.CREATED).json(createdCommunity);
});

const getCommunity = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.user;
  const { communityName } = req.params;

  const community = await prisma.community.findUnique({
    where: {
      normalizedName: communityName.toLowerCase(),
    },
    select: {
      id: true,
      name: true,
      description: true,
      createdAt: true,
      subscribers: {
        select: {
          user: {
            select: {
              id: true,
              username: true,
            },
          },
          isModerator: true,
        },
      },
    },
  });

  if (!community) {
    res
      .status(StatusCodes.NOT_FOUND)
      .json({ message: 'Community does not exist!' });
    return;
  }

  const { subscribers, ...NewCommunity } = community;
  const currentUser = subscribers.find((sub) => sub.user.id === userId);
  const formattedCommunityResponse = {
    ...NewCommunity,
    subscribersAmount: subscribers.length,
    isUserSubscribed: !!currentUser?.user,
    isUserModerator: !!currentUser?.user ? currentUser.isModerator : false,
  };

  res.status(StatusCodes.OK).json(formattedCommunityResponse);
});

const getPaginatedCommunityPosts = asyncHandler(
  async (req: Request, res: Response) => {
    const { userId } = req.user;
    const { communityName } = req.params;

    const limit = Number(req.query.limit as string) || 10;
    const cursor = req.query.cursor as string | undefined;

    const communityPosts = await prisma.community.findUnique({
      where: {
        normalizedName: communityName.toLowerCase(),
      },
      select: {
        posts: {
          orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
          ...(cursor && {
            cursor: { id: cursor },
          }),
          take: limit + 1,
          select: {
            ...prismaPostQueryFieldSelection(userId),
          },
        },
      },
    });

    if (!communityPosts) {
      res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: 'Community does not exist!' });
      return;
    }

    const formattedCommunityPosts = communityPosts.posts.map((post) => {
      const { bookmarks, upvotes, downvotes, community, ...newPost } = post;
      return {
        ...newPost,
        communityNormalizedName: community.normalizedName,
        isPostBookmarked: !!bookmarks.length,
        isPostUpvoted: !!upvotes.length,
        isPostDownvoted: !!downvotes.length,
      };
    });

    const hasNextPage = formattedCommunityPosts.length > limit;
    const nextCursor = hasNextPage
      ? formattedCommunityPosts[formattedCommunityPosts.length - 1].id
      : null;

    res.status(StatusCodes.OK).json({
      data: hasNextPage
        ? formattedCommunityPosts.slice(0, -1)
        : formattedCommunityPosts,
      meta: {
        nextCursor,
      },
    });
  }
);

const handleUserSubscription = asyncHandler(
  async (req: Request, res: Response) => {
    const { userId } = req.user;
    const { communityName } = req.params;

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

    const isUserSubscribed = await prisma.usersOnCommunities.findUnique({
      where: {
        userId_communityId: { userId, communityId: communityExists.id },
      },
    });

    const isUserMod = isUserSubscribed?.isModerator;
    if (isUserSubscribed && !isUserMod) {
      await prisma.usersOnCommunities.delete({
        where: {
          userId_communityId: {
            userId,
            communityId: isUserSubscribed.communityId,
          },
        },
      });
      res
        .status(StatusCodes.OK)
        .json({ message: 'User unsubscribed from community successfully!' });
      return;
    } else if (isUserMod) {
      res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: 'Moderator user cannot unsubscribe from community!' });
      return;
    }
    await prisma.community.update({
      where: {
        normalizedName: communityName.toLowerCase(),
      },
      data: {
        subscribers: {
          create: { userId },
        },
      },
    });
    res
      .status(StatusCodes.OK)
      .json({ message: 'User subscribed to community successfully!' });
  }
);

const getCommunitiesFeed = (feedType: 'all' | 'subscribed') =>
  asyncHandler(async (req: Request, res: Response) => {
    const { userId } = req.user;

    const limit = Number(req.query.limit as string) || 10;
    const cursor = req.query.cursor as string | undefined;

    let postQueryWhereClause = undefined;

    if (feedType === 'subscribed') {
      const userSubscribedCommunities = await prisma.user.findUnique({
        where: {
          id: userId,
        },
        select: {
          subscribedCommunities: {
            select: {
              communityId: true,
            },
          },
        },
      });
      if (!userSubscribedCommunities?.subscribedCommunities) {
        res
          .status(StatusCodes.OK)
          .json({ message: 'User is not subscribed to any community!' });
        return;
      }

      postQueryWhereClause = {
        communityId: {
          in: [
            ...userSubscribedCommunities?.subscribedCommunities.map(
              (subComm) => subComm.communityId
            ),
          ],
        },
      };
    }

    const userPersonalFeedPosts = await prisma.post.findMany({
      ...(postQueryWhereClause && { where: postQueryWhereClause }),
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      ...(cursor && {
        cursor: { id: cursor },
      }),
      take: limit + 1,
      select: { ...prismaPostQueryFieldSelection(userId) },
    });

    const formattedUserFeedPosts = userPersonalFeedPosts.map((post) => {
      const { bookmarks, upvotes, downvotes, community, ...newPost } = post;
      return {
        ...newPost,
        communityNormalizedName: community.normalizedName,
        isPostBookmarked: !!bookmarks.length,
        isPostUpvoted: !!upvotes.length,
        isPostDownvoted: !!downvotes.length,
      };
    });

    const hasNextPage = formattedUserFeedPosts.length > limit;
    const nextCursor = hasNextPage
      ? formattedUserFeedPosts[formattedUserFeedPosts.length - 1].id
      : null;

    res.status(StatusCodes.OK).json({
      data: hasNextPage
        ? formattedUserFeedPosts.slice(0, -1)
        : formattedUserFeedPosts,
      meta: {
        nextCursor,
      },
    });
  });

export {
  createCommunity,
  getCommunity,
  getPaginatedCommunityPosts,
  handleUserSubscription,
  getCommunitiesFeed,
};
