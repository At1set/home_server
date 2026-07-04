import { Request, Response, NextFunction } from 'express';
import { UserDTO } from '../../modules/auth/dtos/user.dto';
import { ApiError } from '../Errors/ApiErrors';
import { TokenService } from '../../modules/auth/services/TokenService';

// Расширяем интерфейс Request в Express, чтобы TypeScript знал про req.user
declare global {
	namespace Express {
		interface Request {
			user?: UserDTO;
		}
	}
}

export function authMiddleware(req: Request, _res: Response, next: NextFunction) {
	try {
		const authorizationHeader = req.headers.authorization;
		if (!authorizationHeader) {
			throw ApiError.UnauthorizedError();
		}

		const accessToken = authorizationHeader.split(' ')[1]; // Ожидаем формат "Bearer TOKEN"
		if (!accessToken) {
			throw ApiError.UnauthorizedError();
		}

		// Верифицируем access-токен
		const userData = TokenService.validateAccessToken(accessToken);
		if (!userData) throw ApiError.UnauthorizedError();

		// Записываем данные в req.user для дальнейшего использования в контроллере
		req.user = userData;

		return next();
	} catch (error) {
		return next(error);
	}
}
