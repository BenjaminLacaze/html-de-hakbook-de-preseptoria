# Estado compartido — Sistema de gestión i26

## Relevo actual

Leer primero `docs/RELEVO_CLAUDE_2026-10-28.md`: contiene el estado exacto, pruebas, pendientes y comandos.
La matriz `docs/ESTADO_VALIDACION.md` distingue implementado, probado en local, probado parcialmente en Neon y pendiente de publicación.

- Equipo: `BenjaminLacaze/html-de-hakbook-de-preseptoria`, carpeta raíz de este archivo.
- Deploy: `mjsis20052/sistema-gestion-i26` → `https://sistema-gestion-i26.vercel.app`.
- Base activa: **Neon**. El usuario consideró Supabase, pero decidió conservar Neon el 28/10.
- Backend existente: Hono + Prisma + PostgreSQL, `/api/v1`, sesiones HttpOnly compartidas.
- Los cambios del 28/10 están preparados para ingreso real obligatorio; no se publicó esta nueva interfaz en esta sesión.
- Los datos demo antiguos se quitaron de Neon con respaldo previo. Los 7 accesos demo públicos se desactivaron.
- Hay 5 escenarios QA persistidos y cuentas nuevas con claves privadas; no son identidades institucionales reales.

## Reglas

1. Revisar git antes de trabajar; no borrar carpetas ajenas (`recursos/`, `julian appcompleta/`).
2. Leer cambios del equipo y evitar pisarlos. No publicar por accidente el repo equivocado.
3. No guardar secretos en código, logs públicos, documentación o commits.
4. No afirmar que todo el flujo está validado por compilar: la evidencia está en el relevo.
5. Migraciones locales siempre con las dos cadenas explícitas; las del `.env` apuntan a Neon real.

## Bitácora

- 2026-10-28 — GPT/Codex — Aclaración de alcance pedida por el usuario: matriz de pruebas y pendientes
  en `docs/ESTADO_VALIDACION.md`, enlazada desde el relevo. No se ejecutaron pruebas nuevas ni se publicó código.

- 2026-10-28 — GPT/Codex — Revisión y conexión real de los cinco frontends a la API existente;
  SessionGate común con login/cambio de contraseña/referencias de roles; Directivos y Profesores con
  gestión académica y notas; portales Alumno con adaptadores reales y comunidad; consolidación con
  pantallas operativas sin stores demo. Build completo correcto, batería HTTP local de cinco escenarios
  comprobada. Respaldo y limpieza de demo en Neon; datos QA nuevos cargados. Prueba completa de Neon
  y verificación visual de todas las acciones quedan pendientes. El usuario pidió documentar para seguir en Claude.
