import { Router } from 'express';
import { userAuthenticationCheck } from '@/middlewares/auth.middleware';
import { validateRequestData } from '@/middlewares/validate.middleware';
import {
  createCommentSchema,
  createPostSchema,
  handleVotingSchema,
} from '@/validators/postSchemas';
import {
  createComment,
  createCommentReply,
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

postRouter.post(
  '/:communityName/:postId/comment',
  validateRequestData(createCommentSchema),
  createComment
);

// postRouter.post(
//   '/:communityName/:postId/:commentId/vote',
//   validateRequestData(handleVotingSchema),
//   handleCommentVoting
// );

postRouter.post(
  '/:communityName/:postId/:commentId/reply',
  validateRequestData(createCommentSchema),
  createCommentReply
);

postRouter.post('/:communityName/:postId/bookmark', handlePostBookmark);

export { postRouter };
