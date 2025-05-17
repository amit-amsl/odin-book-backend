import asyncHandler from 'express-async-handler';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { prisma } from '@/utils/db';
import { z } from 'zod';

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

export { getUserSubscribedCommunities };
