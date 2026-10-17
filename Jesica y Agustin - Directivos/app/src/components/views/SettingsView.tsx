import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Settings,
  School,
  Save,
  RotateCcw,
  ShieldAlert,
  Calendar,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Cloud,
} from 'lucide-react';
import { GoogleDriveBackupModal } from '../common/GoogleDriveBackupModal';

export const SettingsView: React.FC = () => {
  const {
    institutionSettings,
    updateInstitutionSettings,
    activeCycleId,
    setActiveCycleId,
    resetToDemoData,
  } = useApp();

  const [name, setName] = useState(institutionSettings.name);
  const [schoolNumber, setSchoolNumber] = useState(institutionSettings.schoolNumber);
  const [cue, setCue] = useState(institutionSettings.cue);
  const [district, setDistrict] = useState(institutionSettings.district);
  const [region, setRegion] = useState(institutionSettings.region);
  const [address, setAddress] = useState(institutionSettings.address);
  const [phone, setPhone] = useState(institutionSettings.phone);
  const [email, setEmail] = useState(institutionSettings.email);
  const [principalName, setPrincipalName] = useState(institutionSettings.principalName);
  const [vicePrincipalName, setVicePrincipalName] = useState(institutionSettings.vicePrincipalName);

  const [attThreshold, setAttThreshold] = useState(
    institutionSettings.attendanceAlertThresholdPercent
  );
  const [consecutiveThreshold, setConsecutiveThreshold] = useState(
    institutionSettings.consecutiveAbsenceAlertThreshold
  );
  const [minGrade, setMinGrade] = useState(institutionSettings.minPassingGrade);

  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showDriveModal, setShowDriveModal] = useState(false);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateInstitutionSettings({
      name: name.trim(),
      schoolNumber: schoolNumber.trim(),
      cue: cue.trim(),
      district: district.trim(),
      region: region.trim(),
      address: address.trim(),
      phone: phone.trim(),
      email: email.trim(),
      principalName: principalName.trim(),
      vicePrincipalName: vicePrincipalName.trim(),
      attendanceAlertThresholdPercent: Number(attThreshold),
      consecutiveAbsenceAlertThreshold: Number(consecutiveThreshold),
      minPassingGrade: Number(minGrade),
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-lg border border-slate-200 shadow-xs">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-[#89743A]">
            Parámetros del Establecimiento Educativo
          </div>
          <h1 className="text-xl font-bold text-[#14214F] mt-0.5">
            Configuración Institucional
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Definición de claves oficiales, autoridades escolares, umbrales de alerta y ciclos lectivos.
          </p>
        </div>

        <button
          onClick={() => setShowResetConfirm(true)}
          className="px-3.5 py-2 text-xs font-medium text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded transition-colors flex items-center gap-1.5 self-start sm:self-auto"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Restablecer Datos Demo</span>
        </button>
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-6">
        {/* Section 1: Identificación Oficial */}
        <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <School className="w-4 h-4 text-[#14214F]" />
            <h2 className="text-sm font-bold text-[#14214F]">
              Identificación y Radicación Institucional
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="md:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">
                Nombre Oficial del Establecimiento *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 rounded border border-slate-300 focus:outline-none focus:border-[#14214F]"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Clave Única de Establecimiento (CUE) *
              </label>
              <input
                type="text"
                required
                value={cue}
                onChange={(e) => setCue(e.target.value)}
                className="w-full px-3 py-2 rounded border border-slate-300 focus:outline-none focus:border-[#14214F] font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Número de Instituto / Escuela
              </label>
              <input
                type="text"
                required
                value={schoolNumber}
                onChange={(e) => setSchoolNumber(e.target.value)}
                className="w-full px-3 py-2 rounded border border-slate-300 focus:outline-none focus:border-[#14214F] font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Distrito Escolar *
              </label>
              <input
                type="text"
                required
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full px-3 py-2 rounded border border-slate-300 focus:outline-none focus:border-[#14214F]"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Región Educativa
              </label>
              <input
                type="text"
                required
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="w-full px-3 py-2 rounded border border-slate-300 focus:outline-none focus:border-[#14214F]"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">
                Domicilio Legal
              </label>
              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3 py-2 rounded border border-slate-300 focus:outline-none focus:border-[#14214F]"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Teléfono Institucional
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 rounded border border-slate-300 focus:outline-none focus:border-[#14214F] font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Correo Electrónico Oficial
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 rounded border border-slate-300 focus:outline-none focus:border-[#14214F] font-mono"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Autoridades Escolares */}
        <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Sliders className="w-4 h-4 text-[#89743A]" />
            <h2 className="text-sm font-bold text-[#14214F]">
              Autoridades Institucionales
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Director/a del Establecimiento *
              </label>
              <input
                type="text"
                required
                value={principalName}
                onChange={(e) => setPrincipalName(e.target.value)}
                className="w-full px-3 py-2 rounded border border-slate-300 focus:outline-none focus:border-[#14214F]"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Vicedirector/a del Establecimiento *
              </label>
              <input
                type="text"
                required
                value={vicePrincipalName}
                onChange={(e) => setVicePrincipalName(e.target.value)}
                className="w-full px-3 py-2 rounded border border-slate-300 focus:outline-none focus:border-[#14214F]"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Parámetros de Alerta y Calificaciones */}
        <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <h2 className="text-sm font-bold text-[#14214F]">
              Parámetros de Seguimiento Pedagógico y Alertas
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Umbral de Inasistencias para Alerta (%)
              </label>
              <input
                type="number"
                min={5}
                max={40}
                required
                value={attThreshold}
                onChange={(e) => setAttThreshold(Number(e.target.value))}
                className="w-full px-3 py-2 rounded border border-slate-300 focus:outline-none focus:border-[#14214F] font-mono"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Porcentaje mínimo de inasistencias para activar seguimiento de trayectoria.
              </span>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Días Consecutivos de Inasistencia
              </label>
              <input
                type="number"
                min={2}
                max={10}
                required
                value={consecutiveThreshold}
                onChange={(e) => setConsecutiveThreshold(Number(e.target.value))}
                className="w-full px-3 py-2 rounded border border-slate-300 focus:outline-none focus:border-[#14214F] font-mono"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Alerta de ausentismo reiterado sin justificación previa.
              </span>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Nota Mínima de Acreditación (Escala 1 a 10)
              </label>
              <input
                type="number"
                min={4}
                max={8}
                required
                value={minGrade}
                onChange={(e) => setMinGrade(Number(e.target.value))}
                className="w-full px-3 py-2 rounded border border-slate-300 focus:outline-none focus:border-[#14214F] font-mono font-bold text-[#14214F]"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Puntaje mínimo para aprobar espacios curriculares (default oficial: 7).
              </span>
            </div>
          </div>
        </div>

        {/* Section 4: Ciclo Lectivo Activo */}
        <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Calendar className="w-4 h-4 text-[#14214F]" />
            <h2 className="text-sm font-bold text-[#14214F]">
              Ciclo Lectivo Activo en la Plataforma
            </h2>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
            <div>
              <div className="font-semibold text-slate-800">
                Contexto Actual:{' '}
                <span className="font-bold text-[#14214F] font-mono">
                  Ciclo {activeCycleId} ({activeCycleId === '2026' ? 'Vigente' : 'Histórico'})
                </span>
              </div>
              <p className="text-slate-500 text-[11px] mt-0.5 max-w-xl">
                {activeCycleId === '2026'
                  ? 'El ciclo 2026 permite asentar asistencias diarias, cargar calificaciones y modificar cursos activamente.'
                  : 'El ciclo 2025 se encuentra cerrado y opera en modo de consulta de registros históricos.'}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveCycleId('2026')}
                className={`px-3 py-1.5 rounded font-medium border text-xs transition-colors ${
                  activeCycleId === '2026'
                    ? 'bg-[#14214F] text-white border-[#14214F]'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                }`}
              >
                Activar Ciclo 2026
              </button>
              <button
                type="button"
                onClick={() => setActiveCycleId('2025')}
                className={`px-3 py-1.5 rounded font-medium border text-xs transition-colors ${
                  activeCycleId === '2025'
                    ? 'bg-amber-800 text-white border-amber-800'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                }`}
              >
                Consultar Histórico 2025
              </button>
            </div>
          </div>
        </div>

        {/* Section 5: Copia de Seguridad en Google Drive */}
        <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Cloud className="w-4 h-4 text-[#3F78B6]" />
            <h2 className="text-sm font-bold text-[#14214F]">
              Copia de Seguridad y Sincronización en Google Drive
            </h2>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
            <div>
              <div className="font-semibold text-slate-800">
                Almacenamiento en tu cuenta personal / institucional de Google Drive
              </div>
              <p className="text-slate-500 text-[11px] mt-0.5 max-w-xl">
                Permite generar y subir copias de seguridad completas (alumnos, matrículas, calificaciones, partes de asistencia y circulares) directamente a la carpeta <strong>"Perfil Directivo - ISFDyT 26"</strong> de tu Google Drive.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowDriveModal(true)}
              className="px-4 py-2 bg-[#14214F] hover:bg-[#0A1128] text-white rounded text-xs font-semibold transition-colors flex items-center gap-2 shadow-xs shrink-0 self-start sm:self-auto"
            >
              <Cloud className="w-4 h-4 text-[#D4C08A]" />
              <span>Gestionar Copias en Google Drive</span>
            </button>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 bg-[#14214F] hover:bg-[#0A1128] text-white rounded text-xs font-semibold transition-colors flex items-center gap-2 shadow-xs"
          >
            <Save className="w-4 h-4 text-[#D4C08A]" />
            <span>Guardar Parámetros Institucionales</span>
          </button>
        </div>
      </form>

      {/* Google Drive Backup Modal */}
      <GoogleDriveBackupModal
        isOpen={showDriveModal}
        onClose={() => setShowDriveModal(false)}
      />

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-lg border border-slate-200 shadow-xl max-w-md w-full p-5 space-y-4 animate-in fade-in">
            <div className="flex items-center gap-3 text-amber-800">
              <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0" />
              <h3 className="text-sm font-bold">
                ¿Restablecer datos de demostración?
              </h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Esta operación recargará el conjunto inicial completo de estudiantes, docentes, cursos, asistencias y calificaciones oficiales del ISFDyT N.° 26. Se conservará la estructura en el almacenamiento local.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="px-3 py-1.5 rounded text-xs text-slate-700 hover:bg-slate-100"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  resetToDemoData();
                  setShowResetConfirm(false);
                }}
                className="px-4 py-1.5 rounded text-xs font-medium bg-amber-700 hover:bg-amber-800 text-white"
              >
                Restablecer Todo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
