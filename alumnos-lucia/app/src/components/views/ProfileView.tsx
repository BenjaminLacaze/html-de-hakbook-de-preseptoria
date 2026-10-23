/**
 * Vista de Perfil Académico ("Mi Perfil") - Módulo Alumno
 * Estricto modo de consulta de datos oficiales
 * Responsable: Lucia Salgado
 */

import React from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  User,
  GraduationCap,
  Building,
  Mail,
  ShieldCheck,
  AlertCircle,
  Clock,
  IdCard,
  FileCheck
} from 'lucide-react';

export const ProfileView: React.FC = () => {
  const { student, isDemoMode } = useAuth();

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Encabezado */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
          Información del Alumno
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Ficha académica oficial en modo de solo lectura registrado en el Instituto N° 26
        </p>
      </div>

      {/* Ficha principal de identidad */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 sm:p-6 shadow-xs transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div className="w-16 h-16 rounded-full bg-blue-900 text-white flex items-center justify-center font-bold text-xl shrink-0 shadow-sm">
            {student.firstName.charAt(0)}{student.lastName.charAt(0)}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100">
                {student.firstName} {student.lastName}
              </h2>
              <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-700">
                <ShieldCheck size={12} />
                Matrícula {student.enrollmentStatus}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
              {student.career}
            </p>
            <p className="text-xs text-blue-800 dark:text-blue-400 font-medium mt-0.5">
              {student.institution} ({student.institutionShort})
            </p>
          </div>
        </div>

        {/* Grilla de datos académicos estructurados */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 pt-6">
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <IdCard size={14} />
              <span>Identificación Oficial</span>
            </h3>

            <div className="space-y-2.5 text-xs sm:text-sm">
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400">N° de Legajo:</span>
                <span className="font-mono font-semibold text-slate-900 dark:text-slate-100">{student.legajo}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400">DNI:</span>
                <span className="font-mono font-semibold text-slate-900 dark:text-slate-100">{student.dni}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400">Correo Institucional:</span>
                <span className="font-medium text-blue-700 dark:text-blue-400 truncate max-w-[200px]">{student.email}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400">Ciclo Lectivo:</span>
                <span className="font-semibold text-slate-900 dark:text-slate-100">{student.academicYear}</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <GraduationCap size={14} />
              <span>Cursado y División</span>
            </h3>

            <div className="space-y-2.5 text-xs sm:text-sm">
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400">Año de Cursada:</span>
                <span className="font-semibold text-slate-900 dark:text-slate-100">{student.year}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400">División:</span>
                <span className="font-semibold text-slate-900 dark:text-slate-100">{student.division}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400">Turno y Franja:</span>
                <span className="font-semibold text-slate-900 dark:text-slate-100">{student.shift}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400">Asistencia Mínima Requerida:</span>
                <span className="font-bold text-emerald-700 dark:text-emerald-400">{student.minimumAttendanceRequired}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Referente Institucional de Preceptoría */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 sm:p-6 transition-colors">
        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 mb-3">
          <Building size={16} className="text-blue-700 dark:text-blue-400" />
          <span>Contacto de Preceptoría Asignada</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs sm:text-sm">
          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-md border border-slate-200 dark:border-slate-700/60">
            <span className="text-slate-500 dark:text-slate-400 block text-xs">Preceptor a Cargo:</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5 block">{student.preceptorContact.name}</span>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-md border border-slate-200 dark:border-slate-700/60">
            <span className="text-slate-500 dark:text-slate-400 block text-xs">Ubicación Física:</span>
            <span className="font-medium text-slate-800 dark:text-slate-200 mt-0.5 block">{student.preceptorContact.office}</span>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-md border border-slate-200 dark:border-slate-700/60">
            <span className="text-slate-500 dark:text-slate-400 block text-xs">Correo Electrónico:</span>
            <span className="font-mono text-xs text-blue-700 dark:text-blue-400 mt-0.5 block truncate">{student.preceptorContact.email}</span>
          </div>
        </div>
      </div>

      {/* Aviso de modo consulta sin edición */}
      <div className="p-4 bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl flex items-start gap-3 text-xs text-slate-600 dark:text-slate-300">
        <AlertCircle size={18} className="text-slate-600 dark:text-slate-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold text-slate-800 dark:text-slate-200">
            Trámite de rectificación o actualización de legajo
          </p>
          <p className="leading-relaxed">
            Por disposición reglamentaria del Sistema de Asistencia Escolar, el alumno no puede modificar directamente sus datos personales ni su condición académica desde la plataforma web. Si necesitas solicitar una actualización de tus datos filiatorios, contacta a la Secretaría de Alumnos con fotocopia de tu DNI vigente.
          </p>
        </div>
      </div>
    </div>
  );
};
