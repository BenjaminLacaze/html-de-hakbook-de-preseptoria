# Alcance funcional — Portal del Alumno app v2

**Versión documentada:** alumnos-julian/app v2/
**Estado:** prototipo funcional de interfaz en modo demostración; sin autenticación ni conexión confirmada al backend institucional.

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

## Comportamiento de demostración

StudentApi usa demoDB; no hace solicitudes HTTP. Los datos iniciales vienen de JULIAN/mocks/dataset.ts y los cambios se guardan en localStorage bajo alumno-demo-db-v1. La demora y algunos errores de carga se pueden simular.

Las acciones de perfil, asistencia QR, justificaciones, foros, avisos, recordatorios y preferencias no crean trámites ni registros institucionales. La opción de restablecer la demo devuelve el conjunto local al estado inicial.

## Fuera del alcance conectado

- Inicio de sesión, renovación de sesión y permisos institucionales.
- Lectura o escritura en el backend o la base de datos oficial.
- Validación oficial de asistencia QR, calificaciones o solicitudes.
- Carga segura de certificados y adjuntos.
- Notificaciones reales por correo o push.
- Publicación de app v2 en el build general de Vercel.

Para considerar una función institucional, hacen falta una API autorizada, validación en servidor, una sesión confiable, reglas de privacidad y una fuente oficial. Consultá [el contrato backend propuesto](Contrato_backend_alumno_julian.md).
