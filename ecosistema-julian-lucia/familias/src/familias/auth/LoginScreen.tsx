import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { INSTITUTION_INFO } from '../config/themes';
import { FamiliasBrandIcon } from '../components/FamiliasBrandIcon';
import { LockKey, Envelope, SignIn, Info, ShieldCheck } from '@phosphor-icons/react';

export const LoginScreen: React.FC = () => {
  const { login, isLoading, error } = useAuth();
  const [email, setEmail] = useState('mariana.gomez@ejemplo.com');
  const [password, setPassword] = useState('password123');
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    if (!email || !password) {
      setLocalError('Por favor ingresá tu correo institucional y contraseña.');
      return;
    }
    try {
      await login(email, password);
    } catch (err: any) {
      setLocalError(err.message || 'Error al iniciar sesión.');
    }
  };

  const handleFillAccount = (testEmail: string) => {
    setEmail(testEmail);
    setPassword('Prueba-I26-2026');
    setLocalError(null);
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4 bg-[var(--surface)] text-[var(--text)]">
      <div className="w-full max-w-md">
        {/* Cabecera institucional con icono oficial */}
        <div className="text-center mb-6">
          <FamiliasBrandIcon size="lg" className="mx-auto mb-3 shadow-md border-2 border-[#89743A]" />
          <h1 className="text-xl md:text-2xl font-black uppercase tracking-tight text-[var(--text)] font-display">
            {INSTITUTION_INFO.name}
          </h1>
          <div className="mx-auto mt-2 h-[2px] w-12 bg-[var(--brand-gold)]" aria-hidden="true" />
          <p className="text-xs uppercase font-bold tracking-widest text-[var(--text-muted)] mt-2">
            Panel de Familias y Tutores
          </p>
        </div>

        {/* Tarjeta de Inicio de Sesión */}
        <div className="bg-[var(--surface-card)] rounded-2xl border border-[var(--border)] p-6 md:p-8 shadow-sm">
          <div className="mb-5">
            <h2 className="text-lg font-bold text-[var(--text)]">
              Acceso a la plataforma
            </h2>
            <p className="text-xs text-[var(--text-muted)] mt-1">
              Ingresá con el correo electrónico registrado en la secretaría del instituto.
            </p>
          </div>

          {(localError || error) && (
            <div
              className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-xs text-red-800 dark:text-red-300"
              role="alert"
            >
              {localError || error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="login-email"
                className="block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1"
              >
                Correo Electrónico
              </label>
              <div className="relative">
                <Envelope className="w-4 h-4 text-[var(--text-muted)] absolute left-3 top-3.5" />
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ejemplo@correo.com"
                  required
                  autoComplete="email"
                  className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--focus)] transition-all"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="login-password"
                className="block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1"
              >
                Contraseña
              </label>
              <div className="relative">
                <LockKey className="w-4 h-4 text-[var(--text-muted)] absolute left-3 top-3.5" />
                <input
                  id="login-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--focus)] transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 px-4 rounded-xl font-bold text-sm bg-[#14214F] hover:bg-[#1D2D63] text-white transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm disabled:opacity-50"
            >
              <SignIn className="w-4 h-4 text-[#AF9B63]" weight="bold" />
              <span>{isLoading ? 'Comprobando sesión...' : 'Ingresar al Panel'}</span>
            </button>
          </form>

          {/* Advertencia institucional sobre creación de cuentas (Regla §3: NO hay registro libre) */}
          <div className="mt-6 pt-4 border-t border-[var(--border)] text-center">
            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
              <strong>Aviso de seguridad:</strong> Las cuentas son habilitadas exclusivamente por la Dirección y Preceptoría. No existe registro público abierto.
            </p>
          </div>
        </div>

        {/* Cuenta de prueba: solo en desarrollo local (npm run dev). En el sitio publicado no aparece. */}
        {import.meta.env.DEV && (
          <div className="mt-4 p-4 rounded-2xl bg-[var(--surface-subtle)] border border-[var(--border)] text-xs">
            <p className="font-bold text-[var(--text)] mb-2 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[var(--brand-gold)]" weight="bold" />
              Cuenta de prueba (base local):
            </p>
            <button
              type="button"
              onClick={() => handleFillAccount('prueba.familia@isfdyt26.edu.ar')}
              className="w-full text-left p-2 rounded-lg bg-[var(--surface-card)] hover:border-[var(--brand-gold)] border border-[var(--border)] flex items-center justify-between cursor-pointer"
            >
              <div>
                <span className="font-bold block text-[var(--text)]">Familia Prueba</span>
                <span className="text-[11px] text-[var(--text-muted)] font-mono">prueba.familia@isfdyt26.edu.ar · 2 hijos</span>
              </div>
              <span className="text-[10px] text-[var(--brand-gold)] font-bold">Usar</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
