# Integración del ecosistema institucional — 6 de noviembre de 2026

## Objetivo

Unificar Alumnos, Preceptoría, Centro de Estudiantes, Auxiliares, Profesores y Directivos sobre la API Hono/Prisma y la base PostgreSQL de Neon del sistema institucional. No se autorizan bases locales, archivos JSON ni servicios autónomos como fuente de datos de producción.

## Fuente oficial de datos

| Dominio | Fuente única | Paneles que la usan |
| --- | --- | --- |
| Identidad, roles y sesión | `users`, `auth_sessions` | Todos |
| Estructura, alumnos, docentes e inscripciones | API `/structure` | Dirección, Preceptoría, Profesor, Alumno |
| Asistencia, justificaciones y notas | API `/attendance`, `/records`, `/me` | Preceptoría, Profesor, Alumno, Dirección |
| Comunicados, eventos, perfiles y mensajes | API `/records`, `/social` | Todos según rol |
| Centro de Estudiantes | API `/centro` | Centro y Alumno |
| Auxiliares | API `/staff` | Auxiliares y Dirección |

El backend autónomo ubicado en `profesores-nicolas/backend/` es material de desarrollo local. No se publica, no recibe credenciales de Neon y no reemplaza `backend/`.

## Estado al inicio

Los paneles de Julián y Lucía fueron incorporados bajo `ecosistema-julian-lucia/`. Profesores agregó Agenda, Mensajería y una planilla ampliada de calificaciones. Sus pantallas están en el repositorio, pero varias rutas y campos todavía no coinciden con la API institucional actual; por eso no deben declararse integradas ni desplegarse como funciones operativas hasta completar esta lista.

## Extensiones de base preparadas

Las migraciones aditivas se incorporaron para revisión e integración:

- `20261030120000_auditar_lecturas_datos_sensibles`: registro de consultas de datos sensibles.
- `20261101182015_paneles_alumno_preceptoria_auxiliares`: confirmación de lectura de comunicados, QR de asistencia, pedidos de corrección y turnos.
- `20261101184446_turnos_sin_superposicion`: reglas de turnos sin solapamiento.
- `20261101200000_ecosistema_centro_auxiliares_preceptoria`: ampliaciones para Centro, Auxiliares y justificaciones.

Son solo agregados: no eliminan tablas ni registros. Antes de aplicarlas a Neon se debe regenerar Prisma, ejecutar las pruebas contra PostgreSQL aislado y revisar el plan de migración.

## Implementaciones requeridas en la API central

1. **Profesor**: adaptar Agenda, Mensajería y resumen de calificaciones a las rutas institucionales. Las pantallas no pueden depender de `/agenda`, `/messages` ni `/grades` autónomos; deben usar contratos centralizados y permisos por comisión.
2. **Preceptoría**: completar QR, resumen masivo e historial de asistencia; mantener el padrón y los datos sensibles bajo auditoría.
3. **Alumnos**: habilitar lectura de comunicados, QR, pedido de corrección y justificaciones solo cuando la API central responda y valide la inscripción.
4. **Centro**: sumar capacidad de eventos, borradores, moderación de foro, adjuntos como URLs y trazabilidad de reclamos.
5. **Auxiliares**: sumar turnos, solicitudes de cambio, ausencias y campos de instalaciones/incidencias sin conservar estado ficticio en el navegador.

## Reglas obligatorias

- Toda escritura pasa por `/api/v1`; ningún frontend accede directo a Neon.
- Roles y comisión asignada limitan cada lectura y modificación.
- Las acciones académicas se conservan: no se borran notas, asistencia ni reclamos históricos.
- Datos de prueba solo se cargan en base aislada; no se suben cuentas, claves ni datos ficticios a producción.
- Cada ruta nueva necesita prueba de permiso permitido y denegado, además de un recorrido desde pantalla.

## Condición de publicación

La versión se copia al repositorio de producción `mjsis20052/sistema-gestion-i26` solamente después de:

1. `npm run typecheck` y build completo correctos.
2. Migraciones probadas en PostgreSQL local aislado.
3. Prueba HTTP de cada rol sobre las rutas nuevas.
4. Migración aplicada a Neon con respaldo previo y verificación `/api/v1/ready`.
5. Validación visual de login, lectura y escritura en cada panel.

## Registro de decisión

La implementación se hará sobre el backend común y Neon ya existentes. Las aplicaciones aportadas por cada equipo se adaptarán a ese contrato; no se crean una segunda base ni una segunda API de producción.
