import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { AuditLogEntry } from '../../types';
import {
  FileText,
  Search,
  Filter,
  Shield,
  Clock,
  ArrowRight,
  User,
  Layers,
  Calendar,
  CheckCircle,
} from 'lucide-react';

export const AuditView: React.FC = () => {
  const { auditLogs, users } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [moduleFilter, setModuleFilter] = useState('TODOS');
  const [actionFilter, setActionFilter] = useState('TODAS');

  const filteredLogs = useMemo(() => {
    return auditLogs.filter((log) => {
      const matchesSearch =
        log.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.entity.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesModule = moduleFilter === 'TODOS' || log.module === moduleFilter;
      const matchesAction = actionFilter === 'TODAS' || log.action === actionFilter;

      return matchesSearch && matchesModule && matchesAction;
    });
  }, [auditLogs, searchQuery, moduleFilter, actionFilter]);

  const uniqueModules = useMemo(() => {
    return Array.from(new Set(auditLogs.map((l) => l.module)));
  }, [auditLogs]);

  const actionColors: Record<AuditLogEntry['action'], string> = {
    CREACION: 'text-emerald-800 bg-emerald-50 border-emerald-200',
    MODIFICACION: 'text-blue-800 bg-blue-50 border-blue-200',
    CAMBIO_ESTADO: 'text-amber-800 bg-amber-50 border-amber-200',
    CONFIGURACION: 'text-purple-800 bg-purple-50 border-purple-200',
    CAMBIO_CICLO: 'text-indigo-800 bg-indigo-50 border-indigo-200',
    ELIMINACION_CONTROLADA: 'text-red-800 bg-red-50 border-red-200',
    EXPORTACION: 'text-slate-800 bg-slate-50 border-slate-200',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-lg border border-slate-200 shadow-xs">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-[#89743A]">
            Trazabilidad y Seguridad Institucional
          </div>
          <h1 className="text-xl font-bold text-[#14214F] mt-0.5">
            Bitácora de Auditoría y Supervisión
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Registro cronológico inmutable de operaciones administrativas, cambios de estado y modificaciones del sistema.
          </p>
        </div>

        <div className="text-right text-xs text-slate-500 font-mono">
          <div className="font-bold text-[#14214F]">{auditLogs.length} eventos registrados</div>
          <div className="text-[11px] text-slate-400">Protección contra manipulación</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Buscar por descripción, usuario responsable o entidad..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded border border-slate-300 focus:outline-none focus:border-[#14214F]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 text-xs text-slate-500">
            <Filter className="w-3.5 h-3.5" />
            <span>Módulo:</span>
          </div>
          <select
            value={moduleFilter}
            onChange={(e) => setModuleFilter(e.target.value)}
            className="text-xs py-1.5 px-2.5 rounded border border-slate-300 focus:outline-none focus:border-[#14214F]"
          >
            <option value="TODOS">Todos los módulos</option>
            {uniqueModules.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>

          <div className="flex items-center gap-1 text-xs text-slate-500 ml-2">
            <span>Acción:</span>
          </div>
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="text-xs py-1.5 px-2.5 rounded border border-slate-300 focus:outline-none focus:border-[#14214F]"
          >
            <option value="TODAS">Todas las acciones</option>
            <option value="CREACION">Creación</option>
            <option value="MODIFICACION">Modificación</option>
            <option value="CAMBIO_ESTADO">Cambio de Estado</option>
            <option value="CONFIGURACION">Configuración</option>
            <option value="CAMBIO_CICLO">Cambio de Ciclo</option>
            <option value="ELIMINACION_CONTROLADA">Baja Controlada</option>
          </select>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Mostrando {filteredLogs.length} registros cronológicos</span>
          <span className="font-mono text-[11px]">Huso Horario: GMT-3 (Argentina)</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-500 uppercase tracking-wider text-[11px]">
                <th className="py-2.5 px-4 font-semibold">Fecha y Hora</th>
                <th className="py-2.5 px-4 font-semibold">Usuario Operador</th>
                <th className="py-2.5 px-4 font-semibold">Módulo</th>
                <th className="py-2.5 px-4 font-semibold">Tipo Operación</th>
                <th className="py-2.5 px-4 font-semibold">Detalle del Registro</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400 text-xs">
                    No se encontraron registros de auditoría para los filtros aplicados.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  const dateObj = new Date(log.timestamp);
                  const formattedDate = dateObj.toLocaleDateString('es-AR');
                  const formattedTime = dateObj.toLocaleTimeString('es-AR', {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                  });

                  return (
                    <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-mono text-[11px] tabular-nums text-slate-600 whitespace-nowrap">
                        <div className="font-semibold text-slate-800">{formattedDate}</div>
                        <div className="text-slate-400 text-[10px]">{formattedTime}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{log.userName}</div>
                        <div className="text-[10px] text-slate-500 uppercase tracking-wide">
                          {log.userRole}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-700">
                        {log.module}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${
                            actionColors[log.action] || 'bg-slate-100 text-slate-700 border-slate-200'
                          }`}
                        >
                          {log.action.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-4 max-w-md">
                        <div className="text-slate-800 leading-snug">{log.details}</div>
                        {(log.previousValue || log.newValue) && (
                          <div className="mt-1 text-[11px] text-slate-500 font-mono flex items-center gap-1.5">
                            {log.previousValue && (
                              <span className="line-through text-red-600">{log.previousValue}</span>
                            )}
                            {log.previousValue && log.newValue && (
                              <ArrowRight className="w-3 h-3 text-slate-400" />
                            )}
                            {log.newValue && (
                              <span className="text-emerald-700 font-semibold">{log.newValue}</span>
                            )}
                          </div>
                        )}
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                          Entidad: {log.entity} #{log.entityId}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
