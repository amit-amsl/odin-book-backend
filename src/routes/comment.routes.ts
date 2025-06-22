import { Router } from 'express';
import { userAuthenticationCheck } from '@/middlewares/auth.middleware';
import { validateRequestData } from '@/middlewares/validate.middleware';
import {
  createCommentSchema,
  handleVotingSchema,
} from '@/validators/postSchemas';
import {
  createComment,
  createCommentReply,
  getRepliesByCommentId,
  handleCommentVoting,
} from '@/controllers/comment.controller';

const commentRouter = Router();

commentRouter.use(userAuthenticationCheck);

commentRouter.post(
  '/:communityName/:postId/comment',
  validateRequestData(createCommentSchema),
  createComment
);

commentRouter.post(
  '/:communityName/:postId/:commentId/reply',
  validateRequestData(createCommentSchema),
  createCommentReply
);

commentRouter.get('/:commentId/replies', getRepliesByCommentId);

commentRouter.post(
  '/:commentId/vote',
  validateRequestData(handleVotingSchema),
  handleCommentVoting
);

export { commentRouter };
