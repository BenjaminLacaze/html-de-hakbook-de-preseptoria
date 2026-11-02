/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Puerta de sesión del Panel de Preceptores: login con la cuenta institucional,
 * cambio obligatorio de contraseña y control de rol (PRECEPTOR o SUPER_ADMIN).
 */

import React, { createContext, useContext, useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { SignIn, SignOut, LockKey } from '@phosphor-icons/react';
import { ApiError, authApi } from '../api';
import type { ApiAuthMe } from '../api';

const ALLOWED_ROLES = ['PRECEPTOR', 'SUPER_ADMIN'];

interface SessionContextValue {
  me: ApiAuthMe;
  logout: () => Promise<void>;
}

const SessionContext = createContext<SessionContextValue | null>(null);

export function usePreceptorSession(): SessionContextValue {
  const value = useContext(SessionContext);
  if (!value) throw new Error('La sesión de Preceptoría no está disponible.');
  return value;
}

export const SessionGate: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [me, setMe] = useState<ApiAuthMe | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nextPassword, setNextPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    authApi
      .me()
      .then((session) => {
        if (active) setMe(session);
      })
      .catch((reason) => {
        if (active) setError(reason instanceof Error ? reason.message : 'No se pudo consultar la sesión.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    const expired = () => {
      setMe(null);
      setError('La sesión venció. Volvé a ingresar.');
    };
    window.addEventListener('i26:session-expired', expired);
    return () => {
      active = false;
      window.removeEventListener('i26:session-expired', expired);
    };
  }, []);

  const leave = async () => {
    try {
      await authApi.logout();
    } finally {
      setMe(null);
      setPassword('');
      setError('');
    }
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    if (me?.mustChangePassword && nextPassword !== confirmPassword) {
      setError('Las contraseñas nuevas no coinciden.');
      return;
    }
    setBusy(true);
    try {
      const result = me?.mustChangePassword
        ? await authApi.changePassword(password, nextPassword)
        : await authApi.login(email, password);
      setMe(result);
      setPassword('');
      setNextPassword('');
      setConfirmPassword('');
    } catch (reason) {
      setError(reason instanceof ApiError ? reason.message : 'No se pudo iniciar sesión.');
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen grid place-items-center bg-[var(--bg-page)] text-[var(--text-primary)]">
        <p role="status" className="text-sm text-[var(--text-secondary)]">Comprobando tu sesión institucional…</p>
      </main>
    );
  }

  const allowed = Boolean(me && me.user.roles.some((role) => ALLOWED_ROLES.includes(role)));
  if (me && !me.mustChangePassword && allowed) {
    return <SessionContext.Provider value={{ me, logout: leave }}>{children}</SessionContext.Provider>;
  }

  const changing = Boolean(me?.mustChangePassword);
  const forbidden = Boolean(me && !changing && !allowed);
  const inputClass =
    'mt-1 w-full bg-[var(--bg-surface-elevated)] border border-[var(--border-strong)] text-[var(--text-primary)] rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#3F78B6]';

  return (
    <main className="min-h-screen grid place-items-center bg-[var(--bg-page)] text-[var(--text-primary)] p-4">
      <section className="w-full max-w-md rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] shadow-xl overflow-hidden">
        <div className="bg-[var(--brand-navy)] text-white p-6">
          <div className="bg-white rounded-xl p-2 px-3 inline-flex items-center border border-[#AF9B63]/40">
            <img
              src={`${import.meta.env.BASE_URL}assets/aistudio/image_5bcba208.png`}
              alt="PRECEPTORES — ISFDyT N° 26"
              className="h-10 w-auto object-contain"
            />
          </div>
          <p className="mt-4 text-[11px] font-mono-data font-semibold uppercase tracking-widest text-[#AF9B63]">
            ISFDyT N° 26 · Preceptoría
          </p>
          <h1 className="mt-1 font-heading font-extrabold text-2xl">
            {forbidden
              ? 'Esta cuenta no tiene acceso a Preceptoría'
              : changing
                ? 'Elegí tu contraseña'
                : 'Ingresar al Panel de Preceptores'}
          </h1>
        </div>

        <div className="p-6 sm:p-8">
          {forbidden ? (
            <div className="space-y-4 text-sm text-[var(--text-secondary)]">
              <p>
                Ingresaste como <strong className="text-[var(--text-primary)]">{me?.user.firstName} {me?.user.lastName}</strong>.
                Para usar este panel necesitás una cuenta con rol de preceptor/a asignada por Dirección.
              </p>
              <button
                type="button"
                onClick={() => void leave()}
                className="inline-flex items-center gap-2 rounded-xl bg-[var(--brand-navy)] px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white cursor-pointer"
              >
                <SignOut size={16} weight="bold" />
                <span>Ingresar con otra cuenta</span>
              </button>
            </div>
          ) : (
            <>
              <p className="text-xs text-[var(--text-secondary)]">
                {changing
                  ? 'Tu cuenta es nueva o la contraseña fue restablecida. Elegí una contraseña personal para continuar.'
                  : 'Usá la cuenta institucional asignada por Dirección. La misma cuenta comparte sesión con los demás portales.'}
              </p>
              <form onSubmit={(event) => void submit(event)} className="mt-5 space-y-4 text-xs">
                {!changing && (
                  <label className="block font-heading font-bold uppercase text-[var(--text-muted)]">
                    Email institucional
                    <input
                      className={inputClass}
                      type="email"
                      autoComplete="username"
                      required
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                    />
                  </label>
                )}
                <label className="block font-heading font-bold uppercase text-[var(--text-muted)]">
                  {changing ? 'Contraseña temporal o actual' : 'Contraseña'}
                  <input
                    className={inputClass}
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                  />
                </label>
                {changing && (
                  <>
                    <label className="block font-heading font-bold uppercase text-[var(--text-muted)]">
                      Contraseña nueva
                      <input
                        className={inputClass}
                        type="password"
                        autoComplete="new-password"
                        minLength={8}
                        required
                        value={nextPassword}
                        onChange={(event) => setNextPassword(event.target.value)}
                      />
                    </label>
                    <label className="block font-heading font-bold uppercase text-[var(--text-muted)]">
                      Repetir contraseña nueva
                      <input
                        className={inputClass}
                        type="password"
                        autoComplete="new-password"
                        minLength={8}
                        required
                        value={confirmPassword}
                        onChange={(event) => setConfirmPassword(event.target.value)}
                      />
                    </label>
                  </>
                )}
                {error && (
                  <p role="alert" className="text-xs text-red-700 dark:text-red-300 font-medium">
                    {error}
                  </p>
                )}
                <button
                  disabled={busy}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#89743A] hover:bg-[#73612F] px-4 py-3 text-xs font-bold uppercase tracking-wider text-white disabled:opacity-60 cursor-pointer"
                >
                  {changing ? <LockKey size={16} weight="bold" /> : <SignIn size={16} weight="bold" />}
                  <span>{busy ? 'Procesando…' : changing ? 'Guardar contraseña' : 'Ingresar'}</span>
                </button>
                {changing && (
                  <button
                    type="button"
                    onClick={() => void leave()}
                    className="w-full text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] underline cursor-pointer"
                  >
                    Cancelar y salir
                  </button>
                )}
              </form>
              <p className="mt-5 text-[11px] text-[var(--text-muted)]">
                Si olvidaste la contraseña, pedí a Dirección que la restablezca.
              </p>
              {import.meta.env.DEV && !changing && (
                <p className="mt-2 text-[11px] font-mono-data text-[var(--text-muted)]">
                  Cuenta de prueba: prueba.preceptor@isfdyt26.edu.ar
                </p>
              )}
            </>
          )}
        </div>
      </section>
    </main>
  );
};
