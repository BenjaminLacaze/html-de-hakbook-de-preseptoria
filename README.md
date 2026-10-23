# Sistema de Gestión Escolar — ISFDyT N.° 26

Repositorio del equipo con los módulos del sistema de gestión y asistencia.
Publicado en Vercel: <https://sistema-gestion-i26.vercel.app/>

## Estructura

Cada módulo tiene su carpeta, siempre con la misma forma:

```
<modulo>-<autor>/
├── README.md        qué es el módulo
├── *.html           informes / handbooks (se publican tal cual)
├── docs/            documentación en markdown (opcional)
└── app/             la app React + Vite (opcional)
```

| Carpeta | Autor | App | Documentación |
|---|---|---|---|
| `alumnos-julian/` | Julián | `/alumnos-julian/app/` | `index.html`, `portal_definitivo/`, `docs/` |
| `alumnos-lucia/` | Lucía | `/alumnos-lucia/app/` (Panel Alumno · Sistema de Asistencia Escolar) | `documentacion/` |
| `directivos-jesica-agustin/` | Jesica y Agustín | `/directivos-jesica-agustin/app/` | `index.html`, `Handbook/` |
| `preceptoria-benjamin/` | Benjamín | — | `handbook.html` |
| `profesores-nicolas/` | Nicolás | `/profesores-nicolas/app/` | `profesores.html`, `docs/` |
| `shared/` | equipo | — | `types.ts`: modelo de datos unificado que usan todas las apps (`import … from '@shared/types'`); ver `shared/README.md` |
| `docs/` | equipo | — | contratos de backend de todos los módulos y `AJUSTES_INTEGRACION_BACKEND.md` (qué cambiar en cada app para usar la base unificada) |

La landing (`index.html` de la raíz) enlaza a todo.

## Cómo se publica

Vercel corre `node scripts/build.mjs` (configurado en `vercel.json`):

1. Copia todo el repo a `dist/`.
2. Compila cada `app/` con Vite y la deja en `dist/<modulo>/app/`.

Las apps **no se pueden publicar sin compilar**: su `index.html` pide
`/src/main.tsx`, que solo existe con `npm run dev`.

Para probarlo en tu máquina antes de subir:

```bash
node scripts/build.mjs
npx serve dist
```

## Trabajar en tu app

```bash
cd profesores-nicolas/app
npm install --legacy-peer-deps
npm run dev
```

## Sumar un módulo o una app nueva

1. Carpeta nueva `<modulo>-<autor>/` (minúsculas, sin espacios ni tildes).
2. Si tiene app: ponerla en `<modulo>-<autor>/app/`, agregar la carpeta a
   `modulesWithApp` en `scripts/build.mjs` y su rewrite en `vercel.json`.
3. Agregar la tarjeta en `index.html` de la raíz.
4. `node scripts/build.mjs` para probar, y recién ahí push.

**No subir** `node_modules/`, `dist/` ni archivos `.env` (ya están en `.gitignore`).
