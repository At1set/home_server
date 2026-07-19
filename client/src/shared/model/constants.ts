import type { UserRole } from '../types/userRole';

export const USER_ROLES: UserRole[] = ['user', 'admin', 'owner'];
export const USER_ROLE: Record<UserRole, UserRole> = {
	admin: 'admin',
	user: 'user',
	owner: 'owner',
};
export const ROLE_WEIGHT: Record<UserRole, number> = {
	user: 1,
	admin: 2,
	owner: 999,
};
