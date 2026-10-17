import React from 'react';
import { PortalProvider } from './context/PortalContext';
import { StudentPortalApp } from './StudentPortalApp';

/**
 * Módulo Alumno - Asistencia Terciario (Instituto 26)
 * Responsable: Julian
 * 
 * Este componente envuelve el proveedor de estado y entrega el panel completo.
 */
export const JulianStudentPortal: React.FC = () => {
  return (
    <PortalProvider>
      <StudentPortalApp />
    </PortalProvider>
  );
};

export default JulianStudentPortal;
export * from './types';
export * from './services/apiService';
export * from './styles/themes';
