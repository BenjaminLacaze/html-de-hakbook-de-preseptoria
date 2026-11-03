/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * ISFDyT N° 26 - Insignias con color + ícono + texto (contraste AA)
 */

import React from 'react';
import {
  BookOpen,
  Sparkle,
  Trophy,
  Users,
  Clock,
  HourglassMedium,
  ArrowBendUpRight,
  CheckCircle,
  Archive,
  PushPin,
  CalendarCheck,
  WarningCircle,
} from '@phosphor-icons/react';
import { EventCategory, ReclamoEstado } from '../../types';

interface EventCategoryBadgeProps {
  category: EventCategory;
  className?: string;
}

export const EventCategoryBadge: React.FC<EventCategoryBadgeProps> = ({ category, className = '' }) => {
  const config = {
    academico: {
      label: 'Académico',
      icon: <BookOpen weight="bold" className="w-3.5 h-3.5" />,
      classes: 'bg-[#3F78B6]/15 text-[#245487] dark:text-[#90BAE6] border border-[#3F78B6]/30',
    },
    cultural: {
      label: 'Cultural',
      icon: <Sparkle weight="bold" className="w-3.5 h-3.5" />,
      classes: 'bg-[#AF9B63]/20 text-[#6B5A2D] dark:text-[#E2D2A5] border border-[#AF9B63]/40',
    },
    deportivo: {
      label: 'Deportivo',
      icon: <Trophy weight="bold" className="w-3.5 h-3.5" />,
      classes: 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30',
    },
    reunion: {
      label: 'Reunión',
      icon: <Users weight="bold" className="w-3.5 h-3.5" />,
      classes: 'bg-[#14214F]/10 dark:bg-white/10 text-[#14214F] dark:text-slate-100 border border-[#14214F]/25 dark:border-white/20',
    },
  }[category];

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-medium font-sans ${config.classes} ${className}`}
    >
      {config.icon}
      <span>{config.label}</span>
    </span>
  );
};

interface ReclamoStatusBadgeProps {
  estado: ReclamoEstado;
  className?: string;
}

export const ReclamoStatusBadge: React.FC<ReclamoStatusBadgeProps> = ({ estado, className = '' }) => {
  const config = {
    recibido: {
      label: 'Recibido',
      icon: <Clock weight="bold" className="w-3.5 h-3.5" />,
      classes: 'bg-slate-200/70 text-slate-800 dark:bg-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700',
    },
    en_revision: {
      label: 'En revisión',
      icon: <HourglassMedium weight="bold" className="w-3.5 h-3.5" />,
      classes: 'bg-amber-100/90 text-amber-900 dark:bg-amber-950/70 dark:text-amber-200 border border-amber-300/80 dark:border-amber-700',
    },
    derivado: {
      label: 'Derivado',
      icon: <ArrowBendUpRight weight="bold" className="w-3.5 h-3.5" />,
      classes: 'bg-sky-100/90 text-sky-900 dark:bg-sky-950/70 dark:text-sky-200 border border-sky-300/80 dark:border-sky-700',
    },
    respondido: {
      label: 'Respondido',
      icon: <CheckCircle weight="bold" className="w-3.5 h-3.5" />,
      classes: 'bg-emerald-100/90 text-emerald-900 dark:bg-emerald-950/70 dark:text-emerald-200 border border-emerald-300/80 dark:border-emerald-700',
    },
    archivado: {
      label: 'Archivado',
      icon: <Archive weight="bold" className="w-3.5 h-3.5" />,
      classes: 'bg-gray-200/80 text-gray-700 dark:bg-gray-800/80 dark:text-gray-300 border border-gray-300 dark:border-gray-700',
    },
  }[estado];

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-semibold font-sans ${config.classes} ${className}`}
    >
      {config.icon}
      <span>{config.label}</span>
    </span>
  );
};

export const PinnedBadge: React.FC = () => (
  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold bg-brand-gold/15 text-brand-gold dark:text-[#E2D2A5] border border-brand-gold/30">
    <PushPin weight="fill" className="w-3 h-3" />
    <span>Fijado</span>
  </span>
);

export const ScheduledBadge: React.FC = () => (
  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/30">
    <CalendarCheck weight="bold" className="w-3 h-3" />
    <span>Programado</span>
  </span>
);

export const ReportedBadge: React.FC = () => (
  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold bg-rose-500/15 text-rose-800 dark:text-rose-300 border border-rose-500/30">
    <WarningCircle weight="bold" className="w-3 h-3" />
    <span>Denunciado</span>
  </span>
);
