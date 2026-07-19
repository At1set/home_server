import type { FullUser, Session, User } from '../model/types';
import type {
	ChangeUserPasswordResponseDTO,
	DeleteAllUserSessionsResponseDTO,
	DeleteUserResponseDTO,
	DeleteUserSessionResponseDTO,
	GetAllUsersResponseDTO,
	SessionDTO,
	UpdateUserResponseDTO,
	UserDTO,
	UserWithSessionsDTO,
} from './dto';
import type {
	ChangeUserPasswordResponse,
	DeleteAllUserSessionsResponse,
	DeleteUserResponse,
	DeleteUserSessionResponse,
	GetAllUsersResponse,
	UpdateUserResponse,
} from './types';

export function mapSessionDTO(sessionDTO: SessionDTO): Session {
	return {
		id: sessionDTO.id,
		user_id: sessionDTO.user_id,
		device_id: sessionDTO.device_id,
		device_name: sessionDTO.device_name,
		ip_address: sessionDTO.ip_address,
		expires_at: new Date(sessionDTO.expires_at),
		created_at: new Date(sessionDTO.created_at),
	};
}

export function mapGetAllUsersResponseDTO(
	getAllUsersResponseDTO: GetAllUsersResponseDTO,
): GetAllUsersResponse {
	const { meta, data } = getAllUsersResponseDTO;

	return {
		data: data.map((user) => mapFullUserDTO(user)),
		meta: {
			totalCount: meta.totalCount,
			totalPages: meta.totalPages,
			currentPage: meta.currentPage,
			limit: meta.limit,
		},
	};
}

export function mapChangeUserPasswordResponseDTO(
	changeUserPasswordResponseDTO: ChangeUserPasswordResponseDTO,
): ChangeUserPasswordResponse {
	return {
		message: changeUserPasswordResponseDTO.message,
	};
}

export function mapUserDTO(userDTO: UserDTO): User {
	return {
		name: userDTO.name,
		id: userDTO.id,
		login: userDTO.login,
		role: userDTO.role,
		created_at: new Date(userDTO.created_at),
	};
}

export function mapFullUserDTO(userDTO: UserWithSessionsDTO): FullUser {
	return {
		name: userDTO.name,
		id: userDTO.id,
		login: userDTO.login,
		role: userDTO.role,
		created_at: new Date(userDTO.created_at),
		sessions: userDTO.sessions.map((session) => mapSessionDTO(session)),
	};
}

export function mapUpdateUserResponseDTO(
	updateUserResponseDTO: UpdateUserResponseDTO,
): UpdateUserResponse {
	return {
		message: updateUserResponseDTO.message,
		user: mapUserDTO(updateUserResponseDTO.user),
	};
}

export function mapDeleteUserSessionResponseDTO(
	deleteSessionResponseDTO: DeleteUserSessionResponseDTO,
): DeleteUserSessionResponse {
	return {
		message: deleteSessionResponseDTO.message,
		user: mapFullUserDTO(deleteSessionResponseDTO.user),
	};
}

export function mapDeleteAllUserSessionsResponseDTO(
	deleteAllUserSessionsResponseDTO: DeleteAllUserSessionsResponseDTO,
): DeleteAllUserSessionsResponse {
	return {
		message: deleteAllUserSessionsResponseDTO.message,
		closedSessionsCount: deleteAllUserSessionsResponseDTO.closedSessionsCount,
	};
}

export function mapDeleteUserResponseDTO(
	deleteUserResponseDTO: DeleteUserResponseDTO,
): DeleteUserResponse {
	return {
		message: deleteUserResponseDTO.message,
		user: mapUserDTO(deleteUserResponseDTO.user),
	};
}
