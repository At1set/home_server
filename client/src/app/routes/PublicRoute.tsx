import type { FC } from 'react';
import { Navigate, Outlet } from 'react-router-dom';

import { useAuthContext } from '../providers/AuthProvider/hooks/useAuthContext';

export const PublicRoute: FC = () => {
	const { isAuth, isLoading } = useAuthContext();

	if (isLoading) return null;
	if (isAuth) return <Navigate to="/" />;

	return <Outlet />;
};
