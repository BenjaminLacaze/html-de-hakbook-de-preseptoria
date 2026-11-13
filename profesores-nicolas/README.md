# Módulo Profesor / Docente — ISFDyT N.° 26

**Responsable:** Nicolás · **Rol:** `TEACHER` · **App:** `/profesores-nicolas/app/`

El módulo forma parte del Sistema de Gestión Académica y **no tiene backend propio**: usa la
API común Hono + Prisma + PostgreSQL (Neon), con la sesión institucional por cookie y los
tipos de `shared/`.

## Estructura

- [`app/`](app/): frontend React 19 + TypeScript + Vite.
- [`legacy/backend-local/`](legacy/backend-local/): prototipo de backend autónomo del 6/11.
  **No se usa ni se publica**; está archivado como referencia.
- [`docs/`](docs/): contrato original del 16/10. Quedó histórico: el contrato vigente es
  [`docs/CONTRATO_UNIFICACION.html`](../docs/CONTRATO_UNIFICACION.html),
  [`docs/INTEGRACION_TECNICA.md`](../docs/INTEGRACION_TECNICA.md) y `shared/types.ts`.
- [`profesores.html`](profesores.html): informe institucional de la propuesta.
- [`PROPUESTAS.md`](PROPUESTAS.md): cambios que dependen de aprobación del equipo central
  (agenda editable, asunto de mensajes, resumen de notas, lectura de observaciones).

## Qué hace

1. **Panel** con comisiones, matrícula, clases y observaciones.
2. **Mis comisiones**: cátedras asignadas, horario, aula y turno (solo lectura).
3. **Estudiantes**: nómina por comisión, búsqueda y condición de cursada.
4. **Asistencia**: por comisión y clase; estados `PRESENTE`, `AUSENTE` y `TARDE`; muestra las
   ausencias **justificadas** por Preceptoría y guarda con `close:false` para permitir
   correcciones.
5. **Calificaciones**: planilla de parciales, recuperatorios y final; carga y publicación en
   `/records/grades`. El alumno solo ve las notas publicadas.
6. **Observaciones pedagógicas**: cualitativas, con fecha del hecho separada de la fecha de carga.
7. **Agenda**: calendario institucional de `/records/events`, **solo lectura**. Las fechas las
   carga Dirección o Secretaría.
8. **Mensajería**: conversaciones con `/social/messages`; sin asunto ni categoría.

## Cómo correrlo en local

En la raíz del repo (API en `localhost:4000`):

```powershell
npm install
npm run dev:api
```

En `profesores-nicolas/app` (Vite en `localhost:5174`):

```powershell
npm install
npm run dev
```

El proxy de Vite manda `/api` a la API local. Para entrar hace falta una cuenta con rol
`TEACHER` vinculada a un docente; en desarrollo se puede usar el usuario de prueba de
[`shared/testUsers.ts`](../shared/testUsers.ts) (solo aparece con `VITE_SHOW_TEST_USERS=true`).
La app no guarda tokens ni datos de negocio en `localStorage`.

## Integración con las otras secciones

| Sección | Qué comparte |
|---|---|
| Directivos / Secretaría | estructura, comisiones, inscripciones, ciclos, calendario y cuentas |
| Preceptoría | la misma planilla de asistencia y las justificaciones aprobadas |
| Alumnos | asistencia, resumen y notas publicadas (`/me/*`) |
| Centro / Auxiliares | mensajería y notificaciones, sin datos académicos |

El detalle de rutas y permisos está en [`app/INTEGRACION_API.md`](app/INTEGRACION_API.md).

## Pendientes conocidos

- La agenda no la puede editar el docente: es una decisión de permisos, no un faltante de la app.
- La mensajería no tiene asunto, categoría ni adjuntos.
- El porcentaje oficial de asistencia se consulta con `/attendance/summary`; la pantalla del
  docente todavía no lo muestra.
- Las observaciones no las ve el alumno; Preceptoría aún no tiene pantalla para leerlas.
