import { $api } from '@/shared/api';
import type { UserRole } from '@/shared/types/userRole';

import type {
	ChangeUserPasswordResponseDTO,
	DeleteAllUserSessionsResponseDTO,
	DeleteUserResponseDTO,
	DeleteUserSessionResponseDTO,
	GetAllUsersResponseDTO,
	UpdateUserResponseDTO,
} from './dto';
import {
	mapChangeUserPasswordResponseDTO,
	mapDeleteAllUserSessionsResponseDTO,
	mapDeleteUserResponseDTO,
	mapDeleteUserSessionResponseDTO,
	mapGetAllUsersResponseDTO,
	mapUpdateUserResponseDTO,
} from './mapping';
import type { ChangeUserPasswordParams, GetAllUsersParams } from './types';

/**
 * Получение списка всех пользователей
 */
export async function getAllUsers(params?: GetAllUsersParams) {
	const response = await $api.get<GetAllUsersResponseDTO>('/admin/users', {
		params,
	});
	return mapGetAllUsersResponseDTO(response.data);
}

/**
 * Изменение пароля пользователя
 */
export async function changeUserPassword({ userId, password }: ChangeUserPasswordParams) {
	const resposne = await $api.patch<ChangeUserPasswordResponseDTO>(
		`/admin/users/${userId}/change-password`,
		{ password },
	);

	return mapChangeUserPasswordResponseDTO(resposne.data);
}

/**
 * Обновление имени и роли пользователя
 */
export async function updateUser(
	userId: string,
	data: Partial<{
		name: string;
		role: UserRole;
	}>,
) {
	const resposne = await $api.patch<UpdateUserResponseDTO>(`/admin/users/${userId}/`, data);
	return mapUpdateUserResponseDTO(resposne.data);
}

/**
 * Выход из аккаунта со всех устройств пользователя
 */
export async function deleteAllUserSessions({ userId }: { userId: string }) {
	const response = await $api.delete<DeleteAllUserSessionsResponseDTO>(
		`/admin/users/${userId}/sessions`,
	);
	return mapDeleteAllUserSessionsResponseDTO(response.data);
}

/**
 * Удаление одной сессии пользователя
 */
export async function deleteUserSession({
	userId,
	sessionId,
}: {
	userId: string;
	sessionId: string;
}) {
	const response = await $api.delete<DeleteUserSessionResponseDTO>(
		`/admin/users/${userId}/sessions/${sessionId}`,
	);
	return mapDeleteUserSessionResponseDTO(response.data);
}

/**
 * Удаление пользователя
 */
export async function deleteUser(userId: string) {
	const response = await $api.delete<DeleteUserResponseDTO>(`/admin/users/${userId}`);
	return mapDeleteUserResponseDTO(response.data);
}
