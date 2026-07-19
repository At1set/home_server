import type { FC } from 'react';
import { Link } from 'react-router-dom';

import { useAuthContext } from '@/app/providers/AuthProvider';
import { useLogout } from '@/entities/user';

import styles from './Header.module.scss';

export const Header: FC = () => {
	const { user } = useAuthContext();
	const { logout, logoutAll } = useLogout();

	if (!user) return null;

	return (
		<header className={styles.header}>
			<div className={styles.header__container}>
				<div className={styles.header__top}>
					<div className={styles.user}>
						<span className={styles.user__name}>Привет, {user.name}!</span>
						<span className={styles.user__role}>Роль: {user.role}</span>
						<span className={styles.user__id}>Id: {user.id}</span>
					</div>
					<div>
						{['admin', 'owner'].includes(user.role) && (
							<Link className={styles.adminButton} to={'/admin-panel'}>
								Админ панель
							</Link>
						)}
					</div>
				</div>
				<div className={styles.logoutBlock}>
					<button className={styles.logoutBtn} onClick={logout}>
						Выйти с аккаунта
					</button>
					<button className={styles.logoutBtn} onClick={logoutAll}>
						Выйти со всех устройств
					</button>
				</div>
			</div>
		</header>
	);
};
