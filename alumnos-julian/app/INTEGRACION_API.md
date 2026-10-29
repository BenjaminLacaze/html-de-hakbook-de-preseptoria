# Integración API — 2026-10-28 · Codex

Cambios exclusivamente en este app. Sin commits, publicación ni escrituras de prueba en la base.

- Raíz protegida por `shared/auth/SessionGate`, identidad de sesión en contexto; cierre real por cookie.
- Servicios y adaptadores en `src/services`: `/me/student`, `/me/subjects`, `/me/summary`, `/me/attendance`, `/me/grades`, `/me/justifications`; agenda/comunicados/configuración por `/records`; directorio, foro/respuestas y notificaciones por `/social`.
- Modo real obligatorio; eliminados mocks y cliente que intentaba recuperar tokens del navegador. Recarga de consultas al volver al foco. Errores de consultas y escrituras visibles con opción de recargar.
- Vite deduplica React y React DOM para el componente compartido.

## Límites exactos

- Registro QR: sin endpoint; pantalla y botón deshabilitados.
- Solicitud de justificación del alumno: `/me/justifications` solo lee; `POST /attendance/justifications` exige gestión/Preceptoría. Botón deshabilitado. Se consulta estado y resultado en asistencia/historial.
- Edición de ficha/email/teléfono institucional: no hay permiso/endpoint de alumno; botón deshabilitado. No se guarda un teléfono social haciéndolo pasar por teléfono de Secretaría.
- Directorio no proporciona correo, carrera ni comisión. Se indican ausencias de información y no se ofrece un correo vacío. Mensajes privados disponibles en «Centro y mensajes».
- Foro no tiene categorías ni rol del autor en su respuesta: categoría deshabilitada y autores como «Participante». Se muestra estado de moderación; los temas pendientes o cerrados no permiten responder. El alta envía comisión real y queda pendiente según la API.
- Las notas se muestran como publicadas, sin inventar una condición de aprobación que la API no devuelve. Horarios no informan modalidad ni jerarquía del docente: se indican sin informar.
- Eventos no ofrecen aula ni horas; se muestran sin informar. El resumen de materias no proporciona plan, correlativas, clases futuras ni promedios. No se consultan rutas de gestión prohibidas ni se fabrican esos datos; las clases mostradas son las ya registradas. El promedio general queda sin informar; la vista de notas calcula y etiqueta el promedio simple de notas publicadas.
- Configuración de correo/push: sin soporte de backend, deshabilitada. Apariencia sigue siendo preferencia local del dispositivo.
- Pruebas con sesión real en navegador y lecturas/escrituras contra servidor: no realizadas. Validación local contra tipos/contratos del backend, adaptadores y compilación; no equivale a una prueba de punta a punta.

## Validación

`npm run lint --prefix alumnos-julian/app` y `npm run build --prefix alumnos-julian/app`.
`./node_modules/.bin/tsx --tsconfig alumnos-julian/app/tsconfig.json alumnos-julian/app/tests/adapters.test.ts`: 12 comprobaciones.
Build de Julián advierte tamaño de bundle superior a 500 kB; no impide compilar.
Usa `/api/v1` por defecto y proxy local a puerto 4000. Requiere el SessionGate compartido y React disponible en raíz, provistos por el agente padre. No requiere secretos nuevos ni variables para activar modo real.


## Ampliación Centro ↔ Alumno — 2026-10-28 · Codex

«Centro y mensajes» está disponible dentro de ambos portales; no redirige a Consolidación ni requiere rol de Centro.

Cinco recorridos implementados:
1. Consultar comunicados publicados por el Centro (`GET /centro/announcements`).
2. Consultar eventos, anotarse y cancelar inscripción (`GET /centro/events`, `POST/DELETE /centro/events/:id/join`), con recarga del contador y estado que devuelve el servidor.
3. Presentar reclamo y consultar su estado/respuesta del Centro (`GET/POST /centro/claims`). La API filtra lo propio por sesión; el cliente no envía un autor inventado.
4. Crear temas de propuestas/comunidad y consultar/enviar respuestas (`/centro/threads`, `/:id/replies`). Espacio distinto del foro académico moderado.
5. Mensajes privados a usuarios del directorio, conversaciones y lectura de respuestas (`/social/directory`, `/messages/conversations`, `/messages/with/:userId`, `POST /messages`); consultar y marcar notificaciones como leídas (`/social/notifications`, `POST /notifications/read`).

No se permite al alumno crear/moderar eventos, comunicados ni respuestas de gestión a reclamos. Solo se muestran acciones de participación. Las escrituras no cambian datos localmente simulando éxito: se espera respuesta del servidor y luego se relee. Formularios conservan texto ante error de envío. Un error de recarga posterior se muestra por separado de una escritura confirmada, sin reintentar automáticamente el alta.

Cada sección tiene carga, vacío, error y reintento independientes. Se recarga al volver al foco. No hay WebSocket ni actualización instantánea entre pestañas abiertas sin foco/recarga. Una barrera de errores React en la raíz ofrece recarga ante fallos de renderizado. Los errores de red/API se muestran en la sección o formulario.

Pruebas nuevas: `tsx --tsconfig <app>/tsconfig.json <app>/tests/communication.test.ts` comprueba cinco escenarios con HTTP sustituido dentro del test, cookies, errores 403 y ausencia de alta de eventos. **No es prueba de punta a punta contra el backend ni navegador real.** Los dos módulos contienen una copia local de la implementación porque el alcance prohíbe modificar shared; mantenerlas sincronizadas o extraerlas en un cambio posterior autorizado.
