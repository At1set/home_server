import { prisma } from '../../../lib/prisma';
import bcrypt from 'bcrypt';
// @ts-ignore
import { mapUserDTO, type UserDTO } from '../dtos/user.dto';
import { TokenService } from './TokenService';
import { ApiError } from '../../../shared/Errors/ApiErrors';
import { SessionService } from './SessionService';

export const UserService = {
	async registration(login: string, name: string, password: string, deviceId: string) {
		const candidate = await prisma.users.findFirst({
			where: {
				login,
			},
		});
		if (candidate) throw ApiError.BadRequest(`Пользователь с логином ${login} уже существует!`);

		const hashPasswd = await bcrypt.hash(password, 10);
		const user = await prisma.users.create({
			data: {
				login,
				name,
				password: hashPasswd,
			},
		});

		const userPayload = mapUserDTO(user);
		const payload = {
			...userPayload,
			deviceId,
		};
		const { accessToken, refreshToken } = TokenService.generateTokens(payload);

		return {
			accessToken,
			refreshToken,
			user: userPayload,
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
		if (!user) throw ApiError.BadRequest('Неверный логин или пароль');

		// 2. Сравниваем пришедший пароль с хэшем из БД
		const isPassEquals = await bcrypt.compare(password, user.password);
		if (!isPassEquals) {
			throw ApiError.BadRequest('Неверный логин или пароль');
		}

		// 3. Генерируем возврат функции
		const userPayload = mapUserDTO(user);
		const payload = {
			...userPayload,
			deviceId,
		};
		const { accessToken, refreshToken } = TokenService.generateTokens(payload);

		return {
			accessToken,
			refreshToken,
			user: userPayload,
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
		const sessionInDb = await SessionService.find({ userId, deviceId });

		// 4. Безопасность: если токена нет в БД или он не совпадает с текущим (украден/устарел)
		if (!sessionInDb || sessionInDb.refresh_token !== refreshToken) {
			throw ApiError.UnauthorizedError();
		}

		// 5. Достаем свежие данные пользователя из базы (на случай, если изменилось имя или роль)
		const user = await UserService.findById(userId);
		if (!user) throw ApiError.UnauthorizedError();

		const userPayload = mapUserDTO(user);

		// 6. Генерируем НОВУЮ пару токенов (передаем payload пользователя + тот же deviceId)
		const tokens = TokenService.generateTokens({ ...userPayload, deviceId });

		// Возвращаем всё контроллеру
		return {
			...tokens,
			user: userPayload,
			deviceId,
		};
	},

	async findById(userId: string) {
		return await prisma.users.findFirst({
			where: {
				id: userId,
			},
		});
	},

	async findByLogin(login: string) {
		return await prisma.users.findFirst({
			where: {
				login,
			},
		});
	},
};
