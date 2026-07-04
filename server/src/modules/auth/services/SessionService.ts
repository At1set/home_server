import { prisma } from '../../../lib/prisma';

export interface CreateSessionArguments {
	userId: string;
	refreshToken: string;
	deviceId: string;
	deviceName?: string;
	ipAddress: string;
	expiresAt: Date;
}

export const SessionService = {
	async save(args: CreateSessionArguments) {
		const { userId, refreshToken, deviceId, deviceName = 'undefined', ipAddress, expiresAt } = args;

		await SessionService._handleSessionLimit(userId, deviceId);

		return await prisma.sessions.upsert({
			where: {
				// Prisma сама потребует здесь именно уникальные поля/связки
				user_id_device_id: {
					user_id: userId,
					device_id: deviceId,
				},
			},
			update: {
				// Что менять, если запись НАЙДЕНА
				refresh_token: refreshToken,
				device_name: deviceName,
				ip_address: ipAddress,
				expires_at: expiresAt,
			},
			create: {
				// Что вставить, если записи НЕТ
				user_id: userId,
				device_id: deviceId,
				refresh_token: refreshToken,
				device_name: deviceName,
				ip_address: ipAddress,
				expires_at: expiresAt,
			},
		});
	},

	async find({ userId, deviceId }: { userId: string; deviceId: string }) {
		return await prisma.sessions.findUnique({
			where: {
				user_id_device_id: {
					user_id: userId,
					device_id: deviceId,
				},
			},
		});
	},

	async remove(refreshToken: string) {
		return await prisma.sessions.delete({
			where: {
				refresh_token: refreshToken,
			},
		});
	},

	async removeAll(userId: string) {
		return await prisma.sessions.deleteMany({
			where: {
				user_id: userId,
			},
		});
	},

	async _handleSessionLimit(userId: string, deviceId: string) {
		const MAX_SESSIONS = Number(process.env.MAX_SESSIONS_PER_USER) || 5;

		// 1. Считаем, сколько сессий СЕЙЧАС есть у юзера
		const sessionCount = await prisma.sessions.count({
			where: { user_id: userId },
		});

		// 2. Если лимит не превышен — ничего делать не нужно
		if (sessionCount < MAX_SESSIONS) return;

		// 3. Если лимит превышен, но этот девайс УЖЕ есть в базе,
		// то лимит не увеличится (отработает upsert/update). Пропускаем.
		const isCurrentDeviceExists = await prisma.sessions.findUnique({
			where: {
				user_id_device_id: { user_id: userId, device_id: deviceId },
			},
		});
		if (isCurrentDeviceExists) return;

		// 4. Если девайс новый и лимит реально превышен — находим и удаляем САМУЮ СТАРУЮ сессию
		const oldestSession = await prisma.sessions.findFirst({
			where: { user_id: userId },
			orderBy: { created_at: 'asc' }, // Сортируем от старых к новым
		});

		if (oldestSession) {
			await prisma.sessions.delete({
				where: { id: oldestSession.id },
			});
		}
	},
};
