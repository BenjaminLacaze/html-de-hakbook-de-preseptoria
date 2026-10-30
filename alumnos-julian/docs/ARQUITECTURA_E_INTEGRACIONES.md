# Arquitectura e integraciones — Portal del Alumno app v2

**Estado:** app v2 usa una base local de demostración. El sistema general dispone de una API compartida para los módulos de Alumno, Profesores, Preceptoría, Auxiliares y Centro de Estudiantes, pero app v2 todavía no la consume.

## Recorrido actual de datos

1. src/main.tsx inicia Vite y React.
2. src/App.tsx carga JULIAN/app/App.tsx.
3. La aplicación configura ThemeProvider y QueryClientProvider.
4. JULIAN/app/Layout.tsx gestiona la navegación adaptable. La sección se refleja en tab dentro de la URL; no se usa React Router.
5. Las pantallas están separadas en JULIAN/features/.
6. Las pantallas llaman a StudentApi en JULIAN/shared/services/api.ts.
7. StudentApi valida algunos resultados con Zod y delega en demoDB.
8. demoDB inicia desde JULIAN/mocks/dataset.ts y persiste en localStorage bajo alumno-demo-db-v1.

TanStack Query gestiona carga, caché e invalidaciones de interfaz. No convierte la base local en un servicio remoto.

## Capas y herramientas

| Capa | Ruta | Responsabilidad |
|---|---|---|
| Entrada | src/ | Bootstrap de React y Vite |
| Aplicación | JULIAN/app/ | Composición, consultas, tema y navegación |
| Funcionalidades | JULIAN/features/ | Pantallas y acciones |
| Tipos | JULIAN/shared/types/index.ts | Tipos y esquemas Zod de la demo |
| Servicio demo | JULIAN/shared/services/api.ts | Fachada StudentApi sobre demoDB |
| Datos | JULIAN/mocks/ | Dataset, comportamiento y persistencia demo |
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

## Integración pendiente en app v2

StudentApi debe reemplazar demoDB por el cliente compartido apiFetch, usando cookies de sesión y respuestas validadas. Acordar adaptadores entre los tipos actuales en español y los DTOs compartidos, estados de moderación, destinatarios y filtros. Mantener fuera del panel Alumno los endpoints /staff/*.

Las funciones actuales de rectificación de perfil y registro QR no tienen un endpoint de alumno confirmado en la API. La lectura de justificaciones existe, pero la creación y resolución corresponde a Preceptoría/gestión; no reutilizar un reclamo del Centro como justificación de falta. Las preferencias locales pueden seguir en navegador hasta que se acuerde una API.

## Publicación

El build general compila actualmente alumnos-julian/app/, no alumnos-julian/app v2/. La nueva app de AI Studio no se publica en la ruta institucional hasta actualizar y validar scripts/build.mjs y las reglas de Vercel.
