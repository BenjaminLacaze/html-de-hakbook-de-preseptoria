import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
  try {
    // Alumnos con muchas faltas (más de 3)
    const muchasFaltas = db.prepare(`
      SELECT 
        a.id, a.nombre, a.apellido, a.dni, c.anio, c.division,
        COUNT(asist.id) as cantidad_faltas
      FROM alumnos a
      JOIN cursos c ON a.curso_id = c.id
      JOIN asistencias asist ON a.id = asist.alumno_id
      WHERE asist.estado = 'AUSENTE'
      GROUP BY a.id
      HAVING cantidad_faltas > 3
      ORDER BY cantidad_faltas DESC
    `).all();

    // Alumnos con llegadas tarde (más de 2)
    const muchasTardanzas = db.prepare(`
      SELECT 
        a.id, a.nombre, a.apellido, a.dni, c.anio, c.division,
        COUNT(asist.id) as cantidad_tarde
      FROM alumnos a
      JOIN cursos c ON a.curso_id = c.id
      JOIN asistencias asist ON a.id = asist.alumno_id
      WHERE asist.estado = 'TARDE'
      GROUP BY a.id
      HAVING cantidad_tarde > 2
      ORDER BY cantidad_tarde DESC
    `).all();

    // Justificaciones pendientes
    const justificacionesPendientes = db.prepare(`
      SELECT 
        j.id, j.fecha, j.motivo,
        a.id as alumno_id, a.nombre, a.apellido, c.anio, c.division
      FROM justificaciones j
      JOIN asistencias asist ON j.asistencia_id = asist.id
      JOIN alumnos a ON asist.alumno_id = a.id
      JOIN cursos c ON a.curso_id = c.id
      WHERE j.estado = 'PENDIENTE'
      ORDER BY j.fecha DESC
    `).all();

    return NextResponse.json({
      muchasFaltas,
      muchasTardanzas,
      justificacionesPendientes
    });
  } catch (error) {
    console.error('Error en /api/seguimiento:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
