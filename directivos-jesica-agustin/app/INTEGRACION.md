# Integración Directivos — 2026-10-28 — Codex

Entrada runtime reemplazada por panel API en src/App.tsx; conserva estilos institucionales.
SessionGate compartido con apps=['directivos']; Vite dedupe React/ReactDOM.
Sin imports runtime de mocks, simulador de rol, almacenamiento local ni Drive ZIP demo.
Altas: carreras, planes, materias, ciclos, comisiones, alumnos, docentes, cuentas vinculadas e inscripciones.
Cuentas: activar/desactivar y restablecer contraseña temporal. Ciclos: activar.
Reportes: notas por comisión con alumno resuelto desde inscripciones; resumen oficial de asistencia por alumno y comisión opcional; impresión del reporte consultado.
Errores visibles, carga bloquea acciones, recarga al recuperar foco. Credenciales temporales solo en memoria con botón Ocultar.
Lecturas de catálogos usan /academic porque /structure no ofrece GET de carreras/materias.
Verificado: npm run lint y npm run build OK. No se verificaron escrituras ni navegación con sesión real.
Limitación: vistas secundarias anteriores permanecen como código sin importar desde la entrada; el panel nuevo ofrece altas y consultas, no edición general de cada entidad ni carga/publicación de notas.
No se modificó shared/backend ni otros módulos. Sin commits ni publicación.

## 2026-10-28 — Codex — Completar circuito esencial
- Alta de comisión envía preceptorUserId (UUID de cuenta activa PRECEPTOR), teacherIds múltiples y schedule con día, inicio, fin y aula opcional.
- Edición de comisión permite reasignar/quitar docentes y preceptor. Conserva horario salvo reemplazo explícito; admite un bloque nuevo o vaciar horario.
- El backend existente ya admite estos campos en POST/PATCH. No se modificó backend.
- Ciclos se crean PLANNED por defecto del backend y se activan con PATCH separado; explicación visible del cierre del anterior.
- Notas: PUT /records/grades para cargar/corregir por inscripción real; POST /records/grades/publish por comisión/evaluación/instancia. Solo DIRECTOR/SUPER_ADMIN según permisos backend (ADMINISTRATIVE consulta).
- Etiquetas en castellano para asignaciones, horarios, estados y resumen de asistencia; se oculta UUID de inscripción en reporte de notas.
- Verificación: npm run lint y npm run build OK. Vite conserva aviso previo sobre __dirname. Sin pruebas autenticadas de escrituras ni publicación en producción.
- Sigue pendiente edición general de otras entidades; ya se incorporó carga/publicación de notas que figuraba pendiente arriba.
