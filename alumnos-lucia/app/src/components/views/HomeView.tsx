/**
 * Vista de Inicio (Home) - Panel Alumno
 * Resumen de situación académica y métricas de asistencia
 * Responsable: Lucia Salgado
 */

import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { calculateAttendanceStatistics, formatDateDisplay } from '../../services/attendanceService';
import { StatCard } from '../common/StatCard';
import { StatusBadge } from '../common/StatusBadge';
import { RecordDetailModal } from '../modals/RecordDetailModal';
import { AttendanceRecord, NavView } from '../../types';
import {
  CheckCircle2,
  XCircle,
  Clock,
  FileCheck,
  Percent,
  Calendar,
  ArrowRight,
  AlertTriangle,
  Info,
  ShieldCheck
} from 'lucide-react';

interface HomeViewProps {
  onNavigate: (view: NavView) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ onNavigate }) => {
  const { student, records } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState<'ALL' | '1C' | '2C'>('ALL');
  const [selectedRecordForModal, setSelectedRecordForModal] = useState<AttendanceRecord | null>(null);

  // Filtrar registros según período seleccionado para el resumen
  const periodFilteredRecords = records.filter((rec) => {
    if (selectedPeriod === '1C') return rec.academicPeriod === '1C';
    if (selectedPeriod === '2C') return rec.academicPeriod === '2C';
    return true;
  });

  const stats = calculateAttendanceStatistics(periodFilteredRecords, student.minimumAttendanceRequired);

  // Últimos 5 registros ordenados cronológicamente descendente
  const recentRecords = [...records].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);

  const getRegularityBadge = () => {
    if (stats.regularityStatus === 'REGULAR') {
      return (
        <div className="flex items-center gap-2 p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-lg text-emerald-900 dark:text-emerald-200">
          <CheckCircle2 size={20} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
          <div>
            <p className="text-sm font-semibold">Condición: Alumno Regular</p>
            <p className="text-xs text-emerald-800 dark:text-emerald-300 mt-0.5">
              Tu porcentaje actual supera el umbral obligatorio institucional del {student.minimumAttendanceRequired}%.
            </p>
          </div>
        </div>
      );
    }
    if (stats.regularityStatus === 'EN_RIESGO') {
      return (
        <div className="flex items-center gap-2 p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-lg text-amber-900 dark:text-amber-200">
          <AlertTriangle size={20} className="text-amber-600 dark:text-amber-400 shrink-0" />
          <div>
            <p className="text-sm font-semibold">Alerta: Regularidad en Riesgo</p>
            <p className="text-xs text-amber-800 dark:text-amber-300 mt-0.5">
              Tu asistencia ({stats.percentage}%) está por debajo del {student.minimumAttendanceRequired}%. Consulta en Preceptoría para justificar inasistencias.
            </p>
          </div>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-2 p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-lg text-rose-900 dark:text-rose-200">
        <XCircle size={20} className="text-rose-600 dark:text-rose-400 shrink-0" />
        <div>
          <p className="text-sm font-semibold">Condición Crítica: Pérdida de Regularidad</p>
          <p className="text-xs text-rose-800 dark:text-rose-300 mt-0.5">
            El porcentaje acumulado ({stats.percentage}%) se encuentra por debajo del umbral mínimo extraordinario del {student.minimumJustifiedAttendanceRequired}%.
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Saludo y bienvenida */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 sm:p-6 transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-medium text-blue-800 dark:text-blue-400 mb-1">
              <span>{student.institution}</span>
              <span aria-hidden="true">·</span>
              <span>Ciclo Lectivo {student.academicYear}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              Bienvenida, {student.firstName} {student.lastName}
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              {student.career} — {student.year}, {student.division} ({student.shift})
            </p>
          </div>

          {/* Segmented controls para período de resumen */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setSelectedPeriod('ALL')}
              className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                selectedPeriod === 'ALL'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Ciclo Completo
            </button>
            <button
              type="button"
              onClick={() => setSelectedPeriod('1C')}
              className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                selectedPeriod === '1C'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              1° Cuatrimestre
            </button>
            <button
              type="button"
              onClick={() => setSelectedPeriod('2C')}
              className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                selectedPeriod === '2C'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              2° Cuatrimestre
            </button>
          </div>
        </div>

        {/* Notificación de regularidad */}
        <div className="mt-5">
          {getRegularityBadge()}
        </div>
      </div>

      {/* Tarjetas de métricas estadísticas */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Resumen Estadístico {selectedPeriod === 'ALL' ? '(Anual)' : `(${selectedPeriod})`}
          </h2>
          <span className="text-xs text-slate-500 dark:text-slate-400 tabular-nums">
            Total jornadas computables: {stats.totalSessions}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Porcentaje Asistencia"
            value={`${stats.percentage}%`}
            subtitle={`Mínimo exigido: ${student.minimumAttendanceRequired}%`}
            icon={Percent}
            variant={stats.percentage >= 75 ? 'success' : stats.percentage >= 60 ? 'warning' : 'danger'}
          />

          <StatCard
            title="Asistencias (Presente)"
            value={stats.presentCount}
            subtitle={`${stats.totalSessions > 0 ? Math.round((stats.presentCount / stats.totalSessions) * 100) : 0}% de las clases`}
            icon={CheckCircle2}
            variant="success"
          />

          <StatCard
            title="Inasistencias Oficiales"
            value={stats.absentCount}
            subtitle={stats.absentCount === 0 ? 'Sin inasistencias injustificadas' : `${stats.absentCount} ausencias sin justificar`}
            icon={XCircle}
            variant={stats.absentCount > 3 ? 'danger' : 'default'}
          />

          <StatCard
            title="Llegadas Tarde"
            value={stats.lateCount}
            subtitle="Computan 0.5 de inasistencia c/u"
            icon={Clock}
            variant={stats.lateCount > 2 ? 'warning' : 'default'}
          />
        </div>
      </div>

      {/* Sección inferior dividida: Últimos registros y regla de cálculo */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lista de últimos registros (2 columnas) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 sm:p-6 transition-colors flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Registros Recientes
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Últimos asentamientos ingresados por preceptoría
                </p>
              </div>

              <button
                type="button"
                onClick={() => onNavigate('asistencia')}
                className="text-xs sm:text-sm font-semibold text-blue-700 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-blue-600 rounded px-1.5 py-0.5"
              >
                <span>Ver historial completo</span>
                <ArrowRight size={15} />
              </button>
            </div>

            {/* Listado scannable de registros */}
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {recentRecords.map((record) => (
                <div
                  key={record.id}
                  onClick={() => setSelectedRecordForModal(record)}
                  className="py-3 px-2 flex items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/60 rounded-md cursor-pointer transition-colors"
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      setSelectedRecordForModal(record);
                    }
                  }}
                  aria-label={`Ver detalle del ${record.date} para ${record.subjectName}`}
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                      {record.subjectName}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      <span className="flex items-center gap-1">
                        <Calendar size={13} />
                        <span>{formatDateDisplay(record.date)}</span>
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="tabular-nums font-mono text-[11px]">{record.time} hs</span>
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center gap-3">
                    <StatusBadge status={record.status} size="sm" />
                    <span className="text-xs text-blue-600 dark:text-blue-400 hidden sm:inline-block">
                      Detalle
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Haz clic en cualquier registro para auditar el detalle oficial.</span>
            <button
              onClick={() => onNavigate('asistencia')}
              className="font-medium text-blue-700 dark:text-blue-400 hover:underline"
            >
              Ir a Mi Asistencia
            </button>
          </div>
        </div>

        {/* Columna derecha: Criterio y política de asistencia */}
        <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl p-5 sm:p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 font-bold text-sm mb-3">
              <Info size={18} className="text-blue-700 dark:text-blue-400 shrink-0" />
              <span>Régimen de Regularidad I26</span>
            </div>

            <div className="space-y-3 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              <div className="p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                <p className="font-semibold text-slate-800 dark:text-slate-200">
                  Condición de Regular:
                </p>
                <p className="mt-0.5">
                  Exige un mínimo del <strong>75% de asistencia</strong> a las clases dictadas en cada espacio curricular.
                </p>
              </div>

              <div className="p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                <p className="font-semibold text-slate-800 dark:text-slate-200">
                  Régimen Especial Justificado:
                </p>
                <p className="mt-0.5">
                  Con justificación médica o laboral homologada, el piso exigible se reduce al <strong>60%</strong>.
                </p>
              </div>

              <div className="p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                <p className="font-semibold text-slate-800 dark:text-slate-200">
                  Fórmula oficial aplicada:
                </p>
                <p className="mt-0.5 font-mono text-[11px] text-blue-900 dark:text-blue-300">
                  % = (P + 0.5*T + 0.5*J) / Total × 100
                </p>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => onNavigate('ayuda')}
              className="w-full py-2 px-3 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-center"
            >
              Consultar manual de ayuda y reclamos
            </button>
          </div>
        </div>
      </div>

      {/* Modal para ver detalle de registro */}
      <RecordDetailModal
        record={selectedRecordForModal}
        onClose={() => setSelectedRecordForModal(null)}
      />
    </div>
  );
};
