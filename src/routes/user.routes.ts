import { Router } from 'express';
import { userAuthenticationCheck } from '@/middlewares/auth.middleware';
import {
  getUserSubscribedCommunities,
  getUserProfile,
  getUserSubmittedPosts,
  getUserBookmarks,
} from '@/controllers/user.controller';

const userRouter = Router();

userRouter.use(userAuthenticationCheck);

userRouter.get('/communities', getUserSubscribedCommunities);

userRouter.get('/:username', getUserProfile);

userRouter.get('/:username/submittedPosts', getUserSubmittedPosts);

userRouter.get('/:username/bookmarks', getUserBookmarks);

export { userRouter };
