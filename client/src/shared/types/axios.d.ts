import 'axios';

declare module 'axios' {
	// Расширяем конфигурацию, которую мы передаем в методы запросов ($api.get, $api.post и т.д.)
	export interface AxiosRequestConfig {
		skipAuthHeader?: boolean;
		_isRetry?: boolean;
	}

	// Расширяем конфигурацию, которая приходит внутрь интерсепторов (InternalAxiosRequestConfig)
	export interface InternalAxiosRequestConfig {
		skipAuthHeader?: boolean;
		_isRetry?: boolean;
	}
}
