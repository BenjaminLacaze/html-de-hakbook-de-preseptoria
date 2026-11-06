import { neon, type NeonQueryFunction } from '@neondatabase/serverless';
import { env } from 'node:process';
import { ensureAuthTables, requireSession, upsertProfileInState } from './_auth.js';

const institutionId = 'isfdyt26';

let databaseReady: Promise<void> | undefined;

async function ensureDatabase(sql: NeonQueryFunction<false, false>) {
  if (!databaseReady) {
    databaseReady = (async () => {
      await sql`CREATE TABLE IF NOT EXISTS institution_state (
        institution_id TEXT PRIMARY KEY,
        payload JSONB NOT NULL,
        revision INTEGER NOT NULL DEFAULT 1,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )`;
    })().catch((error) => {
      databaseReady = undefined;
      throw error;
    });
  }

  await databaseReady;
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET' && req.method !== 'PUT') {
    res.setHeader('Allow', 'GET, PUT');
    return res.status(405).json({ error: 'Método no permitido.' });
  }

  const databaseUrl = env.DATABASE_URL;
  if (!databaseUrl) {
    return res.status(503).json({ error: 'La base de datos todavía no está configurada.' });
  }

  try {
    const sql = neon(databaseUrl);
    await ensureDatabase(sql);
    await ensureAuthTables(sql);
    const session = await requireSession(req, sql);
    if (!session) {
      res.setHeader('Cache-Control', 'no-store');
      return res.status(401).json({ error: 'Iniciá sesión para acceder a la información institucional.' });
    }
    res.setHeader('Cache-Control', 'no-store');

    if (req.method === 'GET') {
      const rows = await sql`
        SELECT payload, revision, updated_at
        FROM institution_state
        WHERE institution_id = ${institutionId}
        LIMIT 1
      `;
      if (rows[0]?.payload) await upsertProfileInState(sql, session.user);
      return res.status(200).json({
        data: rows[0]?.payload ?? null,
        revision: rows[0]?.revision ?? 0,
      });
    }

    const payload = req.body;
    const requiredCollections = [
      'users', 'courses', 'students', 'teachers', 'subjects', 'teacherAssignments',
      'attendanceRecords', 'gradeRecords', 'schedules', 'events', 'notices', 'auditLogs',
    ];
    if (!payload || typeof payload !== 'object' ||
        requiredCollections.some((key) => !Array.isArray(payload[key])) ||
        !payload.institutionSettings || typeof payload.institutionSettings !== 'object') {
      return res.status(400).json({ error: 'El estado institucional enviado no tiene el formato esperado.' });
    }

    const rows = await sql`
      INSERT INTO institution_state (institution_id, payload)
      VALUES (${institutionId}, ${JSON.stringify(payload)}::jsonb)
      ON CONFLICT (institution_id) DO UPDATE SET
        payload = EXCLUDED.payload,
        revision = institution_state.revision + 1,
        updated_at = NOW()
      RETURNING revision, updated_at
    `;
    return res.status(200).json({ success: true, revision: rows[0].revision });
  } catch (error) {
    console.error('[Neon] No se pudo procesar el estado institucional.', error);
    return res.status(500).json({ error: 'No se pudo guardar o leer la información institucional.' });
  }
}
