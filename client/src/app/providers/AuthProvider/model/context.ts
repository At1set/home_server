import { createContext } from 'react';

import type { AuthContext as AuthContextType } from './types';

export const AuthContext = createContext<AuthContextType | null>(null);
