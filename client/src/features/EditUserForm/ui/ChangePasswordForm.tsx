import { AxiosError } from 'axios';
import clsx from 'clsx';
import { type FC, useState } from 'react';
import z from 'zod';

import { changeUserPassword } from '@/entities/admin/api';
import type { User } from '@/entities/admin/model/types';

import { passwordSchema } from '../model/passwordSchema';
import styles from './EditUserFrom.module.scss';

interface Props {
	user: User;
	onCloseBtnClick?: () => void;
}

export const ChangePasswordForm: FC<Props> = ({ user, onCloseBtnClick }) => {
	const [password, setPassword] = useState('');
	const [repeatPassword, setRepeatPassword] = useState('');

	const [showErrors, setShowErrors] = useState(false);
	const [submitButtonDisabled, setSubmitButtonDisabled] = useState(false);
	const [responseError, setResponseError] = useState<string | null>(null);
	const [responseOk, setResponseOk] = useState<string | null>(null);

	const validate = () => {
		const result = passwordSchema.safeParse({ password, repeatPassword });
		if (result.success) return undefined;
		return z.treeifyError(result.error);
	};

	// Ошибки, которые мы показываем на UI (только если был submit или поля трогали)
	const errors = showErrors ? validate() : undefined;

	// Блокировка кнопки отправки (если есть ошибки валидации или идет отправка)
	const isSubmitButtonDisabled = submitButtonDisabled || Boolean(errors);

	const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
		e.preventDefault();
		setShowErrors(true);
		setResponseError(null);

		const currentErrors = validate();
		if (currentErrors) return;
		else setShowErrors(false);

		try {
			setSubmitButtonDisabled(true);

			const response = await changeUserPassword({ userId: user.id, password });

			setResponseOk(response.message || 'Пароль был успешно изменен');
			setTimeout(() => onCloseBtnClick?.(), 2000);
		} catch (err) {
			if (err instanceof AxiosError) {
				const message = err.response?.data?.message || 'Что-то пошло не так.';
				setResponseError(message);
				return;
			}
			setResponseError('Что-то пошло не так.');
		} finally {
			setSubmitButtonDisabled(false);
			setPassword('');
			setRepeatPassword('');
		}
	};

	return (
		<form className={styles.root} onSubmit={handleSubmit} onChange={() => setResponseOk(null)}>
			<div className={styles.root__container}>
				<div className={styles.root__top}>
					<h2>Пользователь {user.login}</h2>
				</div>

				<div className={styles.divider}></div>

				{/* Поле первого пароля */}
				<div className={clsx(styles.root__field, styles.field)}>
					<label>
						<span>Пароль</span>
						<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
					</label>
					{errors?.properties?.password?.errors?.[0] && (
						<span className={styles.error}>{errors.properties.password.errors[0]}</span>
					)}
				</div>

				<div className={styles.divider}></div>

				{/* Поле повтора пароля */}
				<div className={clsx(styles.root__field, styles.field)}>
					<label>
						<span>Повторите пароль</span>
						<input
							type="password"
							value={repeatPassword}
							onChange={(e) => setRepeatPassword(e.target.value)}
						/>
					</label>
					{errors?.properties?.repeatPassword?.errors?.[0] && (
						<span className={styles.error}>{errors.properties.repeatPassword.errors[0]}</span>
					)}
				</div>

				<div className={styles.divider}></div>

				{/* Ответы сервера */}
				{responseError && <div className={styles.error}>{responseError}</div>}
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
						className={clsx(styles.button, styles.button_save)}
						type="submit"
						disabled={isSubmitButtonDisabled}
					>
						Сохранить
					</button>
				</div>
			</div>
		</form>
	);
};
