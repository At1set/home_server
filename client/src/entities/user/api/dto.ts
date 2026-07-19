import type { UserRole } from '@/shared/types/userRole';

export interface UserDTO {
	id: string;
	name: string;
	role: UserRole;
}

export interface AuthResponseDTO {
	message: string;
	accessToken: string;
	user: UserDTO;
}

export interface LogoutResponseDTO {
	message: string;
}

export interface LogoutAllResponseDTO {
	message: string;
	closedSessionsCount: number;
}

export interface DeleteAccountResponseDTO {
	message: string;
	user: UserDTO;
}
