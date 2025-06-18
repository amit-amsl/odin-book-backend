import dotenv from 'dotenv';
import express, { NextFunction, Request, Response } from 'express';
import { createServer } from 'http';
import morgan from 'morgan';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import RateLimit from 'express-rate-limit';
import { authRouter } from './routes/auth.routes';
import { communityRouter } from './routes/community.routes';
import { postRouter } from './routes/post.routes';
import { commentRouter } from './routes/comment.routes';
import { userRouter } from './routes/user.routes';

export const isProduction = () => {
  return process.env.NODE_ENV === 'production';
};

dotenv.config();
const PORT = process.env.PORT || 3000;

const app = express();
const httpServer = createServer(app);

const limiter = RateLimit({
  windowMs: 1 * 60 * 1000,
  max: 40,
  validate: { xForwardedForHeader: false },
});

app.set('trust proxy', true);
app.use(morgan('dev'));
app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

if (isProduction()) app.use(limiter);

app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ healthy: true });
});

app.use('/api/auth', authRouter);
app.use('/api/user', userRouter);
app.use('/api/community', communityRouter);
app.use('/api/post', postRouter);
app.use('/api/comments', commentRouter);

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

httpServer.listen(PORT, () => console.log(`listening on port ${PORT}!`));
