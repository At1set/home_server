import { z } from 'zod';

export const editUserSchema = z.object({
	name: z
		.string()
		.nonempty({ error: 'Это поле обязательно для заполнения' })
		.min(3, { error: 'Имя должно быть не короче трех символов' })
		.max(12, { error: 'Имя не может привышать 12 символов' }),
});

export type EditUserSchema = z.infer<typeof editUserSchema>;
