import asyncHandler from 'express-async-handler';
import jwt from 'jsonwebtoken';
import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { prisma } from '@/utils/db';

type JwtPayload = { userId: string; username: string };

export const userAuthenticationCheck = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const authToken = req.cookies['authToken'];
    if (!authToken) {
      res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ message: 'Invalid cookie', user: null });
      return;
    }
    try {
      const { userId, username } = jwt.verify(
        authToken,
        process.env.JWT_SECRET as string
      ) as JwtPayload;

      const user = await prisma.user.findFirst({
        where: {
          id: userId,
        },
      });
      if (!user) {
        res
          .status(StatusCodes.UNAUTHORIZED)
          .json({ message: 'Authentication Invalid', user: null });
        return;
      }
      req.user = { userId, username };
      next();
    } catch (error) {
      res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ message: 'Authentication Invalid', user: null });
      return;
    }
  }
);
