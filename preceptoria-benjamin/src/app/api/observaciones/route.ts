import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { format } from 'date-fns';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { alumno_id, texto, preceptor } = body;

    if (!alumno_id || !texto || !preceptor) {
      return NextResponse.json({ error: 'Faltan datos requeridos' }, { status: 400 });
    }

    const fecha = format(new Date(), 'yyyy-MM-dd');

    const stmt = db.prepare(`
      INSERT INTO observaciones (alumno_id, fecha, texto, preceptor)
      VALUES (?, ?, ?, ?)
    `);
    
    const info = stmt.run(alumno_id, fecha, texto, preceptor);

    return NextResponse.json({ 
      success: true, 
      id: info.lastInsertRowid,
      message: 'Observación registrada correctamente' 
    });
  } catch (error) {
    console.error('Error en /api/observaciones:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
