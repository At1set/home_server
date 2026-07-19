import { type ZodIssue } from 'zod'; // 1. Импортируем тип ошибки Zod

// Создаем тип-алиас для удобства чтения
type ApiValidationError = Record<string, unknown> | ZodIssue;

export class ApiError extends Error {
	status: number;
	errors: ApiValidationError[];

	constructor(status: number, message: string, errors: ApiValidationError[] = []) {
		super(message);
		this.status = status;
		this.errors = errors;
	}

	static UnauthorizedError(message?: string) {
		return new ApiError(401, message || 'Пользователь не авторизован');
	}

	static ForbiddenError(message?: string) {
		return new ApiError(403, message || 'Недостаточно прав для выполнения операции');
	}

	static NotFound(message?: string) {
		return new ApiError(404, message || 'Не найдено');
	}

	static BadRequest(message: string, errors: ApiValidationError[] = []) {
		return new ApiError(400, message, errors);
	}
}
