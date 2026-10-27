// Build del sitio para Vercel.
//
// 1. Copia todo el repo (landing, informes, handbooks, docs) a dist/.
// 2. Compila la app React/Vite de cada módulo y la deja en dist/<modulo>/app/,
//    en lugar del código fuente.
//
// Las apps no se pueden servir "crudas": su index.html pide /src/main.tsx,
// que solo existe con el servidor de desarrollo de Vite. Compiladas quedan
// como HTML + JS comunes que Vercel sirve sin problema.
//
// Uso local:  node scripts/build.mjs   y después:  npx serve dist

import { spawnSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, rmSync, readdirSync } from 'node:fs';
import { join, relative, resolve, sep } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const dist = join(root, 'dist');

// Módulos que tienen app React en <modulo>/app/.
// Para sumar uno: agregarlo acá y su rewrite en vercel.json.
const modulesWithApp = [
  'profesores-nicolas',
  'directivos-jesica-agustin',
  'alumnos-julian',
  'alumnos-lucia',
  'consolidacion', // Preceptoría, Auxiliares y Centro de Estudiantes
];

// shared/ son tipos que se compilan dentro de cada app: no hace falta publicarlos sueltos.
// backend/ y api/ son la API (Vercel la publica como función): no van al sitio estático.
const skipTop = new Set([
  'node_modules', '.git', 'dist', '.vercel', 'scripts', 'shared', 'backend', 'api',
  'package.json', 'package-lock.json', 'prisma.config.ts', '.env', '.env.example', 'recursos',
  'julian appcompleta', // copia original de Julián (no se publica; ver consolidacion/README.md)
]);
const appDirs = new Set(modulesWithApp.map((m) => join(root, m, 'app')));

function run(cmd, cwd) {
  console.log(`\n> ${cmd}   (en ${relative(root, cwd) || '.'})`);
  const r = spawnSync(cmd, { cwd, stdio: 'inherit', shell: true });
  if (r.status !== 0) throw new Error(`falló: ${cmd}`);
}

// Cliente de Prisma para la API (api/index.ts). No necesita conexión a la base.
run('npx prisma generate', root);

rmSync(dist, { recursive: true, force: true });
mkdirSync(dist);

// Copia estática: todo menos node_modules y el código fuente de las apps.
for (const entry of readdirSync(root)) {
  if (skipTop.has(entry) || entry.startsWith('.')) continue; // .env, .gitignore, etc.
  cpSync(join(root, entry), join(dist, entry), {
    recursive: true,
    filter: (src) => !appDirs.has(src) && !src.split(sep).includes('node_modules'),
  });
}

// Diseño unificado: la landing lo carga desde shared/design/tokens.css.
mkdirSync(join(dist, 'shared', 'design'), { recursive: true });
cpSync(join(root, 'shared', 'design', 'tokens.css'), join(dist, 'shared', 'design', 'tokens.css'));

const failed = [];
for (const mod of modulesWithApp) {
  const cwd = join(root, mod, 'app');
  const out = join(dist, mod, 'app');
  try {
    if (!existsSync(join(cwd, 'package.json'))) throw new Error('no tiene package.json');
    // --legacy-peer-deps: las apps hechas con AI Studio piden esbuild 0.25 y
    // Vite 8 declara 0.27+ como opcional; sin esto npm se niega a instalar.
    // --no-package-lock: no generar package-lock.json (las apps usan bun.lock).
    run('npm install --no-audit --no-fund --loglevel=error --legacy-peer-deps --no-package-lock', cwd);
    // vite build directo (sin "tsc"): un error de tipos no debe frenar el deploy de todos.
    run(`npx vite build --base=/${mod}/app/ --outDir "${out}" --emptyOutDir`, cwd);
  } catch (err) {
    console.error(`\n!! ${mod}: ${err.message}`);
    failed.push(mod);
  }
}

if (failed.length) {
  console.error(`\nApps que no compilaron: ${failed.join(', ')}`);
  process.exit(1);
}
console.log('\nListo: sitio completo en dist/');
