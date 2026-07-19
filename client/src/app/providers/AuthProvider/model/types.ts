import type { Dispatch, SetStateAction } from 'react';

import type { User } from '@/entities/user/model/types';

export interface AuthContext {
	isAuth: boolean;

	setAuth: Dispatch<SetStateAction<boolean>>;

	isLoading: boolean;

	user: User | null;

	login: (userPayload: User) => void;

	logout: () => void;
}
