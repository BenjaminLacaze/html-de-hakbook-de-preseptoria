import React, { useState } from 'react';
import {
  Sliders,
  Bell,
  Lock,
  Shield,
  Palette,
  CheckCircle2,
  ChevronRight,
  AlertCircle
} from 'lucide-react';
import { usePortal } from '../context/PortalContext';
import { getBorderRadiusClass } from '../styles/themes';

export const OptionsPage: React.FC = () => {
  const { student, setActiveSection, appearance, themeColors } = usePortal();
  const radius = getBorderRadiusClass(appearance.borderStyle);

  const [emailAlerts, setEmailAlerts] = useState(true);
  const [gradeAlerts, setGradeAlerts] = useState(true);
  const [attendanceThresholdAlerts, setAttendanceThresholdAlerts] = useState(true);
  const [attendanceThresholdValue, setAttendanceThresholdValue] = useState(80);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSavePreferences = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div
        style={{
          backgroundColor: themeColors.bgCard,
          borderColor: themeColors.borderSubtle
        }}
        className={`p-6 border shadow-xs ${radius.card}`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span
              style={{ color: themeColors.accentGold }}
              className="text-xs font-bold uppercase tracking-wider block mb-1"
            >
              Configuración y Preferencias · Módulo Alumno
            </span>
            <h1 style={{ color: themeColors.textPrimary }} className="text-2xl font-extrabold tracking-tight">
              Opciones de Cuenta y Notificaciones
            </h1>
            <p style={{ color: themeColors.textMuted }} className="text-xs mt-1">
              Ajustes de avisos de presentismo, alertas de notas y seguridad de acceso
            </p>
          </div>

          <button
            onClick={() => setActiveSection('apariencia')}
            style={{
              backgroundColor: themeColors.bgSubtle,
              borderColor: themeColors.borderSubtle,
              color: themeColors.textPrimary
            }}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold border hover:border-slate-400 transition-colors ${radius.button}`}
          >
            <Palette className="w-4 h-4 text-purple-500" />
            <span>Configurar Apariencia y Temas</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Academic Notification Preferences */}
        <div
          style={{
            backgroundColor: themeColors.bgCard,
            borderColor: themeColors.borderSubtle
          }}
          className={`p-6 border ${radius.card} space-y-4`}
        >
          <div className="flex items-center gap-2 border-b pb-3" style={{ borderColor: themeColors.borderSubtle }}>
            <Bell className="w-5 h-5 text-amber-500" />
            <h3 style={{ color: themeColors.textPrimary }} className="text-sm font-bold">
              Alertas y Notificaciones Académicas
            </h3>
          </div>

          <form onSubmit={handleSavePreferences} className="space-y-4 text-xs">
            <label className="flex items-start justify-between gap-3 cursor-pointer py-1">
              <div>
                <span style={{ color: themeColors.textPrimary }} className="font-semibold block">
                  Aviso por correo de nuevas calificaciones
                </span>
                <span style={{ color: themeColors.textMuted }} className="text-[11px]">
                  Recibir notificación a {student.email} cuando un docente publique un examen o TP.
                </span>
              </div>
              <input
                type="checkbox"
                checked={gradeAlerts}
                onChange={(e) => setGradeAlerts(e.target.checked)}
                className="mt-1 w-4 h-4 text-amber-600 rounded"
              />
            </label>

            <label className="flex items-start justify-between gap-3 cursor-pointer py-1 border-t" style={{ borderColor: themeColors.borderSubtle }}>
              <div>
                <span style={{ color: themeColors.textPrimary }} className="font-semibold block">
                  Alertas tempranas de riesgo de asistencia
                </span>
                <span style={{ color: themeColors.textMuted }} className="text-[11px]">
                  Avisar con anticipación cuando el presentismo baje del umbral establecido.
                </span>
              </div>
              <input
                type="checkbox"
                checked={attendanceThresholdAlerts}
                onChange={(e) => setAttendanceThresholdAlerts(e.target.checked)}
                className="mt-1 w-4 h-4 text-amber-600 rounded"
              />
            </label>

            {attendanceThresholdAlerts && (
              <div
                style={{ backgroundColor: themeColors.bgSubtle }}
                className={`p-3 border border-slate-200 dark:border-slate-800 ${radius.inner} space-y-2`}
              >
                <div className="flex justify-between">
                  <span style={{ color: themeColors.textSecondary }}>Umbral de advertencia:</span>
                  <span style={{ color: themeColors.accentGold }} className="font-bold tabular-nums">
                    {attendanceThresholdValue}% (Regularidad requerida: 75%)
                  </span>
                </div>
                <input
                  type="range"
                  min="75"
                  max="90"
                  step="1"
                  value={attendanceThresholdValue}
                  onChange={(e) => setAttendanceThresholdValue(Number(e.target.value))}
                  className="w-full accent-amber-600"
                />
              </div>
            )}

            <label className="flex items-start justify-between gap-3 cursor-pointer py-1 border-t" style={{ borderColor: themeColors.borderSubtle }}>
              <div>
                <span style={{ color: themeColors.textPrimary }} className="font-semibold block">
                  Comprobante digital por QR escaneado
                </span>
                <span style={{ color: themeColors.textMuted }} className="text-[11px]">
                  Enviar copia de confirmación de presentismo al registrar código en aula.
                </span>
              </div>
              <input
                type="checkbox"
                checked={emailAlerts}
                onChange={(e) => setEmailAlerts(e.target.checked)}
                className="mt-1 w-4 h-4 text-amber-600 rounded"
              />
            </label>

            <div className="pt-3 border-t flex justify-end" style={{ borderColor: themeColors.borderSubtle }}>
              <button
                type="submit"
                style={{
                  backgroundColor: themeColors.accentGold,
                  color: '#FFFFFF'
                }}
                className={`px-4 py-2 font-semibold shadow-xs ${radius.button}`}
              >
                {saveSuccess ? '¡Preferencias guardadas!' : 'Guardar Preferencias'}
              </button>
            </div>
          </form>
        </div>

        {/* Security & Access */}
        <div
          style={{
            backgroundColor: themeColors.bgCard,
            borderColor: themeColors.borderSubtle
          }}
          className={`p-6 border ${radius.card} space-y-4`}
        >
          <div className="flex items-center gap-2 border-b pb-3" style={{ borderColor: themeColors.borderSubtle }}>
            <Lock className="w-5 h-5 text-blue-500" />
            <h3 style={{ color: themeColors.textPrimary }} className="text-sm font-bold">
              Seguridad y Credenciales Institucionales
            </h3>
          </div>

          <div className="space-y-3 text-xs leading-relaxed" style={{ color: themeColors.textSecondary }}>
            <p>
              Tu cuenta se encuentra vinculada a la infraestructura central del <strong>Instituto de Educación Superior N° 26</strong>.
              Las credenciales de acceso son universales para el Campus Virtual, las terminales de biblioteca y este Panel de Alumno.
            </p>

            <div
              style={{
                backgroundColor: themeColors.bgSubtle,
                borderColor: themeColors.borderSubtle
              }}
              className={`p-3.5 border ${radius.inner} space-y-2`}
            >
              <div className="flex justify-between">
                <span style={{ color: themeColors.textMuted }}>Identificador de usuario:</span>
                <span style={{ color: themeColors.textPrimary }} className="font-mono font-semibold">
                  {student.dni}
                </span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: themeColors.textMuted }}>Última actualización de contraseña:</span>
                <span style={{ color: themeColors.textPrimary }} className="tabular-nums">
                  Hace 45 días
                </span>
              </div>
            </div>

            <div
              style={{
                backgroundColor: themeColors.warningBg,
                borderColor: themeColors.warningBorder
              }}
              className={`p-3 border flex items-start gap-2 ${radius.inner}`}
            >
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span style={{ color: themeColors.warningText }} className="text-[11px]">
                Para restablecer tu contraseña institucional, solicitá el enlace de reseteo a Preceptoría
                o acercate con tu DNI a la mesa de ayuda de Informática.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
