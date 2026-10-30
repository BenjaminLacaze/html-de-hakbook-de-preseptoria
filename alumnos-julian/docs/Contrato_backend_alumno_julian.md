# Contrato propuesto de backend — Portal del Alumno app v2

**Estado:** propuesta para acordar con el equipo; no describe endpoints desplegados ni una integración existente.
**App:** alumnos-julian/app v2/
**Fuentes:** JULIAN/shared/services/api.ts, JULIAN/shared/types/index.ts, JULIAN/mocks/db.ts y JULIAN/mocks/dataset.ts.

## 1. Estado actual

La app nueva no envía solicitudes HTTP al backend institucional. StudentApi delega en demoDB. Los datos iniciales vienen de mocks y los cambios se guardan en localStorage con la clave alumno-demo-db-v1. La demora de 300–700 ms y los fallos que se pueden simular no son latencia ni errores de red reales.

El código no implementa login institucional ni autorización de servidor. Las variables de plantilla de .env.example no configuran una API.

## 2. Tipos de interfaz

Los esquemas Zod de JULIAN/shared/types/index.ts describen lo que consume actualmente la UI: Alumno, Materia, Evaluacion, RegistroAsistencia, Evento, Aviso, PublicacionForo, RespuestaForo, HitoHistorial, SolicitudCorreccion, SolicitudJustificacion, NotificacionItem y PreferenciasUsuario.

Estos tipos son el contrato de la interfaz, no el esquema de la base institucional. El backend puede usar otros nombres internos y mapearlos en su capa HTTP.

## 3. Lecturas propuestas

Conservar el límite funcional de StudentApi y reemplazar demoDB por un cliente HTTP autenticado. Las siguientes rutas son nombres iniciales para discusión:

| Método | Ruta propuesta | Contenido |
|---|---|---|
| GET | /api/v1/alumnos/me | Perfil del alumno autenticado |
| GET | /api/v1/alumnos/me/materias | Materias y cursadas vigentes |
| GET | /api/v1/alumnos/me/evaluaciones | Evaluaciones y notas visibles |
| GET | /api/v1/alumnos/me/asistencias | Registros y agregados de asistencia |
| GET | /api/v1/alumnos/me/agenda | Eventos del calendario |
| GET | /api/v1/alumnos/me/avisos | Comunicados visibles |
| GET | /api/v1/alumnos/me/foros | Publicaciones autorizadas |
| GET | /api/v1/alumnos/me/historial | Historial académico |
| GET | /api/v1/alumnos/me/solicitudes-correccion | Solicitudes propias |
| GET | /api/v1/alumnos/me/solicitudes-justificacion | Solicitudes propias |
| GET | /api/v1/alumnos/me/notificaciones | Notificaciones visibles |
| GET | /api/v1/alumnos/me/preferencias | Preferencias de la cuenta |

El equipo debe confirmar rutas, DTOs, filtros, paginación, zona horaria, ciclo lectivo y propiedad de cada dominio antes de implementarlas. No asumir que las rutas existen.

## 4. Escrituras que necesitan contrato propio

La demo permite solicitar correcciones y justificaciones, registrar un QR, marcar avisos leídos, activar recordatorios, cambiar preferencias y crear, responder, editar o borrar contenido propio de foros.

Antes de conectar cualquiera de esas acciones, acordar endpoints, permisos, validación, idempotencia y auditoría. El QR debe validarse completamente en el servidor con un token firmado, vencimiento, contexto de clase y protección contra repetición. Ningún dato enviado por el navegador debe ser prueba suficiente para registrar asistencia.

## 5. Requisitos de seguridad

- Usar la autenticación central y autorizar el rol en cada endpoint.
- Derivar el alumno de una sesión verificada; no aceptar alumnoId del cliente como control de acceso.
- Aislar perfil, materias, notas, asistencias, historial, solicitudes y foros al usuario autenticado.
- Minimizar datos personales, especialmente DNI, teléfono, correo y datos de comisión.
- Mantener los módulos responsables como fuente oficial de inscripciones, notas y asistencia.
- Validar payloads en servidor y auditar escrituras; nunca registrar tokens completos ni secretos.
- Definir límites y tratamiento de adjuntos antes de aceptar certificados.
- Configurar TLS, CORS, límites de solicitudes y errores sin detalles internos.
- No versionar secretos ni incluir credenciales institucionales en el frontend.

## 6. Pasos de integración

1. Aprobar contrato, responsabilidades y política de datos.
2. Definir sesión e identidad central.
3. Implementar lecturas prioritarias y validar respuestas con Zod.
4. Adaptar StudentApi para usar HTTP en lugar de demoDB.
5. Mantener deshabilitadas las escrituras hasta que tengan reglas y autorización.
6. Probar con datos sintéticos en un ambiente no productivo.

Hasta completar estos pasos, app v2 es un prototipo de interfaz y no un sistema académico conectado.
