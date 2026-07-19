import type { UserRole } from '@/shared/types/userRole';

export interface FullUser {
	name: string;
	id: string;
	login: string;
	role: UserRole;
	created_at: Date;
	sessions: Session[];
}

export type User = Omit<FullUser, 'sessions'>;

export interface Session {
	id: string;
	user_id: string;
	device_id: string;
	device_name: string;
	ip_address: string;
	expires_at: Date;
	created_at: Date;
}