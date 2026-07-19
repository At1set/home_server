import { z } from 'zod';

export const loginSchema = z.object({
	body: z.object({
		login: z
			.string()
			.nonempty({ error: 'Логин обязателен' })
			.min(4, 'Логин должен быть не менее четырех символов')
			.max(15, 'Логин не может привышать 15 символов'),
		password: z
			.string()
			.nonempty({ error: 'Пароль обязателен' })
			.min(6, 'Пароль должен быть не менее 6 символов')
			.max(255, 'Превышена максимальная длина пароля - 255 символов'),
		deviceId: z.string({ error: 'deviceId обязателен' }),
	}),
});

export type LoginSchema = z.infer<typeof loginSchema>;
