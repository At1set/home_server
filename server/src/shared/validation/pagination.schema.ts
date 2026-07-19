import { z } from 'zod';
import { emptyStringToUndefined } from '../utils/emptyStringToUndefined';

export const paginationSchema = z.object({
	query: z.object({
		page: z.preprocess(
			emptyStringToUndefined,
			z.coerce
				.number()
				.int({ error: 'page должен быть целым числом' })
				.positive({ error: 'page должен быть больше 0' })
				.default(1), // Если фронтенд не прислал page, Zod сам подставит 1
		),

		limit: z.preprocess(
			emptyStringToUndefined,
			z.coerce
				.number()
				.int({ error: 'limit должен быть целым числом' })
				.positive({ error: 'limit должен быть больше 0' })
				.max(100, { error: 'Нельзя запросить больше 100 записей за раз' })
				.default(10), // Если фронтенд не прислал limit, Zod подставит 10
		),
	}),
});

export type PaginationSchema = z.infer<typeof paginationSchema>;
