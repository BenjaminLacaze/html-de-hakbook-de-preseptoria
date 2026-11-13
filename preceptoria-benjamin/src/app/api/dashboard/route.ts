import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
  try {
    const totalAlumnosRow = db.prepare('SELECT COUNT(*) as count FROM alumnos').get() as { count: number };
    const totalAlumnos = totalAlumnosRow.count;

    // Asumimos que la fecha actual es '2026-09-04' (última fecha del seed) o buscamos la última fecha registrada
    const ultimaFechaRow = db.prepare('SELECT MAX(fecha) as fecha FROM asistencias').get() as { fecha: string };
    const fecha = ultimaFechaRow.fecha;

    const presentesRow = db.prepare('SELECT COUNT(*) as count FROM asistencias WHERE fecha = ? AND estado = ?').get(fecha, 'PRESENTE') as { count: number };
    const ausentesRow = db.prepare('SELECT COUNT(*) as count FROM asistencias WHERE fecha = ? AND estado = ?').get(fecha, 'AUSENTE') as { count: number };
    const tardeRow = db.prepare('SELECT COUNT(*) as count FROM asistencias WHERE fecha = ? AND estado = ?').get(fecha, 'TARDE') as { count: number };

    // Alumnos que requieren atención (ej: más de 2 faltas totales)
    const requierenAtencionRows = db.prepare(`
      SELECT alumno_id, COUNT(*) as faltas 
      FROM asistencias 
      WHERE estado = 'AUSENTE' 
      GROUP BY alumno_id 
      HAVING faltas > 2
    `).all();

    const porcentajeAsistencia = totalAlumnos > 0 ? ((presentesRow.count + tardeRow.count) / totalAlumnos) * 100 : 0;

    return NextResponse.json({
      fechaActual: fecha,
      totalAlumnos,
      presentes: presentesRow.count,
      ausentes: ausentesRow.count,
      tarde: tardeRow.count,
      requierenAtencion: requierenAtencionRows.length,
      porcentajeAsistencia: Math.round(porcentajeAsistencia)
    });
  } catch (error) {
    console.error('Error en /api/dashboard:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
