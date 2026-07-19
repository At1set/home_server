import { useContext } from 'react';

import { PaginationContext } from '../model/context';

export function usePagination() {
	const context = useContext(PaginationContext);
	if (!context) {
		throw new Error('usePaginationContext должен использоваться внутри PaginationProvider');
	}
	return context;
}
