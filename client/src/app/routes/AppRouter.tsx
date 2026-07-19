import type { FC } from 'react';
import { Route, Routes } from 'react-router-dom';

import { AdminPanelPage } from '@/pages/AdminPanelPage';
import { MainPage } from '@/pages/MainPage';
import { SignInPage } from '@/pages/SignInPage';
import { SignUpPage } from '@/pages/SignUpPage';

import { useAuthContext } from '../providers/AuthProvider/hooks/useAuthContext';
import { ProtectedRoleRoute } from './ProtectedRoleRoute';
import { ProtectedRoute } from './ProtectedRoute';
import { PublicRoute } from './PublicRoute';

/**
 * Корневой роутер приложения
 */
export const AppRouter: FC = () => {
	const { isLoading } = useAuthContext();

	if (isLoading) return <div>Загрузка...</div>;

	return (
		<Routes>
			{/* Публичные пути */}
			<Route element={<PublicRoute />}>
				<Route path="/login" element={<SignInPage />} />
				<Route path="/registration" element={<SignUpPage />} />
			</Route>

			{/* Пути, доступные только для авторизованных пользователей */}
			<Route element={<ProtectedRoute />}>
				<Route index element={<MainPage />} />
				<Route element={<ProtectedRoleRoute allowTo={['admin', 'owner']} />}>
					<Route path="/admin-panel" element={<AdminPanelPage />} />
				</Route>
			</Route>
		</Routes>
	);
};
