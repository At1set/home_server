import clsx from 'clsx';
import { type FC } from 'react';
import { Link } from 'react-router-dom';

import { login } from '@/entities/user/api';
import { useAuthForm } from '@/shared/hooks/useAuthForm';
import { AuthFormLayout } from '@/shared/ui/AuthFormLayout/ui/AuthFormLayout';
import authFormStyles from '@/shared/ui/AuthFormLayout/ui/AuthFormLayout.module.scss';

import { type SignInFormFields, signInSchema } from '../model/shema';
import styles from './SignInFrom.module.scss';

interface Props {
	className?: string;
}

const defaultValues: SignInFormFields = {
	login: '',
	password: '',
};

export const SignInForm: FC<Props> = ({ className }) => {
	const { formData, errors, responseError, submitButtonDisabled, handleChange, handleSubmit } =
		useAuthForm({
			defaultValues,
			schema: signInSchema,
			apiSubmitAction: login,
		});

	return (
		<AuthFormLayout
			onSubmit={handleSubmit}
			responseError={responseError}
			submitButtonText="Войти"
			submitDisabled={submitButtonDisabled || Boolean(errors)}
			className={className}
			extra={
				<div className={styles.extraContainer}>
					<div className={styles.noAcc}>Нет аккаунта?</div>
					<Link to="/registration" className={clsx(styles.noAcc, styles.noAcc_link)}>
						Зарегистрироваться
					</Link>
				</div>
			}
		>
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
					<label>
						Пароль
						<input
							type="text"
							value={formData.password}
							onChange={(e) => handleChange('password', e.target.value)}
						/>
					</label>
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
