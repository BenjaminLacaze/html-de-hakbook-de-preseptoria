import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const fecha = searchParams.get('fecha');
    const cursoId = searchParams.get('curso_id');

    if (!fecha || !cursoId) {
      return NextResponse.json({ error: 'Faltan parámetros fecha y curso_id' }, { status: 400 });
    }

    // Obtener los alumnos del curso y su estado de asistencia para esa fecha
    const asistencias = db.prepare(`
      SELECT 
        a.id as alumno_id, 
        a.nombre, 
        a.apellido, 
        a.dni,
        asist.id as asistencia_id,
        asist.estado
      FROM alumnos a
      LEFT JOIN asistencias asist ON a.id = asist.alumno_id AND asist.fecha = ?
      WHERE a.curso_id = ?
      ORDER BY a.apellido, a.nombre
    `).all(fecha, cursoId);

    return NextResponse.json(asistencias);
  } catch (error) {
    console.error('Error en /api/asistencia:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { alumno_id, fecha, estado, registros } = body;

    const upsertOne = (alumnoId: number, fechaStr: string, estadoStr: string) => {
      const existing = db.prepare(
        'SELECT id FROM asistencias WHERE alumno_id = ? AND fecha = ?'
      ).get(alumnoId, fechaStr) as { id: number } | undefined;

      if (existing) {
        db.prepare('UPDATE asistencias SET estado = ? WHERE id = ?').run(estadoStr, existing.id);
      } else {
        db.prepare(
          'INSERT INTO asistencias (alumno_id, fecha, estado) VALUES (?, ?, ?)'
        ).run(alumnoId, fechaStr, estadoStr);
      }
    };

    if (Array.isArray(registros)) {
      const tx = db.transaction((items: { alumno_id: number; fecha: string; estado: string }[]) => {
        for (const item of items) {
          if (item.alumno_id && item.fecha && ['PRESENTE', 'AUSENTE', 'TARDE'].includes(item.estado)) {
            upsertOne(item.alumno_id, item.fecha, item.estado);
          }
        }
      });
      tx(registros);
      return NextResponse.json({ success: true, message: 'Asistencias actualizadas correctamente' });
    }

    if (!alumno_id || !fecha || !['PRESENTE', 'AUSENTE', 'TARDE'].includes(estado)) {
      return NextResponse.json({ error: 'Datos de asistencia inválidos' }, { status: 400 });
    }

    upsertOne(Number(alumno_id), fecha, estado);

    return NextResponse.json({ success: true, message: 'Asistencia registrada correctamente' });
  } catch (error) {
    console.error('Error en POST /api/asistencia:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
