import type { User } from '../model/types';
import type {
	AuthResponseDTO,
	DeleteAccountResponseDTO,
	LogoutAllResponseDTO,
	LogoutResponseDTO,
	UserDTO,
} from './dto';
import type {
	AuthResponse,
	DeleteAccountResponse,
	LogoutAllResponse,
	LogoutResponse,
} from './types';

export function mapUserDTO(user: UserDTO): Omit<User, 'deviceId' | 'sessionId'> {
	return {
		id: user.id,
		name: user.name,
		role: user.role,
	};
}

export function mapAuthResponseDTO(authResponseDTO: AuthResponseDTO): AuthResponse {
	return {
		message: authResponseDTO.message,
		token: authResponseDTO.accessToken,
		user: mapUserDTO(authResponseDTO.user),
	};
}

export function mapLogoutResponseDTO(logoutResponse: LogoutResponseDTO): LogoutResponse {
	return {
		message: logoutResponse.message,
	};
}

export function mapLogoutAllResponseDTO(
	logoutAllResponseDTO: LogoutAllResponseDTO,
): LogoutAllResponse {
	return {
		message: logoutAllResponseDTO.message,
		closedSessionsCount: logoutAllResponseDTO.closedSessionsCount,
	};
}

export function mapDeleteAccountResponseDTO(
	deleteAccountResponseDTO: DeleteAccountResponseDTO,
): DeleteAccountResponse {
	return {
		message: deleteAccountResponseDTO.message,
		user: mapUserDTO(deleteAccountResponseDTO.user),
	};
}
