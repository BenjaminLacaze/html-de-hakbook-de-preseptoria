# Panel de Familias — ISFDyT N° 26

Panel para madres, padres y tutores: siguen la asistencia, las notas y la agenda de sus hijos, justifican inasistencias, responden autorizaciones, leen comunicados y se escriben con Preceptoría y docentes.

- **Online:** https://i26-familias.vercel.app (proyecto Vercel `i26-familias`)
- **Rol:** `GUARDIAN` · **Puerto local:** 3004 · **Origen:** Google AI Studio (React 19 + Vite + Tailwind 4)
- **Datos:** la misma API (`/api/v1`) y la misma base que Alumnos, Preceptoría, Centro y Auxiliares. No tiene base propia: tiene **tablas propias** dentro de la base compartida. No usa datos simulados.

## Cómo se vincula con los otros paneles

| Qué hace la familia | Dónde impacta |
|---|---|
| Mira asistencia y notas de su hijo | Son los mismos registros que carga Preceptoría/Profesores y que el hijo ve en el Panel de Alumnos (mismo cálculo de porcentaje) |
| Presenta una justificación | Le llega a **Preceptoría** como pendiente; al aprobarla o rechazarla lo ven la familia y el alumno |
| Responde una autorización (salida, viaje, uso de imagen, retiro) | La pide **Preceptoría o Directivos** (`POST /families/authorizations`) y ven la respuesta. Se responde una sola vez |
| Lee un comunicado | Son los comunicados que publica Preceptoría/Directivos; el acuse de lectura queda guardado en la base |
| Mira la agenda | Calendario institucional + salidas con autorización + eventos del **Centro de Estudiantes** |
| Manda un mensaje | Mensajería común del sistema: lo recibe el preceptor o docente en su panel |
| Pide corregir sus datos de contacto | Lo resuelve Preceptoría o Secretaría (`/families/corrections`); al aceptarlo se actualiza la ficha |

Un responsable solo ve a los alumnos que tiene vinculados (tabla `student_guardians`). Si pide otro alumno, la API responde 404.

## Tablas propias (migración `20261113120000_panel_familias`)

| Tabla | Para qué |
|---|---|
| `guardians` | Ficha del responsable (DNI, teléfono, domicilio, ocupación), unida a su cuenta |
| `student_guardians` | Vínculo responsable ↔ alumno, con el parentesco |
| `authorization_requests` | Autorización que pide la institución |
| `authorization_responses` | Respuesta por alumno (pendiente / autorizado / no autorizado) |
| `guardian_correction_requests` | Pedidos de corrección de datos del responsable |

Además se agregó el rol `GUARDIAN`. Reutiliza tablas que ya existían: `justifications`, `notices` + `notice_reads`, `private_messages`, `school_events`, `rep_events`, `grades`, `attendance_records`.

## Endpoints

Familia (`/guardian`, rol `GUARDIAN`): `children`, `children/:id/summary`, `children/:id/attendance`, `children/:id/grades`, `children/:id/agenda`, `agenda`, `children/:id/justifications` (GET/POST), `notices`, `notices/:id/read`, `authorizations` (GET) y `authorizations/:id` (PATCH), `profile`, `corrections` (GET/POST), `contacts`.

Institución (`/families`, Preceptoría / Secretaría / Directivos): `authorizations` (GET/POST), `guardians` (GET) y `guardians/:userId` (PUT, solo gestión: crea la ficha y vincula hijos), `corrections` (GET) y `corrections/:id` (PATCH).

En `main` del equipo el backend común no se modificó: el código de estas rutas (`backend/src/routes/guardian.ts`), la migración y la prueba van como propuesta en [`../backend/propuesta/familias.patch`](../backend/propuesta/familias.patch), que se aplica después de `backend.patch`. La versión online ya corre con esos cambios. La capa del panel que habla con la API está en `src/familias/api/`.

## Cómo se da de alta una familia real

1. Directivos crea la cuenta con rol **Familia / Responsable** (igual que el resto de las cuentas).
2. Secretaría o Directivos carga la ficha y vincula a los hijos: `PUT /api/v1/families/guardians/:userId`.

Todavía no hay una pantalla para el paso 2 en el panel de Directivos ni para pedir autorizaciones desde el panel de Preceptoría: hoy se hace por la API.

## Levantarlo en local

Desde la raíz del repositorio, con la base local y la API prendidas (ver `ecosistema-julian-lucia/README.md`):

```powershell
npm run db:test-users            # crea prueba.familia@isfdyt26.edu.ar
npm run db:demo-data -- --family # la vincula a dos alumnos de ejemplo y carga sus datos
npm --prefix ecosistema-julian-lucia/familias run dev
```

Abrir `http://familias.localhost:3004`. La cuenta de prueba local aparece en el login (solo en desarrollo). Prueba automática de punta a punta: `node backend/test/familias-flow.mjs`.

## Online

La cuenta `prueba.familia@isfdyt26.edu.ar` usa la misma contraseña privada que el resto de las cuentas online (no está en el repo). Para volver a publicar: `vercel deploy --prod` desde esta carpeta. El `vercel.json` manda `/api/v1/*` a `https://i26-ecosistema-api.vercel.app`.

## Identidad

Logo y video de presentación en `assets/` (con los scripts que los generan en `assets/generador/`).
