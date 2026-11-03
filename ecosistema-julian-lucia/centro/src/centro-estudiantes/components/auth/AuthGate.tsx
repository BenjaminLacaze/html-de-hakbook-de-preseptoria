/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * ISFDyT N° 26 - Ingreso al Panel del Centro (sesión institucional)
 *
 * Pide GET /auth/me al abrir. Sin sesión muestra el formulario de ingreso; con
 * mustChangePassword pide el cambio de contraseña; sin rol de Centro muestra el aviso
 * de "sin acceso". La sesión vive en una cookie HttpOnly que maneja el navegador.
 */

import React, { useCallback, useEffect, useState } from 'react';
import { ArrowClockwise, Key, LockKey, SignIn, SignOut, WarningCircle } from '@phosphor-icons/react';
import { Toaster, toast } from 'sonner';
import type { AuthMe } from '../../api/dto';
import {
  MIN_PASSWORD_LENGTH,
  SESSION_EXPIRED_EVENT,
  canAccessCentro,
  changePassword,
  errorMessage,
  getMe,
  login,
  logout,
} from '../../api/http';
import { Button } from '../common/Button';
import { ISOTIPO_NEGATIVO_SVG, LOGO_NEGATIVO_PNG } from '../../lib/assets';

type GateState =
  | { status: 'checking' }
  | { status: 'error'; message: string }
  | { status: 'anon'; notice?: string }
  | { status: 'must-change'; me: AuthMe }
  | { status: 'denied'; me: AuthMe }
  | { status: 'ok'; me: AuthMe };

interface AuthGateProps {
  children: (me: AuthMe, onLoggedOut: () => void) => React.ReactNode;
}

const inputClass =
  'w-full px-3.5 py-2.5 text-sm bg-surface rounded-lg border border-border-subtle text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue';
const labelClass = 'text-xs font-semibold text-foreground uppercase tracking-wide';

/** Aplica el tema guardado también en la pantalla de ingreso. */
const applySavedTheme = () => {
  try {
    const saved = localStorage.getItem('isfdyt26_ce_theme');
    if (saved) document.documentElement.setAttribute('data-theme', saved);
  } catch {
    /* sin almacenamiento: tema por defecto */
  }
};

const resolve = (me: AuthMe | null): GateState => {
  if (!me) return { status: 'anon' };
  if (!canAccessCentro(me)) return { status: 'denied', me };
  if (me.mustChangePassword) return { status: 'must-change', me };
  return { status: 'ok', me };
};

export const AuthGate: React.FC<AuthGateProps> = ({ children }) => {
  const [state, setState] = useState<GateState>({ status: 'checking' });

  const check = useCallback(async () => {
    setState({ status: 'checking' });
    try {
      setState(resolve(await getMe()));
    } catch (error) {
      setState({ status: 'error', message: errorMessage(error) });
    }
  }, []);

  useEffect(() => {
    applySavedTheme();
    void check();
  }, [check]);

  useEffect(() => {
    const onExpired = () =>
      setState((prev) =>
        prev.status === 'anon' ? prev : { status: 'anon', notice: 'Tu sesión venció. Volvé a ingresar para seguir.' },
      );
    window.addEventListener(SESSION_EXPIRED_EVENT, onExpired);
    return () => window.removeEventListener(SESSION_EXPIRED_EVENT, onExpired);
  }, []);

  const doLogout = async () => {
    try {
      await logout();
    } catch {
      /* igual se vuelve al ingreso */
    }
    setState({ status: 'anon' });
  };

  if (state.status === 'ok') {
    return <>{children(state.me, () => setState({ status: 'anon', notice: 'Cerraste la sesión.' }))}</>;
  }

  return (
    <div className="min-h-screen bg-surface text-foreground font-sans antialiased flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-5">
        {/* Encabezado de marca */}
        <div className="bg-brand-navy rounded-2xl p-5 flex items-center gap-3 text-white shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-[#14214F] border border-[#AF9B63] p-1.5 flex items-center justify-center shrink-0">
            <img
              src={LOGO_NEGATIVO_PNG}
              alt="Centro de Estudiantes"
              className="w-full h-full object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).src = ISOTIPO_NEGATIVO_SVG;
              }}
            />
          </div>
          <div className="min-w-0">
            <div className="text-base font-heading font-extrabold tracking-tight leading-tight">ISFDyT N° 26</div>
            <div className="text-[11px] font-heading font-bold text-[#AF9B63] tracking-wider uppercase leading-tight mt-0.5">
              CENTRO DE ESTUDIANTES
            </div>
            <div className="text-[9.5px] font-semibold text-[#60A5FA] tracking-wider uppercase leading-tight">
              PANEL DE GESTIÓN
            </div>
          </div>
        </div>

        <div className="bg-surface-card rounded-2xl border border-border-subtle p-6 sm:p-7 space-y-5 shadow-xs">
          {state.status === 'checking' && (
            <div className="py-8 text-center text-sm text-foreground-muted">Verificando la sesión…</div>
          )}

          {state.status === 'error' && (
            <div className="space-y-4 text-center">
              <WarningCircle weight="bold" className="w-10 h-10 text-rose-600 mx-auto" />
              <div className="space-y-1">
                <h1 className="text-lg font-heading font-bold text-foreground">No pudimos conectarnos</h1>
                <p className="text-xs text-foreground-muted">{state.message}</p>
              </div>
              <Button variant="accent-gold" icon={<ArrowClockwise weight="bold" className="w-4 h-4" />} onClick={check}>
                Reintentar
              </Button>
            </div>
          )}

          {state.status === 'anon' && <LoginForm notice={state.notice} onLoggedIn={(me) => setState(resolve(me))} />}

          {state.status === 'must-change' && (
            <ChangePasswordForm
              me={state.me}
              onChanged={(me) => setState(resolve(me))}
              onCancel={doLogout}
            />
          )}

          {state.status === 'denied' && (
            <div className="space-y-4 text-center">
              <LockKey weight="bold" className="w-10 h-10 text-brand-gold mx-auto" />
              <div className="space-y-1">
                <h1 className="text-lg font-heading font-bold text-foreground">
                  Esta cuenta no tiene acceso al Centro
                </h1>
                <p className="text-xs text-foreground-muted leading-relaxed">
                  Ingresaste como <strong className="text-foreground">{state.me.user.email}</strong>. El panel del
                  Centro de Estudiantes es solo para integrantes del Centro. Si creés que es un error, pedí el acceso en
                  Dirección.
                </p>
              </div>
              <Button variant="secondary" icon={<SignOut weight="bold" className="w-4 h-4" />} onClick={doLogout}>
                Cerrar sesión y usar otra cuenta
              </Button>
            </div>
          )}
        </div>
      </div>

      <Toaster position="top-right" richColors closeButton />
    </div>
  );
};

