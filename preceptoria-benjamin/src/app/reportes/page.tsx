"use client";

import { useEffect, useState } from "react";
import { BarChart3, TrendingDown, FileText } from "lucide-react";
import Link from "next/link";

export default function Reportes() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchReportes() {
      try {
        const response = await fetch('/api/reportes');
        const json = await response.json();
        setData(json);
      } catch (error) {
        console.error("Error fetching reportes:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchReportes();
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
      <div className="bg-white/10 backdrop-blur-md border border-white/10 p-6 rounded-xl shadow-sm border border-white/10">
        <h2 className="text-lg font-semibold text-white mb-2 flex items-center">
          <BarChart3 className="mr-2 h-5 w-5 text-blue-600" /> Reportes Estadísticos
        </h2>
        <p className="text-sm text-blue-300">
          Resumen general de la situación de asistencia de la institución.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Asistencia por curso */}
        <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-xl shadow-sm border border-white/10 p-6 lg:col-span-2">
          <h3 className="text-md font-semibold text-white mb-4">Asistencia por Curso (Histórico)</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-white/5 border-b border-white/10">
                  <th className="px-4 py-2 text-sm font-semibold text-blue-200">Curso</th>
                  <th className="px-4 py-2 text-sm font-semibold text-blue-200">Total Alumnos</th>
                  <th className="px-4 py-2 text-sm font-semibold text-emerald-700">Presentes</th>
                  <th className="px-4 py-2 text-sm font-semibold text-red-700">Ausentes</th>
                  <th className="px-4 py-2 text-sm font-semibold text-amber-700">Llegadas Tarde</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {data?.asistenciaPorCurso?.map((curso: any, idx: number) => (
                  <tr key={idx} className="hover:bg-white/5">
                    <td className="px-4 py-3 font-medium text-white">{curso.anio}° {curso.division}ra</td>
                    <td className="px-4 py-3 text-blue-200">{curso.total_alumnos}</td>
                    <td className="px-4 py-3 text-emerald-600 font-medium">{curso.presentes}</td>
                    <td className="px-4 py-3 text-red-600 font-medium">{curso.ausentes}</td>
                    <td className="px-4 py-3 text-amber-600 font-medium">{curso.tarde}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top 5 Ausentes */}
        <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-xl shadow-sm border border-white/10 p-6">
          <h3 className="text-md font-semibold text-white mb-4 flex items-center">
            <TrendingDown className="mr-2 h-5 w-5 text-red-500" /> Alumnos con más faltas
          </h3>
          <ul className="divide-y divide-white/5">
            {data?.topAusentes?.map((alumno: any) => (
              <li key={alumno.id} className="py-3 flex justify-between items-center">
                <div>
                  <Link href={`/alumnos/${alumno.id}`} className="font-medium text-white hover:text-blue-400 hover:underline">
                    {alumno.apellido}, {alumno.nombre}
                  </Link>
                  <div className="text-xs text-blue-300">{alumno.anio}° {alumno.division}ra</div>
                </div>
                <div className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-bold">
                  {alumno.faltas}
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Resumen Justificaciones */}
        <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-xl shadow-sm border border-white/10 p-6">
          <h3 className="text-md font-semibold text-white mb-4 flex items-center">
            <FileText className="mr-2 h-5 w-5 text-purple-500" /> Estado de Justificaciones
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-100 rounded-lg">
              <span className="font-medium text-blue-900">Pendientes</span>
              <span className="text-lg font-bold text-blue-700">{data?.statsJustificaciones?.pendientes}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-100 rounded-lg">
              <span className="font-medium text-emerald-900">Aprobadas</span>
              <span className="text-lg font-bold text-emerald-700">{data?.statsJustificaciones?.aprobadas}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-red-50 border border-red-100 rounded-lg">
              <span className="font-medium text-red-900">Rechazadas</span>
              <span className="text-lg font-bold text-red-700">{data?.statsJustificaciones?.rechazadas}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
