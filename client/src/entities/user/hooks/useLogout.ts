import { useAuthContext } from '@/app/providers/AuthProvider';

import { logout as logoutApi, logoutAll as logoutAllApi } from '../api';

export const useLogout = () => {
	const { logout: unauthorize } = useAuthContext();

	const logout = async () => {
		try {
			await logoutApi();
		} catch (error) {
			console.error(error);
		} finally {
			unauthorize();
		}
	};

	const logoutAll = async () => {
		try {
			await logoutAllApi();
		} catch (error) {
			console.error(error);
		} finally {
			unauthorize();
		}
	};

	return { logout, logoutAll };
};
