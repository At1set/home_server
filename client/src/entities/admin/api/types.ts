import type { FullUser, User } from '../model/types';

export type GetAllUsersParams = {
	page: number;
	limit: number;
};

export interface GetAllUsersResponse {
	data: FullUser[];
	meta: {
		totalCount: number;
		totalPages: number;
		currentPage: number;
		limit: number;
	};
}

export interface ChangeUserPasswordParams {
	userId: string;
	password: string;
}

export interface ChangeUserPasswordResponse {
	message: string;
}

export interface UpdateUserResponse {
	message: string;
	user: Omit<User, 'sessions'>;
}

export interface DeleteUserSessionResponse {
	message: string;
	user: FullUser;
}

export interface DeleteAllUserSessionsResponse {
	message: string;
	closedSessionsCount: number;
}

export interface DeleteUserResponse {
	message: string;
	user: User;
}
