import { prisma } from '../../../lib/prisma';
import bcrypt from 'bcrypt';
// @ts-ignore
import { mapUserDTO, type UserDTO } from '../../user/dtos/user.dto';
import { TokenService } from './TokenService';
import { ApiError } from '../../../shared/Errors/ApiErrors';
import { SessionService } from './SessionService';
import type { UUID } from 'crypto';
import { UserService } from '../../user/services/UserService';

export const AuthUserService = {
	async registration(login: string, name: string, password: string, deviceId: string) {
		const candidate = await UserService.findByLogin(login);
		if (candidate && candidate.login !== login)
			throw ApiError.BadRequest(`Пользователь с логином ${login} уже существует!`);

		const hashPasswd = await bcrypt.hash(password, 10);
		const user = await prisma.users.create({
			data: {
				login,
				name,
				password: hashPasswd,
			},
		});
		const userPayload = mapUserDTO(user);

		// ГЕНЕРИРУЕМ ID СЕССИИ
		const sessionId = crypto.randomUUID();

		const payload = {
			...userPayload,
			deviceId,
			sessionId,
		};
		const { accessToken, refreshToken } = TokenService.generateTokens(payload);

		return {
			accessToken,
			refreshToken,
			user: userPayload,
			sessionId,
		};
	},

	/**
	 * ========== LOGIN ==========
	 * @param login Login пользователя
	 * @param password Пароль пользователя
	 * @returns
	 * * accessToken - токен доступа
	 * * refreshToken -
	 * * user - DTO объекта пользователя @see {@link UserDTO}
	 */
	async login(login: string, password: string, deviceId: string) {
		// 1. Ищем пользователя
		const user = await UserService.findByLogin(login);

		// Безопасное сообщение: не выдаем, что именно не подошло
		if (!user || user.login !== login) throw ApiError.BadRequest('Неверный логин или пароль');

		// 2. Сравниваем пришедший пароль с хэшем из БД
		const isPassEquals = await bcrypt.compare(password, user.password);
		if (!isPassEquals) {
			throw ApiError.BadRequest('Неверный логин или пароль');
		}

		// ГЕНЕРИРУЕМ ID СЕССИИ
		const sessionId = crypto.randomUUID();

		// 3. Генерируем возврат функции
		const userPayload = mapUserDTO(user);
		const payload = {
			...userPayload,
			deviceId,
			sessionId,
		};
		const { accessToken, refreshToken } = TokenService.generateTokens(payload);

		return {
			accessToken,
			refreshToken,
			user: userPayload,
			sessionId,
		};
	},

	async refresh(refreshToken: string) {
		// 1. Проверяем наличие токена
		if (!refreshToken) throw ApiError.UnauthorizedError();

		// 2. Валидируем токен (внутри userData теперь лежит и id, и deviceId)
		const userData = TokenService.validateRefreshToken(refreshToken);
		if (!userData) throw ApiError.UnauthorizedError();

		const { id: userId, deviceId } = userData;

		// 3. Ищем сессию в БД по составному ключу
		const sessionInDb = await SessionService.findByUserId_DeviceId({ userId, deviceId });

		// 4. Безопасность: если токена нет в БД или он не совпадает с текущим (украден/устарел)
		if (!sessionInDb || sessionInDb.refresh_token !== refreshToken) {
			throw ApiError.UnauthorizedError();
		}

		const sessionId = sessionInDb.id as UUID;

		// 5. Достаем свежие данные пользователя из базы (на случай, если изменилось имя или роль)
		const user = await UserService.findById(userId);
		if (!user) throw ApiError.UnauthorizedError();

		const userPayload = mapUserDTO(user);

		// 6. Генерируем НОВУЮ пару токенов (передаем payload пользователя + тот же deviceId)
		const tokens = TokenService.generateTokens({
			...userPayload,
			deviceId,
			sessionId,
		});

		// Возвращаем всё контроллеру
		return {
			...tokens,
			user: userPayload,
			deviceId,
			sessionId,
		};
	},

	async changePassword(userId: string, newPassword: string) {
		const hashPasswd = await bcrypt.hash(newPassword, 10);
		return prisma.users.update({
			where: { id: userId },
			data: { password: hashPasswd },
		});
	},
};
