# CHANGELOG

## 2026-10-23 — Etapa 0: modelo de datos unificado (`shared/`)

**Decisiones aprobadas:** modelo terciario (comisiones), API en inglés (campos y códigos) y
PostgreSQL (Neon). Los **dos** portales de Alumno se integran; se elige uno después de que los prueben. Registradas en `docs/AJUSTES_INTEGRACION_BACKEND.md`.

**Qué cambió**
- Nuevo `shared/types.ts`: tipos y catálogos únicos (roles, turnos, estados de asistencia,
  comisiones, inscripciones, clases, justificaciones, notas, comunicados, auditoría, errores de API
  y pedidos del primer circuito de asistencia). Textos en español en las tablas `*_LABELS`.
- Nuevo `shared/README.md`: cómo usarlo y **tabla de equivalencias** de los valores viejos de cada
  app a los nuevos.
- Alias `@shared` en las 4 apps: `vite.config.ts` (más `server.fs.allow` para el modo desarrollo)
  y `tsconfig.json` / `tsconfig.app.json` (Profesores).
- `scripts/build.mjs` no publica la carpeta `shared/` en el sitio.

**Probado**
- `shared/types.ts` compila en modo estricto (incluido `erasableSyntaxOnly`, que usa Profesores).
- En las 4 apps, un archivo de prueba que importa de `@shared/types` pasa el chequeo de tipos, y un
  valor viejo (`'PRESENTE'`) es rechazado como corresponde. El archivo de prueba se borró.
- Servidor de desarrollo (Profesores y Julián): `shared/types.ts` responde 200 y el resto de las
  carpetas fuera de la app sigue bloqueado (403).
- Build completo OK.

**Todavía no:** ninguna app usa estos tipos en sus pantallas; la migración de cada app es la Etapa 2.
El sitio publicado no cambia.

## 2026-10-23 — Documento de ajustes para el backend unificado

- Nuevo `docs/AJUSTES_INTEGRACION_BACKEND.md`: diagnóstico de cómo maneja los datos cada app,
  modelo de datos unificado (catálogos que hoy no coinciden), login y API comunes, ajustes por app
  con archivos concretos, decisiones pendientes del equipo y orden de trabajo por etapas.
- Hallazgos principales: Directivos modela secundaria (divisiones/trimestres) y el resto terciario
  (comisiones/cuatrimestres); hay 4 catálogos distintos de estado de asistencia; hay dos portales de
  Alumno (Julián y Lucía); Preceptoría no tiene app.
- Solo documentación: no se cambió código.

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
- Antes, los pushes a `main` de ese repo quedaban como **Preview** (la rama de producción no estaba
  definida). Se reconectó el repo en Vercel y quedó `productionBranch = main`: probado, un push a
  `main` ahora publica directo en producción.
- Se intentó conectar Vercel a **este** repo (`BenjaminLacaze/...`) y falló: la app de Vercel en GitHub
  no tiene acceso a repos de la cuenta de Benjamín. Para eso, Benjamín tiene que darle acceso
  (o transferir/compartir el repo). Mientras tanto, los cambios de acá se publican copiándolos a
  `mjsis20052/sistema-gestion-i26`.
- Vercel (plan Hobby) **bloquea** commits cuyo autor no es `mjsis20052`
  ("Deployment was blocked"). Los commits a ese repo tienen que ir firmados por esa cuenta.
- 2026-10-23: publicado en producción con el contenido de `d525248`; las 4 apps verificadas en vivo.

## 2026-10-23 — Redirecciones de URLs viejas

Las redirecciones con espacios en el `source` no coincidían en Vercel (daban 404).
`vercel.json` ahora usa patrones `(.*)` que cubren espacios y `%20`.
