import asyncHandler from 'express-async-handler';
import { body, validationResult } from 'express-validator';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { prisma } from '@/utils/db';

const createCommunity = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.user;
  const { name, description } = req.body as {
    name: string;
    description?: string;
  };

  if (!name) {
    res
      .status(StatusCodes.BAD_REQUEST)
      .json({ message: 'Please provide all required fields' });
    return;
  }

  const createdCommunity = await prisma.community.create({
    data: {
      name,
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

const getCommunityByName = asyncHandler(
  async (req: Request, res: Response) => {}
);

export { createCommunity, getCommunityByName };
