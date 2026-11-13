// Arma la carpeta que se publica en Vercel como proyecto de SOLO API (el ecosistema de Julián).
// No compila las apps: copia api/, backend/ (código, esquema y migraciones) y shared/.
//
// Uso (desde la raíz):
//   node scripts/deploy-api.mjs
//   cd .deploy/i26-ecosistema-api && vercel deploy --prod
//
// Cada publicación aplica las migraciones pendientes en la base del proyecto (Neon conectada
// desde Vercel, variables DATABASE_URL y DATABASE_URL_UNPOOLED). Para cargar cuentas y datos
// de ejemplo una vez: vercel deploy --prod --build-env ONLINE_SEED=1 --build-env ONLINE_ACCOUNTS_PASSWORD=...
//
// La conexión a la base (DATABASE_URL) se configura en el proyecto de Vercel, nunca acá.
import { cpSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join, resolve, sep } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const out = join(root, '.deploy', 'i26-ecosistema-api');

// Conserva el vínculo con el proyecto de Vercel (.vercel/) entre una publicación y la siguiente.
for (const entry of ['api', 'backend', 'shared', 'public', 'consolidacion']) rmSync(join(out, entry), { recursive: true, force: true });
mkdirSync(out, { recursive: true });

const skip = (src) => {
  const parts = src.split(sep);
  return !parts.some((p) => ['node_modules', 'generated', '.local-dev', '.local-test', 'test'].includes(p));
};
cpSync(join(root, 'api'), join(out, 'api'), { recursive: true });
cpSync(join(root, 'backend'), join(out, 'backend'), { recursive: true, filter: skip });
mkdirSync(join(out, 'shared'), { recursive: true });
for (const f of ['types.ts', 'testUsers.ts']) cpSync(join(root, 'shared', f), join(out, 'shared', f));
for (const f of ['package.json', 'package-lock.json', 'prisma.config.ts']) cpSync(join(root, f), join(out, f));
// Datos de ejemplo (backend/src/demo-data.ts los toma de las pantallas rescatadas).
const legacy = join('consolidacion', 'app', 'src', 'legacy');
mkdirSync(join(out, legacy), { recursive: true });
for (const f of ['constants.ts', 'types.ts']) cpSync(join(root, legacy, f), join(out, legacy, f));

mkdirSync(join(out, 'public'), { recursive: true });
writeFileSync(
  join(out, 'public', 'index.html'),
  '<!doctype html><meta charset="utf-8"><title>API Ecosistema ISFDyT 26</title><p>API del Sistema de Gestión ISFDyT N.° 26. Estado: <a href="/api/v1/health">/api/v1/health</a></p>\n',
);
writeFileSync(
  join(out, 'vercel.json'),
  JSON.stringify(
    {
      $schema: 'https://openapi.vercel.sh/vercel.json',
      framework: null,
      installCommand: 'npm install',
      // Crea o actualiza las tablas en cada publicación (migraciones, sin borrar datos).
      // Con ONLINE_SEED=1 (solo cuando se pide, con --build-env) carga cuentas y datos de ejemplo.
      buildCommand:
        'npx prisma generate && DIRECT_DATABASE_URL="$DATABASE_URL_UNPOOLED" npx prisma migrate deploy' +
        ' && if [ "$ONLINE_SEED" = "1" ]; then npx tsx backend/src/online-seed.ts && npx tsx backend/src/demo-data.ts && npx tsx backend/src/online-seed.ts; fi',
      outputDirectory: 'public',
      rewrites: [{ source: '/api/(.*)', destination: '/api' }],
      functions: { 'api/index.ts': { maxDuration: 15 } },
    },
    null,
    2,
  ) + '\n',
);
writeFileSync(join(out, '.gitignore'), '.vercel\nnode_modules\n.env*\n');
console.log(`Listo: ${out}`);
