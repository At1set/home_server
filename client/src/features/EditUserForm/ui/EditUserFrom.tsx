import { AxiosError } from 'axios';
import clsx from 'clsx';
import { type FC, useState } from 'react';
import z from 'zod';

import { useAuthContext } from '@/app/providers/AuthProvider';
import { deleteUser, updateUser } from '@/entities/admin/api';
import type { FullUser, User } from '@/entities/admin/model/types';
import { ROLE_WEIGHT, USER_ROLES } from '@/shared/model/constants';
import { AlertWindow } from '@/shared/ui/AlertWindow/ui/AlertWindow';
import { formatDate } from '@/shared/utils/formatDate';

import { editUserSchema } from '../model/editUserSchema';
import { isFormDataChange } from '../utils/isFormDataChange';
import { ChangePasswordForm } from './ChangePasswordForm';
import styles from './EditUserFrom.module.scss';
import { ManageSessionsForm } from './ManageSessionsForm';

interface Props {
	user: FullUser;
	onCloseBtnClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
	onSubmitted?: (newUser: FullUser) => void;
	onDeleted?: (user: User) => void;
}

export const EditUserFrom: FC<Props> = ({ user, onCloseBtnClick, onSubmitted, onDeleted }) => {
	const { user: admin } = useAuthContext();

	const [defaultValues, setDefaultValues] = useState(user);
	const [userFormData, setUserFormData] = useState<Partial<FullUser>>({});
	const [showErrors, setShowErrors] = useState(false);
	const [responseError, setResponseError] = useState<string | null>(null);
	const [responseOk, setResponseOk] = useState<string | null>(null);
	const [submitButtonDisabled, setSubmitButtonDisabled] = useState(false);

	const [isChangePassword, setChangePassword] = useState(false);
	const [isManageSessions, setManageSessions] = useState(false);

	const [isDeleteUserAccountConfirmOpen, setDeleteUserAccountConfirmOpen] = useState(false);

	// Состояния для открытия AlertWindow когда owner и выше пытается повысить другого до своей роли
	const [isAdminPromoteUserAlertOpen, setAdminPromoteUserAlertOpen] = useState(false);

	// Состояние для окна подтверждения понижения роли самого себя
	const [isDemoteConfirmOpen, setIsDemoteConfirmOpen] = useState(false);

	const formData = {
		...defaultValues,
		...userFormData,
	};

	const validate = () => {
		const res = editUserSchema.safeParse(formData);
		if (res.success) return undefined;
		return z.treeifyError(res.error);
	};

	const errors = showErrors ? validate() : undefined;
	const isSubmitButtonDisabled =
		Boolean(errors) || submitButtonDisabled || !isFormDataChange(defaultValues, userFormData);

	const handleChange = (field: keyof FullUser, value: string) => {
		setUserFormData((prev) => ({ ...prev, [field]: value }));
	};

	// 1. Непосредственная отправка запроса на сервер
	const executeSubmit = async () => {
		try {
			setSubmitButtonDisabled(true);
			setResponseError(null);

			const response = await updateUser(user.id, {
				name: userFormData.name,
				role: userFormData.role,
			});

			const updatedUser = {
				...response.user,
				sessions: user.sessions,
			} satisfies FullUser;
			setDefaultValues(updatedUser);

			setResponseOk(response.message || 'Пользователь был успешно изменен');
			setTimeout(() => setResponseOk(null), 3000);

			onSubmitted?.(updatedUser);
		} catch (err) {
			if (err instanceof AxiosError) {
				const message = err.response?.data?.message || 'Что-то пошло не так.';
				setResponseError(message);
				return;
			}
			setResponseError('Что-то пошло не так.');
		} finally {
			setSubmitButtonDisabled(false);
			setUserFormData({});
			// Закрываем alert Windows
			setAdminPromoteUserAlertOpen(false);
			setIsDemoteConfirmOpen(false);
		}
	};

	// 2. Обработчик клика по кнопке "Сохранить"
	const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
		e.preventDefault();
		setShowErrors(true);
		setResponseError(null);

		const currentErrors = validate();
		if (currentErrors) return;

		setShowErrors(false);

		if (userFormData.role) {
			if (!admin) return setResponseError('Что-то пошло не так.');

			const adminWeight = ROLE_WEIGHT[admin.role] || 0;
			const currentWeight = ROLE_WEIGHT[defaultValues.role] || 0;
			const newWeight = ROLE_WEIGHT[userFormData.role] || 0;

			// 1. Проверка на ПОВЫШЕНИЕ до своей роли (исключаем админа, так как ему не разрешено повышать пользователей до своей роли)
			const isPromotingToOwnRole = admin?.role === userFormData.role && admin.role !== 'admin';

			// 2. Проверяем, понижает ли себя owner и выше (id совпадают, старая роль была owner, новая — ниже)
			const isOwnerSelfRoleGetDown =
				admin?.id === user.id && adminWeight >= ROLE_WEIGHT.owner && newWeight < currentWeight;

			if (isPromotingToOwnRole) {
				return setAdminPromoteUserAlertOpen(true);
			} else if (isOwnerSelfRoleGetDown) {
				return setIsDemoteConfirmOpen(true);
			}
		}

		return await executeSubmit();
	};

	// Обработчик удаления аккаунта
	const handleDeleteAccount = async () => {
		try {
			setSubmitButtonDisabled(true);
			setResponseError(null);

			// Вызываем метод API удаления
			const response = await deleteUser(user.id);
			const deletedUser = response.user;

			setResponseOk(response.message || 'Аккаунт пользователя успешно удален');

			// Вызываем коллбек удаления и закрываем форму через таймаут, чтобы админ успел увидеть плашку успеха
			setTimeout(() => onDeleted?.(deletedUser), 1500);
		} catch (err) {
			if (err instanceof AxiosError) {
				const message = err.response?.data?.message || 'Не удалось удалить аккаунт.';
				setResponseError(message);
				return;
			}
			setResponseError('Что-то пошло не так.');
		} finally {
			setSubmitButtonDisabled(false);
			setDeleteUserAccountConfirmOpen(false);
		}
	};

	if (isChangePassword)
		return <ChangePasswordForm user={user} onCloseBtnClick={() => setChangePassword(false)} />;

	if (isManageSessions)
		return <ManageSessionsForm user={user} onCloseBtnClick={() => setManageSessions(false)} />;

	const isRoleEditDisabled = Boolean(admin && admin.id === user.id && admin.role !== 'owner');

	// Администратор не должен случайно удалить сам себя через форму редактирования пользователей
	const isDeleteAccountDisabled = admin?.id === user.id || submitButtonDisabled;

	return (
		<>
			<form className={styles.root} onSubmit={handleSubmit} onChange={() => setResponseOk(null)}>
				<div className={styles.root__container}>
					<div className={clsx(styles.root__top)}>
						<h2>Пользователь {formData.login}</h2>
						<div className={styles.buttonsBlock}>
							<div className={styles.changePasswdBtn}>
								<button
									onClick={() => setChangePassword(true)}
									title="Сменить пароль у пользователя"
									type="button"
								>
									Сменить пароль
								</button>
							</div>
							<div className={styles.manageSessionsBtn}>
								<button
									onClick={() => setManageSessions(true)}
									title="Управление сессиями пользователя"
									type="button"
								>
									Управление сессиями пользователя
								</button>
							</div>
							<div className={styles.deleteAccountBtn}>
								<button
									onClick={() => setDeleteUserAccountConfirmOpen(true)}
									title={
										isDeleteAccountDisabled
											? 'Вы не можете удалить собственный аккаунт из админ панели'
											: 'Удалить аккаунт пользователя'
									}
									type="button"
									disabled={isDeleteAccountDisabled}
								>
									Удалить аккаунт
								</button>
							</div>
						</div>
					</div>

					<div className={styles.divider}></div>

					<div className={clsx(styles.root__field, styles.field, styles.field_noEdit)}>
						<div className={styles.field__label}>Id</div>
						<span>{user.id}</span>
					</div>

					<div className={styles.divider}></div>

					<div className={clsx(styles.root__field, styles.field, styles.field_noEdit)}>
						<div className={styles.field__label}>Дата и время регистрации</div>
						<span>{formatDate(user.created_at)}</span>
					</div>

					<div className={styles.divider}></div>

					<div className={clsx(styles.root__field, styles.field)}>
						<label>
							Имя
							<input
								type="text"
								value={formData.name}
								onChange={(e) => handleChange('name', e.target.value)}
							/>
						</label>
						{errors?.properties?.name?.errors?.[0] && (
							<span className={styles.error}>{errors.properties.name.errors[0]}</span>
						)}
					</div>

					<div className={styles.divider}></div>

					<div
						className={clsx(styles.root__field, styles.field, {
							[styles.notAllow]: isRoleEditDisabled,
						})}
						title={isRoleEditDisabled ? 'Вы не можете изменить самому себе роль' : undefined}
					>
						<label>
							Роль
							<select
								value={formData.role}
								onChange={(e) => handleChange('role', e.target.value)}
								disabled={isRoleEditDisabled}
								title="Изменить роль пользователя"
							>
								{USER_ROLES.map((role) => (
									<option key={role} value={role}>
										{role}
									</option>
								))}
							</select>
						</label>
						{isRoleEditDisabled && <span className={styles.notAllow__info}>!</span>}
					</div>

					<div className={styles.divider}></div>

					{responseError && <div className={styles.responseError}>{responseError}</div>}
					{responseOk && <div className={styles.responseOk}>{responseOk}</div>}

					<div className={styles.buttonContainer}>
						<button
							className={clsx(styles.button, styles.button_save)}
							onClick={(e) => onCloseBtnClick?.(e)}
							type="button"
						>
							Отмена
						</button>
						<button
							className={clsx(styles.button, styles.button_save)}
							type="submit"
							disabled={isSubmitButtonDisabled}
						>
							Сохранить
						</button>
					</div>
				</div>
			</form>

			{/* Окно подтверждения при повышении пользователя до своей роли */}
			<AlertWindow
				active={isAdminPromoteUserAlertOpen}
				onCloseClick={() => {
					setAdminPromoteUserAlertOpen(false);
					handleChange('role', defaultValues.role);
				}}
				onConfirmClick={executeSubmit}
				submitButtonDisabled={submitButtonDisabled}
				overlayOpacity={0.8}
				type="warning"
				title="⚠️ Подтверждение изменения роли"
				confirmText="Да, повысить"
				message={
					<>
						Вы уверены, что хотите повысить пользователя <strong>{user.login}</strong> до уровня{' '}
						<strong>{userFormData.role}</strong>? Вы наделяете пользователя равными с вами правами и
						не сможете в дальнейшем их откатить
					</>
				}
			/>

			{/* Окно подтверждения ПОНИЖЕНИЯ самого себя (Self-demote) */}
			<AlertWindow
				active={isDemoteConfirmOpen}
				onCloseClick={() => {
					setIsDemoteConfirmOpen(false);
					handleChange('role', defaultValues.role);
				}}
				onConfirmClick={executeSubmit}
				submitButtonDisabled={submitButtonDisabled}
				overlayOpacity={0.8}
				type="danger"
				confirmText="Да, понизить себя"
				message={
					<>
						Вы собираетесь понизить собственную роль с <strong>owner</strong> до{' '}
						<strong>{userFormData.role}</strong>. Вы <strong>потеряете</strong> часть своих
						возможностей! Вы уверены?
					</>
				}
			/>

			{/* Окно подтверждения УДАЛЕНИЯ аккаунта пользователя */}
			<AlertWindow
				active={isDeleteUserAccountConfirmOpen}
				onCloseClick={() => setDeleteUserAccountConfirmOpen(false)}
				onConfirmClick={handleDeleteAccount}
				submitButtonDisabled={submitButtonDisabled}
				overlayOpacity={0.8}
				type="danger"
				title="🚨 Безвозвратное удаление аккаунта"
				confirmText="Да, удалить аккаунт"
				message={
					<>
						Вы собираетесь полностью и безвозвратно удалить аккаунт пользователя{' '}
						<strong>{user.login}</strong>.
						<br />
						Данное действие <strong>невозможно будет отменить</strong>. Все связанные с
						пользователем сессии и данные будут уничтожены. Вы уверены, что хотите продолжить?
					</>
				}
			/>
		</>
	);
};
