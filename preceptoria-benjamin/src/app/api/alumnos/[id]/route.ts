import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const alumnoId = parseInt(id, 10);

    if (isNaN(alumnoId)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
    }

    // Datos básicos del alumno
    const alumno = db.prepare(`
      SELECT a.id, a.nombre, a.apellido, a.dni, c.anio, c.division, c.id as curso_id
      FROM alumnos a
      LEFT JOIN cursos c ON a.curso_id = c.id
      WHERE a.id = ?
    `).get(alumnoId);

    if (!alumno) {
      return NextResponse.json({ error: 'Alumno no encontrado' }, { status: 404 });
    }

    // Historial de asistencias
    const asistencias = db.prepare(`
      SELECT id, fecha, estado 
      FROM asistencias 
      WHERE alumno_id = ?
      ORDER BY fecha DESC
    `).all(alumnoId);

    // Faltas y llegadas tarde (estadísticas)
    const stats = {
      presentes: 0,
      ausentes: 0,
      tarde: 0
    };

    asistencias.forEach((a: any) => {
      if (a.estado === 'PRESENTE') stats.presentes++;
      else if (a.estado === 'AUSENTE') stats.ausentes++;
      else if (a.estado === 'TARDE') stats.tarde++;
    });

    const porcentajeAsistencia = asistencias.length > 0 
      ? Math.round(((stats.presentes + stats.tarde) / asistencias.length) * 100) 
      : 0;

    // Justificaciones
    const justificaciones = db.prepare(`
      SELECT j.id, j.estado, j.motivo, j.fecha, j.observacion, a.fecha as fecha_asistencia
      FROM justificaciones j
      JOIN asistencias a ON j.asistencia_id = a.id
      WHERE a.alumno_id = ?
      ORDER BY j.fecha DESC
    `).all(alumnoId);

    // Observaciones
    const observaciones = db.prepare(`
      SELECT id, fecha, texto, preceptor
      FROM observaciones
      WHERE alumno_id = ?
      ORDER BY fecha DESC
    `).all(alumnoId);

    return NextResponse.json({
      ...alumno,
      stats: {
        ...stats,
        total: asistencias.length,
        porcentajeAsistencia
      },
      historial: asistencias,
      justificaciones,
      observaciones
    });
  } catch (error) {
    console.error('Error en /api/alumnos/[id]:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
