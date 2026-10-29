// Preparación explícita de Supabase. Rechaza Neon y cualquier destino distinto.
import 'dotenv/config';
import pg from 'pg';
import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const action = process.argv[2] ?? 'check';
if (!['check', 'prepare'].includes(action)) throw new Error('Uso: node scripts/supabase.mjs check|prepare');
const direct = process.env.DIRECT_DATABASE_URL;
const runtime = process.env.DATABASE_URL;
for (const [name,value] of [['DIRECT_DATABASE_URL',direct],['DATABASE_URL',runtime]]) {
  if (!value) throw new Error(`Falta ${name} en el .env local.`);
  const u = new URL(value);
  if (!/(^|\.)supabase\.(co|com)$/.test(u.hostname)) throw new Error(`${name} todavía no apunta a Supabase. Se detuvo sin modificar la base.`);
  if (!u.password || /CONTRASENA|YOUR.PASSWORD/.test(u.password)) throw new Error(`Completá la contraseña de ${name}.`);
}
const d = new URL(direct);
if (d.port === '6543') throw new Error('Las migraciones usan conexión directa o Session pooler 5432; no Transaction pooler 6543.');
const connection = new pg.Client({ connectionString: direct });
try {
  await connection.connect();
  const { rows } = await connection.query('SELECT current_database() AS database, current_user AS role');
  console.log('Conexión Supabase verificada:', rows[0].database, '· usuario:', rows[0].role);
  if (action === 'prepare') {
    const migration = spawnSync(process.execPath, [resolve(root, 'node_modules/prisma/build/index.js'), 'migrate', 'deploy'], {
      cwd: root, env: {...process.env, DATABASE_URL: runtime, DIRECT_DATABASE_URL: direct}, stdio:'inherit',
    });
    if (migration.status !== 0) throw new Error('No se pudieron aplicar las migraciones.');
    // Estas tablas se acceden a través de nuestra API, nunca desde la clave pública de Supabase.
    // Se limitan SOLO las tablas de este proyecto: no auth.*, storage.* ni otros esquemas.
    const schema = readFileSync(resolve(root,'backend/prisma/schema.prisma'),'utf8');
    const names = [...schema.matchAll(/@@map\("([a-z_]+)"\)/g)].map(m=>m[1]);
    names.push('_prisma_migrations','_Prerequisites');
    await connection.query('BEGIN');
    try {
      for (const name of names) {
        const exists = await connection.query('SELECT to_regclass($1) AS name', [`public."${name}"`]);
        if (!exists.rows[0].name) continue;
        const ident = `public."${name.replaceAll('"','""')}"`;
        await connection.query(`ALTER TABLE ${ident} ENABLE ROW LEVEL SECURITY`);
        for (const role of ['anon','authenticated']) {
          const r = await connection.query('SELECT 1 FROM pg_roles WHERE rolname=$1',[role]);
          if(r.rowCount) await connection.query(`REVOKE ALL ON TABLE ${ident} FROM "${role}"`);
        }
      }
      await connection.query('COMMIT');
    } catch(e) {await connection.query('ROLLBACK');throw e;}
    console.log('Esquema aplicado. Acceso público de Supabase bloqueado para las tablas de la aplicación.');
  }
} finally { await connection.end(); }
