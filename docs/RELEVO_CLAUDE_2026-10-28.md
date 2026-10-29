# Relevo para Claude — 28/10/2026

## Pedido y decisión vigente

El usuario pidió integrar todas las apps, agregar login con referencias de usuarios/roles, retirar datos
hardcodeados/de muestra, cargar cinco registros por módulo y comprobar un circuito real entre roles.
Luego pidió **documentar para continuar en Claude**. Se detuvo la ampliación y se guarda el trabajo.

**Base elegida: Neon, la ya conectada.** Hubo una propuesta de Supabase, pero el usuario aclaró
«usemos Neon entonces, si ya estaba conectada». No migrar a Supabase por el documento anterior.
`docs/SUPABASE.md` y `scripts/supabase.mjs` quedan solo como alternativa preparada.

## Ubicación y Git

Carpeta: `C:\PROYECTOS 2026\sistema-gestion-i26\html-de-hakbook-de-preseptoria-main`.
El directorio del chat era `hub mp`: ese es OTRO producto y no se modificó.

- Equipo/origin: `BenjaminLacaze/html-de-hakbook-de-preseptoria`, `main`.
- Deploy: `mjsis20052/sistema-gestion-i26`, `main`; Vercel `sistema-gestion-i26.vercel.app`.
- Al empezar: equipo `21135c0`; producción `53af151` con árbol del equipo `f4c3986`.
- Esta sesión NO copió los cambios nuevos al repo de deploy ni activó una versión nueva en Vercel.
- `julian appcompleta/` y `recursos/` estaban sin seguir: se preservan y no se incluyen en el commit.

Arrancar con `git status -sb`, `git log -5 --oneline`, leer este documento y CHANGELOG, y después pull.
El commit de cierre puede identificarse por el mensaje "Connect portals to shared API and document Claude handoff".

## Cambios implementados

### Sesión común

`shared/auth/SessionGate.tsx` + `session.css`: email/contraseña reales, consulta de sesión existente,
cambio obligatorio de contraseña temporal, control de rol por portal, cierre real y tabla de referencias de roles.
No expone contraseñas ni permite elegir un rol para saltear permisos. `shared/api.ts` evita caché y avisa sesión vencida.
React y sus tipos están en devDependencies raíz y los cinco Vite usan dedupe para evitar dos instancias de React.

### Directivos

Entrada `directivos-jesica-agustin/app/src/App.tsx`: panel operativo contra API, sin AppContext demo en ejecución.
Altas de carreras, planes, materias, ciclos, comisiones, alumnos, docentes, cuentas e inscripciones.
Asignación/reasignación de docentes y preceptor a comisión, horario/aula; consulta de asistencia y notas;
carga/corrección/publicación de notas según permiso. Referencia: `directivos-jesica-agustin/app/INTEGRACION.md`.
Las vistas anteriores siguen como fuentes, pero la entrada real no las importa.

### Profesores

`academicService.ts` usa `/academic`, `/structure`, `/attendance`, `/records`.
Nuevo `GradesView.tsx` para cargar/corregir/publicar notas. Descubrimiento de clases vacías/cerradas mediante
nuevo `GET /attendance/commissions/:id/sessions`. Se eliminan las falsas persistencias localStorage.
Referencia: `profesores-nicolas/app/INTEGRACION_API.md`.

### Ambos portales de Alumno

Julián: adaptadores `/me/*`, `/records/*`, `/social/*`, notificaciones, foro académico, agenda y notas publicadas.
Lucía: sesión real, asistencia/estadísticas de servidor, ficha y comunicados. Se consolidaron entradas JS/TS para
que el HTML efectivamente ejecute la App TSX. Se eliminaron los archivos mockData de ambos módulos.
Los dos tienen «Centro y mensajes»: comunicados/eventos e inscripción, reclamos y respuestas, foro de comunidad,
mensajes privados y notificaciones. Referencias `alumnos-*/app/INTEGRACION_API.md` y sus tests.

### Consolidación

`consolidacion/app/src/main.tsx` ejecuta `OperationalApp.tsx`, ya no la App legacy/demo.
Preceptor: asistencia por comisión (incluye llegada tarde), justificaciones, avisos dirigidos y moderación foro académico.
Auxiliar: tareas, instalaciones, incidencias. Centro: eventos/participantes, reclamos, comunicados y foro.
Todos: mensajes, notas personales, perfil y notificaciones. Datos vacíos muestran vacío; no se inventan registros.
`src/legacy` se conserva como fuente histórica sin ser la entrada de producción.

