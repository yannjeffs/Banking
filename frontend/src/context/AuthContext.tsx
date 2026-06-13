import { createContext } from 'react';
import type { User } from '../types';

export interface AuthContextType {
  user:   User | null;
  login:  (userData: User, token: string) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);