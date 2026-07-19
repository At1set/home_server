import { prisma } from '../../../lib/prisma';
import bcrypt from 'bcrypt';
import { ApiError } from '../../../shared/Errors/ApiErrors';
import { type Role as RoleType } from '../../../generated/prisma/enums';

export const UserService = {
	async changePassword(userId: string, newPassword: string) {
		const hashPasswd = await bcrypt.hash(newPassword, 10);
		return prisma.users.update({
			where: { id: userId },
			data: { password: hashPasswd },
		});
	},

	async updateProfile(
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

			// Правило №1: Нельзя менять роль самому себе, если ты не owner
			if (targetUserId === userId && currentActor.role !== 'owner') {
				throw ApiError.BadRequest('Вы не можете изменить свою собственную роль!');
			}

			if (currentActor.role === 'user')
				throw ApiError.ForbiddenError(
					'У вас недопустимый уровень прав для изменения ролей пользователя!',
				);

			// Правило №2: Если запросить смену роли пытается ОБЫЧНЫЙ АДМИН
			if (currentActor.role === 'admin') {
				// Ему запрещено трогать других админов и овнеров
				if (targetUser.role === 'admin' || targetUser.role === 'owner') {
					throw ApiError.ForbiddenError(
						'У вас недопустимый уровень прав для изменения роли этого пользователя!',
					);
					// Ему запрещено повышать других до своей роли и выше
				} else if (data.role === 'owner' || data.role === 'admin')
					throw ApiError.ForbiddenError(
						`У вас недопустимый уровень прав для повышения до ${data.role}!`,
					);
			}

			// Правило №3 - Owner не может понизить owner-a
			if (currentActor.role === 'owner') {
				if (targetUser.role === 'owner' && userId !== targetUserId)
					throw ApiError.ForbiddenError(
						'У вас недопустимый уровень прав для изменения роли этого пользователя!',
					);
			}
		}

		// 2. Обновляем данные в БД
		return prisma.users.update({
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
	},

	async deleteById(userId: string) {
		return await prisma.users.delete({
			where: { id: userId },
		});
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
