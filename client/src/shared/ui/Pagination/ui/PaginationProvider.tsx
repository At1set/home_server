import { type FC, type ReactNode, useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import { PaginationContext } from '../model/context';

interface Props {
	itemsPerPage: number;
	children: ReactNode;
}

/**
 * Провайдер контекста для пагинации
 */
export const PaginationProvider: FC<Props> = ({ children, itemsPerPage: initialItemsPerPage }) => {
	// В react-router-dom useSearchParams возвращает массив [params, setParams]
	const [searchParams, setSearchParams] = useSearchParams();

	const [page, setPage] = useState(() => {
		const p = Number(searchParams.get('page')) || 1;
		return p >= 1 ? p : 1;
	});

	const [itemsPerPage, setItemsPerPage] = useState(() => {
		const limit = Number(searchParams.get('perPage')) || initialItemsPerPage;
		return limit >= 1 ? limit : initialItemsPerPage;
	});

	const [totalPages, setTotalPages] = useState<number | null>(null);

	// Синхронизация URL при изменении страницы или лимита элементов
	useEffect(() => {
		setSearchParams(
			(prev) => {
				prev.set('page', String(page));
				prev.set('perPage', String(itemsPerPage));
				return prev;
			},
			{ replace: true },
		);
	}, [page, itemsPerPage, setSearchParams]);

	// Корректируем максимальную возможную открытую страницу
	useEffect(() => {
		if (totalPages !== null && page > totalPages) {
			// eslint-disable-next-line react-hooks/set-state-in-effect
			setPage(totalPages > 0 ? totalPages : 1);
		}
	}, [itemsPerPage, totalPages, page]);

	const goNextPage = useCallback(() => {
		setPage((p) => (totalPages !== null && p < totalPages ? p + 1 : p));
	}, [totalPages]);

	const goPrevPage = useCallback(() => {
		setPage((p) => (p > 1 ? p - 1 : p));
	}, []);

	return (
		<PaginationContext.Provider
			value={{
				page,
				setPage,
				totalPages,
				setTotalPages,
				itemsPerPage,
				setItemsPerPage,
				goNextPage,
				goPrevPage,
			}}
		>
			{children}
		</PaginationContext.Provider>
	);
};
