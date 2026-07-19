import { z } from 'zod';

export const passwordSchema = z
	.object({
		password: z
			.string()
			.nonempty({ error: 'Это поле обязательно для заполнения' })
			.min(6, { error: 'Пароль должен быть не менее 6 символов' })
			.max(255, 'Превышена максимальная длина пароля - 255 символов'),
		repeatPassword: z
			.string()
			.nonempty({ error: 'Это поле обязательно для заполнения' })
			.min(6, { error: 'Пароль должен быть не менее 6 символов' })
			.max(255, 'Превышена максимальная длина пароля - 255 символов'),
	})
	.refine((data) => data.password === data.repeatPassword, {
		message: 'Пароли не совпадают!',
		path: ['repeatPassword'],
	});

export type PasswordSchema = z.infer<typeof passwordSchema>;
