import React, { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { SignIn, ShieldCheck, Key, WarningCircle } from '@phosphor-icons/react';
import {
  ApiError,
  SESSION_EXPIRED_EVENT,
  changePassword,
  getMe,
  login,
  logout,
  type AuthMe,
} from '../api';
import { ModuleMark } from '../components/ModuleMark';
import { SesionCerradaScreen } from '../screens/SesionCerradaScreen';

/** Roles que pueden usar el Panel de Auxiliares. */
const ALLOWED_ROLES = ['STAFF', 'SUPER_ADMIN'];

export interface Session {
  me: AuthMe;
  logout: () => Promise<void>;
}

const inputClass =
  'mt-1 w-full px-3.5 py-2.5 rounded-lg bg-[#0A1124] border border-[#1C2E56] text-white text-sm focus:border-[#3F78B6] focus:outline-none';

export const SessionGate: React.FC<{ children: (session: Session) => ReactNode }> = ({
  children,
}) => {
  const [me, setMe] = useState<AuthMe | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [loggedOut, setLoggedOut] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nextPassword, setNextPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const checkSession = () => {
    setLoading(true);
    setError('');
    getMe()
      .then(setMe)
      .catch((reason) =>
        setError(reason instanceof Error ? reason.message : 'No se pudo consultar la sesión.')
      )
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    checkSession();
    const expired = () => {
      setMe(null);
      setLoggedOut(false);
      setError('La sesión venció. Volvé a ingresar.');
    };
    window.addEventListener(SESSION_EXPIRED_EVENT, expired);
    return () => window.removeEventListener(SESSION_EXPIRED_EVENT, expired);
  }, []);

  const leave = async () => {
    try {
      await logout();
    } catch {
      // Si la API no responde igual se descarta la sesión en pantalla.
    } finally {
      setMe(null);
      setPassword('');
      setLoggedOut(true);
    }
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    const changing = Boolean(me?.mustChangePassword);
    if (changing && nextPassword !== confirmPassword) {
      setError('Las contraseñas nuevas no coinciden.');
      return;
    }
    setBusy(true);
    try {
      const result = changing
        ? await changePassword(password, nextPassword)
        : await login(email.trim(), password);
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
      <main className="min-h-screen grid place-items-center bg-[#080E1E] text-slate-300">
        <p role="status" className="text-sm">
          Comprobando tu sesión institucional…
        </p>
      </main>
    );
  }

  const allowed = Boolean(me && me.user.roles.some((r) => ALLOWED_ROLES.includes(r)));
  if (me && !me.mustChangePassword && allowed) {
    return <>{children({ me, logout: leave })}</>;
  }

  if (loggedOut && !me) {
    return <SesionCerradaScreen onContinue={() => setLoggedOut(false)} />;
  }

  const changing = Boolean(me?.mustChangePassword);
  const forbidden = Boolean(me && !changing && !allowed);

  return (
    <main className="min-h-screen bg-[#080E1E] text-white flex items-center justify-center p-4">
      <section className="w-full max-w-md rounded-2xl border border-[#1C2E56] bg-[#0E1730] p-6 sm:p-8 shadow-2xl space-y-5">
        <div className="bg-[#0A1124] p-4 rounded-xl border border-[#162444]">
          <ModuleMark />
        </div>

        <div>
          <span className="text-[11px] font-bold text-[#C8A14D] uppercase tracking-widest block">
            ISFDyT N° 26 · Servicios Generales
          </span>
          <h1 className="mt-2 text-2xl font-heading font-extrabold">
            {forbidden
              ? 'Esta cuenta no tiene acceso a Auxiliares'
              : changing
              ? 'Elegí tu contraseña'
              : 'Ingresar al Panel de Auxiliares'}
          </h1>
        </div>

        {forbidden ? (
          <div className="space-y-4 text-sm text-slate-300">
            <p>
              Ingresaste como {me?.user.firstName} {me?.user.lastName}. Para usar este panel
              necesitás una cuenta de auxiliar habilitada por Dirección.
            </p>
            <button
              type="button"
              onClick={() => void leave()}
              className="touch-target w-full py-3 rounded-lg bg-[#C8A14D] hover:brightness-110 text-[#0A1124] font-bold text-sm"
            >
              Ingresar con otra cuenta
            </button>
          </div>
        ) : (
          <>
            <p className="text-xs text-slate-400">
              {changing
                ? 'Es tu primer ingreso o te blanquearon la clave: elegí una contraseña nueva para seguir.'
                : 'Usá la cuenta institucional asignada por Dirección. La sesión se comparte con los demás portales.'}
            </p>
            <form onSubmit={(event) => void submit(event)} className="space-y-4">
              {!changing && (
                <label className="block text-xs font-bold text-slate-300 uppercase">
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
              <label className="block text-xs font-bold text-slate-300 uppercase">
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
                  <label className="block text-xs font-bold text-slate-300 uppercase">
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
                  <label className="block text-xs font-bold text-slate-300 uppercase">
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
                <p
                  role="alert"
                  className="flex items-start gap-2 text-xs text-red-300 bg-red-950/40 border border-red-800 rounded-lg p-2.5"
                >
                  <WarningCircle size={16} className="shrink-0 mt-0.5" />
                  <span>{error}</span>
                </p>
              )}

              <button
                type="submit"
                disabled={busy}
                className="touch-target w-full py-3 rounded-lg bg-[#C8A14D] hover:brightness-110 active:brightness-95 text-[#0A1124] font-extrabold text-sm shadow-md flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {changing ? <Key size={18} weight="bold" /> : <SignIn size={18} weight="bold" />}
                <span>{busy ? 'Procesando…' : changing ? 'Guardar contraseña' : 'Ingresar'}</span>
              </button>

              {changing && (
                <button
                  type="button"
                  onClick={() => void leave()}
                  className="w-full text-xs text-slate-400 hover:text-white underline"
                >
                  Salir sin cambiarla
                </button>
              )}
            </form>

            {import.meta.env.DEV && !changing && (
              <p className="text-[11px] text-slate-500 font-mono">
                Cuenta de prueba: prueba.auxiliar@isfdyt26.edu.ar
              </p>
            )}
            <p className="text-[11px] text-slate-500">
              Si olvidaste la contraseña, pedí a Dirección que la restablezca.
            </p>
          </>
        )}

        <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500 pt-1">
          <ShieldCheck size={14} />
          <span>Instituto Superior de Formación Docente y Técnica N° 26</span>
        </div>
      </section>
    </main>
  );
};
