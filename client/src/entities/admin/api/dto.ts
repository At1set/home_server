import type { UserRole } from '@/shared/types/userRole';

export interface SessionDTO {
	id: string;
	user_id: string;
	device_id: string;
	device_name: string;
	ip_address: string;
	expires_at: string;
	created_at: string;
}

export interface UserDTO {
	name: string;
	id: string;
	login: string;
	role: UserRole;
	created_at: string;
}

export interface UserWithSessionsDTO extends UserDTO {
	sessions: SessionDTO[];
}

export interface GetAllUsersResponseDTO {
	data: UserWithSessionsDTO[];
	meta: {
		totalCount: number;
		totalPages: number;
		currentPage: number;
		limit: number;
	};
}

export interface ChangeUserPasswordResponseDTO {
	message: string;
}

export interface UpdateUserResponseDTO {
	message: string;
	user: UserWithSessionsDTO;
}

export interface DeleteUserSessionResponseDTO {
	message: string;
	user: UserWithSessionsDTO;
}

export interface DeleteAllUserSessionsResponseDTO {
	message: string;
	closedSessionsCount: number;
}

export interface DeleteUserResponseDTO {
	message: string;
	user: UserWithSessionsDTO;
}
