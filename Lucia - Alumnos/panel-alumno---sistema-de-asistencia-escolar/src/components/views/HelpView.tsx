/**
 * Vista de Ayuda y Preguntas Frecuentes - Módulo Alumno
 * Explicación funcional, fórmula de cálculo y protocolo institucional
 * Responsable: Lucia Salgado
 */

import React from 'react';
import {
  HelpCircle,
  Calculator,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  FileCheck,
  AlertTriangle,
  Mail,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import { NavView } from '../../types';

interface HelpViewProps {
  onNavigate: (view: NavView) => void;
}

export const HelpView: React.FC<HelpViewProps> = ({ onNavigate }) => {
  return (
    <div className="space-y-6 max-w-4xl">
      {/* Encabezado */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
          Guía de Ayuda y Funcionamiento
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Instructivo oficial para el uso del Módulo Alumno del Sistema de Asistencia Escolar
        </p>
      </div>

      {/* Tarjeta destacada: Alcance y Limitación de Edición */}
      <div className="bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-xl p-5 text-blue-950 dark:text-blue-100">
        <div className="flex items-start gap-3">
          <ShieldAlert size={22} className="text-blue-700 dark:text-blue-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h2 className="text-sm font-bold">
              Aviso fundamental: Carácter de solo consulta
            </h2>
            <p className="text-xs sm:text-sm text-blue-900 dark:text-blue-200 leading-relaxed">
              El <strong>Panel Alumno</strong> es una interfaz de visualización y consulta ciudadana. Los alumnos <strong>no pueden modificar, borrar ni registrar asistencias oficiales</strong>. Cualquier rectificación, certificado médico o aviso institucional debe canalizarse por las vías administrativas habituales de la institución (Preceptoría y Secretaría).
            </p>
          </div>
        </div>
      </div>

      {/* Sección 1: Significado de cada estado de asistencia */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 sm:p-6 transition-colors">
        <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
          <span>1. Estados oficiales de asistencia</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
          <div className="p-3.5 rounded-lg border border-emerald-200 bg-emerald-50/50 dark:bg-emerald-950/20 dark:border-emerald-800">
            <div className="flex items-center gap-2 font-bold text-emerald-800 dark:text-emerald-300 mb-1">
              <CheckCircle2 size={16} />
              <span>PRESENTE</span>
            </div>
            <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed">
              El alumno asistió al espacio curricular en tiempo y forma. Computa <strong>1.0 jornada computable</strong> de asistencia plena (100%).
            </p>
          </div>

          <div className="p-3.5 rounded-lg border border-amber-200 bg-amber-50/50 dark:bg-amber-950/20 dark:border-amber-800">
            <div className="flex items-center gap-2 font-bold text-amber-800 dark:text-amber-300 mb-1">
              <Clock size={16} />
              <span>LLEGADA TARDE</span>
            </div>
            <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed">
              Ingreso con posterioridad al toque de timbre pero dentro de los 30 minutos de tolerancia. Computa <strong>0.5 unidades de inasistencia</strong> (media falta).
            </p>
          </div>

          <div className="p-3.5 rounded-lg border border-rose-200 bg-rose-50/50 dark:bg-rose-950/20 dark:border-rose-800">
            <div className="flex items-center gap-2 font-bold text-rose-800 dark:text-rose-300 mb-1">
              <XCircle size={16} />
              <span>AUSENTE (Injustificado)</span>
            </div>
            <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed">
              El alumno no concurrió a la clase y no ha presentado constancia médica o laboral formal. Computa <strong>0.0 de asistencia</strong> y descuenta del porcentaje de regularidad.
            </p>
          </div>

          <div className="p-3.5 rounded-lg border border-blue-200 bg-blue-50/50 dark:bg-blue-950/20 dark:border-blue-800">
            <div className="flex items-center gap-2 font-bold text-blue-800 dark:text-blue-300 mb-1">
              <FileCheck size={16} />
              <span>JUSTIFICADO</span>
            </div>
            <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed">
              Inasistencia amparada por certificado médico, citación judicial o causal institucional aceptada por Secretaría. No genera sanción de falta injustificada.
            </p>
          </div>
        </div>
      </div>

      {/* Sección 2: Cómo se calcula el porcentaje de asistencia */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 sm:p-6 transition-colors">
        <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-2">
          <Calculator size={18} className="text-blue-700 dark:text-blue-400" />
          <span>2. Cálculo del porcentaje de asistencia</span>
        </h2>

        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
          El porcentaje de asistencia se calcula estrictamente a partir de las jornadas oficiales asentadas y computadas para el período seleccionado:
        </p>

        <div className="my-4 p-4 bg-slate-50 dark:bg-slate-800/80 rounded-lg border border-slate-200 dark:border-slate-700 text-center font-mono text-xs sm:text-sm">
          <span className="font-semibold text-blue-900 dark:text-blue-300">
            % Asistencia = [ (Presentes × 1.0) + (Llegadas Tarde × 0.5) + (Justificados × 0.5) ] ÷ Total Jornadas × 100
          </span>
        </div>

        <div className="space-y-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
          <p>
            <strong>Regla de regularidad:</strong>
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Mayor o igual al 75%:</strong> Alumno en condición regular pleno para rendir exámenes finales ordinarios.</li>
            <li><strong>Entre 60% y 74%:</strong> Condición en riesgo. Requiere justificación formal de inasistencias en Secretaría.</li>
            <li><strong>Menor al 60%:</strong> Pérdida de la regularidad en el espacio curricular (condición libre).</li>
          </ul>
        </div>
      </div>

      {/* Sección 3: Cómo utilizar los filtros de búsqueda */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 sm:p-6 transition-colors">
        <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-2">
          <Search size={18} className="text-blue-700 dark:text-blue-400" />
          <span>3. Uso de filtros en "Mi Asistencia"</span>
        </h2>

        <div className="space-y-3 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
          <p>
            En la sección <strong>Mi Asistencia</strong> puedes acotar la visualización de tus registros:
          </p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>
              <strong>Filtro por Período / Mes:</strong> Te permite evaluar el porcentaje obtenido en el 1° Cuatrimestre, 2° Cuatrimestre o en un mes calendario específico.
            </li>
            <li>
              <strong>Filtro por Estado:</strong> Puedes aislar rápidamente sólo tus inasistencias para verificar cuántas faltas acumulaste.
            </li>
            <li>
              <strong>Búsqueda por texto:</strong> Escribe el nombre de una materia (por ejemplo <em>"Programación"</em> o <em>"Bases de Datos"</em>) para ver tu historial exclusivo de esa cátedra.
            </li>
            <li>
              <strong>Botón "Limpiar filtros":</strong> Restablece inmediatamente todos los controles al valor por defecto.
            </li>
          </ul>

          <div className="pt-2">
            <button
              type="button"
              onClick={() => onNavigate('asistencia')}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700 dark:text-blue-400 hover:underline"
            >
              <span>Ir a practicar filtros en Mi Asistencia</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Sección 4: Protocolo en caso de discrepancias */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 sm:p-6 transition-colors">
        <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-2">
          <AlertTriangle size={18} className="text-amber-600 dark:text-amber-400" />
          <span>4. ¿Qué hacer si un registro parece incorrecto?</span>
        </h2>

        <div className="space-y-3 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
          <p>
            Si detectas que figurás ausente en una jornada a la que asististe o si tu llegada tarde no fue computada adecuadamente:
          </p>
          <ol className="list-decimal pl-5 space-y-2">
            <li>
              Anota la <strong>fecha</strong> y el <strong>nombre de la materia</strong> cuestionada.
            </li>
            <li>
              Comunícate con el <strong>docente de la cátedra</strong> para constatar la firma del parte diario o de trabajos prácticos entregados ese día.
            </li>
            <li>
              Presenta la solicitud de revisión ante la <strong>Preceptoría del Turno Tarde</strong> del I26 dentro de los 5 días hábiles posteriores a la fecha del registro.
            </li>
            <li>
              En caso de certificados médicos, recuerda que deben presentarse en Secretaría dentro de las 48 horas de producido el reintegro.
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
};
