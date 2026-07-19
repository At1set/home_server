import clsx from 'clsx';
import type { FC, ReactNode } from 'react';

import { ModalWindow, type ModalWindowProps } from '@/shared/ui/ModalWindow';

import styles from './AlertWindow.module.scss';

interface AlertWindowProps extends Omit<ModalWindowProps, 'children'> {
	title?: string;
	message: ReactNode;
	confirmText?: string;
	cancelText?: string;
	onConfirmClick: () => void;
	submitButtonDisabled?: boolean;
	type?: 'danger' | 'warning' | 'info';
}

export const AlertWindow: FC<AlertWindowProps> = ({
	title = '⚠️ Внимание!',
	message,
	confirmText = 'Подтвердить',
	cancelText = 'Отмена',
	onConfirmClick,
	submitButtonDisabled = false,
	type = 'danger',
	...modalProps
}) => {
	return (
		<ModalWindow {...modalProps}>
			<div className={styles.confirmModal}>
				{/* Динамически красим заголовок в зависимости от типа */}
				<h3 className={clsx(styles.title, styles[`title_${type}`])}>{title}</h3>

				<p className={styles.message}>{message}</p>

				<div className={styles.confirmModal__buttons}>
					<button type="button" onClick={modalProps.onCloseClick} className={styles.button_cancel}>
						{cancelText}
					</button>
					<button
						type="button"
						onClick={onConfirmClick}
						disabled={submitButtonDisabled}
						className={clsx(styles.button_action, styles[`button_${type}`])}
					>
						{confirmText}
					</button>
				</div>
			</div>
		</ModalWindow>
	);
};
