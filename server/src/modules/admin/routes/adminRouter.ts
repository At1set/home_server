import { Router } from 'express';
import { AdminUserController } from '../controllers/AdminUserController';
import { validate } from '../../../shared/middlewares/validate.middleware';
import { paginationSchema, userIdParamsSchema } from '../../../shared/validation';
import { searchSchema } from '../validation/search.shema';
import { changePasswordSchema, deleteSessionSchema } from '../validation';
import { updateUserSchema } from '../validation/updateUser.shema';
import { authMiddleware } from '../../../shared/middlewares/auth.middleware';
import { roleMiddleware } from '../../../shared/middlewares/role.middleware';
import { Role } from '../../../generated/prisma/enums';

const adminRouter = Router();

adminRouter.use(authMiddleware);
adminRouter.use(roleMiddleware([Role.admin, Role.owner]));

adminRouter.get('/users', validate(paginationSchema), AdminUserController.getAll);
adminRouter.get('/users/search', validate(searchSchema), AdminUserController.search);

adminRouter.post('/users', AdminUserController.add);
adminRouter.patch('/users/:id', validate(updateUserSchema), AdminUserController.update);
adminRouter.delete('/users/:id', validate(userIdParamsSchema), AdminUserController.delete);

adminRouter.patch(
	'/users/:id/change-password',
	validate(changePasswordSchema),
	AdminUserController.changeUserPassword,
);

// 1. Отозвать ВСЕ сессии пользователя
adminRouter.delete(
	'/users/:id/sessions',
	validate(userIdParamsSchema),
	AdminUserController.deleteAllSessions,
);

// 2. Отозвать ОДНУ сессию по её ID
adminRouter.delete(
	'/users/:id/sessions/:sessionId',
	validate(deleteSessionSchema),
	AdminUserController.deleteSession,
);

export { adminRouter };
