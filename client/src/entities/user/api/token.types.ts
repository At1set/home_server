import type { User } from '../model/types';

export interface TokenBody extends User {
	iat: number;
	exp: number;
}

export type TokenRefreshResponse = {
	message: string;
	accessToken: string;
	user: {
		id: string;
		role: string;
		name: string;
	};
};

export type TokenStatus = 'missing' | 'expired' | 'valid';
