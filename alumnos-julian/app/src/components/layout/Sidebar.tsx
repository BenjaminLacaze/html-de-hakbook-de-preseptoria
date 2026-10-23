import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  User,
  Calendar,
  BookOpen,
  GraduationCap,
  ClipboardList,
  History,
  Users,
  MessageSquare,
  Settings,
  Palette,
  QrCode,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from '../ui/Button';

interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  onOpenLogout: () => void;
}

interface NavItem {
  name: string;
  path: string;
  icon: React.ElementType;
  badge?: string;
  badgeVariant?: 'gold' | 'danger' | 'info';
}

interface NavGroup {
  group: string;
  items: NavItem[];
}

export const navigationGroups: NavGroup[] = [
  {
    group: 'Académico',
    items: [
      { name: 'Inicio', path: '/', icon: LayoutDashboard },
      { name: 'Agenda Académica', path: '/agenda', icon: Calendar, badge: 'Hoy' },
      { name: 'Materias', path: '/materias', icon: BookOpen },
      { name: 'Mis Notas', path: '/notas', icon: GraduationCap },
      { name: 'Mis Faltas', path: '/faltas', icon: ClipboardList, badge: 'Alerta', badgeVariant: 'gold' },
      { name: 'Historial completo', path: '/historial', icon: History },
    ],
  },
  {
    group: 'Comunidad',
    items: [
      { name: 'Comunidad', path: '/comunidad', icon: Users },
      { name: 'Foros', path: '/foros', icon: MessageSquare, badge: '3' },
    ],
  },
  {
    group: 'Herramientas',
    items: [
      { name: 'Asistencia QR', path: '/asistencia-qr', icon: QrCode },
    ],
  },
  {
    group: 'Preferencias',
    items: [
      { name: 'Perfil', path: '/perfil', icon: User },
      { name: 'Apariencia', path: '/apariencia', icon: Palette },
      { name: 'Opciones', path: '/opciones', icon: Settings },
    ],
  },
];

export const Sidebar: React.FC<SidebarProps> = ({
  isCollapsed,
  onToggleCollapse,
  isOpenMobile,
  onCloseMobile,
  onOpenLogout,
}) => {
  const location = useLocation();

  const sidebarContent = (
    <div className="flex flex-col h-full bg-surface select-none">
      {/* Brand Header */}
      <div className={cn(
        'h-16 flex items-center border-b border-subtle-custom px-4 shrink-0 transition-all justify-between',
        isCollapsed ? 'justify-center px-2' : 'px-4'
      )}>
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-9 h-9 rounded-[var(--radius-current)] bg-[var(--accent-primary)] text-[var(--accent-foreground)] flex items-center justify-center font-bold text-sm tracking-wider shrink-0 shadow-xs">
            AT
          </div>
          {!isCollapsed && (
            <div className="flex flex-col truncate">
              <span className="text-sm font-bold tracking-tight text-primary-custom whitespace-nowrap">
                Asistencia Terciario
              </span>
              <span className="text-[11px] text-secondary-custom truncate">
                Panel de Alumno · IES 26
              </span>
            </div>
          )}
        </div>

        {/* Desktop Collapse Toggle */}
        <button
          onClick={onToggleCollapse}
          aria-label={isCollapsed ? 'Expandir barra lateral' : 'Contraer barra lateral'}
          className="hidden md:flex w-7 h-7 rounded-[calc(var(--radius-current)-2px)] items-center justify-center text-secondary-custom hover:text-primary-custom hover:bg-[var(--bg-surface-elevated)] border border-subtle-custom shrink-0 transition-colors"
        >
          {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Navigation Groups */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {navigationGroups.map((group) => (
          <div key={group.group} className="space-y-1">
            {!isCollapsed && (
              <h4 className="px-2 text-[10px] font-semibold uppercase tracking-wider text-muted-custom">
                {group.group}
              </h4>
            )}
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;

                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={onCloseMobile}
                    title={isCollapsed ? item.name : undefined}
                    className={cn(
                      'flex items-center gap-3 px-2.5 py-2 text-xs font-medium rounded-[var(--radius-current)] transition-all whitespace-nowrap group',
                      isActive
                        ? 'bg-[var(--accent-primary)] text-[var(--accent-foreground)] shadow-xs font-semibold'
                        : 'text-secondary-custom hover:text-primary-custom hover:bg-[var(--bg-surface-elevated)]',
                      isCollapsed && 'justify-center px-0 h-10 w-10 mx-auto'
                    )}
                  >
                    <Icon className={cn('w-4 h-4 shrink-0 transition-transform group-hover:scale-105', isActive ? 'text-inherit' : 'text-secondary-custom')} />
                    {!isCollapsed && <span className="flex-1 truncate">{item.name}</span>}
                    {!isCollapsed && item.badge && (
                      <span
                        className={cn(
                          'px-1.5 py-0.2 rounded text-[10px] tabular-nums font-semibold shrink-0',
                          item.badgeVariant === 'gold'
                            ? 'bg-[var(--gold-subtle)] text-[var(--gold-accent)]'
                            : isActive
                            ? 'bg-black/20 text-white'
                            : 'bg-[var(--bg-surface-elevated)] text-secondary-custom'
                        )}
                      >
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* User Footer Profile & Logout */}
      <div className="p-3 border-t border-subtle-custom bg-[var(--bg-surface-elevated)]/40 shrink-0">
        <div className={cn('flex items-center gap-3', isCollapsed ? 'justify-center' : 'justify-between')}>
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-[var(--accent-subtle)] text-[var(--accent-primary)] border border-subtle-custom flex items-center justify-center font-bold text-xs shrink-0">
              JC
            </div>
            {!isCollapsed && (
              <div className="flex flex-col truncate">
                <span className="text-xs font-semibold text-primary-custom truncate">
                  Alex Estudiante
                </span>
                <span className="text-[10px] text-secondary-custom truncate">
                  Leg. DEMO-0842
                </span>
              </div>
            )}
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={onOpenLogout}
            title="Cerrar sesión"
            aria-label="Cerrar sesión"
            className={cn('text-secondary-custom hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 h-8 w-8', isCollapsed && 'hidden')}
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>

        {/* Demonstrative Mode Notice */}
        {!isCollapsed && (
          <div className="mt-2.5 pt-2 border-t border-subtle-custom flex items-center gap-1.5 text-[10px] text-muted-custom">
            <ShieldCheck className="w-3 h-3 shrink-0 text-emerald-500" />
            <span className="truncate">Modo Alumno Conectado</span>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside
        className={cn(
          'hidden md:block shrink-0 border-r border-subtle-custom transition-all duration-200 z-30 sticky top-0 h-screen',
          isCollapsed ? 'w-16' : 'w-64'
        )}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Backdrop and Aside */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs"
            onClick={onCloseMobile}
            aria-hidden="true"
          />
          <div className="relative w-72 max-w-[85vw] h-full shadow-2xl z-10 animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
