import asyncHandler from 'express-async-handler';
import { body, validationResult } from 'express-validator';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { prisma } from '@/utils/db';

const createPost = asyncHandler(async (req: Request, res: Response) => {});

const getPostById = asyncHandler(async (req: Request, res: Response) => {});

export { createPost, getPostById };
