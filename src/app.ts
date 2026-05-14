import express from 'express';
import dotenv from 'dotenv';
dotenv.config();
import { globalError } from './utils/error';
import router from './routes/router';
import cookieParser from 'cookie-parser';

const app = express();
app.use(cookieParser());
app.use(express.json());
app.use('/v1/subscription', router);

app.use(globalError);

export default app;