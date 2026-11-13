import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');
    const cursoId = searchParams.get('curso_id');

    let sql = `
      SELECT a.id, a.nombre, a.apellido, a.dni, c.anio, c.division, a.curso_id 
      FROM alumnos a 
      LEFT JOIN cursos c ON a.curso_id = c.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (query) {
      sql += ` AND (a.nombre LIKE ? OR a.apellido LIKE ? OR a.dni LIKE ?)`;
      const likeQuery = `%${query}%`;
      params.push(likeQuery, likeQuery, likeQuery);
    }

    if (cursoId) {
      sql += ` AND a.curso_id = ?`;
      params.push(cursoId);
    }

    const alumnos = db.prepare(sql).all(...params);

    return NextResponse.json(alumnos);
  } catch (error) {
    console.error('Error en /api/alumnos:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
