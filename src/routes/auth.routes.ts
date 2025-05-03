import { login, logout, register } from '@/controllers/auth.controller';
import { userAuthenticationCheck } from '@/middlewares/auth.middleware';
import { validateRequestData } from '@/middlewares/validate.middleware';
import { loginSchema, registerSchema } from '@/validators/authSchemas';
import { Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import { Request, Response } from 'express';

const authRouter = Router();

authRouter.get(
  '/me',
  userAuthenticationCheck,
  (req: Request, res: Response) => {
    res.status(StatusCodes.OK).json(req.user);
  }
);

authRouter.post('/login', validateRequestData(loginSchema), login);

authRouter.post('/register', validateRequestData(registerSchema), register);

authRouter.post('/logout', userAuthenticationCheck, logout);

export { authRouter };
