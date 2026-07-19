import type { UserRole } from '@/shared/types/userRole';

export interface User {
	id: string;
	name: string;
	role: UserRole;
	deviceId: string;
	sessionId: string;
}
