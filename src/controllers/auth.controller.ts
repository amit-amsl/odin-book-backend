import asyncHandler from 'express-async-handler';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { prisma } from '@/utils/db';
import { z } from 'zod';
import { loginSchema, registerSchema } from '@/validators/authSchemas';

type loginRequestBodyData = z.infer<typeof loginSchema>;

type RegisterRequestBodyData = z.infer<typeof registerSchema>;

const THREE_HOURS = 1000 * 60 * 60 * 3;

const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body as loginRequestBodyData;

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
  res.cookie('authToken', jwtToken, {
    httpOnly: true,
    expires: new Date(Date.now() + THREE_HOURS),
  });

  res
    .status(StatusCodes.OK)
    .json({ message: 'User has logged in successfully!', user: tokenPayload });
});

const register = asyncHandler(async (req: Request, res: Response) => {
  const { email, username, password } = req.body as RegisterRequestBodyData;

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
  res.clearCookie('authToken');
  res
    .status(StatusCodes.OK)
    .json({ msg: `User has been logged out successfully!` });
});

const guestLogin = asyncHandler(async (req: Request, res: Response) => {
  const guestEmail = process.env.GUEST_USER_EMAIL;
  const guestPassword = process.env.GUEST_USER_PASSWORD;

  const user = await prisma.user.findUnique({
    where: {
      email: guestEmail,
    },
  });
  if (!user || !guestPassword) {
    res
      .status(StatusCodes.UNAUTHORIZED)
      .json({ message: 'Invalid Credentials' });
    return;
  }

  const passwordHashComparison = await bcrypt.compare(
    guestPassword,
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
  res.cookie('authToken', jwtToken, {
    httpOnly: true,
    expires: new Date(Date.now() + THREE_HOURS),
  });

  res
    .status(StatusCodes.OK)
    .json({ message: 'User has logged in successfully!', user: tokenPayload });
});

export { login, register, logout, guestLogin };
