# Integración real — 2026-10-28 — Codex

Cambios limitados a profesores-nicolas/app; sin commits ni publicación.

- academicService usa shared/api: /academic/scope, /structure/commissions, /structure/cycles, /structure/teachers, /structure/enrollments, /attendance y /records/observations.
- App usa SessionGate apps=[profesores], render prop AuthMe; identidad y permisos del servidor. Sin fallback mock ni localStorage. Datos mock y DemoBanner quedan como archivos sin importar en runtime.
- Adaptación de estados de asistencia, categorías, turnos, horarios, ciclos e inscripciones. CURSANDO y APROBADO se conservan como condiciones distintas.
- Guardar asistencia usa close:false para permitir correcciones posteriores. El backend rechaza modificar planillas cerradas para docentes. El responsable de cada escritura lo establece el servidor.
- Errores visibles y reintento inicial; App y vistas actualizan datos al volver foco. Vite dedupe react/react-dom.

Verificación: npm run build (tsc -b && vite build) OK, 2374 módulos, 1.90 s. No se probaron login ni escrituras con cuenta real en navegador.

Limitaciones del backend:
- Historial: GET /attendance/commissions/:id/sessions incluye clases vacías y cerradas, con records. Sin commissionId, consulta todas las comisiones en paralelo. El backend limita a 1000 clases por comisión.
- GET sesión no devuelve autor ni fecha de cada asistencia: esos campos se dejan vacíos, no se inventan. Los identificadores de filas de la vista son claves compuestas, no IDs persistidos.
- Observaciones sin ficha disponible (por ejemplo alumno dado de baja) muestran ese aviso en lugar de un nombre inventado. Listado limitado por backend a 1000 observaciones.
- La pantalla no ofrece cierre definitivo de planilla; guardar conserva la posibilidad de corregir.
- Requiere API disponible y sesión compartida; no necesita variables nuevas. Recompilar para publicar.

## Ajuste posterior — 2026-10-28 — Codex
- Se quitaron los textos de demostración activos (modal asistencia, DNI, perfil y pie de menú).
- GradesView y pestaña Calificaciones: consulta GET /records/grades y /structure/enrollments, mapea alumno a enrollmentId. Carga/corrección individual con PUT /records/grades usando SaveGradeRequest exacto: enrollmentId, type, instance (1–10), date, value (1–10 o null), absent y notes (máximo 1000).
- Publicación por comisión + tipo + instancia con POST /records/grades/publish, confirmación, cantidad publicada y estados visibles. Ausente guarda value:null. Correcciones de notas ya publicadas siguen publicadas según comportamiento del backend y se informa en pantalla.
- Estados de carga, errores visibles, reintento y recarga al foco; estilos y modal existentes. Catch duplicado de asistencia corregido.
- No se probaron escrituras/publicación contra la base real ni interacción en navegador. No se modificó backend/shared y no se hicieron commits.

Verificación final: npm run build OK (tsc -b y Vite; 2375 módulos, 1.90 s).
