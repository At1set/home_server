import { z } from 'zod';

export const signInSchema = z.object({
	login: z
		.string()
		.nonempty({ error: 'Это поле обязательно для заполнения' })
		.min(4, 'Логин должен быть не менее четырех символов')
		.max(15, 'Логин не может превышать 15 символов'),
	password: z
		.string()
		.nonempty({ error: 'Это поле обязательно для заполнения' })
		.min(6, 'Пароль должен быть не менее 6 символов'),
});

export type SignInFormFields = z.infer<typeof signInSchema>;
