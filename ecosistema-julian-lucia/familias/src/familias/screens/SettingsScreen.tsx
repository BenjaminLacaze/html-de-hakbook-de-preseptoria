import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { SectionHeader } from '../components/SectionHeader';
import { THEMES } from '../config/themes';
import { toast } from 'sonner';
import { 
  PaintBrush, 
  TextT, 
  Lightning, 
  Bell, 
  Check, 
  Eye, 
  Info,
  ShieldCheck
} from '@phosphor-icons/react';

export const SettingsScreen: React.FC = () => {
  const { 
    theme, 
    setTheme, 
    textSize, 
    setTextSize, 
    reducedMotion, 
    setReducedMotion 
  } = useApp();

  // Preferencias de aviso (en memoria / interfaz)
  const [notifyNotices, setNotifyNotices] = useState(true);
  const [notifyAuthorizations, setNotifyAuthorizations] = useState(true);
  const [notifyAttendanceAlerts, setNotifyAttendanceAlerts] = useState(true);

  const handleThemeChange = (newThemeId: string) => {
    setTheme(newThemeId);
    toast.success('Tema visual actualizado.');
  };

  const handleTextSizeChange = (newSize: 'normal' | 'large') => {
    setTextSize(newSize);
    toast.success(newSize === 'large' ? 'Tamaño de texto grande activado.' : 'Tamaño de texto estándar restablecido.');
  };

  const handleReducedMotionToggle = (enabled: boolean) => {
    setReducedMotion(enabled);
    toast.success(enabled ? 'Modo de movimiento reducido activado.' : 'Animaciones completas activadas.');
  };

  return (
    <div className="space-y-8 animate-in fade-in">
      <SectionHeader
        kicker="Configuración y Accesibilidad"
        title="Apariencia y Opciones"
        subtitle="Personalizá los temas visuales, el tamaño tipográfico y las preferencias de avisos institucionales."
      />

      {/* 1. Selección de Temas (6 temas con contraste AA obligatorio, Requisito §1) */}
      <section aria-labelledby="heading-temas">
        <div className="flex items-center gap-2 mb-3">
          <PaintBrush className="w-4 h-4 text-[#89743A]" weight="bold" />
          <h2 id="heading-temas" className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
            Temas Visuales Institucionales (6 Variantes)
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {THEMES.map((th) => {
            const isSelected = theme === th.id;
            return (
              <button
                key={th.id}
                type="button"
                onClick={() => handleThemeChange(th.id)}
                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'border-[#89743A] ring-2 ring-[#89743A]/30 bg-[var(--surface-card)] shadow-xs'
                    : 'border-[var(--border)] bg-[var(--surface-card)] hover:border-[var(--text-muted)]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-xs font-bold text-[var(--text)]">
                      {th.name}
                    </span>
                    {isSelected && (
                      <span className="w-5 h-5 rounded-full bg-[#89743A] text-white flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3" weight="bold" />
                      </span>
                    )}
                  </div>

                  <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
                    {th.description}
                  </p>
                </div>

                {/* Previsualizador de colores del tema */}
                <div className="mt-4 pt-3 border-t border-[var(--border)] flex items-center gap-2">
                  <div
                    className="w-5 h-5 rounded-md border border-slate-300 shadow-2xs"
                    style={{ backgroundColor: th.surfaceColor }}
                    title="Fondo"
                  />
                  <div
                    className="w-5 h-5 rounded-md border border-slate-300 shadow-2xs"
                    style={{ backgroundColor: th.accentColor }}
                    title="Acento institucional"
                  />
                  <div
                    className="w-5 h-5 rounded-md border border-slate-300 shadow-2xs"
                    style={{ backgroundColor: th.textColor }}
                    title="Texto"
                  />
                  <span className="text-[10px] text-[var(--text-muted)] ml-auto font-mono">
                    {th.isDark ? 'Oscuro' : 'Claro'}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* 2. Accesibilidad: Tamaño de Texto y Reducción de Movimiento (Requisito §2) */}
      <section aria-labelledby="heading-accesibilidad">
        <div className="flex items-center gap-2 mb-3">
          <Eye className="w-4 h-4 text-[#89743A]" weight="bold" />
          <h2 id="heading-accesibilidad" className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
            Accesibilidad y Legibilidad
          </h2>
        </div>

        <div className="bg-[var(--surface-card)] rounded-2xl border border-[var(--border)] p-5 md:p-6 shadow-xs space-y-6">
          {/* Tamaño de texto */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="text-xs font-bold text-[var(--text)] flex items-center gap-1.5">
                  <TextT className="w-4 h-4 text-[#89743A]" weight="bold" />
                  <span>Tamaño de la Tipografía</span>
                </h3>
                <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
                  Mínimo institucional de 12px. Escalado proporcional para facilitar la lectura.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-3">
              <button
                type="button"
                onClick={() => handleTextSizeChange('normal')}
                className={`p-3 rounded-xl border text-xs font-semibold text-center transition-colors cursor-pointer ${
                  textSize === 'normal'
                    ? 'border-[#89743A] bg-[var(--surface-subtle)] font-bold text-[var(--text)] ring-1 ring-[#89743A]'
                    : 'border-[var(--border)] hover:bg-[var(--surface-subtle)] text-[var(--text-muted)]'
                }`}
              >
                <span className="block text-sm font-bold">Estándar (100%)</span>
                <span className="text-[10px] opacity-75">Tamaño recomendado</span>
              </button>

              <button
                type="button"
                onClick={() => handleTextSizeChange('large')}
                className={`p-3 rounded-xl border text-xs font-semibold text-center transition-colors cursor-pointer ${
                  textSize === 'large'
                    ? 'border-[#89743A] bg-[var(--surface-subtle)] font-bold text-[var(--text)] ring-1 ring-[#89743A]'
                    : 'border-[var(--border)] hover:bg-[var(--surface-subtle)] text-[var(--text-muted)]'
                }`}
              >
                <span className="block text-base font-extrabold">Grande (116%)</span>
                <span className="text-[10px] opacity-75">Mayor tamaño y contraste</span>
              </button>
            </div>
          </div>

          <div className="border-t border-[var(--border)] pt-5">
            {/* Reducir movimiento */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xs font-bold text-[var(--text)] flex items-center gap-1.5">
                  <Lightning className="w-4 h-4 text-[#89743A]" weight="bold" />
                  <span>Reducir Movimiento y Animaciones</span>
                </h3>
                <p className="text-[11px] text-[var(--text-muted)] mt-0.5 max-w-lg leading-relaxed">
                  Desactiva transiciones y efectos visuales cinéticos conforme a las pautas de accesibilidad para personas con sensibilidad al movimiento.
                </p>
              </div>

              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={reducedMotion}
                  onChange={(e) => handleReducedMotionToggle(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#14214F]" />
              </label>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Preferencias de Notificaciones Institucionales */}
      <section aria-labelledby="heading-notificaciones">
        <div className="flex items-center gap-2 mb-3">
          <Bell className="w-4 h-4 text-[#89743A]" weight="bold" />
          <h2 id="heading-notificaciones" className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
            Preferencias de Avisos
          </h2>
        </div>

        <div className="bg-[var(--surface-card)] rounded-2xl border border-[var(--border)] p-5 md:p-6 shadow-xs divide-y divide-[var(--border)]">
          <div className="pb-4 flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold text-[var(--text)]">
                Avisos y Comunicados Institucionales Urgentes
              </p>
              <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
                Recibir notificación al publicarse circulares de asistencia obligatoria o suspensión de clases.
              </p>
            </div>
            <input
              type="checkbox"
              checked={notifyNotices}
              onChange={(e) => setNotifyNotices(e.target.checked)}
              className="rounded text-[#14214F] w-4 h-4"
            />
          </div>

          <div className="py-4 flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold text-[var(--text)]">
                Solicitudes de Autorización y Salidas Didácticas
              </p>
              <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
                Recordatorio con 48 hs de anticipación a la fecha límite de respuesta.
              </p>
            </div>
            <input
              type="checkbox"
              checked={notifyAuthorizations}
              onChange={(e) => setNotifyAuthorizations(e.target.checked)}
              className="rounded text-[#14214F] w-4 h-4"
            />
          </div>

          <div className="pt-4 flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold text-[var(--text)]">
                Alertas de Advertencia de Asistencia
              </p>
              <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
                Aviso preventivo automático cuando un estudiante se aproxima al límite de inasistencias.
              </p>
            </div>
            <input
              type="checkbox"
              checked={notifyAttendanceAlerts}
              onChange={(e) => setNotifyAttendanceAlerts(e.target.checked)}
              className="rounded text-[#14214F] w-4 h-4"
            />
          </div>
        </div>
      </section>

      {/* Almacenamiento local conforme a las reglas (§2) */}
      <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--surface-subtle)] text-xs text-[var(--text-muted)] flex items-start gap-2.5">
        <ShieldCheck className="w-4 h-4 text-[#89743A] shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>Privacidad institucional:</strong> En el almacenamiento local del navegador únicamente se guardan las preferencias visuales (tema seleccionado, tamaño tipográfico, opción de movimiento y el identificador de pantalla). Ningún dato académico o personal es retenido en el dispositivo.
        </p>
      </div>
    </div>
  );
};
