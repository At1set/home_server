// shared/validation.ts
import z from 'zod';

// Атомарный валидатор для UUID
export const uuidSchema = z.uuid({ message: 'Некорректный формат ID пользователя' });

// Схема для роутов, где ID лежит в params
export const userIdParamsSchema = z.object({
	params: z.object({
		id: z.uuid({ message: 'Некорректный формат ID пользователя' }),
	}),
});
