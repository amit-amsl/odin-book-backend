import { Router } from 'express';
import { userAuthenticationCheck } from '@/middlewares/auth.middleware';
import {
  getUserSubscribedCommunities,
  getUserProfile,
  getUserSubmittedPosts,
  getUserBookmarks,
  editUserProfile,
} from '@/controllers/user.controller';
import { uploadImageFile } from '@/middlewares/multer.middleware';

const userRouter = Router();

userRouter.use(userAuthenticationCheck);

userRouter.get('/communities', getUserSubscribedCommunities);

userRouter.get('/:username', getUserProfile);

userRouter.get('/:username/submittedPosts', getUserSubmittedPosts);

userRouter.get('/:username/bookmarks', getUserBookmarks);

userRouter.patch(
  '/:username/edit',
  uploadImageFile.single('avatar'),
  editUserProfile
);

export { userRouter };
