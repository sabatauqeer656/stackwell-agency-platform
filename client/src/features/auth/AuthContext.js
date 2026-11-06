import { createContext } from 'react';

// Holds { user, status, login, logout }. status is 'loading' | 'authenticated' | 'unauthenticated'.
export const AuthContext = createContext(null);
