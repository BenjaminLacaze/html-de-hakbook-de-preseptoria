import React from 'react';
import {
  Bell,
  CheckSquare,
  CaretDown,
  GraduationCap,
  Info,
  Clock,
  Play
} from '@phosphor-icons/react';
import { usePreceptor } from '../../context/PreceptorContext';
import negativeLogoUrl from '../../assets/preceptores-logo-negativo.svg';
import marcaLogoUrl from '../../assets/preceptores-logo-marca.svg';

export const TopBar: React.FC = () => {
  const {
    currentCourse,
    setCurrentCourse,
    availableCourses,
    setActiveScreen,
    activeScreen,
    counts,
    setIsNotificationDrawerOpen,
    openIntroVideo,
    courseLoading
  } = usePreceptor();

  return (
    <header className="sticky top-0 z-20 w-full bg-[var(--bg-surface)] border-b border-[var(--border-subtle)] transition-colors">
      {/* Mobile Navy Header */}
      <div className="flex lg:hidden items-center justify-between px-3.5 py-2.5 bg-[var(--brand-navy)] text-white">
        <div className="flex items-center gap-2 max-w-[55%] truncate">
          <div className="bg-white rounded-lg p-1 px-1.5 flex items-center justify-center shrink-0">
            <img
              src={`${import.meta.env.BASE_URL}assets/aistudio/image_5bcba208.png`}
              alt="Preceptores"
              className="h-6 w-auto object-contain"
            />
          </div>
          <div className="truncate">
            <span className="font-heading font-extrabold text-xs tracking-wider text-white block truncate leading-none">
              PRECEPTORES
            </span>
            <span className="text-[9px] font-mono text-[#AF9B63] block">
              ISFDyT N° 26
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Mobile Course Selector */}
          <div className="relative">
            <select
              value={currentCourse.id}
              onChange={(e) => {
                const found = availableCourses.find(c => c.id === e.target.value);
                if (found) setCurrentCourse(found);
              }}
              className="appearance-none bg-white/10 text-white text-xs font-medium pl-2.5 pr-6 py-1.5 rounded-lg border border-white/20 focus:outline-none focus:ring-2 focus:ring-[#3F78B6] cursor-pointer"
              aria-label="Seleccionar curso activo"
            >
              {availableCourses.map(c => (
                <option key={c.id} value={c.id} className="text-slate-900 bg-white">
                  {c.yearLabel} · {c.careerName}
                </option>
              ))}
            </select>
            <CaretDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-slate-300" />
          </div>

          {/* Bell Icon with badge */}
          <button
            type="button"
            onClick={() => setIsNotificationDrawerOpen(true)}
            className="relative p-2 text-slate-200 hover:text-white rounded-lg transition-colors cursor-pointer"
            aria-label="Abrir centro de notificaciones"
          >
            <Bell size={20} weight={counts.unreadNotifications > 0 ? "fill" : "regular"} />
            {counts.unreadNotifications > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-amber-400 rounded-full border border-[var(--brand-navy)]" />
            )}
          </button>
        </div>
      </div>

      {/* Desktop Header */}
      <div className="hidden lg:flex items-center justify-between px-6 py-3">
        {/* Left: Context Breadcrumb / Course Selector */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs text-[var(--text-muted)] font-mono-data uppercase tracking-wider">
            <GraduationCap size={18} className="text-[#89743A]" />
            <span>CURSO ACTIVO:</span>
          </div>

          <div className="relative inline-block">
            <select
              value={currentCourse.id}
              onChange={(e) => {
                const found = availableCourses.find(c => c.id === e.target.value);
                if (found) setCurrentCourse(found);
              }}
              className="appearance-none bg-[var(--bg-surface-elevated)] text-[var(--text-primary)] text-xs font-semibold pl-3 pr-8 py-1.5 rounded-lg border border-[var(--border-strong)] hover:border-[#3F78B6] focus:outline-none focus:ring-2 focus:ring-[#3F78B6] cursor-pointer transition-colors shadow-2xs"
              aria-label="Seleccionar carrera y año lectivo"
            >
              {availableCourses.map(c => (
                <option key={c.id} value={c.id}>
                  {c.yearLabel} · {c.careerName} ({c.shift})
                </option>
              ))}
            </select>
            <CaretDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--text-muted)]" />
          </div>

          {courseLoading && (
            <span className="hidden xl:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md font-mono-data text-[11px] bg-slate-200 dark:bg-slate-800 text-[var(--text-muted)] border border-[var(--border-subtle)]" role="status">
              <Info size={12} />
              <span>Actualizando asistencia…</span>
            </span>
          )}
        </div>

        {/* Right Actions: Notifications Bell, Video & Primary CTA */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={openIntroVideo}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface-elevated)] hover:border-[#89743A] text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
            title="Ver video institucional de presentación"
          >
            <Play size={13} weight="fill" className="text-[#89743A]" />
            <span className="hidden xl:inline">Video institucional</span>
          </button>

          <button
            type="button"
            onClick={() => setIsNotificationDrawerOpen(true)}
            className="relative p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-lg hover:bg-[var(--bg-surface-elevated)] transition-colors cursor-pointer border border-[var(--border-subtle)]"
            aria-label={`Notificaciones (${counts.unreadNotifications} sin leer)`}
          >
            <Bell size={18} weight={counts.unreadNotifications > 0 ? "fill" : "regular"} className={counts.unreadNotifications > 0 ? "text-[#89743A]" : ""} />
            {counts.unreadNotifications > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#89743A] text-white font-mono-data text-[10px] font-bold px-1.5 py-0.2 rounded-full min-w-4 text-center">
                {counts.unreadNotifications}
              </span>
            )}
          </button>

          {activeScreen !== 'asistencia' && (
            <button
              type="button"
              onClick={() => setActiveScreen('asistencia')}
              className="flex items-center gap-2 px-4 py-2 bg-[#89743A] hover:bg-[#73612F] text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow-xs hover:shadow transition-all cursor-pointer"
            >
              <CheckSquare size={16} weight="bold" />
              <span>Tomar asistencia</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
