"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Clock, Filter, AlertCircle } from "lucide-react";
import Link from "next/link";

export default function LlegadasTarde() {
  const [fechaFiltro, setFechaFiltro] = useState("");
  const [llegadasTarde, setLlegadasTarde] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLlegadasTarde() {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams();
        if (fechaFiltro) queryParams.append('fecha', fechaFiltro);

        const response = await fetch(`/api/llegadas-tarde?${queryParams.toString()}`);
        const data = await response.json();
        setLlegadasTarde(data);
      } catch (error) {
        console.error("Error fetching llegadas tarde:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchLlegadasTarde();
  }, [fechaFiltro]);

  return (
    <div className="space-y-6">
      <div className="bg-white/10 backdrop-blur-md border border-white/10 p-4 rounded-xl shadow-sm border border-white/10 flex flex-col sm:flex-row gap-4 items-center">
        <div className="flex-1 flex items-center gap-2">
          <Clock className="h-5 w-5 text-amber-500" />
          <h2 className="text-lg font-semibold text-white">Llegadas Tarde Registradas</h2>
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
                <th className="px-6 py-3 text-sm font-semibold text-blue-200 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-blue-300">Cargando llegadas tarde...</td>
                </tr>
              ) : llegadasTarde.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-blue-300">
                    No se encontraron llegadas tarde para los filtros seleccionados.
                  </td>
                </tr>
              ) : (
                llegadasTarde.map((llegada) => (
                  <tr key={llegada.asistencia_id} className="hover:bg-amber-500/10 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-blue-100">{llegada.fecha}</td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-white">{llegada.apellido}, {llegada.nombre}</div>
                      <div className="text-xs text-blue-300">DNI: {llegada.dni}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-blue-200">
                      {llegada.anio}° {llegada.division}ra
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link 
                        href={`/alumnos/${llegada.alumno_id}`}
                        className="text-sm text-blue-600 hover:text-blue-800 hover:underline font-medium"
                      >
                        Ver Perfil
                      </Link>
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
