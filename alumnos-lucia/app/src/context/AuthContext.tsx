/**
 * Contexto de Autenticación de Demostración
 * Sistema de Asistencia Escolar - Módulo Alumno
 * Responsable: Lucia Salgado
 */

import React, { createContext, useContext, useState } from 'react';
import { StudentProfile, AttendanceRecord } from '../types';
import {
  DEMO_STUDENT,
  DEMO_STUDENT_AT_RISK,
  MOCK_ATTENDANCE_RECORDS_LUCIA,
  MOCK_ATTENDANCE_RECORDS_RISK
} from '../data/mockData';

interface AuthContextType {
  isLoggedIn: boolean;
  student: StudentProfile;
  records: AttendanceRecord[];
  isDemoMode: boolean;
  isLoading: boolean;
  login: (legajoOrUser: string, pass: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  switchDemoProfile: (profileId: 'std_01' | 'std_02') => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Inicialmente con sesión activa para facilitar navegación inmediata del evaluador
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(true);
  const [selectedProfileId, setSelectedProfileId] = useState<'std_01' | 'std_02'>('std_01');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const student = selectedProfileId === 'std_01' ? DEMO_STUDENT : DEMO_STUDENT_AT_RISK;
  const records = selectedProfileId === 'std_01' ? MOCK_ATTENDANCE_RECORDS_LUCIA : MOCK_ATTENDANCE_RECORDS_RISK;

  const login = async (legajoOrUser: string, pass: string) => {
    setIsLoading(true);
    // Simulación de latencia de red para demostrar estados de carga
    await new Promise((resolve) => setTimeout(resolve, 500));
    setIsLoading(false);

    if (!legajoOrUser.trim()) {
      return { success: false, message: 'Ingrese su número de legajo o usuario institucional.' };
    }
    if (!pass.trim()) {
      return { success: false, message: 'Ingrese su contraseña de acceso.' };
    }

    // Si ingresa con el usuario de Agustín
    if (legajoOrUser.includes('8902') || legajoOrUser.toLowerCase().includes('mendez')) {
      setSelectedProfileId('std_02');
    } else {
      setSelectedProfileId('std_01');
    }

    setIsLoggedIn(true);
    return { success: true };
  };

  const logout = () => {
    setIsLoggedIn(false);
  };

  const switchDemoProfile = (profileId: 'std_01' | 'std_02') => {
    setSelectedProfileId(profileId);
  };

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        student,
        records,
        isDemoMode: true,
        isLoading,
        login,
        logout,
        switchDemoProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser utilizado dentro de un AuthProvider');
  }
  return context;
}
