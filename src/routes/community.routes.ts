import { Router } from 'express';
import { userAuthenticationCheck } from '@/middlewares/auth.middleware';
import { validateRequestData } from '@/middlewares/validate.middleware';
import { createCommunitySchema } from '@/validators/communitySchemas';
import {
  createCommunity,
  getCommunityByName,
} from '@/controllers/community.controller';

const communityRouter = Router();

communityRouter.use(userAuthenticationCheck);

communityRouter.post(
  '/',
  validateRequestData(createCommunitySchema),
  createCommunity
);

communityRouter.get('/:communityName', getCommunityByName);

export { communityRouter };
