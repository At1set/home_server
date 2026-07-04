import { Request, Response, NextFunction } from 'express';
import { ZodObject, ZodError, ZodType } from 'zod';
import { ApiError } from '../Errors/ApiErrors.js';

export const validate =
	(
		schema: ZodObject<{
			body?: ZodType;
			query?: ZodType;
			params?: ZodType;
		}>,
	) =>
	async (req: Request, _res: Response, next: NextFunction) => {
		try {
			// Валидируем весь объект запроса
			const parsed = await schema.parseAsync({
				body: req.body,
				query: req.query,
				params: req.params,
			});

			// Перезаписываем ВСЕ части запроса очищенными и приведенными к типам данными
			if (parsed.body) req.body = parsed.body;
			if (parsed.query) req.query = parsed.query as any;
			if (parsed.params) req.params = parsed.params as any;

			return next();
		} catch (error) {
			if (error instanceof ZodError) {
				return next(ApiError.BadRequest('Переданные данные некорректны!', error.issues));
			}
			return next(error);
		}
	};
