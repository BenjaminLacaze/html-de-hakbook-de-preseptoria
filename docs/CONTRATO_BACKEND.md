# Guía inicial para analizar e integrar los módulos

**Estado:** guía de trabajo. La arquitectura (backend común, microservicios u otra alternativa), la base de datos y el contrato definitivo se decidirán después de revisar los frontends y los informes técnicos de todos los módulos.

## 1. Objetivo

Las aplicaciones construidas en AI Studio son interfaces de usuario. El equipo analizará cómo conectar cada frontend con los servicios y datos compartidos. El backend deberá autenticar a las personas, aplicar permisos y validar los datos; el diseño concreto se acordará con evidencia de los proyectos.

```text
Frontend de cada módulo → API (diseño pendiente) → almacenamiento (diseño pendiente)
```

Los frontends no deben incluir credenciales de bases de datos ni claves privadas en el navegador. La estrategia de almacenamiento y acceso se definirá al acordar la arquitectura.

## 2. Decisiones pendientes de arquitectura

Todavía no se elige entre backend común, microservicios u otra arquitectura, ni entre una base compartida o bases separadas. Primero se revisará el código y el informe técnico de cada alumno. Luego Mauricio, como profesor y administrador, definirá la solución con el equipo.

Como reglas de seguridad para cualquier alternativa: los frontends no deben contener credenciales de base de datos; el backend valida identidad y permisos; y cada dato compartido debe tener una fuente de verdad y un responsable definidos. La SQLite que aparezca en una demostración local no se considera automáticamente la base institucional.

## 3. Datos candidatos

El documento de arquitectura de Julian ya propone entidades comunes. Esta lista sirve de inicio y debe revisarse para evitar nombres o campos duplicados:

| Dominio | Datos candidatos | Responsable de escritura por confirmar |
| --- | --- | --- |
| Identidad y acceso | usuarios, credenciales gestionadas por el backend, roles, permisos | Backend / administración |
| Estructura académica | alumnos, cursos o comisiones, matrícula, materias y ciclos lectivos | Administración institucional |
| Asistencia | registros de asistencia, llegadas tarde, justificaciones y observaciones autorizadas | Preceptoría; validar con el equipo |
| Actividad docente | información académica y registros que correspondan al módulo Profesor | Profesorado; confirmar alcance |
| Control institucional | configuración, auditoría y acciones administrativas | Superadministrador / Directivos |

La necesidad de compartir identidad y entidades como alumnos o cursos se verificará al comparar los módulos. Evitar copias incompatibles es un objetivo de integración, pero su implementación se definirá en el contrato final.

## 4. Reglas para la API

- Prefijo sugerido si el equipo elige una API HTTP: `/api/v1`.
- Formato: JSON con UTF-8.
- Toda operación protegida requiere sesión/token válido. El backend obtiene el usuario y sus roles de la sesión; no confía en un `alumno_id` o rol enviado por el frontend.
- Cada operación debe documentar: método y ruta, propósito, roles permitidos, parámetros, validaciones, respuesta exitosa, errores y dueño del dato.
- Los errores deben tener un formato uniforme; los códigos HTTP y los detalles se acordarán en la especificación OpenAPI.
- Los cambios incompatibles se publican en una nueva versión de la API.

Rutas de consulta candidatas que aparecen en la documentación de Julian:

| Operación | Ruta candidata | Observación |
| --- | --- | --- |
| Consultar identidad propia | `GET /api/v1/auth/me` | Devuelve el usuario y sus roles autorizados. |
| Consultar comisiones propias | `GET /api/v1/alumnos/me/comisiones` | El backend resuelve el alumno desde la sesión. |
| Consultar asistencia propia | `GET /api/v1/alumnos/me/asistencias?comision_id={id}` | El backend valida pertenencia y permisos. |
| Consultar calificaciones propias | `GET /api/v1/alumnos/me/calificaciones?comision_id={id}` | El módulo Alumno consulta; no modifica calificaciones. |
| Gestionar alumnos, asistencia y justificaciones | Rutas por definir | Acordar con Administración y Preceptoría. |
| Gestionar usuarios, roles y permisos | Rutas de administración por definir | Solo roles autorizados; incluir auditoría. |

Estas rutas son un punto de partida, no endpoints que ya estén implementados.

## 5. Roles iniciales de la aplicación

Roles iniciales: `SUPER_ADMIN`, `DIRECTIVO`, `ADMINISTRATIVO`, `PRECEPTOR`, `PROFESOR` y `ALUMNO`.

El backend controla los permisos por operación y registro. Por ejemplo, un alumno solo accede a su propia información y cada docente o preceptor opera dentro de sus asignaciones.

## 6. Qué entrega cada alumno

Para integrar su frontend, cada responsable entrega:

1. Carpeta del módulo y archivo de inicio.
2. Lista de pantallas y acciones de lectura/escritura.
3. Datos que muestra, crea o modifica, con ejemplo de cada campo.
4. Roles que pueden realizar cada acción.
5. Estados vacíos, validaciones y mensajes de error necesarios.
6. Rutas API candidatas que necesita, sin incluir contraseñas, tokens ni claves privadas.

Después del análisis, el equipo acuerda responsables, arquitectura, base de datos y contrato de integración. Si corresponde, publica la API aprobada en OpenAPI; el frontend configura la URL por entorno. Esta guía no aprueba por adelantado una arquitectura ni endpoints.

## 7. Detalles por completar antes de implementar

- Campos y relaciones finales para alumno, curso/comisión, materia, ciclo lectivo y matrícula.
- Responsable de escritura y permisos detallados por operación.
- Proveedor de autenticación y ciclo de vida de sesión/tokens.
- Campos visibles para alumnos, especialmente datos personales y asistencia.
- Framework y alojamiento del backend y PostgreSQL.
- Ambientes de desarrollo, pruebas y producción, y estrategia de copias de seguridad.

Estas definiciones siguen pendientes. La arquitectura, el motor y la estrategia de bases de datos se decidirán después de comparar los informes y frontends de los módulos; este documento no aprueba una API común, microservicios ni una base central.

## 8. Documentos usados como base

- `alumnos-julian/docs/ARQUITECTURA_E_INTEGRACIONES.md`
- `alumnos-lucia/documentacion/arquitectura-tecnica.md`
- `preceptoria-benjamin/handbook.html`
- `profesores-nicolas/profesores.html`
- `directivos-jesica-agustin/README.md`
