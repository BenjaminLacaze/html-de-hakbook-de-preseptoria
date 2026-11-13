import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const fecha = searchParams.get('fecha');

    let sql = `
      SELECT 
        a.id as asistencia_id, a.fecha, a.estado,
        al.id as alumno_id, al.nombre, al.apellido, al.dni,
        c.anio, c.division,
        j.id as justificacion_id, j.estado as justificacion_estado
      FROM asistencias a
      JOIN alumnos al ON a.alumno_id = al.id
      JOIN cursos c ON al.curso_id = c.id
      LEFT JOIN justificaciones j ON j.asistencia_id = a.id
      WHERE a.estado = 'AUSENTE'
    `;
    const params: any[] = [];

    if (fecha) {
      sql += ` AND a.fecha = ?`;
      params.push(fecha);
    }

    sql += ` ORDER BY a.fecha DESC, c.anio, c.division, al.apellido`;

    const inasistencias = db.prepare(sql).all(...params);

    return NextResponse.json(inasistencias);
  } catch (error) {
    console.error('Error en /api/inasistencias:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
