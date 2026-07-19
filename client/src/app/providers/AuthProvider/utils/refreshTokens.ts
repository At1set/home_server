import { TokenService } from '@/entities/user';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let failedQueue: any[] = [];
let refreshPromise: Promise<string | null> | null = null;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyPromiseParameters = Parameters<ConstructorParameters<typeof Promise<any>>[0]>;
type AnyResolve = AnyPromiseParameters[0];
type AnyReject = AnyPromiseParameters[1];

const processQueue = (error: unknown, token: string | null = null) => {
	failedQueue.forEach((prom) => {
		if (error) {
			prom.reject(error);
		} else {
			prom.resolve(token);
		}
	});
	failedQueue = [];
};

export const TokenRefresher = {
	getIsRefreshing() {
		return refreshPromise !== null;
	},

	appendQueue(value: { resolve: AnyResolve; reject: AnyReject }) {
		failedQueue.push(value);
	},

	refreshTokens(): Promise<string | null> {
		// Если рефреш уже запущен кем-то другим, просто возвращаем текущий активный промис
		if (refreshPromise) {
			return refreshPromise;
		}

		// Создаем промис и сохраняем его в глобальную переменную
		refreshPromise = TokenService.update()
			.then((token) => {
				processQueue(null, token);
				return token;
			})
			.catch((err) => {
				processQueue(err, null);
				throw err;
			})
			.finally(() => {
				refreshPromise = null; // Сбрасываем ссылку после завершения
			});

		return refreshPromise;
	},
};
