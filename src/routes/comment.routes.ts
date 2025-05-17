import { Router } from 'express';
import { userAuthenticationCheck } from '@/middlewares/auth.middleware';
import { validateRequestData } from '@/middlewares/validate.middleware';
import {
  createCommentSchema,
  handleVotingSchema,
} from '@/validators/postSchemas';
import {
  getRepliesByCommentId,
  handleCommentVoting,
} from '@/controllers/comment.controller';

const commentRouter = Router();

commentRouter.use(userAuthenticationCheck);

commentRouter.get('/:commentId/replies', getRepliesByCommentId);

commentRouter.post(
  '/:commentId/vote',
  validateRequestData(handleVotingSchema),
  handleCommentVoting
);

export { commentRouter };
