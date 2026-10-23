# CHANGELOG

## 2026-10-23 — Reorganización y publicación de las apps

**Problema:** en Vercel solo andaban los informes HTML. Las 4 apps React
(Profesor, Directivos, Alumno Julián, Alumno Lucía) nunca se compilaban: Vercel
servía el código fuente y el `index.html` pedía `/src/main.tsx` en la raíz del
sitio, que no existe. Además las carpetas tenían espacios y tildes en el nombre.

**Qué cambió**

- Carpetas renombradas (con `git mv`, el historial se conserva):
  - `Benjamin - Preceptoría/` → `preceptoria-benjamin/`
  - `Jesica y Agustin - Directivos/` → `directivos-jesica-agustin/`
  - `Julian - Alumnos/` → `alumnos-julian/` y `Modulo Alumno/` → `app/`
  - `Lucia - Alumnos/` → `alumnos-lucia/`, `modulo alumno/modulo-alumno-documentacion/` → `documentacion/`,
    `panel-alumno---sistema-de-asistencia-escolar/` → `app/`
  - `Nicolas - Profesores/` → `profesores-nicolas/` y `Modulo Profesor/` → `app/`
- Nuevo `scripts/build.mjs` + `vercel.json`: Vercel compila cada `app/` y la publica en
  `/<modulo>/app/`. Las URLs viejas (con espacios) redirigen a las nuevas.
- Landing (`index.html`): cada tarjeta tiene botón **Abrir app** + enlaces a la documentación.
- `alumnos-julian/app/src/App.tsx`: `BrowserRouter` con `basename` para funcionar dentro de una subcarpeta.
- `directivos-jesica-agustin/app/src/services/googleAuth.ts`: Firebase solo se inicializa si
  están las variables `VITE_FIREBASE_*`. Sin eso la app entera quedaba en blanco
  (`auth/invalid-api-key`). Ahora arranca y solo el backup a Google Drive avisa que no está configurado.
- Borrados duplicados exactos: `profesores-nicolas/app/docs/contrato-backend/` (igual a `profesores-nicolas/docs/`)
  y `alumnos-julian/app/vercel.json` (lo reemplaza el de la raíz).
- `docs/Contrato_backend_alumno_julian.md` actualizado a la versión nueva que estaba en `alumnos-julian/docs/`.
- Rutas viejas corregidas dentro de READMEs y contratos.
- Nuevos `README.md` (estructura y cómo sumar módulos) y `.gitignore` (`node_modules/`, `dist/`, `.env*`).

**Para que ande**

- Nada que configurar en Vercel: `vercel.json` define build, salida y rewrites.
- Compañeros: `git pull`. Si tenían cambios sin subir en las carpetas viejas, moverlos a la carpeta nueva.
- Para correr una app: `cd <modulo>/app && npm install --legacy-peer-deps && npm run dev`.

**Probado localmente:** build completo OK (las 4 apps compilan) y las 4 apps cargan
con contenido en el navegador servidas desde `dist/`.

**Pendiente / no tocado**

- `alumnos-lucia/app/src` tiene archivos de entrada repetidos (`App.js`, `App.jsx`, `App.tsx`,
  `index.js`, `main.tsx`); se usa `index.js` → `App.jsx`. No se borró nada: que lo decida Lucía.
- `directivos-jesica-agustin/app/server.ts` (API mock con Express) no corre en Vercel: la app usa
  sus datos de prueba internos. El botón "Descargar ZIP" (`/api/download-zip`) no funciona publicado.
- El build usa `vite build` sin `tsc`: errores de tipos no frenan el deploy.

**Deploy (cómo está conectado):** `sistema-gestion-i26.vercel.app` **no** se publica desde este repo,
sino desde `mjsis20052/sistema-gestion-i26` (proyecto Vercel `mjsis20052-3236s-projects/sistema-gestion-i26`).
- Los pushes a `main` de ese repo quedan como **Preview**; para pasarlos a producción:
  `vercel promote <url-del-preview> --scope mjsis20052-3236s-projects --yes`.
- Vercel (plan Hobby) **bloquea** commits cuyo autor no es `mjsis20052`
  ("Deployment was blocked"). Los commits a ese repo tienen que ir firmados por esa cuenta.
- 2026-10-23: publicado en producción con el contenido de `d525248`; las 4 apps verificadas en vivo.

## 2026-10-23 — Redirecciones de URLs viejas

Las redirecciones con espacios en el `source` no coincidían en Vercel (daban 404).
`vercel.json` ahora usa patrones `(.*)` que cubren espacios y `%20`.
