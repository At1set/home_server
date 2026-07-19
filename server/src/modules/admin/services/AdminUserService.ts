import { prisma } from '../../../lib/prisma';
import { ApiError } from '../../../shared/Errors/ApiErrors';
import { SessionService } from '../../auth/services/SessionService';
import { AuthUserService } from '../../auth/services/AuthUserService';
import { mapUserDTO } from '../dtos/user.dto';
import { mapUsersDTO } from '../dtos/users.dto';
import { UserService } from '../../user/services/UserService';
import { type Role as RoleType } from '../../../generated/prisma/enums';
import { ROLE_WEIGHT } from '../../../shared/constants/roleWeight';

interface SearchFilters {
	id?: string;
	login?: string;
	name?: string;
	role?: any;
}

export const AdminUserService = {
	/**
	 * Получение списка всех пользователей с пагинацией (без паролей)
	 * @param page Номер страницы (дефолт: 1)
	 * @param limit Количество записей на страницу (дефолт: 10)
	 */
	async getAll(page: number = 1, limit: number = 10) {
		// Вычисляем, сколько записей нужно пропустить (смещение)
		const skip = (page - 1) * limit;

		const [users, totalCount] = await Promise.all([
			// 1. Получаем пользователей для текущей страницы
			prisma.users.findMany({
				skip: skip,
				take: limit,
				orderBy: {
					id: 'desc', // Свежие пользователи будут вверху списка
				},
				select: {
					id: true,
					login: true,
					name: true,
					role: true,
					created_at: true,
					sessions: {
						orderBy: {
							created_at: 'desc',
						},
						select: {
							id: true,
							user_id: true,
							device_id: true,
							device_name: true,
							ip_address: true,
							expires_at: true,
							created_at: true,
						},
					},
				},
			}),
			// 2. Считаем общее количество пользователей в базе данных
			prisma.users.count(),
		]);

		// Вычисляем общее количество страниц
		const totalPages = Math.ceil(totalCount / limit);

		// Возвращаем структурированный ответ, идеальный для фронтенда
		return {
			data: mapUsersDTO(users),
			meta: {
				totalCount,
				totalPages,
				currentPage: page,
				limit,
			},
		};
	},

	async search(page: number = 1, limit: number = 10, filters: SearchFilters) {
		const skip = (page - 1) * limit;
		const whereCondition: any = {};

		// Динамически собираем условия только по тем полям, которые прислал фронтенд
		if (filters.id) {
			whereCondition.id = { contains: filters.id }; // Строгое совпадение по UUID
		}
		if (filters.role) {
			whereCondition.role = filters.role; // Строгое совпадение по Роли
		}
		if (filters.login) {
			whereCondition.login = { contains: filters.login }; // Поиск по подстроке
		}
		if (filters.name) {
			whereCondition.name = { contains: filters.name }; // Поиск по подстроке
		}

		const [users, totalCount] = await Promise.all([
			prisma.users.findMany({
				skip,
				take: limit,
				where: whereCondition,
				orderBy: { id: 'desc' },
				include: { sessions: true },
			}),
			prisma.users.count({
				where: whereCondition,
			}),
		]);

		// Вычисляем общее количество страниц
		const totalPages = Math.ceil(totalCount / limit);

		return {
			data: mapUsersDTO(users),
			meta: {
				totalCount,
				totalPages: totalPages,
				currentPage: page,
				limit,
			},
		};
	},

	async changeUserPassword(userId: string, newPassword: string) {
		return await AuthUserService.changePassword(userId, newPassword);
	},

	async updateUserProfile(
		userId: string,
		targetUserId: string,
		data: { name: string; role: RoleType },
	) {
		// 1. Проверяем попытку изменения роли
		if (data.role) {
			// Запрашиваем из базы роли обоих участников процесса
			const [targetUser, currentActor] = await Promise.all([
				prisma.users.findUnique({ where: { id: targetUserId }, select: { role: true } }),
				prisma.users.findUnique({ where: { id: userId }, select: { role: true } }),
			]);

			if (!targetUser || !currentActor) {
				throw ApiError.NotFound('Пользователь не найден');
			}

			const actorWeight = ROLE_WEIGHT[currentActor.role] || 0;
			const targetWeight = ROLE_WEIGHT[targetUser.role] || 0;
			const newWeight = ROLE_WEIGHT[data.role] || 0;
			const isSelfAction = targetUserId === userId;

			// Правило №1: Обычные пользователи и админы не могут менять роль самим себе
			if (isSelfAction && actorWeight < ROLE_WEIGHT.owner) {
				throw ApiError.BadRequest('Вы не можете изменить свою собственную роль!');
			}

			// Если действие совершается над ДРУГИМ пользователем
			if (!isSelfAction) {
				// Правило №2: Нельзя трогать тех, кто равен тебе по рангу или выше (Админ не трогает Админа/Овнера)
				if (targetWeight >= actorWeight) {
					throw ApiError.ForbiddenError(
						'У вас недостаточно прав для изменения роли этого пользователя!',
					);
				}

				// Правило №3: Нельзя назначать роли, выше твоей
				if (newWeight > actorWeight)
					throw ApiError.ForbiddenError(
						`Вы не можете назначить роль "${data.role}", так как она превышает ваш уровень прав!`,
					);

				// Правило №3: Админ не может назначать других пользователей админом
				if (currentActor.role === 'admin' && data.role === 'admin') {
					throw ApiError.ForbiddenError(
						`Вам не разрешено повышать пользователей до своей роли. Пожалуйста, обратитесь к owner-у для назначения данного пользователя на роль админа!`,
					);
				}
			}
		}

		// 2. Обновляем данные в БД
		const updatedUser = await prisma.users.update({
			where: { id: targetUserId },
			data,
			select: {
				id: true,
				name: true,
				login: true,
				role: true,
				created_at: true,
			},
		});

		return mapUserDTO(updatedUser);
	},

	async deleteSession(
		userId: string,
		targetUserId: string,
		sessionId: string,
		currentSessionId: string,
	) {
		const session = await SessionService.findById(sessionId);
		if (!session) {
			throw ApiError.NotFound('Сессия не найдена');
		}

		// Проверяем, что сессия действительно принадлежит этому пользователю
		if (session.user_id !== targetUserId) {
			throw ApiError.BadRequest('Id сессии не принадлежит пользователю');
		}

		// Запрещаем удалять сессию, через которую админ сейчас авторизован
		if (sessionId === currentSessionId) {
			throw ApiError.ForbiddenError(
				'Вы не можете сбросить текущий активный сеанс через панель администратора',
			);
		}

		const isSelfAction = targetUserId === userId;

		// 2. Если действие над ДРУГИМ пользователем, проверяем иерархию прав
		if (!isSelfAction) {
			const [targetUser, currentActor] = await Promise.all([
				prisma.users.findUnique({ where: { id: targetUserId }, select: { role: true } }),
				prisma.users.findUnique({ where: { id: userId }, select: { role: true } }),
			]);

			if (!targetUser || !currentActor) {
				throw ApiError.NotFound('Пользователь не найден');
			}

			const actorWeight = ROLE_WEIGHT[currentActor.role as RoleType] || 0;
			const targetWeight = ROLE_WEIGHT[targetUser.role as RoleType] || 0;

			if (targetWeight >= actorWeight) {
				throw ApiError.ForbiddenError(
					'У вас недостаточно прав для управления сессиями этого пользователя!',
				);
			}
		}

		await SessionService.removeById(sessionId);

		const updatedUser = await prisma.users.findUnique({
			where: { id: targetUserId },
			select: {
				id: true,
				login: true,
				name: true,
				role: true,
				created_at: true,
				sessions: {
					orderBy: {
						created_at: 'desc',
					},
					select: {
						id: true,
						user_id: true,
						device_id: true,
						device_name: true,
						ip_address: true,
						expires_at: true,
						created_at: true,
					},
				},
			},
		});

		if (!updatedUser) {
			throw ApiError.NotFound('Пользователь не найден после обновления');
		}

		const [userDTO] = mapUsersDTO([updatedUser]);

		return userDTO;
	},

	async deleteAllSessions(userId: string, targetUserId: string) {
		const isSelfAction = targetUserId === userId;

		// Не даем админу снести собственную рабочую сессию, через данный этот эндпоинт
		if (isSelfAction) {
			throw ApiError.BadRequest(
				'Вы не можете сбросить все свои сеансы через панель управления. Для этого используйте выход со всех устройств в своем профиле.',
			);
		}

		// 1. Ищем роли целевого юзера и администратора
		const [targetUser, currentActor] = await Promise.all([
			prisma.users.findUnique({ where: { id: targetUserId }, select: { role: true } }),
			prisma.users.findUnique({ where: { id: userId }, select: { role: true } }),
		]);

		if (!targetUser || !currentActor) {
			throw ApiError.NotFound('Пользователь не найден');
		}

		const actorWeight = ROLE_WEIGHT[currentActor.role as RoleType] || 0;
		const targetWeight = ROLE_WEIGHT[targetUser.role as RoleType] || 0;

		// 3. Проверка прав (Иерархия):
		// Правило: Никто не может сбрасывать сессии равным себе по роли или тем, кто выше
		if (targetWeight >= actorWeight) {
			throw ApiError.ForbiddenError(
				'У вас недостаточно прав для управления сессиями этого пользователя!',
			);
		}

		// 4. Удаляем все сессии через SessionService
		return await SessionService.removeAll(targetUserId);
	},

	/**
	 * @route DELETE /api/admin/users/:id
	 * @desc Удаление пользователя по ID
	 */
	async deleteUser(userId: string, targetUserId: string) {
		const isSelfAction = targetUserId === userId;

		// Запрещаем удалять самого себя
		if (isSelfAction) {
			throw ApiError.BadRequest(
				'Вы не можете удалить собственную учетную запись из этого интерфейса',
			);
		}

		// 1. Ищем роли целевого юзера и администратора
		const [targetUser, currentActor] = await Promise.all([
			prisma.users.findUnique({ where: { id: targetUserId }, select: { role: true } }),
			prisma.users.findUnique({ where: { id: userId }, select: { role: true } }),
		]);

		if (!targetUser || !currentActor) {
			throw ApiError.NotFound('Пользователь не найден');
		}

		const actorWeight = ROLE_WEIGHT[currentActor.role as RoleType] || 0;
		const targetWeight = ROLE_WEIGHT[targetUser.role as RoleType] || 0;

		// 2. Проверка прав (Иерархия):
		// Правило: Никто не может удалять аккаунты равным себе по роли или тем, кто выше
		if (targetWeight >= actorWeight) {
			throw ApiError.ForbiddenError('У вас недостаточно прав для удаления этого пользователя');
		}

		// 3. Выполняем удаление в БД
		const deletedUser = await UserService.deleteById(targetUserId);
		return mapUserDTO(deletedUser);
	},
};
