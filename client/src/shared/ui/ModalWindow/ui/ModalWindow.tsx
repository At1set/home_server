import clsx from 'clsx';
import React, { type FC, useEffect } from 'react';
import { createPortal } from 'react-dom';

import styles from './ModalWindow.module.scss';

export interface Props extends React.ComponentPropsWithRef<'div'> {
	active: boolean;
	onCloseClick: () => void;
	contentWidth?: 'full' | 'auto' | number;
	contentHeight?: 'full' | 'auto' | number;
	children?: React.ReactNode;
	disableScrollBlock?: boolean;
	overlayOpacity?: number;
}

export const ModalWindow: FC<Props> = ({
	active,
	onCloseClick,
	children,
	disableScrollBlock = false,
	contentWidth = 'auto',
	contentHeight = 'auto',
	overlayOpacity = 0.4,
	...props
}) => {
	useEffect(() => {
		const body = document.body;

		if (active && !disableScrollBlock) {
			body.classList.add('_lock');
		} else {
			body.classList.remove('_lock');
		}

		return () => {
			body.classList.remove('_lock');
		};
	}, [active, disableScrollBlock]);

	// Вычисляем динамические стили для контейнера
	const getDimensionStyle = (val: 'full' | 'auto' | number) => {
		if (val === 'auto') return 'auto';
		if (val === 'full') return '100%';
		return `${val}px`;
	};

	const bodyStyle: React.CSSProperties = {
		maxWidth: getDimensionStyle(contentWidth),
		maxHeight: getDimensionStyle(contentHeight),
		height: contentHeight !== 'auto' ? '100%' : undefined,
		width: contentWidth !== 'auto' ? '100%' : undefined,
	};

	const rootStyle: React.CSSProperties = {
		'--overlay-opacity': overlayOpacity,
	} as React.CSSProperties;

	return createPortal(
		<div
			className={clsx(styles.root, { [styles._active]: active })}
			onClick={onCloseClick}
			style={rootStyle}
			{...props}
		>
			<div className={styles.root__body} style={bodyStyle} onClick={(e) => e.stopPropagation()}>
				{children}
			</div>
		</div>,
		document.body,
	);
};
