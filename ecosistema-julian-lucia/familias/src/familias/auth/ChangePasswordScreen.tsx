import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { LockKey, Key, SignOut } from '@phosphor-icons/react';

export const ChangePasswordScreen: React.FC = () => {
  const { changePassword, isLoading, logout, user } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword.length < 6) {
      setError('La nueva contraseña debe tener al menos 6 caracteres.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Las nuevas contraseñas no coinciden.');
      return;
    }

    try {
      await changePassword(currentPassword, newPassword);
    } catch (err: any) {
      setError(err.message || 'No se pudo actualizar la contraseña.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4 bg-[var(--surface)] text-[var(--text)]">
      <div className="w-full max-w-md bg-[var(--surface-card)] rounded-2xl border border-[var(--border)] p-6 md:p-8 shadow-sm">
        <div className="text-center mb-6">
          <div className="w-12 h-12 mx-auto rounded-full bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-400 flex items-center justify-center mb-3">
            <Key className="w-6 h-6" weight="bold" />
          </div>
          <h1 className="text-xl font-bold uppercase tracking-tight text-[var(--text)]">
            Cambio obligatorio de contraseña
          </h1>
          <div className="mx-auto mt-2 h-[2px] w-12 bg-[var(--brand-gold)]" aria-hidden="true" />
          <p className="text-xs text-[var(--text-muted)] mt-2">
            Hola, <strong>{user?.firstName}</strong>. Por seguridad institucional, al ser tu primer ingreso o por reinicio administrativo, debés definir una nueva contraseña personal.
          </p>
        </div>

        {error && (
          <div
            className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-xs text-red-800 dark:text-red-300"
            role="alert"
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="current-password"
              className="block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1"
            >
              Contraseña Provisoria Actual
            </label>
            <div className="relative">
              <LockKey className="w-4 h-4 text-[var(--text-muted)] absolute left-3 top-3.5" />
              <input
                id="current-password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--focus)]"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="new-password"
              className="block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1"
            >
              Nueva Contraseña Personal
            </label>
            <div className="relative">
              <LockKey className="w-4 h-4 text-[var(--text-muted)] absolute left-3 top-3.5" />
              <input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                required
                className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--focus)]"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="confirm-password"
              className="block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1"
            >
              Confirmar Nueva Contraseña
            </label>
            <div className="relative">
              <LockKey className="w-4 h-4 text-[var(--text-muted)] absolute left-3 top-3.5" />
              <input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Reiterá la nueva contraseña"
                required
                className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--focus)]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-[#14214F] hover:bg-[#1D2D63] text-white transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm disabled:opacity-50"
          >
            <span>{isLoading ? 'Actualizando...' : 'Guardar contraseña y entrar'}</span>
          </button>
        </form>

        <div className="mt-4 pt-3 border-t border-[var(--border)] text-center">
          <button
            type="button"
            onClick={logout}
            className="text-xs text-[var(--text-muted)] hover:text-red-600 inline-flex items-center gap-1 cursor-pointer"
          >
            <SignOut className="w-3.5 h-3.5" />
            Cancelar y salir
          </button>
        </div>
      </div>
    </div>
  );
};
