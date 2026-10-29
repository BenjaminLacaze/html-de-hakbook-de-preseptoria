# Integración API — 2026-10-28 · Codex

Cambios exclusivamente en este app. Sin commits, publicación ni escrituras de prueba en la base.

- Raíz protegida por `shared/auth/SessionGate`; AuthContext recibe identidad real y carga ficha, materias, registros, resumen oficial y configuración desde `/me` y `/records`. Inicio muestra comunicados institucionales reales.
- Eliminados login falso, perfiles alternables y fixtures de demostración. Las entradas JS/JSX ahora delegan en App.tsx; index.html usa main.tsx para evitar ejecutar la versión vieja.
- Cierre real, estados de carga/error y recarga de datos al volver al foco; React/React DOM deduplicados en Vite.
- Resumen global usa `/me/summary`. Subconjuntos filtrados se etiquetan como informativos y usan la configuración institucional: justificadas aprobadas fuera del denominador, peso real de tardanzas y umbrales de la API. Las cursadas anuales no se inventan como primer/segundo cuatrimestre.

## Límites exactos

- Lucía mantiene sus pantallas académicas de asistencia y agrega «Centro y mensajes». No incorpora las vistas de notas ni el foro académico de Julián.
- Ficha solo lectura. API no ofrece aquí cargo/contacto/oficina del preceptor ni detalle de plan; se muestran como no informados. Año de cursada/carrera surge de primera comisión; listado de comisiones incluye todas, sin afirmar que el alumno pertenece a una única comisión.
- No se cargan justificaciones ni certificados desde el alumno: backend reserva escritura a gestión/Preceptoría. Las ausencias aprobadas se reflejan como justificadas.
- Configuración/accesibilidad visual sigue guardada por dispositivo; no se presenta como una actualización institucional.
- Sin pruebas de navegador con sesión real ni contra servidor. No se probaron escrituras reales. La validación de tipos, cálculo y build no equivale a validación completa con cuentas reales.

## Validación

`npm run lint --prefix alumnos-lucia/app` y `npm run build --prefix alumnos-lucia/app`.
`./node_modules/.bin/tsx --tsconfig alumnos-lucia/app/tsconfig.json alumnos-lucia/app/tests/attendance.test.ts`: 8 comprobaciones.
Usa `/api/v1` y proxy local a puerto 4000; requiere SessionGate y React raíz provistos por el padre. No necesita activar modo real ni agregar secretos. Vite puede advertir el uso heredado de __dirname (sin impedir compilar).


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
