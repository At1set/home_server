import { $api } from '@/shared/api';

import type {
	AuthResponseDTO,
	DeleteAccountResponseDTO,
	LogoutAllResponseDTO,
	LogoutResponseDTO,
} from './dto';
import {
	mapAuthResponseDTO,
	mapDeleteAccountResponseDTO,
	mapLogoutAllResponseDTO,
	mapLogoutResponseDTO,
} from './mapping';
import type { LoginParams, RegisterParams } from './types';

/**
 * Регистрация пользователя
 */
export async function register(params: RegisterParams) {
	const response = await $api.post<AuthResponseDTO>('/auth/registration', params, {
		skipAuthHeader: true,
	});
	return mapAuthResponseDTO(response.data);
}

/**
 * Логин пользователя
 */
export async function login(params: LoginParams) {
	const response = await $api.post<AuthResponseDTO>('/auth/login', params, {
		skipAuthHeader: true,
	});
	return mapAuthResponseDTO(response.data);
}

/**
 * Выйти с аккаунта
 */
export async function logout() {
	const response = await $api.post<LogoutResponseDTO>(
		'/auth/logout',
		{},
		{
			skipAuthHeader: true,
		},
	);

	return mapLogoutResponseDTO(response.data);
}

/**
 * Выйти со всех устройств
 */
export async function logoutAll() {
	const response = await $api.post<LogoutAllResponseDTO>('/auth/logout-all', {});
	return mapLogoutAllResponseDTO(response.data);
}

/**
 * Удалить аккаунт
 */
export async function deleteAccount() {
	const response = await $api.delete<DeleteAccountResponseDTO>('/me/deleteAccount');
	return mapDeleteAccountResponseDTO(response.data);
}
