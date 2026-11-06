import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { User } from '../types';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  error: string | null;
  signIn: (username: string, password: string) => Promise<boolean>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshSession = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/session', { credentials: 'same-origin' });
      if (!response.ok) {
        setUser(null);
        return;
      }
      const result = await response.json();
      setUser(result.user ?? null);
    } catch {
      setUser(null);
      setError('No se pudo conectar con el servidor. Revisá tu conexión e intentá nuevamente.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void refreshSession(); }, [refreshSession]);

  const signIn = async (username: string, password: string) => {
    setError(null);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const result = await response.json();
      if (!response.ok) {
        setError(result.error || 'No se pudo iniciar sesión.');
        return false;
      }
      setUser(result.user);
      return true;
    } catch {
      setError('No se pudo conectar con el servidor. Revisá tu conexión e intentá nuevamente.');
      return false;
    }
  };

  const signOut = async () => {
    try {
      await fetch('/api/auth/session', { method: 'DELETE', credentials: 'same-origin' });
    } finally {
      setUser(null);
    }
  };

  return <AuthContext.Provider value={{ user, loading, error, signIn, signOut }}>{children}</AuthContext.Provider>;
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}
