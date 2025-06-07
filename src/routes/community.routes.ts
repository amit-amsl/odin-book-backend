import { Router } from 'express';
import { userAuthenticationCheck } from '@/middlewares/auth.middleware';
import { validateRequestData } from '@/middlewares/validate.middleware';
import { createCommunitySchema } from '@/validators/communitySchemas';
import {
  createCommunity,
  getCommunity,
  getPaginatedCommunityPosts,
  handleUserSubscription,
  getCommunitiesFeed,
} from '@/controllers/community.controller';

const communityRouter = Router();

communityRouter.use(userAuthenticationCheck);

communityRouter.post(
  '/',
  validateRequestData(createCommunitySchema),
  createCommunity
);

communityRouter.get('/feed', getCommunitiesFeed('subscribed'));

communityRouter.get('/all', getCommunitiesFeed('all'));

communityRouter.get('/:communityName', getCommunity);

communityRouter.get('/:communityName/posts', getPaginatedCommunityPosts);

communityRouter.post('/:communityName/subscribe', handleUserSubscription);

export { communityRouter };
