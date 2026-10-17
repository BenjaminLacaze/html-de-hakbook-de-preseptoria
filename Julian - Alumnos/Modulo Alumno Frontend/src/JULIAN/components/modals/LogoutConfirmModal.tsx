import React from 'react';
import { LogOut, AlertCircle } from 'lucide-react';
import { usePortal } from '../../context/PortalContext';
import { getBorderRadiusClass } from '../../styles/themes';

export const LogoutConfirmModal: React.FC = () => {
  const {
    isLogoutModalOpen,
    setIsLogoutModalOpen,
    logout,
    appearance,
    themeColors,
    student
  } = usePortal();

  if (!isLogoutModalOpen) return null;

  const radius = getBorderRadiusClass(appearance.borderStyle);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div
        style={{
          backgroundColor: themeColors.bgCard,
          borderColor: themeColors.borderSubtle
        }}
        className={`w-full max-w-md border p-6 shadow-2xl relative ${radius.card}`}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-full bg-red-100 text-red-600 dark:bg-red-950/40 dark:text-red-400">
            <LogOut className="w-5 h-5" />
          </div>
          <div>
            <h3 style={{ color: themeColors.textPrimary }} className="text-base font-bold">
              ¿Deseas cerrar tu sesión?
            </h3>
            <p style={{ color: themeColors.textMuted }} className="text-xs">
              {student.fullName} · {student.legajo}
            </p>
          </div>
        </div>

        <p style={{ color: themeColors.textSecondary }} className="text-xs mb-4 leading-relaxed">
          Al salir del Panel de Alumno del Instituto 26 se cerrará tu sesión activa en este dispositivo.
          Tus registros de asistencia e historial quedan salvaguardados en el sistema institucional.
        </p>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => setIsLogoutModalOpen(false)}
            style={{
              backgroundColor: themeColors.bgSubtle,
              color: themeColors.textSecondary
            }}
            className={`px-4 py-2 text-xs font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors ${radius.button}`}
          >
            Permanecer en el panel
          </button>
          <button
            type="button"
            onClick={logout}
            className={`px-4 py-2 text-xs font-semibold bg-red-600 hover:bg-red-700 text-white transition-colors shadow-xs ${radius.button}`}
          >
            Cerrar Sesión
          </button>
        </div>
      </div>
    </div>
  );
};
