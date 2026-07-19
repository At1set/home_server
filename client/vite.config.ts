import path from 'node:path';

import basicSsl from '@vitejs/plugin-basic-ssl';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
	plugins: [react(), basicSsl()],
	resolve: {
		alias: {
			'@': path.resolve(__dirname, './src'),
			'@images': path.resolve(__dirname, './src/lib/shared/assets/images'),
			'@icons': path.resolve(__dirname, './src/lib/shared/assets/icons'),
		},
	},
	server: {
		host: true,
		port: 5173,
		proxy: {
			// Все запросы, начинающиеся с /api, Vite перенаправит на твой бэкенд
			'/api': {
				target: 'http://localhost:5000', // Адрес твоего бэка на компе
				changeOrigin: true,
				rewrite: (path) => path.replace(/^\/api/, ''), // Срезаем /api перед отправкой на бэк
				xfwd: true,
			},
		},
	},
});
