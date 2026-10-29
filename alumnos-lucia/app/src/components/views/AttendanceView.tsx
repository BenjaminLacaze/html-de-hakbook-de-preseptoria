/**
 * Vista de Consulta de Asistencia ("Mi Asistencia")
 * Sistema de Asistencia Escolar - Módulo Alumno
 * Responsable: Lucia Salgado
 */

import React, { useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  filterAttendanceRecords,
  calculateAttendanceStatistics,
  formatDateDisplay
} from '../../services/attendanceService';
import { AttendanceFilters, AttendanceRecord, AttendanceStatus } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { RecordDetailModal } from '../modals/RecordDetailModal';
const MONTH_NAMES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
import {
  Search,
  Filter,
  RotateCcw,
  Calendar,
  Clock,
  BookOpen,
  FileText,
  AlertCircle,
  Eye,
  CheckCircle2,
  XCircle
} from 'lucide-react';

const INITIAL_FILTERS: AttendanceFilters = {
  period: 'ALL',
  selectedMonth: undefined,
  status: 'ALL',
  searchQuery: '',
  startDate: '',
  endDate: ''
};

export const AttendanceView: React.FC = () => {
  const { records, student, settings } = useAuth();
  const [filters, setFilters] = useState<AttendanceFilters>(INITIAL_FILTERS);
  const [selectedRecordForModal, setSelectedRecordForModal] = useState<AttendanceRecord | null>(null);

  // Filtrado de registros
  const filteredRecords = useMemo(() => {
    return filterAttendanceRecords(records, filters);
  }, [records, filters]);

  // Estadísticas informativas del subconjunto filtrado
  const filteredStats = useMemo(() => {
    return calculateAttendanceStatistics(filteredRecords, student.minimumAttendanceRequired, settings.lateArrivalAbsenceWeight, settings.attendanceRiskThresholdPercent);
  }, [filteredRecords, student.minimumAttendanceRequired, settings]);

  // Verificar si hay algún filtro activo
  const hasActiveFilters =
    filters.period !== 'ALL' ||
    filters.selectedMonth !== undefined ||
    filters.status !== 'ALL' ||
    filters.searchQuery.trim() !== '' ||
    Boolean(filters.startDate) ||
    Boolean(filters.endDate);

  const handleResetFilters = () => {
    setFilters(INITIAL_FILTERS);
  };

  return (
    <div className="space-y-6"><p className="text-xs">Los filtros muestran un resumen informativo de los registros seleccionados. El resumen oficial completo está en Inicio.</p>
      {/* Encabezado de la sección */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Mi Asistencia Oficial
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Consulta detallada de registros, estados y observaciones asentadas en libro matriz
          </p>
        </div>

        {/* Cómputo rápido del resultado filtrado */}
        <div className="flex items-center gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3.5 py-2 text-xs">
          <div>
            <span className="text-slate-500 dark:text-slate-400 block">Registros visibles:</span>
            <span className="font-bold text-slate-900 dark:text-slate-100 tabular-nums text-sm">
              {filteredRecords.length} de {records.length}
            </span>
          </div>
          <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-1" />
          <div>
            <span className="text-slate-500 dark:text-slate-400 block">Asistencia período:</span>
            <span
              className={`font-bold tabular-nums text-sm ${
                filteredStats.percentage >= 75
                  ? 'text-emerald-700 dark:text-emerald-400'
                  : 'text-amber-700 dark:text-amber-400'
              }`}
            >
              {filteredStats.percentage}%
            </span>
          </div>
        </div>
      </div>

      {/* Barra de Filtros y Búsqueda */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-5 shadow-xs transition-colors">
        <div className="flex items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            <Filter size={14} className="text-blue-600 dark:text-blue-400" />
            <span>Filtros de Búsqueda</span>
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-700 dark:text-rose-400 hover:text-rose-900 dark:hover:text-rose-300 px-2 py-1 rounded hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors focus:outline-none focus:ring-2 focus:ring-rose-500"
            >
              <RotateCcw size={13} />
              <span>Limpiar filtros</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Búsqueda textual */}
          <div className="lg:col-span-1">
            <label
              htmlFor="search-query"
              className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1"
            >
              Buscar por materia o nota
            </label>
            <div className="relative">
              <input
                id="search-query"
                type="text"
                value={filters.searchQuery}
                onChange={(e) => setFilters({ ...filters, searchQuery: e.target.value })}
                placeholder="Ej. Programación, viaje..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white dark:focus:bg-slate-900"
              />
              <Search size={14} className="absolute left-2.5 top-2.5 text-slate-400" />
            </div>
          </div>

          {/* Filtro por Período */}
          <div>
            <label
              htmlFor="period-select"
              className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1"
            >
              Período Académico
            </label>
            <select
              id="period-select"
              value={filters.period === 'MONTH' ? `MONTH_${filters.selectedMonth}` : filters.period}
              onChange={(e) => {
                const val = e.target.value;
                if (val.startsWith('MONTH_')) {
                  const m = parseInt(val.replace('MONTH_', ''), 10);
                  setFilters({ ...filters, period: 'MONTH', selectedMonth: m });
                } else {
                  setFilters({ ...filters, period: val as 'ALL' | '1C' | '2C', selectedMonth: undefined });
                }
              }}
              className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="ALL">Todo el ciclo lectivo</option>
              <option value="1C">1° Cuatrimestre</option>
              <option value="2C">2° Cuatrimestre</option>
              <optgroup label="Filtrar por Mes">
                <option value="MONTH_2">Marzo</option>
                <option value="MONTH_3">Abril</option>
                <option value="MONTH_4">Mayo</option>
                <option value="MONTH_5">Junio</option>
                <option value="MONTH_7">Agosto</option>
                <option value="MONTH_8">Septiembre</option>
                <option value="MONTH_9">Octubre</option>
              </optgroup>
            </select>
          </div>

          {/* Filtro por Estado */}
          <div>
            <label
              htmlFor="status-select"
              className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1"
            >
              Estado de Asistencia
            </label>
            <select
              id="status-select"
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value as 'ALL' | AttendanceStatus })}
              className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="ALL">Todos los estados</option>
              <option value="PRESENTE">Solo Presentes</option>
              <option value="AUSENTE">Solo Ausentes</option>
              <option value="TARDE">Solo Llegadas tarde</option>
              <option value="JUSTIFICADO">Solo Ausencias justificadas</option>
            </select>
          </div>

          {/* Rango de Fechas rápido */}
          <div>
            <label
              htmlFor="start-date"
              className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1"
            >
              Desde fecha
            </label>
            <input
              id="start-date"
              type="date"
              value={filters.startDate || ''}
              onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
              className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>
        </div>

        {/* Resumen rápido de tags activos si existen */}
        {hasActiveFilters && (
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
            <span className="font-medium text-slate-700 dark:text-slate-300">Filtros aplicados:</span>
            {filters.period !== 'ALL' && (
              <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-[11px]">
                Período: {filters.period === 'MONTH' ? MONTH_NAMES[filters.selectedMonth || 0] : filters.period}
              </span>
            )}
            {filters.status !== 'ALL' && (
              <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-[11px]">
                Estado: {filters.status}
              </span>
            )}
            {filters.searchQuery.trim() !== '' && (
              <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-[11px]">
                Texto: "{filters.searchQuery}"
              </span>
            )}
            {filters.startDate && (
              <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-[11px]">
                Desde: {filters.startDate}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Contenedor de Registros */}
      {filteredRecords.length === 0 ? (
        /* Estado vacío cuando ningún registro coincide con los filtros */
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-8 sm:p-12 text-center transition-colors">
          <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <Search size={22} />
          </div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
            No se encontraron registros de asistencia
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-1 leading-relaxed">
            No existen registros oficiales que coincidan con los criterios de filtrado seleccionados. Prueba modificando el período o borrando el texto de búsqueda.
          </p>
          <div className="mt-5">
            <button
              type="button"
              onClick={handleResetFilters}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-md text-xs sm:text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <RotateCcw size={15} />
              <span>Restablecer todos los filtros</span>
            </button>
          </div>
        </div>
      ) : (
        /* Listado de resultados */
        <div className="space-y-4">
          {/* Vista Escritorio: Tabla de alta densidad */}
          <div className="hidden md:block bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs transition-colors">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-semibold uppercase text-[11px] tracking-wider">
                  <tr>
                    <th scope="col" className="py-3 px-4">Fecha</th>
                    <th scope="col" className="py-3 px-3">Hora</th>
                    <th scope="col" className="py-3 px-4">Materia / Módulo</th>
                    <th scope="col" className="py-3 px-3">Período</th>
                    <th scope="col" className="py-3 px-3">Estado</th>
                    <th scope="col" className="py-3 px-4">Observaciones</th>
                    <th scope="col" className="py-3 px-3 text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredRecords.map((record) => (
                    <tr
                      key={record.id}
                      onClick={() => setSelectedRecordForModal(record)}
                      className="hover:bg-blue-50/40 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') setSelectedRecordForModal(record);
                      }}
                      aria-label={`Ver registro del ${record.date} para ${record.subjectName}`}
                    >
                      <td className="py-3 px-4 font-medium text-slate-900 dark:text-slate-100 whitespace-nowrap">
                        {formatDateDisplay(record.date)}
                      </td>
                      <td className="py-3 px-3 tabular-nums font-mono text-slate-500 dark:text-slate-400 whitespace-nowrap">
                        {record.time} hs
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-800 dark:text-slate-200">
                        {record.subjectName}
                      </td>
                      <td className="py-3 px-3 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                        {record.academicPeriod === '1C' ? '1° Cuat.' : '2° Cuat.'}
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <StatusBadge status={record.status} size="sm" />
                      </td>
                      <td className="py-3 px-4 text-xs text-slate-600 dark:text-slate-400 max-w-xs truncate">
                        {record.observation || (
                          <span className="text-slate-400 dark:text-slate-600 italic">Sin observaciones</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedRecordForModal(record);
                          }}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-200 px-2 py-1 rounded hover:bg-blue-50 dark:hover:bg-blue-950 focus:outline-none focus:ring-2 focus:ring-blue-600"
                          aria-label={`Detalle del registro ${record.id}`}
                        >
                          <Eye size={13} />
                          <span>Ver</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Vista Móvil: Tarjetas legibles sin scroll horizontal */}
          <div className="md:hidden space-y-3">
            {filteredRecords.map((record) => (
              <div
                key={record.id}
                onClick={() => setSelectedRecordForModal(record)}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4 shadow-xs hover:border-blue-300 dark:hover:border-blue-700 transition-colors"
                role="button"
                tabIndex={0}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-slate-900 dark:text-slate-100 text-sm leading-tight">
                      {record.subjectName}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-1">
                      <span>{formatDateDisplay(record.date)}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono tabular-nums">{record.time} hs</span>
                    </div>
                  </div>
                  <div className="shrink-0">
                    <StatusBadge status={record.status} size="sm" />
                  </div>
                </div>

                {record.observation && (
                  <div className="p-2 bg-slate-50 dark:bg-slate-800/60 rounded text-xs text-slate-600 dark:text-slate-300 mt-2 border border-slate-200 dark:border-slate-700">
                    <span className="font-medium text-slate-700 dark:text-slate-200">Nota: </span>
                    {record.observation}
                  </div>
                )}

                <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
                  <span>Período: {record.academicPeriod === '1C' ? '1° Cuatrimestre' : '2° Cuatrimestre'}</span>
                  <span className="text-blue-700 dark:text-blue-400 font-semibold flex items-center gap-1">
                    Ver detalle completo
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Pie de auditoría y aclaración institucional */}
          <div className="p-4 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-600 dark:text-slate-400 flex items-start gap-2.5">
            <AlertCircle size={16} className="text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Información para el alumno:</strong> Todos los datos expuestos provienen de los libros de asistencia digitalizados por el personal de Preceptoría del I26. Si adviertes una inasistencia u horario registrado de forma errónea, dirígete con el docente del espacio curricular o a Preceptoría de Turno Tarde para la verificación de firmas en el parte diario.
            </p>
          </div>
        </div>
      )}

      {/* Modal de Detalle */}
      <RecordDetailModal
        record={selectedRecordForModal}
        onClose={() => setSelectedRecordForModal(null)}
      />
    </div>
  );
};
