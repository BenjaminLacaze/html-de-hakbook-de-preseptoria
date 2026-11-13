import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const estado = searchParams.get('estado');

    let sql = `
      SELECT 
        j.id, j.estado, j.motivo, j.fecha, j.observacion,
        a.id as asistencia_id, a.fecha as fecha_asistencia,
        al.id as alumno_id, al.nombre, al.apellido,
        c.anio, c.division
      FROM justificaciones j
      JOIN asistencias a ON j.asistencia_id = a.id
      JOIN alumnos al ON a.alumno_id = al.id
      LEFT JOIN cursos c ON al.curso_id = c.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (estado && estado !== 'TODAS') {
      sql += ` AND j.estado = ?`;
      params.push(estado);
    }

    sql += ` ORDER BY j.fecha DESC`;

    const justificaciones = db.prepare(sql).all(...params);

    return NextResponse.json(justificaciones);
  } catch (error) {
    console.error('Error en /api/justificaciones:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { asistencia_id, motivo, observacion, estado = 'PENDIENTE' } = body;

    if (!asistencia_id || !motivo) {
      return NextResponse.json({ error: 'Faltan datos requeridos (asistencia_id, motivo)' }, { status: 400 });
    }

    const asistencia = db.prepare('SELECT id, fecha FROM asistencias WHERE id = ?').get(asistencia_id) as { id: number; fecha: string } | undefined;
    if (!asistencia) {
      return NextResponse.json({ error: 'Registro de asistencia no encontrado' }, { status: 404 });
    }

    const existing = db.prepare('SELECT id FROM justificaciones WHERE asistencia_id = ?').get(asistencia_id) as { id: number } | undefined;
    if (existing) {
      db.prepare(`
        UPDATE justificaciones SET motivo = ?, estado = ?, observacion = ? WHERE id = ?
      `).run(motivo, estado, observacion || null, existing.id);
      return NextResponse.json({ success: true, id: existing.id, message: 'Justificación actualizada correctamente' });
    }

    const info = db.prepare(`
      INSERT INTO justificaciones (asistencia_id, estado, motivo, fecha, observacion)
      VALUES (?, ?, ?, ?, ?)
    `).run(asistencia_id, estado, motivo, asistencia.fecha, observacion || null);

    return NextResponse.json({
      success: true,
      id: info.lastInsertRowid,
      message: 'Justificación registrada correctamente'
    });
  } catch (error) {
    console.error('Error en POST /api/justificaciones:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
