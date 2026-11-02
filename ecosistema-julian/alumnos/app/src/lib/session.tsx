import { createContext, useContext } from 'react';
import type { AuthMe } from '@shared/types';
export const SessionContext = createContext<AuthMe | null>(null);
export const useSession = () => useContext(SessionContext)!;