### Otros

- `/api/v1/ready` comprueba acceso a PostgreSQL; `/health` sigue indicando vida del proceso.
- Landing cambia a "Portales institucionales" y se retira el enlace destacado al portal HTML de muestra.
- `scripts/build.mjs --skip-install` recompila con dependencias ya instaladas; el build de deploy normal sigue instalando.
- `.env.example` sigue documentando Neon. `.env` local fue normalizado quitando duplicados y conservando sus claves;
  TLS pasa a `sslmode=verify-full`. No se imprimieron ni versionaron secretos.

## Lo que NO está completo (no anunciar «todo listo»)

1. No se publicó este código nuevo en Vercel.
2. Falta cerrar la batería HTTP sobre Neon (ver abajo) y revisar acciones desde pantallas reales de cada rol.
3. QR, adjuntos/materiales/planificaciones y turnos de auxiliares no están integrados: se mantienen deshabilitados
   o fuera del panel operativo; no simular éxito ni decir que ya existen.
4. Las fichas institucionales no son editables por Alumno; debe hacerlo Secretaría.
5. La integración social es por consultas y recarga al volver a foco; no hay WebSocket.
6. Directivos tiene edición de asignaciones de comisión y gestión esencial, no un CRUD visual completo de cada entidad.
7. Algunos archivos legacy todavía contienen demos, pero no se deben importar en las entradas reales.
8. No afirmar que los nombres QA son personas reales: son registros persistidos de verificación.

## Pruebas y evidencia confirmada

- `npm run typecheck` raíz: correcto.
- Typecheck de consolidación: correcto. Agentes verificaron build/typecheck de Directivos, Profesores y ambos Alumnos.
- Build completo `node scripts/build.mjs --skip-install`: **5 apps correctas**, salida final "Listo: sitio completo en dist/".
  Advertencias: bundle de Julián >500 KB y `__dirname` heredado en Vite de Lucía/Directivos.
- `backend/test/integration-flow.mjs` contra PostgreSQL 17 aislado `127.0.0.1:5452/qa_i26`:
  cinco recorridos profesor asistencia/nota → alumno → preceptor justifica → alumno refleja; cinco CRUD Centro/Auxiliar;
  alta íntegra HTTP por Director de alumno+cuenta+cambio obligatorio+inscripción+asistencia. Denegaciones entre roles.
  Se verifica porcentaje **100 → 0 → 100** tras aprobación, y que la justificación pendiente no mejore el porcentaje.
  Archivo privado de evidencia `backend/.local-test/integration-result.txt`.
- Verificación navegador contra base local: login de Dirección y listados; login Profesor y comisión asignada;
  login Alumno de Julián y materias. Se detectó falta de institution_settings en la fixture y se corrigió en el generador.
  **No se completó la validación visual de Lucía ni de todas las acciones de consolidación en esta sesión.**
- Dos lecturas `/me` automatizadas no sustituyen dos recorridos de pantalla: verificar ambos portales manualmente.

## Neon: cambios REALES ya realizados

1. Respaldo consistente de las 39 tablas: `.local-backups/i26-2026-10-29T01-47-29-294Z.json`, 1210 filas,
   con hash SHA256 al lado. El nombre usa UTC; ocurrió la noche del 28/10 en Argentina.
   Contiene información privada y hashes de contraseñas: ignorado por Git.
   Formato JSON con tablas, metadata de columnas y FK. No es un dump nativo restaurable con psql:
   restaurar requiere el esquema Prisma y orden correcto de relaciones.
2. Se ejecutó `npm run db:demo-data:off`: borró **2 carreras demo, 60 alumnos demo, 18 comisiones demo**
   y dependencias marcadas, sin borrado general. Se ejecutó `npm run db:test-users:off`: **7 cuentas demo desactivadas**.
