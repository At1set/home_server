import clsx from 'clsx';
import React from 'react';
import { type FC, useState } from 'react';

import type { FullUser } from '@/entities/admin/model/types';

import { formatDate } from '../../../shared/utils/formatDate';
import { mapSessionsCount } from '../utils/mapSessionsCount';
import styles from './UsersTable.module.scss';

interface Props {
	users: FullUser[];
	onEdit?: (user: FullUser) => void;
}

export const UsersTable: FC<Props> = ({ users, onEdit }) => {
	// Храним ID пользователей, у которых раскрыты детали сессий
	const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

	const toggleUserSessions = (userId: string) => {
		setExpandedRows((prev) => ({
			...prev,
			[userId]: !prev[userId],
		}));
	};

	const handleEditClick = (e: React.MouseEvent, user: FullUser) => {
		e.stopPropagation();
		if (onEdit) {
			onEdit(user);
		}
	};

	return (
		<div className={styles.root}>
			<table className={styles.table}>
				<thead>
					<tr>
						<th className={styles.th}>ID</th>
						<th className={styles.th}>Имя</th>
						<th className={styles.th}>Логин</th>
						<th className={styles.th}>Роль</th>
						<th className={styles.th}>Дата регистрации</th>
						<th className={styles.th}>Сессии</th>
						<th className={clsx(styles.th, styles.actionsTh)}></th>
					</tr>
				</thead>
				<tbody>
					{users.map((user) => {
						const isExpanded = !!expandedRows[user.id];
						const activeSessionsCount = user.sessions.length;

						return (
							<React.Fragment key={user.id}>
								{/* строка пользователя */}
								<tr
									className={`${styles.tr} ${isExpanded ? styles.activeRow : ''}`}
									onClick={() => toggleUserSessions(user.id)}
								>
									<td className={styles.td}>
										<span className={styles.id}>{user.id}</span>
									</td>
									<td className={clsx(styles.td, styles.bold)}>{user.name}</td>
									<td className={styles.td}>{user.login}</td>
									<td className={styles.td}>
										<span className={clsx(styles.role, styles[user.role])}>{user.role}</span>
									</td>
									<td className={styles.td}>{formatDate(user.created_at)}</td>
									<td className={styles.td}>
										<button className={styles.sessionBadge}>
											{activeSessionsCount} {mapSessionsCount(activeSessionsCount)}
											<span className={`${styles.arrow} ${isExpanded ? styles.arrowUp : ''}`}>
												▼
											</span>
										</button>
									</td>
									<td className={clsx(styles.td, styles.td_editUser)}>
										<div className={styles.actionsContainer}>
											<button
												className={styles.editButton}
												onClick={(e) => handleEditClick(e, user)}
												title="Редактировать пользователя"
												aria-label="Редактировать"
											>
												{/* Простая SVG иконка карандаша */}
												<svg
													xmlns="http://www.w3.org/2000/svg"
													viewBox="0 0 20 20"
													fill="currentColor"
													className={styles.editIcon}
												>
													<path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
												</svg>
											</button>
										</div>
									</td>
								</tr>

								{/* Раскрывающаяся строка с сессиями */}
								{isExpanded && (
									<tr className={styles.detailsRow}>
										<td colSpan={7} className={styles.detailsTd}>
											<div className={styles.sessionsContainer}>
												<h4 className={styles.sessionsTitle}>Активные сессии пользователя:</h4>
												{activeSessionsCount === 0 ? (
													<p className={styles.noSessions}>Нет активных сессий</p>
												) : (
													<div className={styles.sessionsGrid}>
														<div className={styles.sessionHeader}>
															<span>Устройство</span>
															<span>IP-Адрес</span>
															<span>Создана</span>
															<span>Истекает</span>
														</div>
														{user.sessions.map((session) => (
															<div key={session.id} className={styles.sessionItem}>
																<span className={styles.deviceName} title={session.device_id}>
																	💻 {session.device_name || 'Неизвестное устройство'}
																</span>
																<span className={styles.ipAddress}>🌐 {session.ip_address}</span>
																<span>{formatDate(session.created_at)}</span>
																<span>{formatDate(session.expires_at)}</span>
															</div>
														))}
													</div>
												)}
											</div>
										</td>
									</tr>
								)}
							</React.Fragment>
						);
					})}
				</tbody>
			</table>
		</div>
	);
};
