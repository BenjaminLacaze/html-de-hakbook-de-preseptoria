import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { UserProfile } from '../types/api';
import * as authApi from '../api/auth';
import { ApiException } from '../api/client';
import { toast } from 'sonner';

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, pass: string) => Promise<UserProfile>;
  logout: () => Promise<void>;
  changePassword: (oldPass: string, newPass: string) => Promise<void>;
  refreshUser: () => Promise<void>;
  isGuardian: boolean;
  mustChangePassword: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const checkSession = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const profile = await authApi.getMe();
      setUser(profile);
    } catch (err: any) {
      if (err instanceof ApiException && err.statusCode === 401) {
        setUser(null);
      } else {
        // En caso de que no haya sesión iniciada
        setUser(null);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  const login = async (email: string, pass: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const loggedUser = await authApi.login(email, pass);
      setUser(loggedUser);
      toast.success(`Bienvenido/a al Panel de Familias, ${loggedUser.firstName}`);
      return loggedUser;
    } catch (err: any) {
      const msg = err.message || 'Error al iniciar sesión.';
      setError(msg);
      toast.error(msg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
      setUser(null);
      toast.info('Sesión cerrada correctamente.');
    } catch (err: any) {
      setUser(null);
    }
  };

  const changePassword = async (oldPass: string, newPass: string) => {
    setIsLoading(true);
    try {
      const res = await authApi.changePassword(oldPass, newPass);
      if (user) {
        setUser({ ...user, mustChangePassword: false });
      }
      toast.success(res.message || 'Contraseña actualizada con éxito.');
    } catch (err: any) {
      toast.error(err.message || 'No se pudo actualizar la contraseña.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const refreshUser = async () => {
    try {
      const profile = await authApi.getMe();
      setUser(profile);
    } catch {
      // Ignore
    }
  };

  const isGuardian = user?.role === 'GUARDIAN';
  const mustChangePassword = !!user?.mustChangePassword;

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        error,
        login,
        logout,
        changePassword,
        refreshUser,
        isGuardian,
        mustChangePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
