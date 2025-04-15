import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { ZodSchema } from 'zod';

type RequestDataSource = 'body' | 'query' | 'params';

export const validateRequestData =
  (schema: ZodSchema, source: RequestDataSource = 'body') =>
  (req: Request, res: Response, next: NextFunction) => {
    const validationResult = schema.safeParse(req[source]);

    if (!validationResult.success) {
      res.status(StatusCodes.UNPROCESSABLE_ENTITY).json({
        message: 'Validation failed',
        validationErrors: validationResult.error.flatten().fieldErrors,
      });
      return;
    }

    req[source] = validationResult.data;
    next();
  };
