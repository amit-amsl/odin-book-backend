import { Router } from 'express';
import { userAuthenticationCheck } from '@/middlewares/auth.middleware';
import { validateRequestData } from '@/middlewares/validate.middleware';
import { createCommunitySchema } from '@/validators/communitySchemas';
import {
  createCommunity,
  getCommunityByName,
  handleUserSubscription,
  getSubscribedCommunitiesFeed,
} from '@/controllers/community.controller';

const communityRouter = Router();

communityRouter.use(userAuthenticationCheck);

communityRouter.post(
  '/',
  validateRequestData(createCommunitySchema),
  createCommunity
);

communityRouter.get('/feed', getSubscribedCommunitiesFeed);

communityRouter.get('/:communityName', getCommunityByName);

communityRouter.post('/:communityName/subscribe', handleUserSubscription);

export { communityRouter };
