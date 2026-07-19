import { AxiosError } from 'axios';
import clsx from 'clsx';
import { type FC, useState } from 'react';

import { useAuthContext } from '@/app/providers/AuthProvider';
import { deleteAllUserSessions, deleteUserSession } from '@/entities/admin/api';
import type { FullUser, Session } from '@/entities/admin/model/types';
import { useLogout } from '@/entities/user';
import { AlertWindow } from '@/shared/ui/AlertWindow/ui/AlertWindow';
import { ModalWindow } from '@/shared/ui/ModalWindow';
import { formatDate } from '@/shared/utils/formatDate';

import styles from './ManageSessions.module.scss';

interface Props {
	user: FullUser;
	onCloseBtnClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

export const ManageSessionsForm: FC<Props> = ({ user, onCloseBtnClick }) => {
	const { user: currentUser } = useAuthContext();
	const { logoutAll } = useLogout();

	const [userSessions, setUserSessions] = useState<Session[]>(user.sessions);
	const [responseError, setResponseError] = useState<string | null>(null);
	const [responseOk, setResponseOk] = useState<string | null>(null);
	const [submitButtonDisabled, setSubmitButtonDisabled] = useState(false);

	const isSubmitButtonDisabled = submitButtonDisabled || !userSessions.length;

	// Состояние для модалки сброса ВСЕХ сессий самого себя
	const [isSelfDeleteAllSessionsAlertOpen, setIsSelfDeleteAllSessionsAlertOpen] = useState(false);

	// Стейт для модалки подтверждения удаления ВСЕХ сессий у другого пользователя
	const [isDeleteAllSessionsAlertOpen, setIsDeleteAllSessionsAlertOpen] = useState(false);

	// Стейт для выбранной сессии, которую мы хотим удалить
	const [selectedSession, setSelectedSession] = useState<Session | null>(null);

	// ========= Стейт и функции для окна подтверждения удаления сессии =========
	const [alertWindowActive, setAlertWindowActive] = useState(false);
	const isAlertWindowActive = selectedSession && alertWindowActive;

	function closeAlertWindow() {
		setAlertWindowActive(false);
		setTimeout(() => setSelectedSession(null), 200);
	}

	function openAlertWindow(selectedSession: Session) {
		setSelectedSession(selectedSession);
		setAlertWindowActive(true);
	}
	// ========= Стейт и функции для окна подтверждения удаления сессии =========

	const handleSingleDelete = async () => {
		if (!selectedSession) return;
		setResponseError(null);
		setResponseOk(null);

		try {
			setSubmitButtonDisabled(true);

			const response = await deleteUserSession({ userId: user.id, sessionId: selectedSession.id });
			setUserSessions(response.user.sessions);
			setResponseOk(response.message || 'Сессия отозвана');
			setTimeout(() => setResponseOk(null), 3000);
		} catch (err) {
			if (err instanceof AxiosError) {
				const message = err.response?.data?.message || 'Не удалось отозвать сессию.';
				setResponseError(message);
				return;
			}
			setResponseError('Что-то пошло не так.');
		} finally {
			setSubmitButtonDisabled(false);
			setAlertWindowActive(false);
			setSelectedSession(null);
		}
	};

	const executeDeleteAllSessions = async () => {
		setResponseError(null);
		setResponseOk(null);

		try {
			setSubmitButtonDisabled(true);

			const response = await deleteAllUserSessions({ userId: user.id });
			setUserSessions([]);
			setResponseOk(
				`Все сессии пользователя были успешно отозваны (${response.closedSessionsCount})`,
			);
			setTimeout(() => setResponseOk(null), 3000);
		} catch (err) {
			if (err instanceof AxiosError) {
				const message = err.response?.data?.message || 'Что-то пошло не так.';
				setResponseError(message);
				return;
			}
			setResponseError('Что-то пошло не так.');
		} finally {
			setSubmitButtonDisabled(false);
			setSelectedSession(null);
			setIsSelfDeleteAllSessionsAlertOpen(false);
			setIsDeleteAllSessionsAlertOpen(false);
		}
	};

	const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
		e.preventDefault();

		// Проверяем, совершает ли админ действие над своей учетной записью
		const isSelfDelete = currentUser?.id === user.id;

		if (isSelfDelete) {
			setIsSelfDeleteAllSessionsAlertOpen(true); // Показываем окно предупреждения
		} else {
			setIsDeleteAllSessionsAlertOpen(true); // Если другому юзеру - показываем соответсвующее окно подтверждения
		}
	};

