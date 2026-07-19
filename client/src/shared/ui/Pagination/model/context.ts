import { createContext } from 'react';

import type { PaginationContext as PaginationContextType } from './types';

export const PaginationContext = createContext<PaginationContextType | null>(null);
