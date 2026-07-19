import { mapSessionDTO, type Session, type SessionDTO } from './session.dto';
import { mapUserDTO, type User, type UserDTO } from './user.dto';

export type Users = (User & {
	sessions: Session[];
})[];

export type UsersDTO = (UserDTO & {
	sessions: SessionDTO[];
})[];

export function mapUsersDTO(users: Users): UsersDTO {
	return users.map(({ sessions, ...user }) => {
		return {
			...mapUserDTO(user),
			sessions: sessions.map((session) => mapSessionDTO(session)),
		};
	});
}
