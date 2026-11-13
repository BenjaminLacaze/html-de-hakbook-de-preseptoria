"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search, Filter, Eye } from "lucide-react";

interface Alumno {
  id: number;
  nombre: string;
  apellido: string;
  dni: string;
  anio: number;
  division: number;
}

export default function AlumnosList() {
  const [alumnos, setAlumnos] = useState<Alumno[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [cursoFiltro, setCursoFiltro] = useState("");

  useEffect(() => {
    async function fetchAlumnos() {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams();
        if (search) queryParams.append('q', search);
        if (cursoFiltro) queryParams.append('curso_id', cursoFiltro);

        const response = await fetch(`/api/alumnos?${queryParams.toString()}`);
        const data = await response.json();
        setAlumnos(data);
      } catch (error) {
        console.error("Error fetching alumnos:", error);
      } finally {
        setLoading(false);
      }
    }
    
    // Simple debounce para la búsqueda
    const timer = setTimeout(() => {
      fetchAlumnos();
    }, 300);

    return () => clearTimeout(timer);
  }, [search, cursoFiltro]);

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <div className="bg-white/10 backdrop-blur-md border border-white/10 p-4 rounded-xl shadow-sm border border-white/10 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input 
            type="text" 
            placeholder="Buscar por nombre, apellido o DNI..." 
            className="w-full pl-10 pr-4 py-2 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <div className="relative w-full sm:w-64">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <select 
            className="w-full pl-10 pr-4 py-2 border border-white/20 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/10 backdrop-blur-md border border-white/10"
            value={cursoFiltro}
            onChange={(e) => setCursoFiltro(e.target.value)}
          >
            <option value="">Todos los cursos</option>
            <option value="1">1° 1ra</option>
            <option value="2">1° 2da</option>
            <option value="3">2° 1ra</option>
            <option value="4">3° 1ra</option>
          </select>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-xl shadow-sm border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 border-b border-white/10">
                <th className="px-6 py-3 text-sm font-semibold text-blue-200">Alumno</th>
                <th className="px-6 py-3 text-sm font-semibold text-blue-200">DNI</th>
                <th className="px-6 py-3 text-sm font-semibold text-blue-200">Curso</th>
                <th className="px-6 py-3 text-sm font-semibold text-blue-200 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-blue-300">
                    <div className="flex justify-center mb-2">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                    Cargando alumnos...
                  </td>
                </tr>
              ) : alumnos.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-blue-300">
                    No se encontraron alumnos con los filtros actuales.
                  </td>
                </tr>
              ) : (
                alumnos.map((alumno) => (
                  <tr key={alumno.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-white">{alumno.apellido}, {alumno.nombre}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-blue-200">{alumno.dni}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {alumno.anio}° {alumno.division}ra
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link 
                        href={`/alumnos/${alumno.id}`}
                        className="inline-flex items-center justify-center p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                        title="Ver Perfil"
                      >
                        <Eye className="h-5 w-5" />
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
