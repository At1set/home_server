import type { FC } from 'react';

import { SignInForm } from '@/features/SignInForm/ui/SignInForm';

import styles from './SignIn.module.scss';

export const SignIn: FC = () => {
	return (
		<div className={styles.root}>
			<div className={styles.root__container}>
				<SignInForm className={styles.root__form} />
			</div>
		</div>
	);
};
