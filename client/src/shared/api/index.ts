import axios from 'axios';

const {
	DEV: isDev,
	VITE_API_GATEWAY_DEV: API_GATEWAY_DEV,
	VITE_API_GATEWAY_PROD: API_GATEWAY_PROD,
} = import.meta.env;

export const $api = axios.create({
	baseURL: isDev ? API_GATEWAY_DEV : API_GATEWAY_PROD,
	withCredentials: true,
	timeout: 10_000,
});
