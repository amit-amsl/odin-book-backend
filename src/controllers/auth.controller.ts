import asyncHandler from 'express-async-handler';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { prisma } from '@/utils/db';

const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  // if (!email || !password) {
  //   res
  //     .status(StatusCodes.BAD_REQUEST)
  //     .json({ message: 'Please provide all required fields' });
  //   return;
  // }

  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });
  if (!user) {
    res
      .status(StatusCodes.UNAUTHORIZED)
      .json({ message: 'Invalid Credentials' });
    return;
  }

  const passwordHashComparison = await bcrypt.compare(
    password,
    user.hashedPassword
  );
  if (!passwordHashComparison) {
    res
      .status(StatusCodes.UNAUTHORIZED)
      .json({ message: 'Invalid Credentials' });
    return;
  }

  const tokenPayload = {
    userId: user.id,
    username: user.username,
  };

  const jwtToken = jwt.sign(tokenPayload, process.env.JWT_SECRET as string, {
    expiresIn: '3h',
  });
  const THREE_HOURS = 1000 * 60 * 60 * 3;
  res.cookie('authToken', jwtToken, {
    httpOnly: true,
    expires: new Date(Date.now() + THREE_HOURS),
  });

  res
    .status(StatusCodes.OK)
    .json({ message: 'User has logged in successfully!', user: tokenPayload });
});

const register = asyncHandler(async (req: Request, res: Response) => {
  const { email, username, password } = req.body;

  // if (!email || !password || !username) {
  //   res
  //     .status(StatusCodes.BAD_REQUEST)
  //     .json({ message: 'Please provide all required fields' });
  //   return;
  // }

  const usernameOrEmailExists = await prisma.user.findFirst({
    where: { OR: [{ username }, { email }] },
  });
  if (usernameOrEmailExists) {
    res.status(StatusCodes.BAD_REQUEST).json({
      message: 'Username or email already exists, please choose another one!',
    });
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const createUser = await prisma.user.create({
    data: {
      email,
      hashedPassword,
      username,
    },
  });

  res.status(StatusCodes.CREATED).json({
    message: 'User has been created successfully!',
  });
});

const logout = asyncHandler(async (req: Request, res: Response) => {
  // res.cookie('authToken', 'logout', {
  //   httpOnly: true,
  //   expires: new Date(Date.now() + 1 * 1000),
  // });
  res.clearCookie('authToken');
  res
    .status(StatusCodes.OK)
    .json({ msg: `User has been logged out successfully!` });
});

export { login, register, logout };
