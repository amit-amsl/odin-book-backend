import { Router } from 'express';
import { userAuthenticationCheck } from '@/middlewares/auth.middleware';
import { validateRequestData } from '@/middlewares/validate.middleware';
import { createPostSchema } from '@/validators/postSchemas';
import { createPost, getPostById } from '@/controllers/post.controller';

const postRouter = Router();

postRouter.use(userAuthenticationCheck);

postRouter.post(
  '/:communityName',
  validateRequestData(createPostSchema),
  createPost
);

postRouter.get('/:communityName/:postId', getPostById);

export { postRouter };
