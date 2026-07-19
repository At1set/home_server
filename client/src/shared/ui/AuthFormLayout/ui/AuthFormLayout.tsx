import clsx from 'clsx';
import { type FC, type ReactNode, type SubmitEvent } from 'react';

import styles from './AuthFormLayout.module.scss';

interface Props {
	children: ReactNode;
	onSubmit: (e: SubmitEvent<HTMLFormElement>) => void;
	responseError?: string | null;
	submitButtonText: string;
	submitDisabled: boolean;
	className?: string;
	extra?: ReactNode;
}

export const AuthFormLayout: FC<Props> = ({
	children,
	onSubmit,
	responseError,
	submitButtonText,
	submitDisabled,
	className,
	extra,
}) => {
	return (
		<form onSubmit={onSubmit} className={clsx(styles.root, className)}>
			{/* Сюда будут прокидываться инпуты */}
			<div className={styles.fieldsContainer}>{children}</div>

			{responseError && <div className={styles.responseError}>{responseError}</div>}
			<button type="submit" className={styles.root__submitButton} disabled={submitDisabled}>
				{submitButtonText}
			</button>

			{extra && <div className={styles.extraContainer}>{extra}</div>}
		</form>
	);
};
