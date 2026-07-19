import type { Request, Response, NextFunction } from 'express';
import { ApiError } from '../Errors/ApiErrors';
import { type Role as RoleType } from '../../generated/prisma/enums';

export function roleMiddleware(requiredRole: RoleType | RoleType[]) {
	return (req: Request, _res: Response, next: NextFunction) => {
		try {
			const user = req.user;
			const allowedRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];

			if (!user || !allowedRoles.includes(user.role)) {
				throw ApiError.ForbiddenError();
			}

			next();
		} catch (error) {
			next(error);
		}
	};
}
