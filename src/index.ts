import dotenv from 'dotenv';
import express, { NextFunction, Request, Response } from 'express';
import { createServer } from 'http';
import morgan from 'morgan';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { authRouter } from './routes/auth.routes';
import { communityRouter } from './routes/community.routes';
import { postRouter } from './routes/post.routes';

dotenv.config();
const PORT = process.env.PORT || 3000;
const ORIGIN_ADDR = 'http://localhost:5173';

const app = express();
const httpServer = createServer(app);

app.set('trust proxy', true);
app.use(morgan('dev'));
app.use(helmet());
app.use(
  cors({
    origin: ORIGIN_ADDR,
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use('/api/auth', authRouter);
app.use('/api/community', communityRouter);
app.use('/api/post', postRouter);

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

httpServer.listen(PORT, () => console.log(`listening on port ${PORT}!`));
