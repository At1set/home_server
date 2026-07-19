import { z } from 'zod';
import { Role } from '../../../generated/prisma/enums';
import { paginationSchema } from '../../../shared/validation/pagination.schema';
import { emptyStringToUndefined } from '../../../shared/utils/emptyStringToUndefined';

const availableRoles = Object.values(Role);

export const searchSchema = z.object({
	query: paginationSchema.shape.query.extend({
		// Поля фильтрации (все опциональные)
		id: z.string().trim().optional(),
		login: z.string().trim().optional(),
		name: z.string().trim().optional(),
		role: z.preprocess(
			emptyStringToUndefined,
			z.enum(Role, { error: `Несуществующая роль, досупные роли: ${availableRoles}` }).optional(),
		),
	}),
});

export type SearchSchema = z.infer<typeof paginationSchema>;
