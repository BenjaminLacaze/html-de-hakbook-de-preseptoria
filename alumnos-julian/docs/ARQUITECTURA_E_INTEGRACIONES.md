# Arquitectura e integraciones — Portal del Alumno app v2

**Estado (2026-10-30):** app v2 tiene en local su conexión inicial a login y lecturas de la API compartida. La URL independiente [alumnos-julian-v2.vercel.app](https://alumnos-julian-v2.vercel.app) aún requiere recibir estos cambios y validación QA. El sistema general ya dispone de PostgreSQL en Neon, Prisma y una API compartida para Alumno, Profesores, Preceptoría, Auxiliares y Centro de Estudiantes. No crear otra base: cada módulo usa sus tablas y permisos dentro del esquema institucional común. Ver el [contrato de backend](Contrato_backend_alumno_julian.md).

## Recorrido actual de datos

1. src/main.tsx inicia Vite y React.
2. src/App.tsx carga JULIAN/app/App.tsx.
3. La aplicación configura ThemeProvider y QueryClientProvider.
4. JULIAN/app/Layout.tsx gestiona la navegación adaptable. La sección se refleja en tab dentro de la URL; no se usa React Router.
5. Las pantallas están separadas en JULIAN/features/.
6. `SessionGate` controla acceso con la sesión institucional y `shared/services/http.ts` consulta el API `/api/v1`.
7. `StudentApi` adapta las respuestas autorizadas a los modelos de la interfaz y valida estructuras con Zod. Las preferencias locales no contienen datos académicos oficiales.

TanStack Query gestiona carga, caché e invalidaciones de interfaz. Los fixtures de `JULIAN/mocks/` ya no son la fuente de las lecturas institucionales.

## Capas y herramientas

| Capa | Ruta | Responsabilidad |
|---|---|---|
| Entrada | src/ | Bootstrap de React y Vite |
| Aplicación | JULIAN/app/ | Composición, consultas, tema y navegación |
| Funcionalidades | JULIAN/features/ | Pantallas y acciones |
| Tipos | JULIAN/shared/types/index.ts | Tipos de interfaz y esquemas Zod para los adaptadores |
| Cliente API | JULIAN/shared/services/http.ts | Fetch same-origin y manejo de sesión/errores |
| Servicio | JULIAN/shared/services/api.ts | Fachada StudentApi y adaptación de DTO institucional |
| Datos de referencia | JULIAN/mocks/ | Fixtures históricos, no fuente de datos conectados |
| UI y estilos | JULIAN/shared/ui/, JULIAN/shared/lib/, JULIAN/styles/ | Componentes, utilidades, temas y tokens |

Herramientas visibles: React, TypeScript, Vite, Tailwind CSS 4, TanStack Query, Zod, Phosphor Icons, Sonner, React Hook Form y lector QR. La lista de dependencias puede incluir paquetes aún no usados por las pantallas.

## Cómo se relaciona con consolidacion

Todos los paneles usan una API común bajo /api/v1 y una sesión con cookie HttpOnly. Los roles y permisos se validan en el servidor. La app Alumno debe adaptarse al mismo cliente de sesión/API del repositorio, no guardar tokens en localStorage.

| Panel | Escrituras en el sistema común | Lecturas que puede compartir con Alumno |
|---|---|---|
| Preceptoría | Toma asistencia por materia y fecha; crea y resuelve justificaciones para sus cursos; gestiona comunicados acotados | El alumno lee su asistencia y justificaciones desde /me/*; el backend calcula el resumen |
| Profesores | Carga asistencia por comisión y clase; publica calificaciones | El alumno lee sus materias y notas publicadas desde /me/* |
| Centro de Estudiantes | Gestiona eventos, anuncios y moderación comunitaria; responde reclamos | Alumno autenticado puede leer eventos, temas, respuestas y anuncios de /centro/*; puede inscribirse a eventos, participar y presentar sus propios reclamos según endpoints |
| Auxiliares | Gestiona tareas, instalaciones, incidencias y mantenimiento | Sin acceso de lectura para rol STUDENT; los endpoints /staff/* requieren rol autorizado |

Hay dos foros: /social/forum es el foro académico, sujeto a moderación de Preceptoría; /centro/threads es el foro comunitario del Centro. También hay dos fuentes de eventos y comunicados: /records/events y /records/notices para información institucional; /centro/events y /centro/announcements para la actividad del Centro. No fusionar estos dominios sin conservar origen, público, autoría y permisos.

## Rutas existentes útiles para el portal Alumno

El prefijo configurado en el cliente compartido es /api/v1. Las rutas se indican debajo de ese prefijo:

- /me/student, /me/subjects, /me/attendance, /me/summary, /me/grades y /me/justifications: datos propios, derivados de la sesión.
- /records/notices y /records/events: comunicados y calendario institucionales, sujetos a visibilidad.
- /centro/events, /centro/threads, /centro/threads/{id}/replies y /centro/announcements: contenido del Centro accesible con sesión.
- /social/forum y /social/forum/{id}/replies: foro académico con estado de moderación.
- /social/notifications: notificaciones de la cuenta.

El centro permite a alumnos participar o anotarse en eventos y crear reclamos propios. Sus endpoints de gestión de eventos y anuncios son exclusivos del rol STUDENT_REP y SUPER_ADMIN. Consultá el código de rutas y el contrato backend antes de integrar verbos de escritura.

## Estado de integración en app v2

La implementación local ya reemplaza las lecturas demo por el cliente API con cookie de sesión y adaptadores tipados. Pendiente publicar esta versión y validar en QA los contratos, estados de moderación, destinatarios y filtros. Mantener fuera del panel Alumno los endpoints /staff/*.

Las funciones actuales de rectificación de perfil y registro QR no tienen un endpoint de alumno confirmado en la API. La lectura de justificaciones existe, pero la creación y resolución corresponde a Preceptoría/gestión; no reutilizar un reclamo del Centro como justificación de falta. Las preferencias locales pueden seguir en navegador hasta que se acuerde una API.

## Publicación

La V2 de AI Studio está publicada en un proyecto Vercel propio. La ruta `/alumnos-julian/app-v2/` del sitio institucional requiere que el repositorio productivo integre la configuración de build general. La app independiente ya declara un rewrite same-origin hacia la API institucional; el deploy publicado aún no contiene estos cambios locales.
