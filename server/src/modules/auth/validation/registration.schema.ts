import { z } from 'zod';

export const registrationSchema = z.object({
	body: z.object({
		login: z
			.string()
			.nonempty({ error: 'Логин обязателен' })
			.min(4, { error: 'Длина логина не соответсвует минимальной - 4 символа' }),
		name: z
			.string()
			.nonempty({ error: 'Имя обязательно' })
			.min(3, { error: 'Имя должно быть не короче трех символов' })
			.max(12, { error: 'Имя не может привышать 12 символов' }),
		password: z
			.string()
			.nonempty({ error: 'Пароль обязателен' })
			.min(6, { error: 'Пароль должен быть не менее 6 символов' })
			.max(255, 'Превышена максимальная длина пароля - 255 символов'),
		deviceId: z.string({ error: 'deviceId обязателен' }),
	}),
});

export type RegistrationSchema = z.infer<typeof registrationSchema>;
