import React from 'react';
import {
  Home,
  User,
  Calendar,
  BookOpen,
  Award,
  ClockAlert,
  History,
  Users,
  MessageSquare,
  Sliders,
  Palette,
  QrCode,
  LogOut,
  Sparkles
} from 'lucide-react';
import { usePortal } from '../../context/PortalContext';
import { getBorderRadiusClass } from '../../styles/themes';
import { ActiveSection } from '../../types';

interface SidebarProps {
  onItemClick?: () => void;
}

interface NavGroup {
  label: string;
  items: {
    id: ActiveSection | 'logout';
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string;
  }[];
}

export const Sidebar: React.FC<SidebarProps> = ({ onItemClick }) => {
  const {
    activeSection,
    setActiveSection,
    appearance,
    themeColors,
    setIsLogoutModalOpen,
    totalAbsences
  } = usePortal();

  const radius = getBorderRadiusClass(appearance.borderStyle);

  const navGroups: NavGroup[] = [
    {
      label: 'GESTIÓN PRINCIPAL',
      items: [
        { id: 'inicio', label: 'Inicio / Panel', icon: Home },
        { id: 'perfil', label: 'Mi Perfil', icon: User },
        { id: 'agenda', label: 'Agenda Académica', icon: Calendar }
      ]
    },
    {
      label: 'SEGUIMIENTO ACADÉMICO',
      items: [
        { id: 'materias', label: 'Materias', icon: BookOpen },
        { id: 'notas', label: 'Mis Notas', icon: Award },
        {
          id: 'faltas',
          label: 'Mis Faltas',
          icon: ClockAlert,
          badge: totalAbsences > 0 ? `${totalAbsences} faltas` : undefined
        },
        { id: 'historial', label: 'Historial Completo', icon: History }
      ]
    },
    {
      label: 'ESPACIO INSTITUCIONAL',
      items: [
        { id: 'asistencia-qr', label: 'Asistencia QR', icon: QrCode },
        { id: 'comunidad', label: 'Comunidad', icon: Users },
        { id: 'foros', label: 'Foros', icon: MessageSquare }
      ]
    },
    {
      label: 'PREFERENCIAS',
      items: [
        { id: 'apariencia', label: 'Apariencia', icon: Palette },
        { id: 'opciones', label: 'Opciones', icon: Sliders },
        { id: 'logout', label: 'Cerrar Sesión', icon: LogOut }
      ]
    }
  ];

  const handleClick = (id: ActiveSection | 'logout') => {
    if (id === 'logout') {
      setIsLogoutModalOpen(true);
    } else {
      setActiveSection(id);
    }
    if (onItemClick) {
      onItemClick();
    }
  };

  return (
    <aside
      style={{
        backgroundColor: themeColors.bgSidebar,
        borderColor: themeColors.borderSubtle
      }}
      className="w-64 h-full flex flex-col justify-between border-r select-none overflow-y-auto"
    >
      {/* Upper branding */}
      <div>
        <div className="p-5 border-b border-white/10 flex items-center gap-3">
          <img
            src="/src/assets/images/instituto26_shield_crest_1792192527347.jpg"
            alt="Instituto 26"
            referrerPolicy="no-referrer"
            className="w-10 h-10 rounded-lg object-cover border border-[#D4AF37]/40 shadow-xs shrink-0"
          />
          <div>
            <div className="text-white font-bold text-sm tracking-tight leading-none">
              INSTITUTO 26
            </div>
            <div className="text-[#D4AF37] text-[11px] font-semibold mt-1 tracking-wide">
              Módulo Alumno
            </div>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="p-3 space-y-5">
          {navGroups.map((group) => (
            <div key={group.label}>
              <div className="px-3 mb-1.5 text-[10px] font-semibold tracking-wider text-slate-400">
                {group.label}
              </div>
              <ul className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeSection === item.id;
                  const isLogout = item.id === 'logout';

                  return (
                    <li key={item.id}>
                      <button
                        onClick={() => handleClick(item.id)}
                        style={{
                          backgroundColor: isActive
                            ? themeColors.accentGold
                            : 'transparent',
                          color: isActive
                            ? '#FFFFFF'
                            : isLogout
                            ? '#F87171'
                            : '#CBD5E1'
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium transition-all ${
                          radius.button
                        } ${
                          isActive
                            ? 'shadow-xs font-semibold'
                            : isLogout
                            ? 'hover:bg-red-500/10'
                            : 'hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : ''}`} />
                          <span className="truncate">{item.label}</span>
                        </div>
                        {item.badge && (
                          <span
                            className={`text-[10px] px-1.5 py-0.5 rounded font-bold tabular-nums shrink-0 ${
                              isActive
                                ? 'bg-black/20 text-white'
                                : 'bg-red-500/20 text-red-300'
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
      </div>

      {/* Footer institutional badge */}
      <div className="p-4 m-3 rounded-xl bg-white/5 border border-white/10 text-xs">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[11px] text-slate-400">Ciclo Lectivo</span>
          <span className="text-[11px] font-semibold text-[#D4AF37]">2026</span>
        </div>
        <div className="text-[11px] text-slate-300 truncate">
          TS Desarrollo de Software
        </div>
        <div className="text-[10px] text-slate-500 mt-1 flex items-center justify-between">
          <span>Comisión 2° B</span>
          <span className="font-mono text-[9px]">v1.4</span>
        </div>
      </div>
    </aside>
  );
};
