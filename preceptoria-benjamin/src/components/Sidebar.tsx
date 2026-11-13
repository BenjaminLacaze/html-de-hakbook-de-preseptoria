"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Users, 
  CalendarCheck, 
  CalendarX, 
  Clock, 
  FileCheck, 
  AlertTriangle, 
  BarChart3,
  GraduationCap
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const menuItems = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Alumnos", href: "/alumnos", icon: Users },
  { name: "Asistencia", href: "/asistencia", icon: CalendarCheck },
  { name: "Inasistencias", href: "/inasistencias", icon: CalendarX },
  { name: "Llegadas Tarde", href: "/llegadas-tarde", icon: Clock },
  { name: "Justificaciones", href: "/justificaciones", icon: FileCheck },
  { name: "Seguimiento", href: "/seguimiento", icon: AlertTriangle },
  { name: "Reportes", href: "/reportes", icon: BarChart3 },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white/5 backdrop-blur-md border-r border-white/10 text-white flex flex-col h-screen fixed top-0 left-0">
      <div className="h-16 flex items-center px-6 border-b border-white/10">
        <GraduationCap className="h-8 w-8 text-blue-400 mr-3 filter drop-shadow-[0_0_8px_rgba(96,165,250,0.8)]" />
        <span className="text-xl font-bold tracking-tight">Preceptoría</span>
      </div>
      <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-300",
                isActive
                  ? "bg-blue-500/80 text-white shadow-[0_0_15px_rgba(59,130,246,0.6)]"
                  : "text-blue-100 hover:bg-white/10 hover:text-white hover:translate-x-1"
              )}
            >
              <item.icon className={cn("mr-3 h-5 w-5 transition-colors", isActive ? "text-white" : "text-blue-200")} />
              {item.name}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-white/10">
        <div className="flex items-center">
          <div className="h-8 w-8 rounded-full bg-slate-700 flex items-center justify-center text-sm font-medium">
            P
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium">Preceptor Demo</p>
            <p className="text-xs text-slate-400">Turno Mañana</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
