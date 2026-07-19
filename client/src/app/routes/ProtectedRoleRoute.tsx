import type { FC } from 'react';
import { Outlet } from 'react-router-dom';

import type { UserRole } from '@/shared/types/userRole';

import { useAuthContext } from '../providers/AuthProvider/hooks/useAuthContext';

interface Props {
	allowTo: UserRole | UserRole[];
}

export const ProtectedRoleRoute: FC<Props> = ({ allowTo }) => {
	const { user, isLoading } = useAuthContext();
	const allowedRoles = Array.isArray(allowTo) ? allowTo : [allowTo];

	if (isLoading) return null;
	if (!user || !allowedRoles.includes(user.role)) return <div>403 Forbidden</div>;

	return <Outlet />;
};
