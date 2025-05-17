import { Router } from 'express';
import { userAuthenticationCheck } from '@/middlewares/auth.middleware';
import { getUserSubscribedCommunities } from '@/controllers/user.controller';

const userRouter = Router();

userRouter.use(userAuthenticationCheck);

userRouter.get('/communities', getUserSubscribedCommunities);

export { userRouter };
