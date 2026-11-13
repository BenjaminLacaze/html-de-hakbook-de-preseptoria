"use client";

import { usePathname } from "next/navigation";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const routeNames: Record<string, string> = {
  "/": "Dashboard Principal",
  "/alumnos": "Gestión de Alumnos",
  "/asistencia": "Seguimiento de Asistencia",
  "/inasistencias": "Control de Inasistencias",
  "/llegadas-tarde": "Llegadas Tarde",
  "/justificaciones": "Justificaciones",
  "/seguimiento": "Seguimiento y Alertas",
  "/reportes": "Reportes",
};

export default function Header() {
  const pathname = usePathname();
  
  // Buscar el título de la ruta actual
  let title = "Sistema de Preceptoría";
  if (routeNames[pathname]) {
    title = routeNames[pathname];
  } else if (pathname.startsWith("/alumnos/")) {
    title = "Perfil del Alumno";
  }

  const currentDate = format(new Date(), "EEEE, d 'de' MMMM 'de' yyyy", { locale: es });
  // Capitalize first letter of date
  const formattedDate = currentDate.charAt(0).toUpperCase() + currentDate.slice(1);

  return (
    <header className="bg-white/10 backdrop-blur-md border border-white/10 border-b border-white/10 h-16 flex items-center justify-between px-8 sticky top-0 z-10">
      <h1 className="text-2xl font-semibold text-white">{title}</h1>
      <div className="text-sm font-medium text-blue-300 bg-white/5 px-4 py-2 rounded-md border border-white/10">
        {formattedDate}
      </div>
    </header>
  );
}
