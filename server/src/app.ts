import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { errorMiddleware } from './shared/middlewares/error.middleware';
import { authRouter } from './modules/auth/routes/AuthRouter';
import { adminRouter } from './modules/admin/routes/adminRouter';
import { userRouter } from './modules/user/routes/UserRouter';

process.loadEnvFile();

const app = express();
const PORT = Number(process.env.PORT) || 5000;

app.use(express.json());

app.use(
	cors({
		credentials: true,
		origin: process.env.CLIENT_URL,
	}),
);

app.use(cookieParser());

app.use('/auth', authRouter);
app.use('/me', userRouter);
app.use('/admin', adminRouter);

app.use(errorMiddleware());

app.listen(PORT, '0.0.0.0', async () => {
	console.log(`Server is running on port ${PORT}`);
});
