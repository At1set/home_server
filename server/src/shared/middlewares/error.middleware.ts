import { ErrorRequestHandler } from 'express';
import { ApiError } from '../Errors/ApiErrors';

export function errorMiddleware(): ErrorRequestHandler {
	return (err, _req, res, _next) => {
		if (err instanceof ApiError) {
			return res.status(err.status).json({
				message: err.message,
				errors: err.errors,
			});
		}

		console.log(err);

		res.status(500).json({
			error: 'Внутренняя ошибка сервера',
			...(process.env.NODE_ENV === 'development' &&
				err instanceof Error && { details: err.message }),
		});
	};
}
