import { z } from 'zod';

export const registrationSchema = z.object({
	body: z.object({
		login: z
			.string({ error: 'Логин обязателен' })
			.min(4, 'Длина логина не соответсвует минимальной - 4 символа'),
		name: z.string({ error: 'Имя обязательно' }),
		password: z
			.string({ error: 'Пароль обязателен' })
			.min(6, 'Пароль должен быть не менее 6 символов'),
		deviceId: z.string({ error: 'deviceId обязателен' }),
	}),
});
