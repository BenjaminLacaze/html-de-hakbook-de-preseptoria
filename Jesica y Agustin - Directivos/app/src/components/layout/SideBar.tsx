import React from 'react';
import { useApp } from '../../context/AppContext';
import { ActiveSection } from '../../types';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  CalendarCheck2,
  GraduationCap,
  Clock,
  BellRing,
  BarChart3,
  FileText,
  Settings,
  AlertTriangle,
  School,
  Code2,
} from 'lucide-react';

interface Props {
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export const SideBar: React.FC<Props> = ({ isMobileOpen, onCloseMobile }) => {
  const { activeSection, setActiveSection, getAtRiskStudents, institutionSettings } = useApp();
  const atRiskCount = getAtRiskStudents().length;

  const navGroups: {
    groupTitle: string;
    items: {
      id: ActiveSection;
      label: string;
      icon: React.ComponentType<{ className?: string }>;
      badge?: number | string;
      badgeColor?: string;
    }[];
  }[] = [
    {
      groupTitle: 'Dirección General',
      items: [
        {
          id: 'inicio',
          label: 'Tablero Ejecutivo',
          icon: LayoutDashboard,
          badge: atRiskCount > 0 ? `${atRiskCount} alertas` : undefined,
          badgeColor: 'text-amber-800 bg-amber-100 border border-amber-300',
        },
      ],
    },
    {
      groupTitle: 'Estructura Institucional',
      items: [
        {
          id: 'usuarios',
          label: 'Usuarios y Permisos',
          icon: Users,
        },
        {
          id: 'cursos',
          label: 'Cursos y Divisiones',
          icon: BookOpen,
        },
      ],
    },
    {
      groupTitle: 'Seguimiento Pedagógico',
      items: [
        {
          id: 'asistencia',
          label: 'Asistencia Escolar',
          icon: CalendarCheck2,
        },
        {
          id: 'rendimiento',
          label: 'Rendimiento Académico',
          icon: GraduationCap,
        },
        {
          id: 'organizacion',
          label: 'Horarios y Calendario',
          icon: Clock,
        },
      ],
    },
    {
      groupTitle: 'Supervisión y Gestión',
      items: [
        {
          id: 'comunicados',
          label: 'Circulares y Comunicados',
          icon: BellRing,
        },
        {
          id: 'informes',
          label: 'Informes y Estadísticas',
          icon: BarChart3,
        },
        {
          id: 'auditoria',
          label: 'Bitácora de Auditoría',
          icon: FileText,
        },
      ],
    },
    {
      groupTitle: 'Administración',
      items: [
        {
          id: 'configuracion',
          label: 'Configuración Institucional',
          icon: Settings,
        },
        {
          id: 'contrato',
          label: 'Contrato de Backend (API)',
          icon: Code2,
        },
      ],
    },
  ];

  const handleSelect = (section: ActiveSection) => {
    setActiveSection(section);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 z-30 lg:hidden backdrop-blur-xs"
          onClick={onCloseMobile}
        />
      )}

      {/* Persistent Sidebar */}
      <aside
        className={`fixed lg:sticky top-[53px] left-0 h-[calc(100vh-53px)] w-64 bg-[#0A1128] text-slate-300 z-40 flex flex-col border-r border-[#89743A]/20 transition-transform duration-200 ease-in-out ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } no-print`}
      >
        {/* Institutional subtitle header */}
        <div className="p-4 border-b border-white/10 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded bg-[#14214F] border border-[#89743A]/40 flex items-center justify-center shrink-0">
            <School className="w-4 h-4 text-[#D4C08A]" />
          </div>
          <div className="min-w-0">
            <div className="text-[11px] font-semibold text-[#D4C08A] uppercase tracking-wider truncate">
              Gestión Institucional
            </div>
            <div className="text-xs text-slate-300 truncate font-mono">
              CUE: {institutionSettings.cue}
            </div>
          </div>
        </div>

        {/* Scrollable Nav Items */}
        <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
          {navGroups.map((group) => (
            <div key={group.groupTitle} className="space-y-1">
              <div className="px-2.5 text-[10px] font-semibold tracking-wider text-slate-400 uppercase font-sans">
                {group.groupTitle}
              </div>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeSection === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSelect(item.id)}
                      className={`w-full flex items-center justify-between px-2.5 py-2 rounded text-xs transition-colors whitespace-nowrap text-left ${
                        isActive
                          ? 'bg-[#14214F] text-white font-medium border-l-2 border-[#89743A] shadow-xs'
                          : 'text-slate-300 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Icon
                          className={`w-4 h-4 shrink-0 ${
                            isActive ? 'text-[#D4C08A]' : 'text-slate-400'
                          }`}
                        />
                        <span className="truncate">{item.label}</span>
                      </div>
                      {item.badge && (
                        <span
                          className={`text-[10px] px-1.5 py-0.2 rounded font-medium ${
                            item.badgeColor || 'bg-slate-700 text-slate-200'
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
          ))}
        </nav>

        {/* Footer info box */}
        <div className="p-3 border-t border-white/10 text-[11px] text-slate-400">
          <div className="flex items-center justify-between text-[11px] text-[#AF9B63] mb-0.5 font-medium">
            <span>ISFDyT N.° 26</span>
            <span>Dolores, BA</span>
          </div>
          <div className="text-[10px] text-slate-400">
            Región 18 · DGCyE
          </div>
        </div>
      </aside>
    </>
  );
};
