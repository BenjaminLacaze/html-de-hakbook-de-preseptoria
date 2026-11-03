# Ecosistema de Julián y Lucía — Alumnos, Preceptoría, Centro de Estudiantes y Auxiliares

> **Responsables:** Julián y Lucía · Asistencia Terciario — ISFDyT N° 26
> Antes esta carpeta se llamaba `alumnos-julian/` y tenía solo el módulo de Alumnos. Desde el 01/11/2026 reúne los cuatro paneles. Las URL viejas `/alumnos-julian/...` redirigen a `/ecosistema-julian-lucia/alumnos/...` (ver `vercel.json`).

Los cuatro paneles comparten la misma base de datos y la misma API (`/api/v1`, en `backend/`). Cada uno ve y escribe solo lo que le permite su rol. Cómo se relacionan: [`backend/README.md`](backend/README.md) y [`backend/DETALLE_TECNICO.md`](backend/DETALLE_TECNICO.md).

| Carpeta | Panel | Rol | Puerto local | Origen |
|---|---|---|---|---|
| [`alumnos/`](alumnos/README.md) | Alumnos (`app v2/` actual, `app/` anterior, documentación) | `STUDENT` | 3000 | Google AI Studio |
| `centro/` | Centro de Estudiantes | `STUDENT_REP` | 3001 | Google AI Studio |
| `auxiliares/` | Auxiliares (maestranza y mantenimiento) | `STAFF` | 3002 | Google AI Studio |
| `preceptoria/` | Preceptoría | `PRECEPTOR` | 3003 | Google AI Studio |
| [`backend/`](backend/README.md) | **Base de datos y API**: cómo está construida, a qué se conecta, endpoints y datos | — | 4000 | Documentación (el código está en `/backend`) |

## Cómo levantarlo en local

Desde la raíz del repositorio, cada comando en su propia terminal:

```powershell
& "C:\Program Files\PostgreSQL\17\bin\pg_ctl" -D backend/.local-dev/pgdata -l backend/.local-dev/postgres.log -o "-p 5440 -h 127.0.0.1" start
npm run dev:api
npm --prefix "ecosistema-julian-lucia/alumnos/app v2" run dev
npm --prefix ecosistema-julian-lucia/centro run dev
npm --prefix ecosistema-julian-lucia/auxiliares run dev
npm --prefix ecosistema-julian-lucia/preceptoria run dev
```

Las apps mandan `/api` a la API local (`localhost:4000`), que usa la base `i26_dev`. Las cuentas de prueba están en `shared/testUsers.ts`.

**Sesiones:** todas las apps usan la misma cookie. Si abrís dos paneles con roles distintos en `localhost`, entrar en uno cierra la sesión del otro. Abrí cada uno con su propio nombre `.localhost`: `alumno.localhost:3000`, `centro.localhost:3001`, `aux.localhost:3002` y `preceptoria.localhost:3003`.

## Online

| Panel | URL |
|---|---|
| Alumnos | https://alumnos-julian-v2.vercel.app |
| Centro de Estudiantes | https://i26-centro-estudiantes.vercel.app |
| Auxiliares | https://i26-auxiliares.vercel.app |
| Preceptoría | https://i26-preceptoria.vercel.app |
| API | https://i26-ecosistema-api.vercel.app |

Base: Neon nueva conectada al proyecto Vercel de la API. Las cuentas online usan una contraseña privada que no está en el repo. Todo el detalle está en [`backend/README.md`](backend/README.md).
