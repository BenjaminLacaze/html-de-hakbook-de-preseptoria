import React from 'react';

interface ModuleMarkProps {
  className?: string;
  isCompact?: boolean;
}

/**
 * Marca provisoria del módulo Panel de Auxiliares
 * Fuente: Manual de Marca ISFDyT N° 26
 * Aislado para reemplazo directo cuando se oficialice el isotipo
 */
export const ModuleMark: React.FC<ModuleMarkProps> = ({ className = '', isCompact = false }) => {
  return (
    <div className={`flex flex-col select-none ${className}`}>
      <div className="flex items-center gap-2">
        <span
          className="font-heading font-extrabold text-white tracking-[0.22em] uppercase text-xl leading-none"
          style={{ letterSpacing: '0.22em' }}
        >
          AUXILIARES
        </span>
        <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#AF9B63] text-white tracking-wider uppercase">
          N° 26
        </span>
      </div>
      {!isCompact && (
        <span className="text-[11px] font-medium text-slate-300 tracking-wider uppercase mt-1">
          ISFDyT N° 26 · Servicios Generales
        </span>
      )}
    </div>
  );
};
