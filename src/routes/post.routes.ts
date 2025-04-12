import { Router } from 'express';
import { userAuthenticationCheck } from '@/middlewares/auth.middleware';
import { createPost, getPostById } from '@/controllers/post.controller';

const postRouter = Router();

postRouter.use(userAuthenticationCheck);

postRouter.post('/:communityName', createPost);

postRouter.get('/:communityName/:postId', getPostById);

export { postRouter };
