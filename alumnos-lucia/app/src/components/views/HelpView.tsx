import React from 'react';
import { useAuth } from '../../context/AuthContext';
import type { NavView } from '../../types';
export const HelpView: React.FC<{
    onNavigate: (v: NavView) => void;
}> = ({ onNavigate }) => { const { settings } = useAuth(); return <section><h2>Ayuda sobre asistencia</h2><p>El resumen oficial lo calcula el servidor. El mínimo institucional es {settings.minAttendancePercent}% y el umbral de alerta es {settings.attendanceRiskThresholdPercent}%.</p><p>Cada llegada tarde computa {settings.lateArrivalAbsenceWeight} inasistencias. Las ausencias justificadas aprobadas se excluyen del total computable.</p><p>Los filtros muestran un cálculo informativo del subconjunto seleccionado con esa misma regla. Las materias anuales aparecen en el total anual, sin asignarlas a un cuatrimestre.</p><p>Para presentar o corregir una justificación, contactá a Preceptoría. El portal no puede cargar certificados ni modificar la ficha institucional.</p><button onClick={() => onNavigate('asistencia')}>Consultar asistencia</button></section>; };
