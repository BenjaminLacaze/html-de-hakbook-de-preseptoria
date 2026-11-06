import React, { useState } from 'react';
import { Eye, EyeOff, LockKeyhole, UserRound } from 'lucide-react';
import { InstitutionalCrest } from './InstitutionalCrest';
import { useAuth } from '../../context/AuthContext';

export const LoginScreen: React.FC = () => {
  const { signIn, error } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    await signIn(username, password);
    setIsSubmitting(false);
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#F8F9FA] px-4 py-10">
      <section className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
        <div className="bg-[#14214F] px-8 py-9 text-center text-white">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/10 ring-1 ring-[#D4C08A]/50">
            <InstitutionalCrest size={46} />
          </div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#D4C08A]">ISFDyT N.° 26 · Dolores</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">Perfil Directivo</h1>
          <p className="mt-2 text-sm text-white/70">Ingresá con tu usuario institucional de la aplicación</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 px-8 py-8">
          <div>
            <label htmlFor="username" className="mb-1.5 block text-sm font-medium text-slate-700">Usuario</label>
            <div className="relative">
              <UserRound aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                id="username"
                name="username"
                autoComplete="username"
                autoCapitalize="none"
                required
                maxLength={80}
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-900 outline-none transition focus:border-[#89743A] focus:ring-2 focus:ring-[#89743A]/20"
                placeholder="Tu nombre de usuario"
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-slate-700">Contraseña</label>
            <div className="relative">
              <LockKeyhole aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
                maxLength={256}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-11 text-sm text-slate-900 outline-none transition focus:border-[#89743A] focus:ring-2 focus:ring-[#89743A]/20"
                placeholder="Tu contraseña"
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1.5 text-slate-500 hover:bg-slate-100"
                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {error && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-800">{error}</p>}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg bg-[#14214F] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#1E3276] disabled:cursor-wait disabled:opacity-60"
          >
            {isSubmitting ? 'Ingresando…' : 'Iniciar sesión'}
          </button>
          <p className="text-center text-xs text-slate-500">Acceso privado para personal autorizado.</p>
        </form>
      </section>
    </main>
  );
};
