import type { FC } from 'react';

import { SignUpForm } from '@/features/SignUpForm/ui/SignUpForm';

import styles from './SignUp.module.scss';

export const SignUp: FC = () => {
	return (
		<div className={styles.root}>
			<div className={styles.root__container}>
				<SignUpForm />
			</div>
		</div>
	);
};
