import type { UUID } from 'crypto';
import { type sessions as SessionType } from '../../../generated/prisma/client.js';

export interface SessionDTO {
	id: UUID;
	user_id: string;
	device_id: string;
	device_name: string;
	ip_address: string;
	expires_at: Date;
	created_at: Date;
}

export type Session = Pick<
	SessionType,
	'id' | 'user_id' | 'created_at' | 'device_id' | 'device_name' | 'expires_at' | 'ip_address'
>;

export function mapSessionDTO(session: Session): SessionDTO {
	return {
		id: session.id as UUID,
		user_id: session.user_id,
		created_at: session.created_at,
		device_id: session.device_id,
		device_name: session.device_name,
		ip_address: session.ip_address,
		expires_at: session.expires_at,
	};
}
