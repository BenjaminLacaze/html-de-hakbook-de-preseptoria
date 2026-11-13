# Propuestas del módulo Profesor

Formato de [`docs/CONTRATO_UNIFICACION.html`](../docs/CONTRATO_UNIFICACION.html) §12. Ninguna
de estas propuestas está implementada; el módulo funciona hoy con lo que ya existe en la API.

## P-PROF-01 · Agenda docente editable o fechas de evaluación por comisión

- **App:** Profesores (Nicolás) · **Fecha:** 2026-11-13
- **Tipo:** permisos + campo/endpoint nuevo (a decidir)
- **Situación actual:** el docente lee `GET /records/events`. Crear/editar/borrar eventos está
  reservado a Dirección/Administración (`MANAGE`), y `SchoolEvent` no tiene hora, lugar,
  recordatorio ni “cumplido”.
- **Propuesta:** si la institución quiere que el docente cargue fechas de parciales, permitir
  `POST /records/events` a `TEACHER` con `commissionId` obligatorio y alcance a sus comisiones;
  si además hacen falta recordatorios, agregar `reminderDaysBefore` y `completed` al modelo.
- **Afecta a:** Alumnos (vería las fechas), Preceptoría (calendario), Dirección (supervisión).
- **Estado:** propuesta abierta. Hasta que se apruebe, la agenda es de solo lectura.

## P-PROF-02 · Asunto y categoría en la mensajería

- **App:** Profesores (Nicolás) · **Fecha:** 2026-11-13
- **Tipo:** campos nuevos en `private_messages` (a decidir)
- **Situación actual:** `/social/messages` guarda solo `text`, `senderId`, `receiverId` y
  `readAt`. La app muestra conversaciones simples, sin asunto ni categoría.
- **Propuesta:** si se necesita clasificar (Académico / Institucional / Directivo) o mostrar un
  asunto, agregar `subject` y `category` a `private_messages` y a los DTO de `/social`.
- **Afecta a:** Alumnos, Preceptoría, Centro y Auxiliares (todos usan el mismo `/social`).
- **Estado:** propuesta abierta. La v1 usa conversación simple.

## P-PROF-03 · Resumen de calificaciones y condición de cursada en el backend

- **App:** Profesores (Nicolás) · **Fecha:** 2026-11-13
- **Tipo:** endpoint de lectura (sin tabla nueva)
- **Situación actual:** la planilla calcula promedio y condición en la vista a partir de
  `GET /records/grades`. El alumno recibe solo notas publicadas y no tiene condición calculada.
- **Propuesta:** `GET /records/grades/summary?commissionId=` que devuelva, por inscripción,
  las cinco instancias, el promedio y la condición (`PROMOCIONADO`, `REGULAR`, `LIBRE`,
  `CURSANDO`), con la misma regla para docente y alumno. Evita dos cálculos distintos.
- **Afecta a:** Alumnos (podría mostrar la condición oficial), Dirección (reportes).
- **Estado:** propuesta abierta. Hoy el cálculo es solo de pantalla y no se presenta como oficial.

## P-PROF-04 · Lectura de observaciones por Preceptoría

- **App:** Profesores (Nicolás) / Preceptoría (equipo de Consolidación) · **Fecha:** 2026-11-13
- **Tipo:** pantalla + permiso (el endpoint ya existe)
- **Situación actual:** el docente escribe en `/records/observations`; Preceptoría y Dirección
  pueden leerlas por API, pero la app de Consolidación todavía no tiene pantalla.
- **Propuesta:** agregar en Preceptoría una vista de solo lectura de observaciones por comisión
  o alumno, respetando el alcance de sus comisiones. No hace falta cambiar el modelo.
- **Afecta a:** Preceptoría, Dirección y el equipo de Orientación (si se define el rol).
- **Estado:** propuesta abierta. El alumno no debe verlas.
