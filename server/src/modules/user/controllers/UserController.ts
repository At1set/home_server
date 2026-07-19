import type { NextFunction, Request, Response } from 'express';
import { UserService } from '../services/UserService.js';
import { ApiError } from '../../../shared/Errors/ApiErrors.js';
import { mapUserDTO } from '../dtos/user.dto.js';

export const UserController = {
	async deleteAccount(req: Request, res: Response, next: NextFunction) {
		try {
			const { id: userId } = req.user!;

			// 1. Ищем пользователя по id в access токене
			const userToDelete = await UserService.findById(userId);
			if (!userToDelete) throw ApiError.NotFound('Пользователь не найден');

			// 2. Если пользователь существует, удаляем его
			const deletedUser = await UserService.deleteById(userId);

			// 3. Стираем refresh-куку на текущем устройстве, чтобы клиент разлогинился локально
			res.clearCookie('refreshToken', {
				httpOnly: true,
				secure: process.env.NODE_ENV === 'production',
				sameSite: 'strict',
			});

			return res.json({
				message: 'Аккаунт пользователя был удален',
				user: mapUserDTO(deletedUser),
			});
		} catch (error) {
			next(error);
		}
	},
};
