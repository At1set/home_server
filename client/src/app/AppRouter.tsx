import type { FC } from 'react';
import { Route, Routes } from 'react-router-dom';

import { Main } from '@/pages/Main';

/**
 * Корневой роутер приложения
 */
export const AppRouter: FC = () => {
	return (
		<Routes>
			<Route index element={<Main />}></Route>
		</Routes>
	);
};
