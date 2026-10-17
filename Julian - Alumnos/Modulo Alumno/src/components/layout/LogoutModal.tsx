import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { LogOut, ShieldAlert, Check } from 'lucide-react';

interface LogoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LogoutModal: React.FC<LogoutModalProps> = ({ isOpen, onClose }) => {
  const [loggedOut, setLoggedOut] = useState(false);

  const handleConfirmLogout = () => {
    setLoggedOut(true);
    // Simular cierre de sesión
    sessionStorage.removeItem('asistencia_auth_token');
    setTimeout(() => {
      setLoggedOut(false);
      onClose();
    }, 1200);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Cerrar Sesión de Alumno"
      maxWidth="sm"
      footer={
        loggedOut ? null : (
          <>
            <Button variant="outline" size="sm" onClick={onClose}>
              Cancelar
            </Button>
            <Button variant="danger" size="sm" onClick={handleConfirmLogout}>
              <LogOut className="w-3.5 h-3.5" />
              <span>Confirmar Cierre</span>
            </Button>
          </>
        )
      }
    >
      {loggedOut ? (
        <div className="py-6 flex flex-col items-center justify-center text-center space-y-2">
          <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center">
            <Check className="w-5 h-5" />
          </div>
          <p className="text-sm font-semibold text-primary-custom">Sesión cerrada exitosamente</p>
          <p className="text-xs text-secondary-custom">
            Modo demostración: reanudando acceso para continuar navegando.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-start gap-3 p-3 rounded-[calc(var(--radius-current)-2px)] bg-[var(--bg-surface-elevated)] border border-subtle-custom">
            <ShieldAlert className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <p className="font-semibold text-primary-custom">
                ¿Estás seguro de que deseas salir?
              </p>
              <p className="text-secondary-custom leading-relaxed">
                Esta acción cerrará la sesión actual en este dispositivo. En una integración real, se revocará el token JWT y se redirigirá a la pantalla de acceso institucional.
              </p>
            </div>
          </div>
          <p className="text-[11px] text-muted-custom">
            Cuenta de demostración: <strong>Alex Estudiante</strong> (Leg. DEMO-0842)
          </p>
        </div>
      )}
    </Modal>
  );
};