3. Se cargaron **5 escenarios QA nuevos en Neon**, con alumnos/docentes/comisiones y cinco datos en módulos Centro/Auxiliar.
   `backend/src/integration-fixtures.ts --allow-configured-qa` con `ALLOW_REMOTE_QA=true`.
   Reutiliza el ciclo ACTIVE existente. No crea otro ciclo ni altera cuentas institucionales.
4. Cuentas QA y contraseñas aleatorias: `backend/.local-test/neon-manifest.json` (privado, ignorado por Git).
   Cuenta institucional `direccion@isfdyt26.edu.ar` preservada; no se cambió su contraseña en esta sesión.
5. Se inició la prueba contra API local puerto 4053 conectada a Neon. Registro de avance:
   `backend/.local-test/neon-integration-result.txt`. Leer el resultado de cierre más abajo antes de inferir completitud.

Antes de publicar, verificar también que no quedaron demo=true y que el backend viejo no sea usado para validar las nuevas pantallas.
Las cuentas de prueba públicas anteriores ya NO sirven: no volver a activarlas automáticamente.

## Comandos de continuación

Base local: fixtures y pruebas requieren AMBAS cadenas explícitas cuando se usa Prisma.

```powershell
$env:DATABASE_URL='postgresql://postgres@127.0.0.1:5452/qa_i26'
$env:DIRECT_DATABASE_URL=$env:DATABASE_URL
npm run db:integration-fixtures
$env:API_PORT='4052'
node --import tsx backend/src/dev.ts
```

En otra consola:

```powershell
$env:API_TEST_URL='http://127.0.0.1:4052/api/v1'
$env:TEST_FIXTURE_MANIFEST=(Resolve-Path backend/.local-test/manifest.json).Path
npm run test:integration
```

**Neon**: usar una consola NUEVA sin variables de prueba heredadas; `.env` tiene las conexiones reales.

```powershell
$env:API_PORT='4053'
node --import tsx backend/src/dev.ts
```

En otra consola NUEVA:

```powershell
$env:ALLOW_REMOTE_QA='true'
$env:API_TEST_URL='http://127.0.0.1:4053/api/v1'
$env:TEST_FIXTURE_MANIFEST=(Resolve-Path backend/.local-test/neon-manifest.json).Path
node backend/test/integration-flow.mjs
```

La prueba configurada solo acepta API local 4053 y manifest remoto explícito. Crea/modifica registros QA;
en ese modo NO ejecuta borrados. No volver a cargar fixtures si ya están (son idempotentes, pero no es necesario).
Las pruebas usan fechas posteriores a justificaciones previas para repetirse sin borrar historia.

## Publicar cuando esté comprobado

El usuario ya autorizó completar y probar las mejoras. Verificar Git del equipo y el de deploy antes de copiar.
Publicar el mismo árbol al repo de deploy, conservando su historial (commit encima del último main, sin force).
Vercel requiere que el autor sea `mjsis20052` en el plan usado; no usar el autor Git de la otra cuenta para ese repo.
Después comprobar `/ready`, login de cuentas QA, permisos, clases/notas y consultas de alumno.
El push de cierre de esta sesión va solo al repo del equipo para que Claude encuentre los cambios.

## Incidente de pruebas documentado

Un primer comando de un agente estableció solo DATABASE_URL local y Prisma tomó DIRECT_DATABASE_URL del .env (Neon).
Se interrumpió al detectarlo. El padre consultó después `_prisma_migrations` de Neon: solo estaban las tres migraciones
históricas, terminadas el 24 y el 27/10; no apareció una migración del 28. No hay cambios de esquema nuevos de esta sesión.
El detalle bruto y la corrección de procedimiento están en `backend/test/README.md`.

## Cierre efectivo para relevo

La batería Neon se detuvo expresamente al pedido de continuar en Claude. Llegó a comprobar configuración,
el porcentaje del escenario 1 (100 → 0 → 100), su circuito asistencia/notas/justificación/permisos,
y el cambio de porcentaje del escenario 2. El resto del segundo circuito no llegó a confirmarse.
**No se terminó la batería remota de cinco escenarios**. Puede haber escrituras parciales QA de la siguiente
iteración; la prueba es repetible y conserva la historia. Leer el log privado antes de repetir.
Los cinco escenarios completos y CRUD están confirmados en la base local aislada.
Los servidores de desarrollo y la base local se cierran al finalizar; usar los comandos anteriores para levantarlos.
