import { Router } from 'express';
import { authMiddleware } from '../../../shared/middlewares/auth.middleware';
import { UserController } from '../controllers/UserController';

const userRouter = Router();

userRouter.delete('/deleteAccount', authMiddleware, UserController.deleteAccount);

export { userRouter };
