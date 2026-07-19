import type { NextFunction, Request, Response } from 'express';
import { SessionService } from '../services/SessionService';
import { ApiError } from '../../../shared/Errors/ApiErrors';
import { AuthUserService } from '../services/AuthUserService';

export const AuthController = {
	async registration(req: Request, res: Response, next: NextFunction) {
		try {
			const { login, name, password, deviceId } = req.body;

			// 2. Регистрация пользователя
			const authData = await AuthUserService.registration(login, name, password, deviceId);
			const { accessToken, refreshToken, user, sessionId } = authData;

			// 3. Собираем данные окружения для сессии
			const ipAddress = req.ip || (req.headers['x-forwarded-for'] as string) || '127.0.0.1';
			const deviceName = req.headers['user-agent'] || 'Unknown Browser/Device';
			const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 дней

			// 4. Создаем сессию в БД через SessionService
			await SessionService.create({
				id: sessionId,
				userId: user.id,
				refreshToken,
				deviceId,
				deviceName,
				ipAddress,
				expiresAt,
			});

			// 5. Сохраняем refreshToken в безопасную куку httpOnly
			res.cookie('refreshToken', refreshToken, {
				httpOnly: true,
				secure: process.env.NODE_ENV === 'production',
				maxAge: 30 * 24 * 60 * 60 * 1000,
				sameSite: 'strict',
			});

			return res.status(201).json({
				message: 'Пользователь успешно зарегистрирован',
				accessToken,
				user,
			});
		} catch (error) {
			next(error);
		}
	},

	async login(req: Request, res: Response, next: NextFunction) {
		try {
			const { login, password, deviceId } = req.body;

			// 2. Логин пользователя
			const authData = await AuthUserService.login(login, password, deviceId);
			const { accessToken, refreshToken, user, sessionId } = authData;

			// 3. Собираем данные окружения для сессии
			const ipAddress = (req.headers['x-forwarded-for'] as string) || req.ip || '127.0.0.1';
			const deviceName = req.headers['user-agent'] || 'Unknown Browser/Device';
			const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 дней

			// 4. Пересоздаем сессию в БД через SessionService
			await SessionService.create({
				id: sessionId,
				userId: user.id,
				refreshToken,
				deviceId,
				deviceName,
				ipAddress,
				expiresAt,
			});

			// 5. Сохраняем refreshToken в безопасную куку httpOnly
			res.cookie('refreshToken', refreshToken, {
				httpOnly: true,
				secure: process.env.NODE_ENV === 'production',
				maxAge: 30 * 24 * 60 * 60 * 1000,
				sameSite: 'strict',
			});

			return res.status(200).json({
				message: 'Пользователь успешно авторизован',
				accessToken,
				user,
			});
		} catch (error) {
			next(error);
		}
	},

	async logout(req: Request, res: Response, next: NextFunction) {
		try {
			// 1. Достаем refreshToken из кук
			const { refreshToken } = req.cookies;

			// Если токена и так нет, просто возвращаем успешный статус (клиент уже «чист»)
			if (!refreshToken) {
				return res.sendStatus(200);
			}

			try {
				// 2. Удаляем сессию из базы данных
				await SessionService.removeByRefreshToken(refreshToken);
			} catch (dbError) {
				console.log('Ошибка при удалении сессии пользователя!', dbError);
				// Если токена уже не было в БД (например, удален по истечении срока),
				// игнорируем ошибку и идем дальше очищать куку
			}

			// 3. Очищаем куку на клиенте (передаем те же параметры, с какими создавали)
			res.clearCookie('refreshToken', {
				httpOnly: true,
				sameSite: 'strict',
			});

			// 4. Возвращаем успешный ответ
			return res.status(200).json({ message: 'Успешный выход из системы' });
		} catch (error) {
			next(error);
		}
	},

	async logoutAllDevices(req: Request, res: Response, next: NextFunction) {
		try {
			// Данные гарантированно есть, так как запрос пройдет через authMiddleware
			const userId = req.user?.id;

			if (!userId) {
				throw ApiError.UnauthorizedError('Пользователь не идентифицирован');
			}

			// 1. Удаляем абсолютно все сессии пользователя из MariaDB
			const result = await SessionService.removeAll(userId);

			// 2. Стираем refresh-куку на текущем устройстве, чтобы клиент разлогинился локально
			res.clearCookie('refreshToken', {
				httpOnly: true,
				secure: process.env.NODE_ENV === 'production',
				sameSite: 'strict',
			});

			// Возвращаем количество закрытых сессий
			return res.status(200).json({
				message: 'Успешный выход со всех устройств',
				closedSessionsCount: result.count,
			});
		} catch (error) {
			next(error);
		}
	},

	async refresh(req: Request, res: Response, next: NextFunction) {
		try {
			const { refreshToken } = req.cookies;

			// 1. Получаем новые токены и данные из сервиса
			const { user, deviceId, sessionId, ...userData } =
				await AuthUserService.refresh(refreshToken);

			// 2. Сбор данных окружения
			const ipAddress = req.ip || (req.headers['x-forwarded-for'] as string) || '127.0.0.1';
			const deviceName = req.headers['user-agent'] || 'Unknown Browser/Device';
			const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 дней

			// 3. Обновляем сессию на уровне контроллера
			await SessionService.update({
				id: sessionId,
				refreshToken: userData.refreshToken,
				deviceName,
				ipAddress,
				expiresAt,
			});

			// 4. Пишем куку
			res.cookie('refreshToken', userData.refreshToken, {
				maxAge: 30 * 24 * 60 * 60 * 1000,
				httpOnly: true,
				secure: process.env.NODE_ENV === 'production',
				sameSite: 'strict',
			});

			return res.status(200).json({
				message: 'Токен был успешно обновлен',
				accessToken: userData.accessToken,
				user,
			});
		} catch (e) {
			next(e);
		}
	},

	async forgotPassword(req: Request, res: Response, next: NextFunction) {},
};
