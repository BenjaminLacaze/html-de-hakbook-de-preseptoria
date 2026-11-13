# Material histórico — no forma parte del runtime

`backend-local/` es el servidor REST autónomo que se armó como prototipo del módulo
(2026-11-06). **No se usa en producción y no debe publicarse.**

Motivos:

- No comparte la sesión institucional ni la base PostgreSQL/Neon del sistema.
- Mantiene su propio `data/db.json` con datos ficticios.
- Duplica el contrato de asistencia, notas y mensajería que ya existe en `/api/v1`.
- Sus pruebas (`test.js`) validan ese contrato paralelo, no la integración real.

El módulo Profesor se conecta al backend común (Hono + Prisma + Neon) documentado en
[`docs/INTEGRACION_TECNICA.md`](../../docs/INTEGRACION_TECNICA.md) y en
[`docs/CONTRATO_UNIFICACION.html`](../../docs/CONTRATO_UNIFICACION.html).

Si necesitás recuperar el prototipo, está completo acá; no lo importes desde `app/` ni lo
agregues al build.
