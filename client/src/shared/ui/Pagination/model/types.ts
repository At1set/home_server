export type PaginationContext = {
	page: number;
	setPage: (page: number) => void;
	totalPages: number | null;
	setTotalPages: (total: number) => void;
	itemsPerPage: number;
	setItemsPerPage: (itemsPerPage: number) => void;
	goNextPage: () => void;
	goPrevPage: () => void;
};
