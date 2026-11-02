import React, { createContext, useContext, useEffect, useState, type FormEvent, type ReactNode } from "react";
import { ApiError, changePassword, getMe, login, logout, type AuthMe } from "../services/http";

interface SessionContextValue {
  me: AuthMe;
  logout: () => Promise<void>;
}

const SessionContext = createContext<SessionContextValue | null>(null);

export function useStudentSession() {
  const value = useContext(SessionContext);
  if (!value) throw new Error("La sesión del alumno no está disponible.");
  return value;
}

export function SessionGate({ children }: { children: ReactNode }) {
  const [me, setMe] = useState<AuthMe | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nextPassword, setNextPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    getMe().then((session) => { if (active) setMe(session); })
      .catch((reason) => { if (active) setError(reason instanceof Error ? reason.message : "No se pudo consultar la sesión."); })
      .finally(() => { if (active) setLoading(false); });
    const expired = () => { setMe(null); setError("La sesión venció. Volvé a ingresar."); };
    window.addEventListener("i26:session-expired", expired);
    return () => { active = false; window.removeEventListener("i26:session-expired", expired); };
  }, []);

  const leave = async () => {
    try { await logout(); } finally { setMe(null); }
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    if (me?.mustChangePassword && nextPassword !== confirmPassword) {
      setError("Las contraseñas nuevas no coinciden.");
      return;
    }
    setBusy(true);
    try {
      const result = me?.mustChangePassword
        ? await changePassword(password, nextPassword)
        : await login(email, password);
      setMe(result);
      setPassword("");
      setNextPassword("");
      setConfirmPassword("");
    } catch (reason) {
      setError(reason instanceof ApiError ? reason.message : "No se pudo iniciar sesión.");
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <main className="min-h-screen grid place-items-center bg-[var(--surface)] text-[var(--text)]"><p role="status">Comprobando tu sesión institucional…</p></main>;

  if (me && !me.mustChangePassword && me.studentId && me.user.roles.some((role) => ["STUDENT", "STUDENT_REP"].includes(role))) {
    return <SessionContext.Provider value={{ me, logout: leave }}>{children}</SessionContext.Provider>;
  }

  const changing = Boolean(me?.mustChangePassword);
  const forbidden = Boolean(me && !changing);
  return (
    <main className="min-h-screen grid place-items-center bg-[var(--surface)] text-[var(--text)] p-4">
      <section className="w-full max-w-md rounded-2xl border border-[var(--border)] bg-[var(--surface-raised)] p-6 sm:p-8 shadow-xl">
        <p className="text-xs font-bold uppercase tracking-widest text-[#89743A]">ISFDyT N.° 26 · Dolores</p>
        <h1 className="mt-3 text-2xl font-bold">{forbidden ? "Esta cuenta no tiene acceso al portal Alumno" : changing ? "Elegí tu contraseña" : "Ingresar al Panel de Alumno"}</h1>
        {forbidden ? (
          <div className="mt-5 space-y-4 text-sm text-[var(--text-muted)]">
            <p>Ingresaste como {me?.user.firstName} {me?.user.lastName}. Para usar este panel necesitás una cuenta de alumno vinculada por Secretaría.</p>
            <button onClick={() => void leave()} className="rounded-xl bg-[#14214F] px-4 py-2.5 font-semibold text-white">Ingresar con otra cuenta</button>
          </div>
        ) : (
          <>
            <p className="mt-2 text-sm text-[var(--text-muted)]">Usá la cuenta institucional asignada por Dirección. La misma cuenta comparte sesión con los demás portales.</p>
            <form onSubmit={(event) => void submit(event)} className="mt-6 space-y-4">
              {!changing && <label className="block text-sm font-medium">Email institucional<input className="mt-1 w-full rounded-lg border border-[var(--border)] bg-transparent px-3 py-2.5" type="email" autoComplete="username" required value={email} onChange={(event) => setEmail(event.target.value)} /></label>}
              <label className="block text-sm font-medium">{changing ? "Contraseña temporal o actual" : "Contraseña"}<input className="mt-1 w-full rounded-lg border border-[var(--border)] bg-transparent px-3 py-2.5" type="password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} /></label>
              {changing && <>
                <label className="block text-sm font-medium">Contraseña nueva<input className="mt-1 w-full rounded-lg border border-[var(--border)] bg-transparent px-3 py-2.5" type="password" autoComplete="new-password" minLength={8} required value={nextPassword} onChange={(event) => setNextPassword(event.target.value)} /></label>
                <label className="block text-sm font-medium">Repetir contraseña nueva<input className="mt-1 w-full rounded-lg border border-[var(--border)] bg-transparent px-3 py-2.5" type="password" autoComplete="new-password" minLength={8} required value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} /></label>
              </>}
              {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
              <button disabled={busy} className="w-full rounded-xl bg-[#14214F] px-4 py-3 font-bold text-white disabled:opacity-60">{busy ? "Procesando…" : changing ? "Guardar contraseña" : "Ingresar"}</button>
            </form>
            <p className="mt-5 text-xs text-[var(--text-muted)]">Si olvidaste la contraseña, pedí a Dirección que la restablezca.</p>
          </>
        )}
      </section>
    </main>
  );
}
