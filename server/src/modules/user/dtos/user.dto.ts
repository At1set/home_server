import { type Role as RoleType, type users } from '../../../generated/prisma/client';

export interface UserDTO {
	id: string;
	name: string;
	role: RoleType;
}

export function mapUserDTO(user: users): UserDTO {
	return {
		id: user.id,
		role: user.role as RoleType,
		name: user.name,
	};
}
