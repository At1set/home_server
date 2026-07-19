import type { Request, Response, NextFunction } from 'express';
import { AdminUserService } from '../services/AdminUserService';

export const AdminUserController = {
	async getAll(req: Request, res: Response, next: NextFunction) {
		try {
			const { page, limit } = req.validatedQuery!;

			const usersData = await AdminUserService.getAll(page, limit);

			return res.status(200).json(usersData);
		} catch (error) {
			next(error);
		}
	},

	async search(req: Request, res: Response, next: NextFunction) {
		try {
			const { page, limit, ...filters } = req.validatedQuery!;

			const result = await AdminUserService.search(page, limit, filters);

			return res.status(200).json(result);
		} catch (error) {
			next(error);
		}
	},

	async add(req: Request, res: Response, next: NextFunction) {},

	async changeUserPassword(req: Request, res: Response, next: NextFunction) {
		try {
			const { id: userId } = req.validatedParams!;
			const { password } = req.body;

			AdminUserService.changeUserPassword(userId, password);
			return res.json({ message: 'Пароль пользователя успешно изменен' });
		} catch (error) {
			next(error);
		}
	},

	async update(req: Request, res: Response, next: NextFunction) {
		try {
			const { id: userId } = req.user!;
			const { id: targetUserId } = req.validatedParams!;
			const { name, role } = req.body;

			const updatedUser = await AdminUserService.updateUserProfile(userId, targetUserId, {
				name,
				role,
			});

			return res.json({
				message: 'Данные пользователя успешно обновлены',
				user: updatedUser,
			});
		} catch (error) {
			next(error);
		}
	},

	async delete(req: Request, res: Response, next: NextFunction) {
		try {
			const { id: userId } = req.user!;
			const { id: targetUserId } = req.validatedParams!;
			const deletedUser = await AdminUserService.deleteUser(userId, targetUserId);
			res.json({
				message: `Аккаунт пользователя ${deletedUser.login} был удален`,
				user: deletedUser,
			});
		} catch (error) {
			next(error);
		}
	},

	// Отозвать одну сессию конкретного пользователя
	async deleteSession(req: Request, res: Response, next: NextFunction) {
		try {
			const { id: targetUserId, sessionId } = req.validatedParams!;
			const { id: userId, sessionId: currentSessionId } = req.user!;
			console.log(userId, targetUserId, sessionId, currentSessionId);

			// Передаем targetUserId в сервис, чтобы сделать проверку прав еще более надежной
			const updatedUser = await AdminUserService.deleteSession(
				userId,
				targetUserId,
				sessionId,
				currentSessionId,
			);

			return res.json({ message: 'Сессия успешно завершена', user: updatedUser });
		} catch (error) {
			next(error);
		}
	},

	// Отозвать ВСЕ сессии конкретного пользователя
	async deleteAllSessions(req: Request, res: Response, next: NextFunction) {
		try {
			const { id: userId } = req.user!; // ID админа из сессии
			const { id: targetUserId } = req.validatedParams!; // ID пользователя из параметров пути

			const result = await AdminUserService.deleteAllSessions(userId, targetUserId);

			return res.json({
				message: 'Все сессии пользователя успешно завершены',
				closedSessionsCount: result.count,
			});
		} catch (error) {
			next(error);
		}
	},
};