	return (
		<>
			<form className={styles.root} onSubmit={handleSubmit} onChange={() => setResponseOk(null)}>
				<div className={styles.root__container}>
					<div className={styles.root__top}>
						<h2>Пользователь {user.login}</h2>
						<div className={styles.divider}></div>
					</div>

					<div className={styles.sessionsList}>
						<div className={styles.sessionsList__body}>
							{userSessions && userSessions.length > 0 ? (
								userSessions.map((session) => {
									const isCurrentSession = session.device_id === currentUser?.deviceId;

									return (
										<div
											key={session.id}
											className={clsx(styles.sessionItem, {
												[styles.sessionItem_current]: isCurrentSession,
											})}
										>
											<div className={styles.sessionItem__info}>
												<div className={styles.sessionItem__device}>
													<span>Устройство:</span> {session.device_name || 'Неизвестное устройство'}
												</div>
												<div className={styles.sessionItem__details}>
													<span>IP-адрес:</span> {session.ip_address} • <span>Активна до:</span>{' '}
													{formatDate(session.expires_at)}
												</div>
											</div>

											{isCurrentSession && <span className={styles.badge}>Текущая сессия</span>}

											{/* Кнопка-мусорка */}
											<button
												type="button"
												disabled={isCurrentSession}
												className={styles.sessionItem__deleteBtn}
												onClick={() => openAlertWindow(session)}
												title={
													isCurrentSession
														? 'Вы не можете удалить свою текущую сессию'
														: 'Отозвать сессию'
												}
											>
												<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
													<path
														d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"
														fill="currentColor"
													/>
												</svg>
											</button>
										</div>
									);
								})
							) : (
								<div className={styles.emptySessions}>Активных сессий не найдено</div>
							)}
						</div>
					</div>

					<div className={styles.divider}></div>

					{/* Ответы сервера */}
					{responseError && <div className={styles.responseError}>{responseError}</div>}
					{responseOk && <div className={styles.responseOk}>{responseOk}</div>}

					<div className={styles.buttonContainer}>
						<button
							className={clsx(styles.button, styles.button_save)}
							onClick={onCloseBtnClick}
							type="button"
						>
							← Назад
						</button>
						<button
							className={clsx(styles.button, styles.button_deleteAllSessions)}
							type="submit"
							disabled={isSubmitButtonDisabled}
						>
							Выйти на всех устройствах
						</button>
					</div>
				</div>
			</form>

			{/* Модалка подтверждения удаления конкретной сессии */}
			<AlertWindow
				active={!!isAlertWindowActive}
				onCloseClick={() => closeAlertWindow()}
				onConfirmClick={handleSingleDelete}
				submitButtonDisabled={isSubmitButtonDisabled}
				overlayOpacity={0.8}
				type="warning"
				title="⚠️ Отозвать сеанс?"
				confirmText="Да, завершить"
				message={
					selectedSession && (
						<>
							Вы уверены, что хотите завершить сеанс на устройстве{' '}
							<strong>{selectedSession.device_name}</strong>?
							<div
								style={{
									marginTop: '12px',
									fontSize: '13px',
									display: 'flex',
									flexDirection: 'column',
									gap: '4px',
								}}
							>
								<div>
									<strong>IP:</strong> {selectedSession.ip_address}
								</div>
								<div>
									<strong>Создана:</strong> {formatDate(selectedSession.created_at)}
								</div>
							</div>
						</>
					)
				}
			/>

			{/* Окно подтверждения сброса всех сессий для САМОГО СЕБЯ */}
			<AlertWindow
				active={isSelfDeleteAllSessionsAlertOpen}
				onCloseClick={() => setIsSelfDeleteAllSessionsAlertOpen(false)}
				onConfirmClick={logoutAll}
				submitButtonDisabled={submitButtonDisabled}
				overlayOpacity={0.8}
				type="danger"
				title="🚨 Выход из системы на всех устройствах"
				confirmText="Да, сбросить все сессии"
				message={
					<>
						Вы собираетесь завершить абсолютно все активные сессии для своего аккаунта{' '}
						<strong>{user.login}</strong>. <br />
						<br />
						Это действие <strong>немедленно завершит ваш текущий сеанс</strong>, и вас автоматически
						выбьет из этой панели администратора. Вам потребуется войти заново. Продолжить?
					</>
				}
			/>

			{/* Модалка подтверждения удаления всех сессий у ДРУГОГО пользователя */}
			<AlertWindow
				active={isDeleteAllSessionsAlertOpen}
				onCloseClick={() => setIsDeleteAllSessionsAlertOpen(false)}
				onConfirmClick={executeDeleteAllSessions}
				submitButtonDisabled={isSubmitButtonDisabled}
				overlayOpacity={0.8}
				type="warning"
				title="⚠️ Сбросить все сессии пользователя?"
				confirmText="Да, разлогинить везде"
				message={
					<>
						Вы уверены, что хотите принудительно завершить все сеансы для пользователя{' '}
						<strong>{user.login}</strong>? <br />
						<br />
						Будет закрыто сессий: <strong>{userSessions.length}</strong>. Пользователь будет
						разлогинен на всех компьютерах и мобильных устройствах.
					</>
				}
			/>
		</>
	);
};
