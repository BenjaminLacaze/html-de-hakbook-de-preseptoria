import React, { useEffect, useState, type ReactNode } from 'react';
import { getMe, login, logout, changePassword, hasAppAccess } from '../api';
import { ROLE_LABELS, MIN_PASSWORD_LENGTH, type AppId, type AuthMe } from '../types';
import '../design/tokens.css';
import './session.css';

const REFERENCES = [
  ['DIRECTOR', 'Dirección', 'direccion@isfdyt26.edu.ar'],
  ['ADMINISTRATIVE', 'Secretaría', 'Tu email institucional'],
  ['PRECEPTOR', 'Preceptoría', 'Tu email institucional'],
  ['TEACHER', 'Profesores', 'Tu email institucional'],
  ['STUDENT', 'Alumnos (ambos portales)', 'Tu email institucional'],
  ['STAFF', 'Auxiliares', 'Tu email institucional'],
  ['STUDENT_REP', 'Centro de Estudiantes', 'Tu email institucional'],
] as const;

/** Una sesión real por dominio: todos los portales comparten la cookie HttpOnly. */
export function SessionGate({ apps, children }: { apps: AppId[]; children: (me: AuthMe) => ReactNode }) {
  const [me, setMe] = useState<AuthMe | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const leave = async () => {
    setBusy(true);
    try { await logout(); setMe(null); setPassword(''); }
    catch (e) { setError(e instanceof Error ? e.message : 'No se pudo cerrar la sesión.'); }
    finally { setBusy(false); }
  };
  useEffect(() => {
    let live = true;
    getMe().then(m => { if (live) setMe(m); })
      .catch(e => { if (live) setError(e instanceof Error ? e.message : 'No se pudo comprobar la sesión.'); })
      .finally(() => { if (live) setLoading(false); });
    const expired = () => { setMe(null); setError('La sesión venció. Volvé a ingresar.'); };
    window.addEventListener('i26:session-expired', expired);
    return () => { live = false; window.removeEventListener('i26:session-expired', expired); };
  }, []);

  if (loading) return <main className="i26-auth"><p role="status">Comprobando tu sesión…</p></main>;
  if (me && !me.mustChangePassword && apps.some(app => hasAppAccess(me, app))) {
    return <><nav className="i26-session" aria-label="Sesión y portales"><a href="/">Todos los portales</a><span>{me.user.firstName} {me.user.lastName} · {me.user.roles.map(r => ROLE_LABELS[r]).join(', ')}</span><button disabled={busy} onClick={() => void leave()}>Cerrar sesión</button></nav>{error && <p role="alert" className="i26-auth-error">{error}</p>}{children(me)}</>;
  }
  if (me && !me.mustChangePassword) return <main className="i26-auth"><section className="i26-auth-card"><h1>Esta cuenta no tiene acceso a este portal</h1><p>Roles: {me.user.roles.map(r => ROLE_LABELS[r]).join(', ')}.</p><a href="/">Elegir otro portal</a><button onClick={() => void leave()} disabled={busy}>Ingresar con otra cuenta</button></section></main>;

  const changing = Boolean(me?.mustChangePassword);
  const submit = async (event: React.FormEvent) => {
    event.preventDefault(); setError('');
    if (changing && next !== confirm) { setError('Las contraseñas nuevas no coinciden.'); return; }
    setBusy(true);
    try {
      const result = changing ? await changePassword(password, next) : await login(email, password);
      setMe(result); setPassword(''); setNext(''); setConfirm('');
    } catch (e) { setError(e instanceof Error ? e.message : 'No se pudo ingresar.'); }
    finally { setBusy(false); }
  };
  return <main className="i26-auth"><section className="i26-auth-card">
    <a href="/">ISFDyT N.° 26 · Dolores</a>
    <h1>{changing ? 'Elegí tu contraseña' : 'Ingresar al sistema'}</h1>
    <p>{changing ? 'Reemplazá la contraseña temporal antes de continuar.' : 'Usá la cuenta creada por Dirección. La misma cuenta sirve en los portales correspondientes a tu rol.'}</p>
    <form onSubmit={event => void submit(event)}>
      {!changing && <label>Email institucional<input type="email" autoComplete="username" required value={email} onChange={e => setEmail(e.target.value)} /></label>}
      <label>{changing ? 'Contraseña temporal o actual' : 'Contraseña'}<input type="password" autoComplete="current-password" required value={password} onChange={e => setPassword(e.target.value)} /></label>
      {changing && <><label>Contraseña nueva<input type="password" autoComplete="new-password" required minLength={MIN_PASSWORD_LENGTH} value={next} onChange={e => setNext(e.target.value)} /></label><label>Repetir contraseña nueva<input type="password" autoComplete="new-password" required minLength={MIN_PASSWORD_LENGTH} value={confirm} onChange={e => setConfirm(e.target.value)} /></label></>}
      {error && <p role="alert" className="i26-auth-error">{error}</p>}
      <button className="i26-auth-submit" disabled={busy}>{busy ? 'Procesando…' : changing ? 'Guardar contraseña' : 'Ingresar'}</button>
    </form>
    <p>Si olvidaste la contraseña, pedí a Dirección que la restablezca.</p>
    <details><summary>Referencia de usuarios y roles</summary><p>La cuenta de Dirección es una referencia. Cada persona ingresa con su propio email; el rol lo asigna Dirección.</p><table><thead><tr><th>Rol</th><th>Usuario</th></tr></thead><tbody>{REFERENCES.map(([role, label, user]) => <tr key={role}><td>{label}</td><td>{user}</td></tr>)}</tbody></table></details>
  </section></main>;
}
