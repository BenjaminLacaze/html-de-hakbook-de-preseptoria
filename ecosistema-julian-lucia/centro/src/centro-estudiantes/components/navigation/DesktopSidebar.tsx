/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * ISFDyT N° 26 - Barra lateral sólida Navy para escritorio (≥1024px)
 */

import React from 'react';
import {
  House,
  CalendarBlank,
  Megaphone,
  ChatsCircle,
  ChatCircleDots,
  UsersThree,
  Palette,
  Gear,
  SignOut,
  Plus,
  VideoCamera,
} from '@phosphor-icons/react';
import { useCentro } from '../../context/CentroContext';
import { ScreenId } from '../../types';
import { ISOTIPO_NEGATIVO_SVG, LOGO_NEGATIVO_PNG } from '../../lib/assets';

export const DesktopSidebar: React.FC = () => {
  const {
    currentScreen,
    setCurrentScreen,
    currentUser,
    setOpenPublishModal,
    setPublishType,
    setOpenLogoutModal,
    setShowPresentation,
    stats,
  } = useCentro();

  const navItemsComunidad = [
    { id: 'inicio' as ScreenId, label: 'Inicio', icon: <House weight="bold" className="w-5 h-5" /> },
    {
      id: 'eventos' as ScreenId,
      label: 'Eventos',
      icon: <CalendarBlank weight="bold" className="w-5 h-5" />,
      badge: stats.proximosEventos > 0 ? stats.proximosEventos : undefined,
    },
    { id: 'comunicados' as ScreenId, label: 'Comunicados', icon: <Megaphone weight="bold" className="w-5 h-5" /> },
    {
      id: 'foros' as ScreenId,
      label: 'Foros',
      icon: <ChatsCircle weight="bold" className="w-5 h-5" />,
      badge: stats.publicacionesDenunciadas > 0 ? '!' : undefined,
      badgeColor: 'bg-rose-500',
    },
  ];

  const navItemsGestion = [
    {
      id: 'reclamos' as ScreenId,
      label: 'Reclamos',
      icon: <ChatCircleDots weight="bold" className="w-5 h-5" />,
      badge: stats.reclamosSinAtender > 0 ? stats.reclamosSinAtender : undefined,
      badgeColor: 'bg-brand-gold',
    },
    { id: 'miembros' as ScreenId, label: 'Miembros del Centro', icon: <UsersThree weight="bold" className="w-5 h-5" /> },
  ];

  return (
    <aside
      className="hidden lg:flex flex-col w-64 bg-brand-navy text-white shrink-0 select-none z-30 min-h-screen border-r border-[#1C2E6B]"
      aria-label="Navegación principal del Centro"
    >
      {/* Brand lockup exacto a image_f42964f7.png con el ícono provisto */}
      <div className="p-4 border-b border-[#1C2E6B]/60 flex items-center gap-3">
        {/* Contenedor redondeado con borde dorado y el ícono oficial */}
        <div className="w-12 h-12 rounded-xl bg-[#14214F] border border-[#AF9B63] p-1.5 flex items-center justify-center shrink-0 shadow-sm">
          <img
            src={LOGO_NEGATIVO_PNG}
            alt="Centro de Estudiantes"
            className="w-full h-full object-contain"
            onError={(e) => {
              (e.target as HTMLImageElement).src = ISOTIPO_NEGATIVO_SVG;
            }}
          />
        </div>

        {/* Tipografía oficial de tres líneas */}
        <div className="min-w-0">
          <div className="text-base font-heading font-extrabold text-white tracking-tight leading-tight">
            ISFDyT N° 26
          </div>
          <div className="text-[11px] font-heading font-bold text-[#AF9B63] tracking-wider uppercase leading-tight mt-0.5">
            CENTRO DE ESTUDIANTES
          </div>
          <div className="text-[9.5px] font-sans font-semibold text-[#60A5FA] tracking-wider uppercase leading-tight">
            ASISTENCIA TERCIARIO
          </div>
        </div>
      </div>

      {/* Quick publish button in sidebar */}
      <div className="p-3">
        <button
          type="button"
          onClick={() => {
            setPublishType('comunicado');
            setOpenPublishModal(true);
          }}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-brand-gold hover:bg-[#766330] text-white rounded-lg text-sm font-semibold transition-all shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue min-h-[44px]"
        >
          <Plus weight="bold" className="w-4 h-4" />
          <span>Publicar al Centro</span>
        </button>
      </div>

      {/* Navigation Groups */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-6">
        {/* Grupo COMUNIDAD */}
        <div>
          <div className="px-3 mb-2 text-[11px] font-bold text-white/50 tracking-widest uppercase">
            Comunidad
          </div>
          <nav className="space-y-1">
            {navItemsComunidad.map((item) => {
              const active = currentScreen === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setCurrentScreen(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left min-h-[44px] focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue ${
                    active
                      ? 'bg-white/15 text-white font-semibold'
                      : 'text-white/80 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={active ? 'text-brand-gold-sand' : 'text-white/70'}>
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span
                      className={`px-1.5 py-0.5 rounded-full text-[11px] font-mono font-bold text-white ${
                        item.badgeColor || 'bg-white/20'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Grupo GESTIÓN */}
        <div>
          <div className="px-3 mb-2 text-[11px] font-bold text-white/50 tracking-widest uppercase">
            Gestión
          </div>
          <nav className="space-y-1">
            {navItemsGestion.map((item) => {
              const active = currentScreen === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setCurrentScreen(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left min-h-[44px] focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue ${
                    active
                      ? 'bg-white/15 text-white font-semibold'
                      : 'text-white/80 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={active ? 'text-brand-gold-sand' : 'text-white/70'}>
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span
                      className={`px-2 py-0.5 rounded-full text-[11px] font-mono font-bold text-white ${
                        item.badgeColor || 'bg-white/20'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Footer Area: Video Presentación, Apariencia, Opciones, Perfil, Cerrar sesión */}
      <div className="p-3 border-t border-[#1C2E6B]/60 space-y-1 bg-[#0E1738]">
        <button
          type="button"
          onClick={() => setShowPresentation(true)}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold text-brand-gold-sand hover:bg-white/10 hover:text-white transition-colors min-h-[44px]"
          title="Ver video de presentación institucional"
        >
          <VideoCamera weight="bold" className="w-4 h-4 text-brand-gold" />
          <span>Video Presentación</span>
        </button>

        <button
          type="button"
          onClick={() => setCurrentScreen('perfil')}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-white/80 hover:bg-white/10 hover:text-white transition-colors min-h-[44px] ${
            currentScreen === 'perfil' ? 'bg-white/15 text-white font-semibold' : ''
          }`}
        >
          <Palette weight="bold" className="w-4 h-4 text-brand-gold-sand" />
          <span>Apariencia y Temas</span>
        </button>

        <button
          type="button"
          onClick={() => setCurrentScreen('perfil')}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-white/80 hover:bg-white/10 hover:text-white transition-colors min-h-[44px]"
        >
          <Gear weight="bold" className="w-4 h-4 text-brand-blue" />
          <span>Opciones del Sistema</span>
        </button>

        {/* User preview */}
        <div className="pt-2 border-t border-white/10 flex items-center justify-between gap-2 px-1">
          <div
            onClick={() => setCurrentScreen('perfil')}
            className="flex items-center gap-2.5 min-w-0 cursor-pointer p-1 rounded-md hover:bg-white/5 transition-colors flex-1"
            role="button"
            tabIndex={0}
            aria-label="Ver mi perfil"
          >
            <div className="w-8 h-8 rounded-full bg-brand-gold text-white font-bold text-xs flex items-center justify-center shrink-0">
              {currentUser.iniciales}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-semibold text-white truncate">
                {currentUser.nombre}
              </div>
              <div className="text-[10px] text-brand-gold-sand truncate">
                {currentUser.cargo || 'Integrante del Centro'}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setOpenLogoutModal(true)}
            aria-label="Cerrar sesión"
            className="p-2 text-white/60 hover:text-rose-400 hover:bg-white/5 rounded-md transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
            title="Cerrar sesión"
          >
            <SignOut weight="bold" className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
