import { Router } from 'express';
import { userAuthenticationCheck } from '@/middlewares/auth.middleware';
import { validateRequestData } from '@/middlewares/validate.middleware';
import { createPostSchema } from '@/validators/postSchemas';
import {
  createComment,
  createCommentReply,
  createPost,
  getPostById,
  handleCommentVoting,
  handlePostVoting,
} from '@/controllers/post.controller';

const postRouter = Router();

postRouter.use(userAuthenticationCheck);

postRouter.post(
  '/:communityName',
  validateRequestData(createPostSchema),
  createPost
);

postRouter.get('/:communityName/:postId', getPostById);

postRouter.post('/:communityName/:postId/vote', handlePostVoting);

postRouter.post('/:communityName/:postId/comment', createComment);

postRouter.post('/:communityName/:postId/:commentId/vote', handleCommentVoting);

postRouter.post('/:communityName/:postId/:commentId/reply', createCommentReply);

export { postRouter };
