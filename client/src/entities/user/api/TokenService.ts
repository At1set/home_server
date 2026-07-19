import { jwtDecode } from 'jwt-decode';

import { $api } from '@/shared/api';

import type { TokenBody, TokenRefreshResponse, TokenStatus } from './token.types';

export const TokenService = {
	/**
	 * Получить access-токен из localStorage
	 */
	getToken() {
		return localStorage.getItem('token');
	},

	/**
	 * Сохранить access-токен в localStorage
	 */
	setToken(token: string) {
		localStorage.setItem('token', token);
	},

	/**
	 * Удалить токен из localStorage (разлогин)
	 */
	removeToken() {
		localStorage.removeItem('token');
	},

	/**
	 * Синхронная проверка локального токена при старте приложения
	 *
	 * Декодирует JWT и проверяет его срок годности (exp)
	 */
	checkLocalStatus(): { status: TokenStatus; payload: TokenBody | null } {
		const token = TokenService.getToken();
		if (!token) return { status: 'missing', payload: null };

		try {
			const payload = jwtDecode<TokenBody>(token);

			// Переводим exp (секунды) в миллисекунды и сравниваем с текущим временем
			const isExpired = payload.exp * 1000 < Date.now();

			if (isExpired) return { status: 'expired', payload };

			return { status: 'valid', payload };
		} catch (error) {
			console.error('Ошибка декодирования JWT:', error);
			return { status: 'missing', payload: null };
		}
	},

	/**
	 * Запрос на обновление пары токенов.
	 */
	async update(): Promise<string> {
		try {
			const response = await $api.post<TokenRefreshResponse>(
				`/auth/refresh`,
				{},
				{ skipAuthHeader: true },
			);

			const newToken = response.data.accessToken;
			if (!newToken) {
				throw new Error('Сервер не вернул новый токен в ответе');
			}

			// Сохраняем новый access-токен
			TokenService.setToken(newToken);
			return newToken;
		} catch (error) {
			// Ошибка будет перехвачена интерсептором в AuthProvider, который сбросит сессию
			TokenService.removeToken();
			throw error;
		}
	},

	decode() {
		const token = TokenService.getToken();
		if (!token) return null;
		return jwtDecode<TokenBody>(token);
	},

	decodeSafe() {
		try {
			return TokenService.decode();
		} catch {
			return null;
		}
	},
};
