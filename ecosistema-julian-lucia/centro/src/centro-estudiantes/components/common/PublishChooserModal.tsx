/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * ISFDyT N° 26 - Modal selector de publicación rápida
 */

import React from 'react';
import { Megaphone, CalendarPlus, ChatCircleText } from '@phosphor-icons/react';
import { useCentro } from '../../context/CentroContext';
import { Dialog } from './Dialog';

export const PublishChooserModal: React.FC = () => {
  const {
    openPublishModal,
    setOpenPublishModal,
    setCurrentScreen,
    setSelectedDetailId,
  } = useCentro();

  if (!openPublishModal) return null;

  const handleSelect = (screen: 'comunicados' | 'eventos' | 'foros') => {
    setSelectedDetailId(null);
    setCurrentScreen(screen);
    setOpenPublishModal(false);
  };

  return (
    <Dialog
      isOpen={openPublishModal}
      onClose={() => setOpenPublishModal(false)}
      title="¿Qué querés publicar al Centro?"
      description="Elegí el tipo de publicación para toda la comunidad del ISFDyT N° 26."
      maxWidth="sm"
    >
      <div className="space-y-2.5">
        <button
          type="button"
          onClick={() => handleSelect('comunicados')}
          className="w-full p-4 rounded-xl border border-border-subtle bg-surface hover:bg-surface-hover flex items-start gap-3.5 text-left transition-colors min-h-[44px] group"
        >
          <div className="p-2.5 rounded-xl bg-brand-navy/10 text-brand-navy dark:bg-white/10 dark:text-white group-hover:scale-105 transition-transform shrink-0">
            <Megaphone weight="bold" className="w-6 h-6" />
          </div>
          <div>
            <div className="text-sm font-heading font-bold text-foreground">
              Comunicado Institucional
            </div>
            <div className="text-xs text-foreground-muted mt-0.5 leading-relaxed">
              Cartelera digital, normativas, mesas de examen y avisos del Centro.
            </div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => handleSelect('eventos')}
          className="w-full p-4 rounded-xl border border-border-subtle bg-surface hover:bg-surface-hover flex items-start gap-3.5 text-left transition-colors min-h-[44px] group"
        >
          <div className="p-2.5 rounded-xl bg-brand-gold/15 text-brand-gold group-hover:scale-105 transition-transform shrink-0">
            <CalendarPlus weight="bold" className="w-6 h-6" />
          </div>
          <div>
            <div className="text-sm font-heading font-bold text-foreground">
              Actividad o Evento
            </div>
            <div className="text-xs text-foreground-muted mt-0.5 leading-relaxed">
              Asambleas, talleres, jornadas culturales o torneos con cupo y lista de inscriptos.
            </div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => handleSelect('foros')}
          className="w-full p-4 rounded-xl border border-border-subtle bg-surface hover:bg-surface-hover flex items-start gap-3.5 text-left transition-colors min-h-[44px] group"
        >
          <div className="p-2.5 rounded-xl bg-brand-blue/15 text-brand-blue group-hover:scale-105 transition-transform shrink-0">
            <ChatCircleText weight="bold" className="w-6 h-6" />
          </div>
          <div>
            <div className="text-sm font-heading font-bold text-foreground">
              Hilo en los Foros
            </div>
            <div className="text-xs text-foreground-muted mt-0.5 leading-relaxed">
              Debate participativo en canal general, propuestas o actividades.
            </div>
          </div>
        </button>
      </div>
    </Dialog>
  );
};
