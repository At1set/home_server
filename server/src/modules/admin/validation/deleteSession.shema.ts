import z from 'zod';
import { uuidSchema } from '../../../shared/validation';

export const deleteSessionSchema = z.object({
	params: z.object({
		id: uuidSchema, // ID пользователя
		sessionId: z.uuid({ error: 'Некорректный формат ID сессии' }), // ID сессии
	}),
});
export type DeleteSessionSchema = z.infer<typeof deleteSessionSchema>;
