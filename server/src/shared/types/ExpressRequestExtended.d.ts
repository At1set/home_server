import 'express';
import type { Payload } from '../../modules/auth/services/TokenService';

declare module 'express' {
	export interface Request {
		validatedQuery?: Record<string, any>;
		validatedParams?: Record<string, any>;
		user?: Payload;
	}
}
