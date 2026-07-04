import { users } from '../../../generated/prisma/client.js';
import { Role } from '../../../shared/types/roles.js';

export interface UserDTO {
	id: string;
	name: string;
	role: Role;
}

export function mapUserDTO(user: users): UserDTO {
	return {
		id: user.id,
		role: user.role as Role,
		name: user.name,
	};
}
