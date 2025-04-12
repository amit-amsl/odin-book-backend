import { Router } from 'express';
import { userAuthenticationCheck } from '@/middlewares/auth.middleware';
import {
  createCommunity,
  getCommunityByName,
} from '@/controllers/community.controller';

const communityRouter = Router();

communityRouter.use(userAuthenticationCheck);

communityRouter.post('/', createCommunity);

communityRouter.get('/:communityName', getCommunityByName);

export { communityRouter };
