import React from 'react';
import { useAuth } from '../context/AuthContext';
import { INSTITUTION_INFO } from '../config/themes';
import { ShieldWarning, SignOut } from '@phosphor-icons/react';

export const UnauthorizedRoleScreen: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4 bg-[var(--surface)] text-[var(--text)]">
      <div className="w-full max-w-md bg-[var(--surface-card)] rounded-2xl border border-amber-300 dark:border-amber-800 p-6 md:p-8 text-center shadow-sm">
        <div className="w-14 h-14 mx-auto rounded-full bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-400 flex items-center justify-center mb-3">
          <ShieldWarning className="w-8 h-8" weight="fill" />
        </div>

        <h1 className="text-lg font-bold uppercase tracking-tight text-[var(--text)]">
          Acceso no autorizado
        </h1>
        <div className="mx-auto mt-2 h-[2px] w-12 bg-[var(--brand-gold)]" aria-hidden="true" />

        <p className="text-sm font-semibold text-amber-800 dark:text-amber-300 mt-4">
          Esta cuenta no tiene acceso al panel de familias.
        </p>

        <p className="text-xs text-[var(--text-muted)] mt-2 leading-relaxed">
          Has iniciado sesión con el usuario <strong>{user?.email}</strong> (rol asignado: <span className="font-mono font-bold">{user?.role}</span>).
          El presente módulo está reservado exclusivamente para madres, padres y tutores responsables registrados en {INSTITUTION_INFO.name}.
        </p>

        <div className="mt-6 pt-4 border-t border-[var(--border)]">
          <button
            type="button"
            onClick={logout}
            className="w-full py-2.5 px-4 rounded-xl font-bold text-sm bg-[#14214F] hover:bg-[#1D2D63] text-white transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
          >
            <SignOut className="w-4 h-4" />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </div>
    </div>
  );
};
