"use client";

import { useEffect, useState } from "react";
import { 
  Users, 
  UserCheck, 
  UserX, 
  Clock, 
  AlertCircle,
  TrendingUp 
} from "lucide-react";
import Link from "next/link";

interface DashboardData {
  fechaActual: string;
  totalAlumnos: number;
  presentes: number;
  ausentes: number;
  tarde: number;
  requierenAtencion: number;
  porcentajeAsistencia: number;
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('/api/dashboard');
        const json = await response.json();
        setData(json);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!data) {
    return <div>Error al cargar los datos del dashboard.</div>;
  }

  return (
    <div className="space-y-6">
      {/* Tarjetas de Estadísticas Principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Alumnos" 
          value={data.totalAlumnos} 
          icon={<Users className="h-6 w-6 text-blue-600" />} 
          bgIcon="bg-blue-100" 
        />
        <StatCard 
          title="Porcentaje Asistencia" 
          value={`${data.porcentajeAsistencia}%`} 
          icon={<TrendingUp className="h-6 w-6 text-green-600" />} 
          bgIcon="bg-green-100" 
        />
        <StatCard 
          title="Presentes Hoy" 
          value={data.presentes} 
          icon={<UserCheck className="h-6 w-6 text-emerald-600" />} 
          bgIcon="bg-emerald-100" 
        />
        <StatCard 
          title="Ausentes Hoy" 
          value={data.ausentes} 
          icon={<UserX className="h-6 w-6 text-red-600" />} 
          bgIcon="bg-red-100" 
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Otras Estadísticas */}
        <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-xl shadow-sm border border-white/10 p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
            <Clock className="h-5 w-5 mr-2 text-amber-500" />
            Llegadas Tarde del Día
          </h2>
          <div className="flex items-end justify-between">
            <div className="text-4xl font-bold text-white">{data.tarde}</div>
            <Link href="/llegadas-tarde" className="text-sm text-blue-600 hover:underline">
              Ver detalle &rarr;
            </Link>
          </div>
        </div>

        {/* Alertas */}
        <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-xl shadow-sm border border-white/10 p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
            <AlertCircle className="h-5 w-5 mr-2 text-red-500" />
            Casos que requieren atención
          </h2>
          <div className="flex items-end justify-between">
            <div className="text-4xl font-bold text-white">{data.requierenAtencion}</div>
            <Link href="/seguimiento" className="text-sm text-blue-600 hover:underline">
              Ir a Seguimiento &rarr;
            </Link>
          </div>
          <p className="text-sm text-blue-300 mt-2">
            Alumnos con múltiples inasistencias o situaciones a revisar.
          </p>
        </div>
      </div>
      
      {/* Quick Actions / Atajos */}
      <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-xl shadow-sm border border-white/10 p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Acciones Rápidas</h2>
        <div className="flex flex-wrap gap-4">
          <Link href="/asistencia" className="px-4 py-2 bg-white/10 hover:bg-white/30 text-blue-100 rounded-lg font-medium text-sm transition-colors">
            Pasar Lista
          </Link>
          <Link href="/justificaciones" className="px-4 py-2 bg-white/10 hover:bg-white/30 text-blue-100 rounded-lg font-medium text-sm transition-colors">
            Revisar Justificaciones
          </Link>
          <Link href="/alumnos" className="px-4 py-2 bg-white/10 hover:bg-white/30 text-blue-100 rounded-lg font-medium text-sm transition-colors">
            Buscar Alumno
          </Link>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, bgIcon }: { title: string, value: string | number, icon: React.ReactNode, bgIcon: string }) {
  return (
    <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-xl p-6 shadow-sm border border-white/10 flex items-center">
      <div className={`p-3 rounded-lg ${bgIcon} mr-4`}>
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium text-blue-300">{title}</p>
        <h3 className="text-2xl font-bold text-white">{value}</h3>
      </div>
    </div>
  );
}
