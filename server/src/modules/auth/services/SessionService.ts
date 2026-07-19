import type { UUID } from 'crypto';
import { prisma } from '../../../lib/prisma';

interface CreateSessionArguments {
	id: UUID;
	userId: string;
	refreshToken: string;
	deviceId: string;
	deviceName?: string;
	ipAddress: string;
	expiresAt: Date;
}

interface UpdateSessionArguments {
	id: UUID;
	refreshToken: string;
	deviceName?: string;
	ipAddress: string;
	expiresAt: Date;
}

export const SessionService = {
	async create(args: CreateSessionArguments) {
		const {
			id,
			userId,
			refreshToken,
			deviceId,
			deviceName = 'undefined',
			ipAddress,
			expiresAt,
		} = args;

		await SessionService._handleSessionLimit(userId, deviceId);

		// Eсли сессия для этого девайса была — удаляем её, чтобы не плодить дубли
		await prisma.sessions.deleteMany({
			where: {
				user_id: userId,
				device_id: deviceId,
			},
		});

		// Cоздаем ЧИСТУЮ запись с новым UUID
		return await prisma.sessions.create({
			data: {
				id,
				user_id: userId,
				device_id: deviceId,
				refresh_token: refreshToken,
				device_name: deviceName,
				ip_address: ipAddress,
				expires_at: expiresAt,
			},
		});
	},

	async update({ id, refreshToken, deviceName, ipAddress, expiresAt }: UpdateSessionArguments) {
		return await prisma.sessions.update({
			where: { id },
			data: {
				refresh_token: refreshToken,
				device_name: deviceName,
				ip_address: ipAddress,
				expires_at: expiresAt,
			},
		});
	},

	async findById(id: string) {
		return await prisma.sessions.findUnique({
			where: {
				id,
			},
		});
	},

	async findByUserId_DeviceId({ userId, deviceId }: { userId: string; deviceId: string }) {
		return await prisma.sessions.findUnique({
			where: {
				user_id_device_id: {
					user_id: userId,
					device_id: deviceId,
				},
			},
		});
	},

	async removeByRefreshToken(refreshToken: string) {
		return await prisma.sessions.delete({
			where: {
				refresh_token: refreshToken,
			},
		});
	},

	async removeById(sessionId: string) {
		return await prisma.sessions.delete({
			where: {
				id: sessionId,
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
