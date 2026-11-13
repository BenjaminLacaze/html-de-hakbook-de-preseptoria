"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, UserX, Clock, FileWarning } from "lucide-react";
import Link from "next/link";

export default function Seguimiento() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSeguimiento() {
      try {
        const response = await fetch('/api/seguimiento');
        const json = await response.json();
        setData(json);
      } catch (error) {
        console.error("Error fetching seguimiento:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchSeguimiento();
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 rounded-xl p-6 text-white flex items-start gap-4 shadow-md">
        <AlertTriangle className="h-8 w-8 text-amber-400 shrink-0" />
        <div>
          <h2 className="text-xl font-bold">Panel de Seguimiento y Alertas</h2>
          <p className="text-slate-300 mt-1">
            Este panel identifica automáticamente a los alumnos que requieren atención debido a inasistencias reiteradas, llegadas tarde o justificaciones pendientes.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Muchas Faltas */}
        <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-xl shadow-sm border border-white/10 overflow-hidden">
          <div className="bg-red-50 p-4 border-b border-red-100 flex items-center gap-3">
            <UserX className="h-5 w-5 text-red-600" />
            <h3 className="font-semibold text-red-900">Alumnos con Múltiples Inasistencias ( &gt; 3 )</h3>
          </div>
          <div className="p-0">
            {data?.muchasFaltas?.length === 0 ? (
              <p className="p-6 text-center text-blue-300 text-sm">No hay alumnos en esta condición.</p>
            ) : (
              <ul className="divide-y divide-white/5">
                {data?.muchasFaltas?.map((alumno: any) => (
                  <li key={alumno.id} className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors">
                    <div>
                      <Link href={`/alumnos/${alumno.id}`} className="font-medium text-blue-600 hover:underline">
                        {alumno.apellido}, {alumno.nombre}
                      </Link>
                      <div className="text-xs text-blue-300 mt-0.5">{alumno.anio}° {alumno.division}ra</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="bg-red-100 text-red-700 font-bold px-3 py-1 rounded-full text-sm">
                        {alumno.cantidad_faltas} faltas
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Muchas Llegadas Tarde */}
        <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-xl shadow-sm border border-white/10 overflow-hidden">
          <div className="bg-amber-50 p-4 border-b border-amber-100 flex items-center gap-3">
            <Clock className="h-5 w-5 text-amber-600" />
            <h3 className="font-semibold text-amber-900">Llegadas Tarde Recurrentes ( &gt; 2 )</h3>
          </div>
          <div className="p-0">
            {data?.muchasTardanzas?.length === 0 ? (
              <p className="p-6 text-center text-blue-300 text-sm">No hay alumnos en esta condición.</p>
            ) : (
              <ul className="divide-y divide-white/5">
                {data?.muchasTardanzas?.map((alumno: any) => (
                  <li key={alumno.id} className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors">
                    <div>
                      <Link href={`/alumnos/${alumno.id}`} className="font-medium text-blue-600 hover:underline">
                        {alumno.apellido}, {alumno.nombre}
                      </Link>
                      <div className="text-xs text-blue-300 mt-0.5">{alumno.anio}° {alumno.division}ra</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="bg-amber-100 text-amber-700 font-bold px-3 py-1 rounded-full text-sm">
                        {alumno.cantidad_tarde} llegadas tarde
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Justificaciones Pendientes */}
        <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-xl shadow-sm border border-white/10 overflow-hidden lg:col-span-2">
          <div className="bg-blue-50 p-4 border-b border-blue-100 flex items-center gap-3">
            <FileWarning className="h-5 w-5 text-blue-600" />
            <h3 className="font-semibold text-blue-900">Justificaciones Pendientes de Revisión</h3>
          </div>
          <div className="p-0">
            {data?.justificacionesPendientes?.length === 0 ? (
              <p className="p-6 text-center text-blue-300 text-sm">No hay justificaciones pendientes.</p>
            ) : (
              <ul className="divide-y divide-white/5">
                {data?.justificacionesPendientes?.map((just: any) => (
                  <li key={just.id} className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors sm:flex-row flex-col sm:items-center items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Link href={`/alumnos/${just.alumno_id}`} className="font-medium text-white hover:text-blue-600 hover:underline">
                          {just.apellido}, {just.nombre}
                        </Link>
                        <span className="text-xs font-medium bg-white/10 text-blue-200 px-2 py-0.5 rounded">
                          {just.anio}° {just.division}ra
                        </span>
                      </div>
                      <p className="text-sm text-blue-200"><span className="font-medium">Motivo:</span> {just.motivo}</p>
                      <p className="text-xs text-blue-300 mt-1">Falta del: {just.fecha}</p>
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto">
                      <Link href="/justificaciones" className="text-sm bg-white/10 backdrop-blur-md border border-white/10 border border-white/20 text-blue-100 hover:bg-white/5 font-medium px-4 py-2 rounded-lg transition-colors text-center flex-1 sm:flex-none">
                        Revisar
                      </Link>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
