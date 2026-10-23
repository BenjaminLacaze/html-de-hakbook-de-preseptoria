import React from 'react';
import { Info, RotateCcw } from 'lucide-react';

interface DemoBannerProps {
  onResetData: () => void;
}

export const DemoBanner: React.FC<DemoBannerProps> = ({ onResetData }) => {
  return (
    <aside
      aria-label="Aviso institucional de demostración"
      style={{
        backgroundColor: 'var(--isf-gold-light)',
        borderBottom: '1px solid var(--isf-gold-border)',
        padding: '0.625rem 1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.75rem',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
        <Info size={18} color="var(--isf-gold-ochre)" aria-hidden="true" style={{ flexShrink: 0 }} />
        <p style={{ fontSize: '0.84rem', color: '#554215', margin: 0, lineHeight: 1.4 }}>
          <strong>MÓDULO DE DEMOSTRACIÓN FRONTEND:</strong> Este sistema opera con datos simulados locales.
          Las asistencias y observaciones registradas tienen fines de prueba de interfaz y <strong>no constituyen registros oficiales</strong> con validez institucional.
        </p>
      </div>
      <button
        type="button"
        onClick={onResetData}
        className="btn btn-secondary btn-sm"
        style={{
          fontSize: '0.8rem',
          padding: '0.25rem 0.65rem',
          borderColor: 'var(--isf-gold-border)',
          backgroundColor: '#FFFFFF',
          color: 'var(--isf-gold-ochre)',
          minHeight: '32px',
        }}
        title="Restablecer datos simulados a su estado original"
        aria-label="Restablecer datos de prueba a valores iniciales"
      >
        <RotateCcw size={14} aria-hidden="true" />
        <span>Restablecer datos demo</span>
      </button>
    </aside>
  );
};
