/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  House,
  CheckSquare,
  Users,
  CalendarCheck,
  FileText,
  Megaphone,
  ChatCircleDots,
  ChartLineUp,
  ChatTeardropText,
  UsersThree,
  Palette,
  Gear,
  SignOut,
  User,
  Play
} from '@phosphor-icons/react';
import { usePreceptor, ScreenId } from '../../context/PreceptorContext';
import negativeLogoUrl from '../../assets/preceptores-logo-negativo.svg';

interface NavItem {
  id: ScreenId;
  label: string;
  icon: React.ComponentType<any>;
  badge?: number;
  badgeColor?: string;
}

export const Sidebar: React.FC = () => {
  const { activeScreen, setActiveScreen, counts, openIntroVideo, profile, logout } = usePreceptor();
  const initials = `${profile.nombre.charAt(0)}${profile.apellido.charAt(0)}`.toUpperCase();

  const cursosNav: NavItem[] = [
    { id: 'inicio', label: 'Inicio', icon: House },
    { id: 'asistencia', label: 'Tomar asistencia', icon: CheckSquare },
    { id: 'alumnos', label: 'Alumnos', icon: Users },
    { id: 'historial', label: 'Historial de asistencia', icon: CalendarCheck },
  ];

  const gestionNav: NavItem[] = [
    {
      id: 'justificaciones',
      label: 'Justificaciones',
      icon: FileText,
      badge: counts.pendingJustifications
    },
    { id: 'anuncios', label: 'Anuncios', icon: Megaphone },
    {
      id: 'mensajes',
      label: 'Mensajes',
      icon: ChatCircleDots,
      badge: counts.unreadMessages
    },
    {
      id: 'analisis',
      label: 'Análisis y alertas',
      icon: ChartLineUp,
      badge: counts.atRiskStudents > 0 ? counts.atRiskStudents : undefined,
      badgeColor: 'bg-amber-500 text-amber-950 font-bold'
    },
  ];

  const comunidadNav: NavItem[] = [
    { id: 'comunidad', label: 'Foros y Centro', icon: UsersThree },
  ];

  const bottomNav: NavItem[] = [
    { id: 'opciones', label: 'Opciones', icon: Gear },
    { id: 'perfil', label: 'Mi perfil y Apariencia', icon: User },
  ];

  const renderNavGroup = (title: string, items: NavItem[]) => (
    <div className="space-y-1">
      <p className="px-3 text-[11px] font-heading font-bold uppercase tracking-wider text-[#AF9B63] select-none">
        {title}
      </p>
      <div className="space-y-0.5">
        {items.map(item => {
          const Icon = item.icon;
          const isActive = activeScreen === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveScreen(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all group cursor-pointer text-left ${
                isActive
                  ? 'bg-[#89743A] text-white shadow-xs font-semibold'
                  : 'text-slate-200 hover:bg-white/10 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5 truncate">
                <Icon
                  size={18}
                  weight={isActive ? 'bold' : 'regular'}
                  className={isActive ? 'text-white' : 'text-[#AF9B63] group-hover:text-white'}
                />
                <span className="truncate">{item.label}</span>
              </div>
              {item.badge !== undefined && item.badge > 0 && (
                <span
                  className={`px-1.5 py-0.5 rounded-full font-mono-data text-[10px] shrink-0 ${
                    item.badgeColor
                      ? item.badgeColor
                      : isActive
                      ? 'bg-white text-[#89743A] font-bold'
                      : 'bg-[#89743A] text-white font-semibold'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <aside className="hidden lg:flex flex-col w-64 h-screen sticky top-0 shrink-0 bg-[var(--brand-navy)] text-white border-r border-[#1E2B52] z-30 select-none">
      {/* Official Brand Logo Header with Uploaded Pencil P Asset */}
      <div className="p-3.5 border-b border-white/10 flex flex-col items-center justify-center bg-black/10">
        <div className="bg-white rounded-xl p-2 px-3 shadow-md flex items-center justify-center border border-[#AF9B63]/40 w-full">
          <img
            src={`${import.meta.env.BASE_URL}assets/aistudio/image_5bcba208.png`}
            alt="PRECEPTORES — ISFDyT N° 26"
            className="h-11 w-auto max-w-full object-contain"
          />
        </div>
        <div className="flex items-center gap-2 mt-2 text-[10px] font-mono tracking-widest text-[#AF9B63] uppercase">
          <span>ISFDyT N° 26</span>
          <span>·</span>
          <span>ASISTENCIA</span>
        </div>
      </div>

      {/* Navigation Groups */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        {renderNavGroup('Cursos', cursosNav)}
        {renderNavGroup('Gestión', gestionNav)}
        {renderNavGroup('Comunidad', comunidadNav)}
      </div>

      {/* User Card & Settings */}
      <div className="p-3 border-t border-white/10 bg-black/15 space-y-2">
        <div className="space-y-0.5">
          {/* Institutional Video Replay Button */}
          <button
            type="button"
            onClick={openIntroVideo}
            className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#AF9B63] hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="Ver video institucional de presentación"
          >
            <Play size={15} weight="fill" className="text-[#AF9B63]" />
            <span>Video de presentación</span>
          </button>

          {bottomNav.map(item => {
            const Icon = item.icon;
            const isActive = activeScreen === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveScreen(item.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-[#89743A] text-white font-semibold'
                    : 'text-slate-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Icon size={16} weight={isActive ? 'bold' : 'regular'} className="text-[#AF9B63]" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Current Preceptor mini card */}
        <div className="pt-2 border-t border-white/10 flex items-center justify-between px-2">
          <div className="flex items-center gap-2 truncate">
            <div className="w-8 h-8 rounded-full bg-[#89743A] flex items-center justify-center font-heading font-bold text-xs text-white shrink-0">
              {initials}
            </div>
            <div className="truncate">
              <p className="text-xs font-medium text-white truncate leading-tight">
                {profile.nombre} {profile.apellido}
              </p>
              <p className="text-[10px] text-[#AF9B63] font-mono-data truncate">
                {profile.roleLabel}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => void logout()}
            className="text-slate-400 hover:text-white p-1 rounded transition-colors cursor-pointer"
            title="Cerrar sesión"
            aria-label="Cerrar sesión"
          >
            <SignOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
};
