import clsx from 'clsx';
import { type FC, useId } from 'react';
import { Link } from 'react-router-dom';

import { register } from '@/entities/user/api';
import { useAuthForm } from '@/shared/hooks/useAuthForm';
import { AuthFormLayout } from '@/shared/ui/AuthFormLayout/ui/AuthFormLayout';
import authFormStyles from '@/shared/ui/AuthFormLayout/ui/AuthFormLayout.module.scss';

import { type SignUpFormFields, signUpSchema } from '../model/shema';
import styles from './SignUpForm.module.scss';

const defaultValues: SignUpFormFields = {
	name: '',
	login: '',
	password: '',
};

export const SignUpForm: FC = () => {
	const { formData, errors, responseError, submitButtonDisabled, handleChange, handleSubmit } =
		useAuthForm({
			defaultValues,
			schema: signUpSchema,
			apiSubmitAction: register,
		});

	const passwordFieldId = useId();

	return (
		<AuthFormLayout
			onSubmit={handleSubmit}
			responseError={responseError}
			submitButtonText="Зарегистрироваться"
			submitDisabled={submitButtonDisabled || Boolean(errors)}
			extra={
				<div className={styles.extraContainer}>
					<div className={styles.haveAcc}>Уже есть аккаунт?</div>
					<Link to="/login" className={clsx(styles.haveAcc, styles.haveAcc_link)}>
						Войти
					</Link>
				</div>
			}
		>
			<div className={clsx(authFormStyles.root__field, authFormStyles.field)}>
				<div className={authFormStyles.field__input}>
					<label>
						Имя
						<input
							type="text"
							value={formData.name}
							onChange={(e) => handleChange('name', e.target.value)}
						/>
					</label>
				</div>
				{errors?.properties?.name?.errors?.[0] && (
					<span className={authFormStyles.field__error}>{errors.properties.name.errors[0]}</span>
				)}
			</div>
			<div className={clsx(authFormStyles.root__field, authFormStyles.field)}>
				<div className={authFormStyles.field__input}>
					<label>
						Логин
						<input
							type="text"
							value={formData.login}
							onChange={(e) => handleChange('login', e.target.value)}
						/>
					</label>
				</div>
				{errors?.properties?.login?.errors?.[0] && (
					<span className={authFormStyles.field__error}>{errors.properties.login.errors[0]}</span>
				)}
			</div>
			<div className={clsx(authFormStyles.root__field, authFormStyles.field)}>
				<div className={authFormStyles.field__input}>
					<div className={styles.field__labelContainer}>
						<label htmlFor={passwordFieldId}>Пароль</label>
						<Link to="/reset-password" className={styles.forgotPasswordLabel}>
							Забыли пароль?
						</Link>
					</div>
					<input
						type="text"
						id={passwordFieldId}
						value={formData.password}
						onChange={(e) => handleChange('password', e.target.value)}
					/>
				</div>
				{errors?.properties?.password?.errors?.[0] && (
					<span className={authFormStyles.field__error}>
						{errors.properties.password.errors[0]}
					</span>
				)}
			</div>
		</AuthFormLayout>
	);
};
