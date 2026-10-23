/**
 * Pantalla de Acceso (Login) - Módulo Alumno
 * Sistema de Asistencia Escolar
 * Responsable: Lucia Salgado
 */

import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  GraduationCap,
  Eye,
  EyeOff,
  LogIn,
  AlertCircle,
  ShieldCheck,
  UserCheck
} from 'lucide-react';

export const LoginView: React.FC = () => {
  const { login, isLoading } = useAuth();
  const [identifier, setIdentifier] = useState('ALU-2024-8841');
  const [password, setPassword] = useState('alumna1234');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const result = await login(identifier, password);
    if (!result.success && result.message) {
      setErrorMessage(result.message);
    }
  };

  const fillQuickDemo = (user: string, pass: string) => {
    setIdentifier(user);
    setPassword(pass);
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4 sm:p-6 bg-slate-100 dark:bg-slate-950 transition-colors">
      <div className="w-full max-w-md">
        {/* Cabecera institucional */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-blue-900 text-white shadow-md mb-3">
            <GraduationCap size={32} />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Sistema de Asistencia Escolar
          </h1>
          <p className="text-sm font-medium text-blue-800 dark:text-blue-400 mt-1">
            Módulo Alumno · Instituto N° 26
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Tecnicatura Superior en Desarrollo de Software
          </p>
        </div>

        {/* Tarjeta de Login */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg p-6 sm:p-8">
          <div className="mb-6 pb-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                Iniciar Sesión
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Acceso exclusivo para consulta de asistencia del alumno
              </p>
            </div>
            <div className="p-2 rounded bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400">
              <ShieldCheck size={18} />
            </div>
          </div>

          {/* Mensaje de validación o error */}
          {errorMessage && (
            <div
              className="mb-5 p-3 rounded-md bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs flex items-start gap-2"
              role="alert"
            >
              <AlertCircle size={16} className="text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Campo Usuario / Legajo */}
            <div>
              <label
                htmlFor="identifier"
                className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5"
              >
                Legajo o Usuario Institucional
              </label>
              <input
                id="identifier"
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="Ej. ALU-2024-8841"
                required
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-md text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white dark:focus:bg-slate-900 transition-colors"
              />
            </div>

            {/* Campo Contraseña con botón Mostrar/Ocultar */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="password"
                  className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider"
                >
                  Contraseña
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-xs text-blue-700 dark:text-blue-400 hover:underline flex items-center gap-1 focus:outline-none"
                >
                  {showPassword ? (
                    <>
                      <EyeOff size={13} />
                      <span>Ocultar</span>
                    </>
                  ) : (
                    <>
                      <Eye size={13} />
                      <span>Mostrar</span>
                    </>
                  )}
                </button>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Ingrese su contraseña"
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-md text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white dark:focus:bg-slate-900 transition-colors"
                />
              </div>
            </div>

            {/* Botón de envío con estado de carga */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 bg-blue-900 hover:bg-blue-800 text-white font-medium rounded-md text-sm transition-colors flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-sm"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Verificando credenciales...</span>
                  </>
                ) : (
                  <>
                    <LogIn size={16} />
                    <span>Ingresar al Panel Alumno</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Modo de Demostración - Explicación clara y sin engaños */}
          <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-start gap-2 text-xs text-slate-500 dark:text-slate-400 mb-3">
              <UserCheck size={16} className="text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
              <p>
                <strong>Modo de Demostración Académico:</strong> Datos ficticios precargados para evaluación de la interfaz. No ingrese claves personales bancarias ni reales.
              </p>
            </div>

            <div className="space-y-1.5">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-medium">
                Cuentas de prueba preconfiguradas:
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => fillQuickDemo('ALU-2024-8841', 'alumna1234')}
                  className="px-2.5 py-1.5 text-xs text-left bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700 rounded transition-colors text-slate-700 dark:text-slate-300"
                >
                  <span className="font-semibold block truncate">Lucia Salgado</span>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400">Regular (90%)</span>
                </button>
                <button
                  type="button"
                  onClick={() => fillQuickDemo('ALU-2024-8902', 'alumno5678')}
                  className="px-2.5 py-1.5 text-xs text-left bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-amber-300 dark:hover:border-amber-700 rounded transition-colors text-slate-700 dark:text-slate-300"
                >
                  <span className="font-semibold block truncate">Agustín Méndez</span>
                  <span className="text-[10px] text-amber-600 dark:text-amber-400">En riesgo (58%)</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Pie con autoría */}
        <div className="text-center mt-6 text-xs text-slate-500 dark:text-slate-400">
          <p>Proyecto: Sistema de Asistencia Escolar · Panel Alumno</p>
          <p className="mt-0.5 font-medium text-slate-700 dark:text-slate-300">
            Responsable: Lucia Salgado · Tecnicatura en Desarrollo de Software
          </p>
        </div>
      </div>
    </div>
  );
};
