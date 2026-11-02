/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  User,
  Palette,
  SignOut,
  IdentificationCard,
  ShieldCheck,
  Envelope,
  Phone,
  MapPin,
  Clock,
  Info,
  Check,
  TextT,
  Table
} from '@phosphor-icons/react';
import { usePreceptor } from '../../context/PreceptorContext';
import { WEEKDAY_LABELS } from '../../api';
import {
  THEME_OPTIONS,
  ThemeId,
  getStoredTheme,
  setStoredTheme,
  getStoredTextSize,
  setStoredTextSize,
  getStoredDensity,
  setStoredDensity,
  TextSize,
  TableDensity
} from '../../config/theme';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { toast } from 'sonner';

export const PerfilScreen: React.FC = () => {
  const { profile, logout } = usePreceptor();
  const [currentTheme, setCurrentTheme] = useState<ThemeId>(getStoredTheme);
  const [currentSize, setCurrentSize] = useState<TextSize>(getStoredTextSize);
  const [currentDensity, setCurrentDensity] = useState<TableDensity>(getStoredDensity);

  // Logout state
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleSelectTheme = (themeId: ThemeId) => {
    setCurrentTheme(themeId);
    setStoredTheme(themeId);
    toast.success(`Tema ${themeId.toUpperCase()} aplicado con persistencia.`);
  };

  const handleSelectTextSize = (size: TextSize) => {
    setCurrentSize(size);
    setStoredTextSize(size);
    toast.success(`Tamaño de texto ajustado a ${size}.`);
  };

  const handleSelectDensity = (density: TableDensity) => {
    setCurrentDensity(density);
    setStoredDensity(density);
    toast.success(`Densidad de tablas cambiada a ${density}.`);
  };

  const handleConfirmLogout = () => {
    setShowLogoutConfirm(false);
    void logout();
  };

  const notAvailable = <span className="text-[var(--text-muted)] italic">No informado por el sistema</span>;

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <section className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-5 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-mono-data text-[#89743A] uppercase font-semibold">
              CUENTA Y PREFERENCIAS VISUALES
            </span>
            <h1 className="font-heading font-extrabold text-2xl text-[var(--text-primary)] mt-1">
              Mi Perfil y <span className="text-[#89743A]">Apariencia</span>
            </h1>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">
              Ficha del preceptor a cargo, selección de los 6 temas institucionales y ajuste tipográfico.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowLogoutConfirm(true)}
            className="px-4 py-2 bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300 border border-red-300 dark:border-red-900 rounded-lg text-xs font-semibold hover:bg-red-100 transition-colors cursor-pointer flex items-center gap-1.5 self-start md:self-auto"
          >
            <SignOut size={16} weight="bold" />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </section>

      {/* 1. Datos del Preceptor */}
      <section className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-5 shadow-2xs space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-[var(--border-subtle)]">
          <IdentificationCard size={20} className="text-[#89743A]" />
          <h2 className="font-heading font-bold text-base text-[var(--text-primary)] uppercase tracking-wide">
            Ficha del Agente Educativo
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="space-y-3 bg-[var(--bg-surface-elevated)] p-4 rounded-xl border border-[var(--border-subtle)]">
            <div>
              <span className="text-[var(--text-muted)] block text-[11px]">Apellido y Nombre</span>
              <strong className="text-sm font-heading text-[var(--text-primary)]">{profile.apellido}, {profile.nombre}</strong>
            </div>

            <div>
              <span className="text-[var(--text-muted)] block text-[11px]">Rol en el sistema</span>
              <strong className="text-[var(--text-primary)]">{profile.roleLabel} (ISFDyT N° 26)</strong>
            </div>

            <div>
              <span className="text-[var(--text-muted)] block text-[11px]">Cargo / legajo interno</span>
              {profile.position ? <span className="text-[var(--text-primary)] font-semibold">{profile.position}</span> : notAvailable}
            </div>

            <div>
              <span className="text-[var(--text-muted)] block text-[11px]">Carreras y Cursos Asignados</span>
              {profile.carrerasAsignadas.length ? (
                <ul className="list-disc list-inside space-y-0.5 text-[var(--text-secondary)] mt-1">
                  {profile.carrerasAsignadas.map((c, i) => (
                    <li key={i}>{c}</li>
                  ))}
                </ul>
              ) : notAvailable}
            </div>
          </div>

          <div className="space-y-3 bg-[var(--bg-surface-elevated)] p-4 rounded-xl border border-[var(--border-subtle)]">
            <div className="flex items-start gap-2.5">
              <Envelope size={16} className="text-[#3F78B6] shrink-0 mt-0.5" />
              <div>
                <span className="text-[var(--text-muted)] block text-[11px]">Correo Electrónico Institucional</span>
                <span className="font-mono-data text-[var(--text-primary)] font-medium">{profile.email}</span>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <Phone size={16} className="text-[#3F78B6] shrink-0 mt-0.5" />
              <div>
                <span className="text-[var(--text-muted)] block text-[11px]">Teléfono</span>
                {profile.phone ? <span className="font-mono-data text-[var(--text-primary)] font-medium">{profile.phone}</span> : notAvailable}
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <MapPin size={16} className="text-[#89743A] shrink-0 mt-0.5" />
              <div>
                <span className="text-[var(--text-muted)] block text-[11px]">Oficina</span>
                {notAvailable}
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <Clock size={16} className="text-[#89743A] shrink-0 mt-0.5" />
              <div>
                <span className="text-[var(--text-muted)] block text-[11px]">Horario de atención</span>
                {profile.availability.length ? (
                  <span className="text-[var(--text-primary)] font-medium">
                    {profile.availability.map(a => `${WEEKDAY_LABELS[a.dayOfWeek] ?? ''} ${a.startTime}–${a.endTime}`).join(' · ')}
                  </span>
                ) : notAvailable}
              </div>
            </div>
          </div>
        </div>

        {profile.bio && (
          <p className="text-xs text-[var(--text-secondary)] bg-[var(--bg-surface-elevated)] p-3 rounded-lg border border-[var(--border-subtle)] whitespace-pre-line">
            {profile.bio}
          </p>
        )}

        {/* Notice for uneditable fields */}
        <div className="p-3 bg-slate-100 dark:bg-slate-900 border border-[var(--border-subtle)] rounded-lg text-xs text-[var(--text-secondary)] flex items-center gap-2">
          <Info size={18} className="text-[#89743A] shrink-0" />
          <span>
            <strong>Información protegida:</strong> Tus comisiones a cargo las asigna Dirección. Para modificar datos de la cuenta o comisiones asignadas, pedilo a <strong>Dirección / Secretaría</strong>.
          </span>
        </div>
      </section>

      {/* 2. Selector de 6 Temas Institucionales */}
      <section className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-5 shadow-2xs space-y-4">
        <div className="pb-2 border-b border-[var(--border-subtle)] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Palette size={20} className="text-[#89743A]" />
            <h2 className="font-heading font-bold text-base text-[var(--text-primary)] uppercase tracking-wide">
              Temas de Interfaz (Manual ISFDyT 26)
            </h2>
          </div>
          <span className="text-xs text-[var(--text-muted)] font-mono-data">
            Contraste WCAG AA garantizado
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {THEME_OPTIONS.map(theme => {
            const isSelected = currentTheme === theme.id;
            return (
              <button
                key={theme.id}
                type="button"
                onClick={() => handleSelectTheme(theme.id)}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer relative ${
                  isSelected
                    ? 'border-[#89743A] ring-2 ring-[#89743A]/40 shadow-sm bg-[var(--bg-surface-elevated)]'
                    : 'border-[var(--border-subtle)] hover:border-[var(--border-strong)] bg-[var(--bg-surface)]'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-heading font-bold text-sm text-[var(--text-primary)]">
                    {theme.name}
                  </span>
                  {isSelected && (
                    <span className="p-1 rounded-full bg-[#89743A] text-white">
                      <Check size={12} weight="bold" />
                    </span>
                  )}
                </div>

                {/* Color swatches preview */}
                <div className="flex items-center gap-1.5 mb-2">
                  <span className="w-5 h-5 rounded-md border border-black/10 shadow-2xs" style={{ backgroundColor: theme.bgHex }} title="Fondo de página" />
                  <span className="w-5 h-5 rounded-md border border-black/10 shadow-2xs" style={{ backgroundColor: theme.sidebarHex }} title="Barra lateral" />
                  <span className="w-5 h-5 rounded-md border border-black/10 shadow-2xs" style={{ backgroundColor: theme.accentHex }} title="Acento dorado" />
                </div>

                <p className="text-[11px] text-[var(--text-secondary)] leading-snug">
                  {theme.tagline}
                </p>
              </button>
            );
          })}
        </div>
      </section>

      {/* 3. Accesibilidad: Tamaño de Texto y Densidad de Tablas */}
      <section className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-5 shadow-2xs space-y-4">
        <h2 className="font-heading font-bold text-base text-[var(--text-primary)] uppercase tracking-wide pb-2 border-b border-[var(--border-subtle)]">
          Comodidad Visual y Densidad
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          {/* Tamaño de texto */}
          <div className="p-4 rounded-xl bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] space-y-2">
            <div className="flex items-center gap-1.5 text-[var(--text-primary)] font-semibold">
              <TextT size={18} className="text-[#89743A]" />
              <span>Tamaño de Texto General</span>
            </div>
            <p className="text-[var(--text-muted)] text-[11px]">
              Texto base de lectura conforme a la norma institucional (15–16px estándar o 17px ampliado).
            </p>
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => handleSelectTextSize('normal')}
                className={`flex-1 py-2 px-3 rounded-lg border font-semibold transition-colors cursor-pointer ${
                  currentSize === 'normal'
                    ? 'bg-[var(--brand-navy)] text-white border-[var(--brand-navy)]'
                    : 'bg-[var(--bg-surface)] text-[var(--text-secondary)] border-[var(--border-strong)]'
                }`}
              >
                Normal (15px)
              </button>
              <button
                type="button"
                onClick={() => handleSelectTextSize('grande')}
                className={`flex-1 py-2 px-3 rounded-lg border font-semibold transition-colors cursor-pointer ${
                  currentSize === 'grande'
                    ? 'bg-[var(--brand-navy)] text-white border-[var(--brand-navy)]'
                    : 'bg-[var(--bg-surface)] text-[var(--text-secondary)] border-[var(--border-strong)]'
                }`}
              >
                Grande (17px)
              </button>
            </div>
          </div>

          {/* Densidad de tablas */}
          <div className="p-4 rounded-xl bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] space-y-2">
            <div className="flex items-center gap-1.5 text-[var(--text-primary)] font-semibold">
              <Table size={18} className="text-[#3F78B6]" />
              <span>Densidad de Filas en Tablas</span>
            </div>
            <p className="text-[var(--text-muted)] text-[11px]">
              Ajusta el espaciado vertical en el historial y listas de alumnos para monitores de alta resolución.
            </p>
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => handleSelectDensity('comoda')}
                className={`flex-1 py-2 px-3 rounded-lg border font-semibold transition-colors cursor-pointer ${
                  currentDensity === 'comoda'
                    ? 'bg-[var(--brand-navy)] text-white border-[var(--brand-navy)]'
                    : 'bg-[var(--bg-surface)] text-[var(--text-secondary)] border-[var(--border-strong)]'
                }`}
              >
                Cómoda (Amplia)
              </button>
              <button
                type="button"
                onClick={() => handleSelectDensity('compacta')}
                className={`flex-1 py-2 px-3 rounded-lg border font-semibold transition-colors cursor-pointer ${
                  currentDensity === 'compacta'
                    ? 'bg-[var(--brand-navy)] text-white border-[var(--brand-navy)]'
                    : 'bg-[var(--bg-surface)] text-[var(--text-secondary)] border-[var(--border-strong)]'
                }`}
              >
                Compacta (Densa)
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Logout confirmation dialog */}
      <ConfirmDialog
        isOpen={showLogoutConfirm}
        title="¿Cerrar sesión en el Panel de Preceptores?"
        description="Se cerrará tu sesión institucional en este navegador (y en los demás portales que comparten la cuenta)."
        confirmLabel="Cerrar sesión"
        cancelLabel="Cancelar"
        onConfirm={handleConfirmLogout}
        onCancel={() => setShowLogoutConfirm(false)}
      />
    </div>
  );
};
