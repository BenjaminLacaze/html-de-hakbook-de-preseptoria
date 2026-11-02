import React from 'react';
import { ShieldCheck, SignIn, CheckCircle } from '@phosphor-icons/react';
import { ModuleMark } from '../components/ModuleMark';

/** Se muestra después de POST /auth/logout; "Volver a ingresar" lleva al formulario de acceso. */
export const SesionCerradaScreen: React.FC<{ onContinue: () => void }> = ({ onContinue }) => {
  return (
    <div className="min-h-screen bg-[#14214F] text-white flex flex-col items-center justify-center p-4 text-center">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-2xl p-8 shadow-2xl border border-white/20 space-y-6">
        {/* Module Brand Header */}
        <div className="bg-[#14214F] p-4 rounded-xl inline-block w-full">
          <ModuleMark />
        </div>

        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
          <CheckCircle size={40} weight="fill" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-bold text-[#89743A] uppercase tracking-wider block">
            ISFDyT N° 26 · Servicios Generales
          </span>
          <h1 className="text-2xl font-heading font-extrabold text-slate-900 dark:text-white">
            Sesión cerrada
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Cerraste tu sesión en el Panel de Auxiliares. Lo que registraste quedó guardado en el
            sistema institucional.
          </p>
        </div>

        <div className="pt-2">
          <button
            type="button"
            onClick={onContinue}
            className="touch-target w-full py-3.5 rounded-xl bg-[#89743A] hover:brightness-110 active:brightness-95 text-white font-extrabold text-base shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <SignIn size={20} weight="bold" />
            <span>Volver a ingresar</span>
          </button>
        </div>

        <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400">
          <ShieldCheck size={16} />
          <span>Instituto Superior de Formación Docente y Técnica N° 26</span>
        </div>
      </div>
    </div>
  );
};
