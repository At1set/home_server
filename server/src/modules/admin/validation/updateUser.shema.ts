import z from 'zod';
import { Role } from '../../../generated/prisma/enums';
import { userIdParamsSchema } from '../../../shared/validation';

const availableRoles = Object.values(Role);

export const updateUserSchema = userIdParamsSchema.extend({
	body: z
		.object({
			name: z
				.string()
				.min(3, { error: 'Имя должно быть не короче трех символов' })
				.max(12, { error: 'Имя не может превышать 12 символов' }),
			role: z.enum(Role, { error: `Несуществующая роль, досупные роли: ${availableRoles}` }),
		})
		.partial()
		.refine((data) => Object.keys(data).length > 0, {
			message:
				'Ни одного поля не было передано для изменения пользователя. Доступные редактируемые поля: name, role',
		}),
});

export type UpdateUserSchema = z.infer<typeof updateUserSchema>;
