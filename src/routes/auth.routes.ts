import { login, logout, register } from '@/controllers/auth.controller';
import { Router } from 'express';

const authRouter = Router();

authRouter.post('/login', login);

authRouter.post('/register', register);

authRouter.post('/logout', logout);

export { authRouter };
