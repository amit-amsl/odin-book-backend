import asyncHandler from 'express-async-handler';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { prisma } from '@/utils/db';

const createCommunity = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.user;
  const { name, description } = req.body as {
    name: string;
    description?: string;
  };
  const normalizedInputName = name.toLowerCase();

  if (!name) {
    res
      .status(StatusCodes.BAD_REQUEST)
      .json({ message: 'Please provide all required fields' });
    return;
  }

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
    include: {
      posts: true,
      subscribers: true,
    },
  });

  if (!community) {
    res
      .status(StatusCodes.NOT_FOUND)
      .json({ message: 'Community does not exist!' });
    return;
  }

  res.status(StatusCodes.ACCEPTED).json(community);
});

export { createCommunity, getCommunityByName };
