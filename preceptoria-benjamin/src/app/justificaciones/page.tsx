"use client";

import { useState, useEffect } from "react";
import { FileCheck, Filter, CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";

export default function Justificaciones() {
  const [estadoFiltro, setEstadoFiltro] = useState("TODAS");
  const [justificaciones, setJustificaciones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [procesandoId, setProcesandoId] = useState<number | null>(null);

  async function fetchJustificaciones() {
    setLoading(true);
    try {
      const response = await fetch(`/api/justificaciones?estado=${estadoFiltro}`);
      const data = await response.json();
      setJustificaciones(data);
    } catch (error) {
      console.error("Error fetching justificaciones:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchJustificaciones();
  }, [estadoFiltro]);

  const cambiarEstado = async (id: number, nuevoEstado: string) => {
    setProcesandoId(id);
    try {
      const response = await fetch(`/api/justificaciones/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: nuevoEstado, observacion: 'Revisado por preceptoría' })
      });
      if (response.ok) {
        // Refrescar lista
        fetchJustificaciones();
      }
    } catch (error) {
      console.error("Error updating justificacion:", error);
    } finally {
      setProcesandoId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white/10 backdrop-blur-md border border-white/10 p-4 rounded-xl shadow-sm border border-white/10 flex flex-col sm:flex-row gap-4 items-center">
        <div className="flex-1 flex items-center gap-2">
          <FileCheck className="h-5 w-5 text-purple-600" />
          <h2 className="text-lg font-semibold text-white">Gestión de Justificaciones</h2>
        </div>
        
        <div className="relative w-full sm:w-64">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <select 
            className="w-full pl-9 pr-4 py-2 text-sm border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/10 backdrop-blur-md border border-white/10"
            value={estadoFiltro}
            onChange={(e) => setEstadoFiltro(e.target.value)}
          >
            <option value="TODAS">Todos los estados</option>
            <option value="PENDIENTE">Pendientes</option>
            <option value="APROBADA">Aprobadas</option>
            <option value="RECHAZADA">Rechazadas</option>
          </select>
        </div>
      </div>

      <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-xl shadow-sm border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white/5 border-b border-white/10">
                <th className="px-6 py-3 text-sm font-semibold text-blue-200">Fecha Inasistencia</th>
                <th className="px-6 py-3 text-sm font-semibold text-blue-200">Alumno</th>
                <th className="px-6 py-3 text-sm font-semibold text-blue-200">Motivo</th>
                <th className="px-6 py-3 text-sm font-semibold text-blue-200">Estado</th>
                <th className="px-6 py-3 text-sm font-semibold text-blue-200 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-blue-300">Cargando justificaciones...</td>
                </tr>
              ) : justificaciones.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-blue-300">
                    No se encontraron justificaciones.
                  </td>
                </tr>
              ) : (
                justificaciones.map((just) => (
                  <tr key={just.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-blue-100">{just.fecha_asistencia}</td>
                    <td className="px-6 py-4">
                      <Link href={`/alumnos/${just.alumno_id}`} className="font-medium text-blue-600 hover:underline">
                        {just.apellido}, {just.nombre}
                      </Link>
                      <div className="text-xs text-blue-300">
                        {just.anio}° {just.division}ra
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-blue-200 max-w-xs truncate" title={just.motivo}>
                      {just.motivo}
                    </td>
                    <td className="px-6 py-4">
                      {just.estado === 'APROBADA' && <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">Aprobada</span>}
                      {just.estado === 'RECHAZADA' && <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Rechazada</span>}
                      {just.estado === 'PENDIENTE' && <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">Pendiente</span>}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {just.estado === 'PENDIENTE' && (
                        <div className="flex justify-end gap-2">
                          <button 
                            disabled={procesandoId === just.id}
                            onClick={() => cambiarEstado(just.id, 'APROBADA')}
                            className="p-1.5 text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-md transition-colors disabled:opacity-50"
                            title="Aprobar"
                          >
                            <CheckCircle className="h-5 w-5" />
                          </button>
                          <button 
                            disabled={procesandoId === just.id}
                            onClick={() => cambiarEstado(just.id, 'RECHAZADA')}
                            className="p-1.5 text-red-600 bg-red-50 hover:bg-red-100 rounded-md transition-colors disabled:opacity-50"
                            title="Rechazar"
                          >
                            <XCircle className="h-5 w-5" />
                          </button>
                        </div>
                      )}
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
