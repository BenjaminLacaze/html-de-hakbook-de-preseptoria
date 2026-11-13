import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { estado, observacion } = body;

    const justificacionId = parseInt(id, 10);
    if (isNaN(justificacionId)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
    }

    if (!estado || !['PENDIENTE', 'APROBADA', 'RECHAZADA'].includes(estado)) {
      return NextResponse.json({ error: 'Estado inválido' }, { status: 400 });
    }

    const stmt = db.prepare(`
      UPDATE justificaciones 
      SET estado = ?, observacion = ?
      WHERE id = ?
    `);
    
    const info = stmt.run(estado, observacion || null, justificacionId);

    if (info.changes === 0) {
      return NextResponse.json({ error: 'Justificación no encontrada' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Justificación actualizada' });
  } catch (error) {
    console.error('Error en /api/justificaciones/[id]:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
