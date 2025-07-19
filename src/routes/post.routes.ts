import { Router } from 'express';
import { userAuthenticationCheck } from '@/middlewares/auth.middleware';
import { validateRequestData } from '@/middlewares/validate.middleware';
import { createPostSchema, handleVotingSchema } from '@/validators/postSchemas';
import { uploadImageFile } from '@/middlewares/multer.middleware';
import {
  createPost,
  getPostById,
  handlePostVoting,
  getCommentsByPostId,
  handlePostBookmark,
} from '@/controllers/post.controller';

const postRouter = Router();

postRouter.use(userAuthenticationCheck);

postRouter.post(
  '/:communityName',
  uploadImageFile.single('image'),
  validateRequestData(createPostSchema),
  createPost
);

postRouter.get('/:communityName/:postId', getPostById);

postRouter.post(
  '/:communityName/:postId/vote',
  validateRequestData(handleVotingSchema),
  handlePostVoting
);

postRouter.get('/:communityName/:postId/comments', getCommentsByPostId);

postRouter.post('/:communityName/:postId/bookmark', handlePostBookmark);

export { postRouter };