const LoginForm: React.FC<{ notice?: string; onLoggedIn: (me: AuthMe) => void }> = ({ notice, onLoggedIn }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      onLoggedIn(await login(email.trim(), password));
      setPassword('');
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="space-y-1">
        <h1 className="text-xl font-heading font-bold text-foreground">Ingresá al panel</h1>
        <p className="text-xs text-foreground-muted">Usá tu cuenta institucional del ISFDyT N° 26.</p>
        <div className="brand-fillet mt-2" />
      </div>

      {notice && (
        <div className="p-3 bg-brand-gold/10 rounded-lg border border-brand-gold/25 text-xs text-foreground-muted">
          {notice}
        </div>
      )}

      <div className="space-y-1">
        <label htmlFor="login-email" className={labelClass}>
          Email institucional
        </label>
        <input
          id="login-email"
          type="email"
          required
          autoComplete="username"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="nombre.apellido@isfdyt26.edu.ar"
          className={inputClass}
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="login-password" className={labelClass}>
          Contraseña
        </label>
        <input
          id="login-password"
          type="password"
          required
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={inputClass}
        />
      </div>

      {error && (
        <div role="alert" className="p-3 bg-rose-50 dark:bg-rose-950/40 rounded-lg border border-rose-300 dark:border-rose-800 text-xs text-rose-800 dark:text-rose-200">
          {error}
        </div>
      )}

      <Button
        type="submit"
        variant="accent-gold"
        className="w-full"
        loading={busy}
        disabled={busy}
        icon={<SignIn weight="bold" className="w-4 h-4" />}
      >
        {busy ? 'Ingresando…' : 'Ingresar'}
      </Button>

      {import.meta.env.DEV && (
        <p className="text-[11px] text-foreground-muted text-center font-mono">
          Cuenta de prueba: prueba.centro@isfdyt26.edu.ar
        </p>
      )}
    </form>
  );
};

const ChangePasswordForm: React.FC<{ me: AuthMe; onChanged: (me: AuthMe) => void; onCancel: () => void }> = ({
  me,
  onChanged,
  onCancel,
}) => {
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [repeat, setRepeat] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (next.length < MIN_PASSWORD_LENGTH) {
      setError(`La contraseña nueva tiene que tener al menos ${MIN_PASSWORD_LENGTH} caracteres.`);
      return;
    }
    if (next !== repeat) {
      setError('Las dos contraseñas nuevas no coinciden.');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const updated = await changePassword(current, next);
      toast.success('Contraseña actualizada');
      onChanged(updated);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="space-y-1">
        <h1 className="text-xl font-heading font-bold text-foreground flex items-center gap-2">
          <Key weight="bold" className="w-5 h-5 text-brand-gold" />
          Elegí una contraseña nueva
        </h1>
        <p className="text-xs text-foreground-muted">
          Hola, {me.user.firstName}. Antes de seguir tenés que cambiar la contraseña inicial de tu cuenta.
        </p>
        <div className="brand-fillet mt-2" />
      </div>

      <div className="space-y-1">
        <label htmlFor="pw-current" className={labelClass}>
          Contraseña actual
        </label>
        <input
          id="pw-current"
          type="password"
          required
          autoComplete="current-password"
          value={current}
          onChange={(e) => setCurrent(e.target.value)}
          className={inputClass}
        />
      </div>
      <div className="space-y-1">
        <label htmlFor="pw-new" className={labelClass}>
          Contraseña nueva
        </label>
        <input
          id="pw-new"
          type="password"
          required
          autoComplete="new-password"
          minLength={MIN_PASSWORD_LENGTH}
          value={next}
          onChange={(e) => setNext(e.target.value)}
          className={inputClass}
        />
        <p className="text-[11px] text-foreground-muted">Mínimo {MIN_PASSWORD_LENGTH} caracteres.</p>
      </div>
      <div className="space-y-1">
        <label htmlFor="pw-repeat" className={labelClass}>
          Repetí la contraseña nueva
        </label>
        <input
          id="pw-repeat"
          type="password"
          required
          autoComplete="new-password"
          value={repeat}
          onChange={(e) => setRepeat(e.target.value)}
          className={inputClass}
        />
      </div>

      {error && (
        <div role="alert" className="p-3 bg-rose-50 dark:bg-rose-950/40 rounded-lg border border-rose-300 dark:border-rose-800 text-xs text-rose-800 dark:text-rose-200">
          {error}
        </div>
      )}

      <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={busy}>
          Salir
        </Button>
        <Button type="submit" variant="accent-gold" loading={busy} disabled={busy}>
          {busy ? 'Guardando…' : 'Cambiar contraseña'}
        </Button>
      </div>
    </form>
  );
};
