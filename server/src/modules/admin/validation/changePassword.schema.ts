import z from 'zod';

export const changePasswordSchema = z.object({
	params: z.object({
		id: z.uuid(),
	}),
	body: z.object({
		password: z
			.string()
			.nonempty({ error: 'Пароль обязателен' })
			.min(6, { error: 'Пароль должен быть не менее 6 символов' })
			.max(255, 'Превышена максимальная длина пароля - 255 символов'),
	}),
});

export type ChangePasswordSchema = z.infer<typeof changePasswordSchema>;
