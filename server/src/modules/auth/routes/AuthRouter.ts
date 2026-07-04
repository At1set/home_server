import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { validate } from '../../../shared/middlewares/validate.middleware';
import { registrationSchema, loginSchema } from '../validation/inex';
import { authMiddleware } from '../../../shared/middlewares/auth.middleware';

const authRouter = Router();

authRouter.post('/registration', validate(registrationSchema), AuthController.registration);
authRouter.post('/login', validate(loginSchema), AuthController.login);
authRouter.post('/refresh', AuthController.refresh);
authRouter.post('/logout', AuthController.logout);
authRouter.post('/logout-all', authMiddleware, AuthController.logoutAllDevices);

export { authRouter };
