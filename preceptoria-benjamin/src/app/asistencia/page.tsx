"use client";

import { useState, useEffect, useCallback } from "react";
import { Calendar as CalendarIcon, Users, CheckCircle2, XCircle, Clock } from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";

export default function Asistencia() {
  const [fecha, setFecha] = useState("");
  const [curso, setCurso] = useState("1");
  const [asistencias, setAsistencias] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actualizandoId, setActualizandoId] = useState<number | null>(null);

  useEffect(() => {
    async function initFecha() {
      try {
        const res = await fetch('/api/dashboard');
        const data = await res.json();
        if (data?.fechaActual) {
          setFecha(data.fechaActual);
          return;
        }
      } catch (e) {
        console.error("Error obteniendo fecha inicial:", e);
      }
      setFecha(format(new Date(), 'yyyy-MM-dd'));
    }
    initFecha();
  }, []);

  const fetchAsistencia = useCallback(async () => {
    if (!fecha || !curso) return;
    setLoading(true);
    try {
      const response = await fetch(`/api/asistencia?fecha=${fecha}&curso_id=${curso}`);
      const data = await response.json();
      setAsistencias(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching asistencia:", error);
    } finally {
      setLoading(false);
    }
  }, [fecha, curso]);

  useEffect(() => {
    fetchAsistencia();
  }, [fetchAsistencia]);

  const actualizarEstado = async (alumnoId: number, nuevoEstado: string) => {
    setActualizandoId(alumnoId);
    try {
      const res = await fetch('/api/asistencia', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alumno_id: alumnoId, fecha, estado: nuevoEstado })
      });
      if (res.ok) {
        setAsistencias((prev) =>
          prev.map((a) => (a.alumno_id === alumnoId ? { ...a, estado: nuevoEstado } : a))
        );
      }
    } catch (error) {
      console.error("Error actualizando asistencia:", error);
    } finally {
      setActualizandoId(null);
    }
  };

  const marcarTodosPresentes = async () => {
    if (asistencias.length === 0 || !fecha) return;
    setLoading(true);
    try {
      const registros = asistencias.map((a) => ({
        alumno_id: a.alumno_id,
        fecha,
        estado: 'PRESENTE'
      }));
      const res = await fetch('/api/asistencia', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ registros })
      });
      if (res.ok) {
        await fetchAsistencia();
      }
    } catch (error) {
      console.error("Error marcando todos presentes:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white/10 backdrop-blur-md border border-white/10 p-6 rounded-xl shadow-sm border border-white/10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <h2 className="text-lg font-semibold text-white flex items-center">
            <CalendarIcon className="mr-2 h-5 w-5 text-blue-600" /> Consultar y Pasar Asistencia
          </h2>
          {asistencias.length > 0 && (
            <button
              type="button"
              onClick={marcarTodosPresentes}
              className="px-3 py-1.5 text-xs font-medium bg-emerald-600/80 hover:bg-emerald-500 text-white rounded-lg transition-colors self-start sm:self-auto"
            >
              Marcar todos Presentes
            </button>
          )}
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-blue-100 mb-1">Fecha</label>
            <input 
              type="date" 
              className="w-full px-4 py-2 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-blue-100 mb-1">Curso y División</label>
            <select 
              className="w-full px-4 py-2 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/10 backdrop-blur-md border border-white/10"
              value={curso}
              onChange={(e) => setCurso(e.target.value)}
            >
              <option value="1">1° 1ra</option>
              <option value="2">1° 2da</option>
              <option value="3">2° 1ra</option>
              <option value="4">3° 1ra</option>
            </select>
          </div>
        </div>
        <p className="text-sm text-blue-300 mt-4">
          Nota: En esta versión demostrativa, la asistencia proviene de una base de datos local que simula la respuesta de la API centralizada.
        </p>
      </div>

      <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-xl shadow-sm border border-white/10 overflow-hidden">
        <div className="p-4 border-b border-white/10 bg-white/5 flex flex-wrap justify-between items-center gap-4">
          <h3 className="font-medium text-white flex items-center">
            <Users className="h-5 w-5 mr-2 text-blue-300" />
            Alumnos ({asistencias.length})
          </h3>
          <div className="flex gap-4 text-sm font-medium">
            <span className="flex items-center text-emerald-400"><CheckCircle2 className="h-4 w-4 mr-1"/> Presentes: {asistencias.filter(a => a.estado === 'PRESENTE').length}</span>
            <span className="flex items-center text-amber-400"><Clock className="h-4 w-4 mr-1"/> Tarde: {asistencias.filter(a => a.estado === 'TARDE').length}</span>
            <span className="flex items-center text-red-400"><XCircle className="h-4 w-4 mr-1"/> Ausentes: {asistencias.filter(a => a.estado === 'AUSENTE').length}</span>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white/10 backdrop-blur-md border border-white/10 border-b border-white/10">
                <th className="px-6 py-3 text-sm font-semibold text-blue-200">Alumno</th>
                <th className="px-6 py-3 text-sm font-semibold text-blue-200">DNI</th>
                <th className="px-6 py-3 text-sm font-semibold text-blue-200">Estado de Asistencia</th>
                <th className="px-6 py-3 text-sm font-semibold text-blue-200 text-right">Registrar / Cambiar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-blue-300">
                    Cargando información de asistencia...
                  </td>
                </tr>
              ) : asistencias.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-blue-300">
                    No hay alumnos registrados para este curso.
                  </td>
                </tr>
              ) : (
                asistencias.map((alumno) => (
                  <tr key={alumno.alumno_id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 font-medium text-white">
                      <Link href={`/alumnos/${alumno.alumno_id}`} className="hover:text-blue-400 hover:underline">
                        {alumno.apellido}, {alumno.nombre}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-sm text-blue-200">{alumno.dni}</td>
                    <td className="px-6 py-4">
                      {alumno.estado === 'PRESENTE' && (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-sm font-medium bg-emerald-100 text-emerald-800 border border-emerald-200">
                          <CheckCircle2 className="mr-1.5 h-4 w-4" /> Presente
                        </span>
                      )}
                      {alumno.estado === 'AUSENTE' && (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-sm font-medium bg-red-100 text-red-800 border border-red-200">
                          <XCircle className="mr-1.5 h-4 w-4" /> Ausente
                        </span>
                      )}
                      {alumno.estado === 'TARDE' && (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-sm font-medium bg-amber-100 text-amber-800 border border-amber-200">
                          <Clock className="mr-1.5 h-4 w-4" /> Llegada Tarde
                        </span>
                      )}
                      {!alumno.estado && (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-sm font-medium bg-white/10 text-blue-200 border border-white/10">
                          Sin Registro
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="inline-flex gap-1.5">
                        <button
                          type="button"
                          disabled={actualizandoId === alumno.alumno_id}
                          onClick={() => actualizarEstado(alumno.alumno_id, 'PRESENTE')}
                          className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                            alumno.estado === 'PRESENTE'
                              ? 'bg-emerald-600 text-white'
                              : 'bg-white/10 text-emerald-300 hover:bg-emerald-600/40'
                          }`}
                        >
                          P
                        </button>
                        <button
                          type="button"
                          disabled={actualizandoId === alumno.alumno_id}
                          onClick={() => actualizarEstado(alumno.alumno_id, 'TARDE')}
                          className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                            alumno.estado === 'TARDE'
                              ? 'bg-amber-500 text-white'
                              : 'bg-white/10 text-amber-300 hover:bg-amber-500/40'
                          }`}
                        >
                          T
                        </button>
                        <button
                          type="button"
                          disabled={actualizandoId === alumno.alumno_id}
                          onClick={() => actualizarEstado(alumno.alumno_id, 'AUSENTE')}
                          className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                            alumno.estado === 'AUSENTE'
                              ? 'bg-red-600 text-white'
                              : 'bg-white/10 text-red-300 hover:bg-red-600/40'
                          }`}
                        >
                          A
                        </button>
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
