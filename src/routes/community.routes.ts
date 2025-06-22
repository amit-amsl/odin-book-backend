import { Router } from 'express';
import { userAuthenticationCheck } from '@/middlewares/auth.middleware';
import { validateRequestData } from '@/middlewares/validate.middleware';
import {
  communitiesFeedSchema,
  createCommunitySchema,
} from '@/validators/communitySchemas';
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

communityRouter.get(
  '/feed',
  validateRequestData(communitiesFeedSchema, 'query'),
  getCommunitiesFeed('subscribed')
);

communityRouter.get(
  '/all',
  validateRequestData(communitiesFeedSchema, 'query'),
  getCommunitiesFeed('all')
);

communityRouter.get('/:communityName', getCommunity);

communityRouter.get('/:communityName/posts', getPaginatedCommunityPosts);

communityRouter.post('/:communityName/subscribe', handleUserSubscription);

export { communityRouter };
