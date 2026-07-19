import { z } from 'zod';

export const signUpSchema = z.object({
	name: z
		.string()
		.nonempty({ error: 'Это поле обязательно для заполнения' })
		.min(3, 'Имя должно быть не короче трех символов')
		.max(12, 'Имя не может привышать 12 символов'),
	login: z
		.string()
		.nonempty({ error: 'Это поле обязательно для заполнения' })
		.min(4, 'Логин должен быть не менее четырех символов')
		.max(15, 'Логин не может привышать 15 символов'),
	password: z
		.string()
		.nonempty({ error: 'Это поле обязательно для заполнения' })
		.min(6, 'Пароль должен быть не менее 6 символов'),
});

export type SignUpFormFields = z.infer<typeof signUpSchema>;
