"use client";

import { useState, useEffect, useCallback } from "react";
import { CalendarX, Filter, FilePlus } from "lucide-react";
import Link from "next/link";

export default function Inasistencias() {
  const [fechaFiltro, setFechaFiltro] = useState("");
  const [inasistencias, setInasistencias] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [justificandoId, setJustificandoId] = useState<number | null>(null);
  const [motivoInput, setMotivoInput] = useState("");
  const [guardando, setGuardando] = useState(false);

  const fetchInasistencias = useCallback(async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (fechaFiltro) queryParams.append('fecha', fechaFiltro);

      const response = await fetch(`/api/inasistencias?${queryParams.toString()}`);
      const data = await response.json();
      setInasistencias(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching inasistencias:", error);
    } finally {
      setLoading(false);
    }
  }, [fechaFiltro]);

  useEffect(() => {
    fetchInasistencias();
  }, [fetchInasistencias]);

  const registrarJustificacion = async (asistenciaId: number) => {
    if (!motivoInput.trim()) return;
    setGuardando(true);
    try {
      const res = await fetch('/api/justificaciones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          asistencia_id: asistenciaId,
          motivo: motivoInput.trim(),
          estado: 'PENDIENTE'
        })
      });
      if (res.ok) {
        setJustificandoId(null);
        setMotivoInput("");
        await fetchInasistencias();
      }
    } catch (error) {
      console.error("Error registrando justificación:", error);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white/10 backdrop-blur-md border border-white/10 p-4 rounded-xl shadow-sm border border-white/10 flex flex-col sm:flex-row gap-4 items-center">
        <div className="flex-1 flex items-center gap-2">
          <CalendarX className="h-5 w-5 text-red-500" />
          <h2 className="text-lg font-semibold text-white">Control de Inasistencias</h2>
        </div>
        
        <div className="flex gap-4 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              type="date" 
              className="w-full pl-9 pr-4 py-2 text-sm border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/10 backdrop-blur-md border border-white/10"
              value={fechaFiltro}
              onChange={(e) => setFechaFiltro(e.target.value)}
            />
          </div>
          {fechaFiltro && (
            <button 
              onClick={() => setFechaFiltro("")}
              className="px-4 py-2 text-sm text-blue-200 bg-white/10 hover:bg-white/30 rounded-lg transition-colors whitespace-nowrap"
            >
              Ver todas
            </button>
          )}
        </div>
      </div>

      <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-xl shadow-sm border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white/5 border-b border-white/10">
                <th className="px-6 py-3 text-sm font-semibold text-blue-200">Fecha</th>
                <th className="px-6 py-3 text-sm font-semibold text-blue-200">Alumno</th>
                <th className="px-6 py-3 text-sm font-semibold text-blue-200">Curso</th>
                <th className="px-6 py-3 text-sm font-semibold text-blue-200">Estado Justificación</th>
                <th className="px-6 py-3 text-sm font-semibold text-blue-200 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-blue-300">Cargando inasistencias...</td>
                </tr>
              ) : inasistencias.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-blue-300">
                    No se encontraron inasistencias para los filtros seleccionados.
                  </td>
                </tr>
              ) : (
                inasistencias.map((inasistencia) => (
                  <tr key={inasistencia.asistencia_id} className="hover:bg-red-500/10 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-blue-100">{inasistencia.fecha}</td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-white">{inasistencia.apellido}, {inasistencia.nombre}</div>
                      <div className="text-xs text-blue-300">DNI: {inasistencia.dni}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-blue-200">
                      {inasistencia.anio}° {inasistencia.division}ra
                    </td>
                    <td className="px-6 py-4">
                      {inasistencia.justificacion_estado ? (
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          inasistencia.justificacion_estado === 'APROBADA' ? 'bg-emerald-100 text-emerald-800' :
                          inasistencia.justificacion_estado === 'RECHAZADA' ? 'bg-red-100 text-red-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {inasistencia.justificacion_estado === 'APROBADA' ? 'Justificada' : 
                           inasistencia.justificacion_estado === 'RECHAZADA' ? 'Rechazada' : 'En revisión'}
                        </span>
                      ) : justificandoId === inasistencia.asistencia_id ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            placeholder="Motivo de justificación..."
                            value={motivoInput}
                            onChange={(e) => setMotivoInput(e.target.value)}
                            className="px-2.5 py-1 text-xs bg-slate-900/90 border border-white/20 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <button
                            type="button"
                            disabled={guardando}
                            onClick={() => registrarJustificacion(inasistencia.asistencia_id)}
                            className="px-2.5 py-1 text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white rounded disabled:opacity-50"
                          >
                            Guardar
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setJustificandoId(null);
                              setMotivoInput("");
                            }}
                            className="px-2 py-1 text-xs text-slate-300 hover:text-white"
                          >
                            Cancelar
                          </button>
                        </div>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/10 text-blue-200">
                          Sin justificar
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="inline-flex items-center gap-3 justify-end">
                        {!inasistencia.justificacion_estado && justificandoId !== inasistencia.asistencia_id && (
                          <button
                            type="button"
                            onClick={() => {
                              setJustificandoId(inasistencia.asistencia_id);
                              setMotivoInput("");
                            }}
                            className="inline-flex items-center text-xs font-medium text-purple-300 hover:text-purple-200 bg-purple-500/20 hover:bg-purple-500/30 px-2.5 py-1 rounded-md border border-purple-400/20"
                          >
                            <FilePlus className="h-3.5 w-3.5 mr-1" /> Justificar
                          </button>
                        )}
                        <Link 
                          href={`/alumnos/${inasistencia.alumno_id}`}
                          className="text-sm text-blue-400 hover:text-blue-300 hover:underline font-medium"
                        >
                          Ver Perfil
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
