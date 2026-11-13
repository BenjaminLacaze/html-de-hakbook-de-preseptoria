"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { ArrowLeft, User, Calendar, AlertTriangle, FileText, MessageSquare, Plus } from "lucide-react";
import { format } from "date-fns";

export default function AlumnoPerfil({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [mostrarFormObs, setMostrarFormObs] = useState(false);
  const [nuevaObsTexto, setNuevaObsTexto] = useState("");
  const [nuevaObsPreceptor, setNuevaObsPreceptor] = useState("Preceptor Demo");
  const [guardandoObs, setGuardandoObs] = useState(false);

  async function fetchAlumno() {
    try {
      const response = await fetch(`/api/alumnos/${id}`);
      const json = await response.json();
      setData(json);
    } catch (error) {
      console.error("Error fetching alumno:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchAlumno();
  }, [id]);

  const guardarObservacion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevaObsTexto.trim() || !nuevaObsPreceptor.trim()) return;
    setGuardandoObs(true);
    try {
      const res = await fetch('/api/observaciones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          alumno_id: Number(id),
          texto: nuevaObsTexto.trim(),
          preceptor: nuevaObsPreceptor.trim()
        })
      });
      if (res.ok) {
        setNuevaObsTexto("");
        setMostrarFormObs(false);
        await fetchAlumno();
      }
    } catch (error) {
      console.error("Error guardando observación:", error);
    } finally {
      setGuardandoObs(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!data || data.error) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl text-blue-200">No se pudo cargar la información del alumno.</h2>
        <Link href="/alumnos" className="text-blue-600 hover:underline mt-4 inline-block">Volver al listado</Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Botón Volver */}
      <div>
        <Link href="/alumnos" className="inline-flex items-center text-sm font-medium text-blue-300 hover:text-white transition-colors">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver al listado
        </Link>
      </div>

      {/* Tarjeta Principal (Info Básica + Stats) */}
      <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-xl shadow-sm border border-white/10 overflow-hidden">
        <div className="p-6 md:p-8 flex flex-col md:flex-row gap-8 items-start md:items-center border-b border-white/5">
          <div className="h-24 w-24 bg-white/10 rounded-full flex items-center justify-center shrink-0">
            <User className="h-12 w-12 text-slate-400" />
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-white">{data.apellido}, {data.nombre}</h1>
            <div className="mt-2 flex flex-wrap gap-4 text-sm text-blue-200">
              <span className="flex items-center"><User className="mr-1.5 h-4 w-4 text-slate-400" /> DNI: {data.dni}</span>
              <span className="flex items-center">
                <div className="h-1.5 w-1.5 rounded-full bg-slate-400 mr-2"></div> 
                Curso: {data.anio}° {data.division}ra
              </span>
            </div>
          </div>
          
          <div className="flex gap-4 md:border-l md:border-white/10 md:pl-8 w-full md:w-auto">
            <div className="text-center flex-1">
              <div className="text-3xl font-bold text-blue-600">{data.stats.porcentajeAsistencia}%</div>
              <div className="text-xs font-medium text-blue-300 uppercase tracking-wider mt-1">Asistencia</div>
            </div>
            <div className="text-center flex-1">
              <div className="text-3xl font-bold text-red-500">{data.stats.ausentes}</div>
              <div className="text-xs font-medium text-blue-300 uppercase tracking-wider mt-1">Faltas</div>
            </div>
          </div>
        </div>
      </div>

      {/* Grillas de Información */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Historial Reciente */}
        <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-xl shadow-sm border border-white/10 p-6 flex flex-col h-96">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white flex items-center">
              <Calendar className="mr-2 h-5 w-5 text-blue-500" /> Historial de Asistencia
            </h2>
          </div>
          <div className="flex-1 overflow-y-auto pr-2">
            {data.historial.length === 0 ? (
              <p className="text-blue-300 text-sm">No hay registros de asistencia.</p>
            ) : (
              <div className="space-y-3">
                {data.historial.slice(0, 15).map((registro: any) => (
                  <div key={registro.id} className="flex justify-between items-center p-3 bg-white/5 rounded-lg border border-white/5">
                    <span className="text-sm font-medium text-blue-100">{registro.fecha}</span>
                    <BadgeEstado estado={registro.estado} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Observaciones */}
        <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-xl shadow-sm border border-white/10 p-6 flex flex-col h-96">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white flex items-center">
              <MessageSquare className="mr-2 h-5 w-5 text-amber-500" /> Observaciones
            </h2>
            <button
              type="button"
              onClick={() => setMostrarFormObs((prev) => !prev)}
              className="text-sm text-blue-400 hover:text-blue-300 font-medium flex items-center px-2.5 py-1 rounded-md bg-white/5 hover:bg-white/10 border border-white/10"
            >
              <Plus className="h-4 w-4 mr-1" /> {mostrarFormObs ? "Cancelar" : "Nueva"}
            </button>
          </div>

          {mostrarFormObs && (
            <form onSubmit={guardarObservacion} className="mb-4 p-3 bg-white/5 border border-white/10 rounded-lg space-y-3">
              <div>
                <input
                  type="text"
                  placeholder="Preceptor..."
                  value={nuevaObsPreceptor}
                  onChange={(e) => setNuevaObsPreceptor(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-slate-900/80 border border-white/20 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <textarea
                  rows={2}
                  placeholder="Escribir observación sobre el alumno..."
                  value={nuevaObsTexto}
                  onChange={(e) => setNuevaObsTexto(e.target.value)}
                  className="w-full px-3 py-1.5 text-sm bg-slate-900/80 border border-white/20 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  required
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={guardandoObs}
                  className="px-3 py-1.5 text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white rounded-md disabled:opacity-50"
                >
                  {guardandoObs ? "Guardando..." : "Guardar Observación"}
                </button>
              </div>
            </form>
          )}

          <div className="flex-1 overflow-y-auto pr-2">
            {data.observaciones.length === 0 ? (
              <p className="text-blue-300 text-sm">No hay observaciones registradas.</p>
            ) : (
              <div className="space-y-4">
                {data.observaciones.map((obs: any) => (
                  <div key={obs.id} className="p-4 bg-amber-500/10 rounded-lg border border-amber-500/20">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs font-semibold text-amber-800 bg-amber-100 px-2 py-1 rounded">{obs.fecha}</span>
                      <span className="text-xs text-amber-300">{obs.preceptor}</span>
                    </div>
                    <p className="text-sm text-blue-100 mt-2">{obs.texto}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Justificaciones */}
        <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-xl shadow-sm border border-white/10 p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white flex items-center">
              <FileText className="mr-2 h-5 w-5 text-purple-500" /> Justificaciones
            </h2>
          </div>
          <div className="overflow-x-auto">
            {data.justificaciones.length === 0 ? (
              <p className="text-blue-300 text-sm">No hay justificaciones registradas.</p>
            ) : (
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-blue-300">
                    <th className="pb-3 font-semibold">Fecha Inasistencia</th>
                    <th className="pb-3 font-semibold">Motivo</th>
                    <th className="pb-3 font-semibold">Estado</th>
                    <th className="pb-3 font-semibold text-right">Detalle</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {data.justificaciones.map((just: any) => (
                    <tr key={just.id}>
                      <td className="py-3 font-medium text-blue-100">{just.fecha_asistencia}</td>
                      <td className="py-3 text-blue-200">{just.motivo}</td>
                      <td className="py-3">
                        <BadgeJustificacion estado={just.estado} />
                      </td>
                      <td className="py-3 text-right">
                        {just.observacion ? (
                          <span className="text-xs text-blue-300 italic" title={just.observacion}>Con observación</span>
                        ) : (
                          <span className="text-xs text-slate-400">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

function BadgeEstado({ estado }: { estado: string }) {
  switch (estado) {
    case 'PRESENTE':
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">Presente</span>;
    case 'AUSENTE':
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Ausente</span>;
    case 'TARDE':
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">Llegada Tarde</span>;
    default:
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/10 text-white">{estado}</span>;
  }
}

function BadgeJustificacion({ estado }: { estado: string }) {
  switch (estado) {
    case 'APROBADA':
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">Aprobada</span>;
    case 'RECHAZADA':
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Rechazada</span>;
    case 'PENDIENTE':
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">Pendiente</span>;
    default:
      return <span>{estado}</span>;
  }
}
