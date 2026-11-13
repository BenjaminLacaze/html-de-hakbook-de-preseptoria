import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
  try {
    // Asistencia por curso
    const asistenciaPorCurso = db.prepare(`
      SELECT 
        c.anio, c.division,
        COUNT(DISTINCT a.id) as total_alumnos,
        SUM(CASE WHEN asist.estado = 'PRESENTE' THEN 1 ELSE 0 END) as presentes,
        SUM(CASE WHEN asist.estado = 'AUSENTE' THEN 1 ELSE 0 END) as ausentes,
        SUM(CASE WHEN asist.estado = 'TARDE' THEN 1 ELSE 0 END) as tarde
      FROM cursos c
      LEFT JOIN alumnos a ON c.id = a.curso_id
      LEFT JOIN asistencias asist ON a.id = asist.alumno_id
      GROUP BY c.id
      ORDER BY c.anio, c.division
    `).all();

    // Top 5 alumnos con más inasistencias
    const topAusentes = db.prepare(`
      SELECT 
        a.id, a.nombre, a.apellido, c.anio, c.division,
        COUNT(asist.id) as faltas
      FROM alumnos a
      JOIN cursos c ON a.curso_id = c.id
      JOIN asistencias asist ON a.id = asist.alumno_id
      WHERE asist.estado = 'AUSENTE'
      GROUP BY a.id
      ORDER BY faltas DESC
      LIMIT 5
    `).all();

    // Estado de Justificaciones global
    const statsJustificacionesRow = db.prepare(`
      SELECT 
        SUM(CASE WHEN estado = 'PENDIENTE' THEN 1 ELSE 0 END) as pendientes,
        SUM(CASE WHEN estado = 'APROBADA' THEN 1 ELSE 0 END) as aprobadas,
        SUM(CASE WHEN estado = 'RECHAZADA' THEN 1 ELSE 0 END) as rechazadas
      FROM justificaciones
    `).get() as { pendientes: number, aprobadas: number, rechazadas: number };

    return NextResponse.json({
      asistenciaPorCurso,
      topAusentes,
      statsJustificaciones: {
        pendientes: statsJustificacionesRow.pendientes || 0,
        aprobadas: statsJustificacionesRow.aprobadas || 0,
        rechazadas: statsJustificacionesRow.rechazadas || 0
      }
    });
  } catch (error) {
    console.error('Error en /api/reportes:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
