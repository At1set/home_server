import { type FC, type ReactNode, useEffect, useState } from 'react';

import { TokenService } from '@/entities/user';
import type { User } from '@/entities/user/model/types';
import { $api } from '@/shared/api';

import { AuthContext } from '../model/context';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { AuthContext as AuthContextType } from '../model/types';
import { TokenRefresher } from '../utils/refreshTokens';

interface Props {
	children: ReactNode;
}

/**
 * Провайдер, предоставляющий информацию об авторизации пользователя
 * @see {@link AuthContextType}
 */
export const AuthProvider: FC<Props> = ({ children }) => {
	const [isAuth, setAuth] = useState(false);
	const [isLoading, setIsLoading] = useState(true);
	const [user, setUser] = useState<User | null>(null);

	function login(userPayload: User) {
		setUser(userPayload);
		setAuth(true);
	}

	function logout() {
		setUser(null);
		setAuth(false);
		TokenService.removeToken();
	}

	useEffect(() => {
		// Добавление Authorization Header с acess токеном
		const requestInterceptor = $api.interceptors.request.use((config) => {
			if (config.skipAuthHeader || config._isRetry) return config;
			const token = TokenService.getToken();
			if (token) {
				config.headers.Authorization = `Bearer ${token}`;
			}
			return config;
		});

		// Авто-refresh токена при 401 ответе от сервера
		const responseInterceptor = $api.interceptors.response.use(
			(res) => res,
			async (error) => {
				const originalRequest = error.config;

				if (originalRequest.url?.includes('/auth/refresh')) {
					return Promise.reject(error);
				}

				if (error.response?.status === 401 && !originalRequest._isRetry) {
					originalRequest._isRetry = true;

					// ЕСЛИ РЕФРЕШ УЖЕ ИДЕТ — встаем в очередь ожидания
					if (TokenRefresher.getIsRefreshing()) {
						return new Promise((resolve, reject) => {
							TokenRefresher.appendQueue({ resolve, reject });
						})
							.then((token) => {
								originalRequest.headers.Authorization = `Bearer ${token}`;
								return $api(originalRequest);
							})
							.catch(Promise.reject);
					}

					try {
						const newToken = await TokenRefresher.refreshTokens();
						const newUser = TokenService.decodeSafe();
						if (!newUser)
							throw new Error('Не получилось обновить данные пользователя при обновлении токена');
						login(newUser);
						originalRequest.headers.Authorization = `Bearer ${newToken}`;
						return $api(originalRequest);
					} catch (refreshError) {
						logout();
						return Promise.reject(refreshError);
					}
				}
				return Promise.reject(error);
			},
		);

		return () => {
			$api.interceptors.request.eject(requestInterceptor);
			$api.interceptors.response.eject(responseInterceptor);
		};
	}, []);

	// Проверка на валидность токена при первом запуске приложения
	useEffect(() => {
		const initAuth = async () => {
			const { status, payload } = TokenService.checkLocalStatus();

			if (status === 'valid' && payload !== null) {
				login(payload);
			} else if (status === 'expired') {
				console.log('Access токен истек, пробуем обновиться через refresh-token...');
				try {
					const token = await TokenRefresher.refreshTokens();
					const newUser = TokenService.decodeSafe();
					if (token && newUser !== null) login(newUser);
				} catch {
					console.log('Обновление токена не удалось, идет перенаправление на страницу входа...');
					logout();
				}
			} else {
				logout();
			}

			setIsLoading(false);
		};

		initAuth();
	}, []);

	return (
		<AuthContext.Provider value={{ isAuth, setAuth, user, isLoading, login, logout }}>
			{children}
		</AuthContext.Provider>
	);
};
