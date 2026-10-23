import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { InstitutionalCrest } from '../common/InstitutionalCrest';
import {
  Calendar,
  UserCheck,
  RotateCcw,
  Printer,
  ChevronDown,
  ShieldAlert,
  GraduationCap,
  Cloud,
  Download,
} from 'lucide-react';
import { GoogleDriveBackupModal } from '../common/GoogleDriveBackupModal';

export const TopBar: React.FC = () => {
  const {
    activeUser,
    activeSection,
    activeCycleId,
    setActiveCycleId,
    setActiveUser,
    users,
    resetToDemoData,
    institutionSettings,
  } = useApp();

  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showCycleMenu, setShowCycleMenu] = useState(false);
  const [showDriveModal, setShowDriveModal] = useState(false);

  // Friendly names for breadcrumbs
  const sectionLabels: Record<string, string> = {
    inicio: 'Tablero Directivo Ejecutivo',
    usuarios: 'Gestión de Usuarios y Roles',
    cursos: 'Cursos, Divisiones y Matrícula',
    asistencia: 'Seguimiento de Asistencia Escolar',
    rendimiento: 'Seguimiento Académico y Calificaciones',
    organizacion: 'Organización Institucional y Horarios',
    comunicados: 'Circulares y Comunicados Oficiales',
    informes: 'Informes Estadísticos Institucionales',
    auditoria: 'Supervisión y Bitácora de Auditoría',
    configuracion: 'Configuración Institucional',
    contrato: 'Contrato de Backend (API REST)',
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <header className="no-print bg-[#14214F] text-white border-b border-[#89743A]/30 sticky top-0 z-40 px-4 lg:px-6 py-2.5 shadow-sm">
      <div className="max-w-[1600px] mx-auto flex items-center justify-between gap-4">
        {/* Left: Brand mark & Breadcrumb */}
        <div className="flex items-center gap-3 min-w-0">
          <InstitutionalCrest size={34} />
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-xs text-[#D4C08A]">
              <span className="font-semibold uppercase tracking-wider truncate">
                {institutionSettings.schoolNumber ? `ISFDyT N.° ${institutionSettings.schoolNumber}` : 'ISFDyT N.° 26'}
              </span>
              <span aria-hidden="true" className="text-white/40">/</span>
              <span className="text-white/80 hidden sm:inline truncate">{institutionSettings.district}</span>
              <span aria-hidden="true" className="text-white/40 hidden sm:inline">/</span>
              <span className="text-white font-medium truncate">{sectionLabels[activeSection] || 'Panel'}</span>
            </div>
            <div className="text-sm font-semibold tracking-tight text-white flex items-center gap-2">
              <span className="truncate">Perfil Directivo</span>
              {activeCycleId === '2025' && (
                <span className="text-[11px] text-[#EEDBA5] bg-[#89743A]/40 px-2 py-0.5 rounded border border-[#89743A] font-normal flex items-center gap-1">
                  <ShieldAlert className="w-3 h-3 text-[#EEDBA5]" />
                  Modo Histórico (2025)
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right: Controls & User Switcher */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Ciclo Lectivo Selector */}
          <div className="relative">
            <button
              onClick={() => {
                setShowCycleMenu(!showCycleMenu);
                setShowUserMenu(false);
              }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-white/10 hover:bg-white/15 text-xs text-white border border-white/10 transition-colors whitespace-nowrap"
              title="Cambiar ciclo lectivo"
            >
              <Calendar className="w-3.5 h-3.5 text-[#D4C08A]" />
              <span className="font-medium">Ciclo {activeCycleId}</span>
              <ChevronDown className="w-3 h-3 text-white/60" />
            </button>

            {showCycleMenu && (
              <div className="absolute right-0 mt-1 w-64 bg-white text-[#14214F] rounded-lg shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in">
                <div className="px-3 py-1.5 border-b border-slate-100 text-[11px] text-slate-500 font-semibold uppercase tracking-wider">
                  Seleccionar Ciclo Lectivo
                </div>
                <button
                  onClick={() => {
                    setActiveCycleId('2026');
                    setShowCycleMenu(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 ${
                    activeCycleId === '2026' ? 'bg-blue-50/70 font-semibold text-[#14214F]' : ''
                  }`}
                >
                  <div>
                    <div className="font-medium">Ciclo 2026 (Vigente)</div>
                    <div className="text-[11px] text-slate-500">Operaciones activas y registro en curso</div>
                  </div>
                  {activeCycleId === '2026' && <span className="text-xs text-[#14214F] font-bold">✓</span>}
                </button>
                <button
                  onClick={() => {
                    setActiveCycleId('2025');
                    setShowCycleMenu(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 ${
                    activeCycleId === '2025' ? 'bg-amber-50/70 font-semibold text-amber-900' : ''
                  }`}
                >
                  <div>
                    <div className="font-medium">Ciclo 2025 (Histórico)</div>
                    <div className="text-[11px] text-slate-500">Solo consulta de registros archivados</div>
                  </div>
                  {activeCycleId === '2025' && <span className="text-xs text-amber-900 font-bold">✓</span>}
                </button>
              </div>
            )}
          </div>

          {/* Google Drive Backup button */}
          <button
            onClick={() => setShowDriveModal(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-[#3F78B6]/30 hover:bg-[#3F78B6]/50 text-xs text-white border border-[#3F78B6]/40 transition-colors whitespace-nowrap"
            title="Guardar y sincronizar respaldos en Google Drive"
          >
            <Cloud className="w-3.5 h-3.5 text-[#D4C08A]" />
            <span className="hidden sm:inline font-medium">Google Drive</span>
          </button>

          {/* Download ZIP button */}
          <a
            href="/api/download-zip"
            download="perfil-directivo-isfdyt26.zip"
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-emerald-700/80 hover:bg-emerald-700 text-xs text-white border border-emerald-500/50 transition-colors whitespace-nowrap"
            title="Descargar código completo en .zip para subir a Git"
          >
            <Download className="w-3.5 h-3.5 text-white" />
            <span className="font-medium">Descargar ZIP</span>
          </a>

          {/* Quick Print button */}
          <button
            onClick={handlePrint}
            className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-white/10 hover:bg-white/15 text-xs text-white border border-white/10 transition-colors whitespace-nowrap"
            title="Imprimir vista actual para el legajo institucional"
          >
            <Printer className="w-3.5 h-3.5 text-[#D4C08A]" />
            <span>Imprimir</span>
          </button>

          {/* Reset Demo Data button */}
          <button
            onClick={resetToDemoData}
            className="hidden lg:flex items-center gap-1.5 px-2 py-1.5 rounded hover:bg-white/10 text-xs text-white/80 hover:text-white transition-colors whitespace-nowrap"
            title="Restablecer datos de demostración limpios"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="text-[11px]">Restablecer Demo</span>
          </button>

          {/* Active User Switcher / Profile */}
          <div className="relative">
            <button
              onClick={() => {
                setShowUserMenu(!showUserMenu);
                setShowCycleMenu(false);
              }}
              className="flex items-center gap-2 pl-2.5 pr-2 py-1 rounded bg-[#0A1128]/80 hover:bg-[#0A1128] border border-[#89743A]/40 text-left transition-colors"
            >
              <div className="w-6 h-6 rounded-full bg-[#89743A] text-white flex items-center justify-center font-bold text-xs">
                {activeUser.name.charAt(0)}
              </div>
              <div className="hidden sm:block text-left pr-1">
                <div className="text-xs font-medium text-white leading-tight truncate max-w-[130px]">
                  {activeUser.name.split(' ').slice(0, 2).join(' ')}
                </div>
                <div className="text-[10px] text-[#D4C08A] uppercase tracking-wide">
                  {activeUser.role}
                </div>
              </div>
              <ChevronDown className="w-3 h-3 text-white/60" />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-1 w-72 bg-white text-[#14214F] rounded-lg shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in">
                <div className="px-3 py-2 border-b border-slate-100">
                  <div className="text-xs font-bold text-slate-900">{activeUser.name}</div>
                  <div className="text-[11px] text-slate-500 font-mono">{activeUser.email}</div>
                  <div className="text-[11px] text-[#89743A] font-medium mt-0.5">Rol: {activeUser.role}</div>
                </div>
                <div className="px-3 py-1.5 text-[11px] text-slate-500 font-semibold uppercase tracking-wider bg-slate-50">
                  Simular acceso con otro rol
                </div>
                <div className="max-h-60 overflow-y-auto divide-y divide-slate-100">
                  {users.map((u) => (
                    <button
                      key={u.id}
                      onClick={() => {
                        setActiveUser(u);
                        setShowUserMenu(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs hover:bg-slate-50 flex items-center justify-between ${
                        activeUser.id === u.id ? 'bg-blue-50/70 font-semibold' : ''
                      }`}
                    >
                      <div>
                        <div className="font-medium text-slate-800">{u.name}</div>
                        <div className="text-[11px] text-slate-500">
                          {u.role} · {u.status}
                        </div>
                      </div>
                      {activeUser.id === u.id && (
                        <UserCheck className="w-4 h-4 text-[#14214F]" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Google Drive Backup Modal */}
      <GoogleDriveBackupModal
        isOpen={showDriveModal}
        onClose={() => setShowDriveModal(false)}
      />
    </header>
  );
};
