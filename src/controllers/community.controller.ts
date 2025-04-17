import asyncHandler from 'express-async-handler';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { prisma } from '@/utils/db';
import { z } from 'zod';
import { createCommunitySchema } from '@/validators/communitySchemas';

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

const getCommunityByName = asyncHandler(async (req: Request, res: Response) => {
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
      posts: {
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

  res.status(StatusCodes.OK).json(community);
});

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

    if (isUserSubscribed) {
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

export { createCommunity, getCommunityByName, handleUserSubscription };
