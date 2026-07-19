import { type users } from '../../../generated/prisma/client';
import { type Role as RoleType } from '../../../generated/prisma/enums';

export interface UserDTO {
	name: string;
	id: string;
	login: string;
	role: RoleType;
	created_at: Date;
}

export type User = Pick<users, 'id' | 'name' | 'login' | 'role' | 'created_at'>;

export function mapUserDTO(user: User): UserDTO {
	return {
		id: user.id,
		name: user.name,
		login: user.login,
		role: user.role as RoleType,
		created_at: user.created_at,
	};
}
