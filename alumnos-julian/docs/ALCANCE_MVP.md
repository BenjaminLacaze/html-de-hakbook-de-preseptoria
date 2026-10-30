# Alcance funcional — Portal del Alumno app v2

**Versión documentada:** alumnos-julian/app v2/
**Estado:** prototipo funcional de interfaz en modo demostración; sin autenticación ni conexión desde esta app al backend.

## Funciones disponibles

| Área | Funcionalidad | Estado de datos |
|---|---|---|
| Inicio | Resumen académico, métricas de asistencia, próximos eventos, avisos y notas | Demo |
| Perfil | Datos del alumno y solicitud de corrección | La solicitud se guarda localmente |
| Agenda | Eventos y recordatorios | Recordatorios simulados |
| Materias | Materias, docentes, horarios y detalle de cursada | Demo |
| Notas | Evaluaciones y calificaciones | No son notas oficiales |
| Faltas | Registros de asistencia y solicitud de justificación | Justificación simulada |
| Asistencia QR | Lectura y registro de código QR | Sin validación institucional |
| Historial | Línea de tiempo académica | Demo |
| Comunidad | Avisos y estado de lectura | Estado local |
| Foros | Publicaciones y respuestas | Operaciones locales sobre la demo |
| Opciones | Preferencias, modo demo y restablecimiento | Persistencia local |
| Apariencia | Seis temas, tamaño de texto, densidad y reducción de movimiento | Preferencias locales |

También hay introducción institucional, búsqueda global, notificaciones, navegación móvil y estados de carga y error.

## Relación funcional entre paneles

| Panel responsable | Fuente compartida | Qué corresponde al panel Alumno |
|---|---|---|
| Preceptoría y Profesores | Planilla única de asistencia y justificaciones | Consultar exclusivamente sus propios registros y resumen |
| Centro de Estudiantes | Eventos, comunicados, conversaciones comunitarias y reclamos | Leer contenido habilitado; participar en eventos, foro comunitario o reclamos según permisos |
| Auxiliares | Tareas, instalaciones, incidencias y mantenimiento | Nada del panel operativo; el rol STUDENT no tiene acceso a /staff/* |
| Preceptoría | Foro académico y comunicados destinados a sus cursos | Ver solo contenido publicado y dirigido al alumno, separado del foro del Centro |

La API compartida ya tiene endpoints para estas áreas. Que existan en el backend no significa que app v2 los esté consumiendo: hoy las pantallas usan mocks locales.

## Comportamiento de demostración

StudentApi usa demoDB; no hace solicitudes HTTP. Los datos iniciales vienen de JULIAN/mocks/dataset.ts y los cambios se guardan en localStorage bajo alumno-demo-db-v1. La demora y algunos errores de carga se pueden simular.

Las acciones de perfil, asistencia QR, justificaciones, foros, avisos, recordatorios y preferencias no crean trámites ni registros institucionales. La opción de restablecer la demo devuelve el conjunto local al estado inicial.

## Fuera del alcance conectado

- Inicio de sesión, renovación de sesión y permisos institucionales.
- Lectura o escritura desde app v2 en el backend o en la base de datos oficial.
- Validación oficial de asistencia QR, calificaciones o solicitudes.
- Carga segura de certificados y adjuntos.
- Notificaciones reales por correo o push.
- Publicación de app v2 en el build general de Vercel.

Para considerar una función institucional, hacen falta una sesión confiable, autorización del backend, reglas de privacidad y una fuente oficial. Consultá [el contrato backend](Contrato_backend_alumno_julian.md).
