import type { User } from '../model/types';

export interface RegisterParams {
	login: string;
	name: string;
	password: string;
	deviceId: string;
}

export interface LoginParams {
	login: string;
	password: string;
	deviceId: string;
}

export interface AuthResponse {
	message: string;
	token: string;
	user: Omit<User, 'deviceId' | 'sessionId'>;
}

export interface LogoutResponse {
	message: string;
}

export interface LogoutAllResponse {
	message: string;
	closedSessionsCount: number;
}

export interface DeleteAccountResponse {
	message: string;
	user: Omit<User, 'deviceId' | 'sessionId'>;
}
