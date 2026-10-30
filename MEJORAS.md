# Estado compartido — Sistema de gestión i26

## Relevo actual

Leer primero `docs/RELEVO_CLAUDE_2026-10-28.md`: contiene el estado exacto, pruebas, pendientes y comandos.
La matriz `docs/ESTADO_VALIDACION.md` distingue implementado, probado en local, probado parcialmente en Neon y pendiente de publicación.

- Equipo: `BenjaminLacaze/html-de-hakbook-de-preseptoria`, carpeta raíz de este archivo.
- Deploy: `mjsis20052/sistema-gestion-i26` → `https://sistema-gestion-i26.vercel.app`.
- Base activa: **Neon**. El usuario consideró Supabase, pero decidió conservar Neon el 28/10.
- Backend existente: Hono + Prisma + PostgreSQL, `/api/v1`, sesiones HttpOnly compartidas.
- Los cambios de conexión de Alumnos V2 están implementados localmente; falta publicarlos y verificarlos con QA. No se ejecutaron cambios en Neon.
- Los datos demo antiguos se quitaron de Neon con respaldo previo. Los 7 accesos demo públicos se desactivaron.
- Hay 5 escenarios QA persistidos y cuentas nuevas con claves privadas; no son identidades institucionales reales.

## Reglas

1. Revisar git antes de trabajar; no borrar carpetas ajenas (`recursos/`, `julian appcompleta/`).
2. Leer cambios del equipo y evitar pisarlos. No publicar por accidente el repo equivocado.
3. No guardar secretos en código, logs públicos, documentación o commits.
4. No afirmar que todo el flujo está validado por compilar: la evidencia está en el relevo.
5. Migraciones locales siempre con las dos cadenas explícitas; las del `.env` apuntan a Neon real.

## Bitácora

- 2026-10-30 — GPT/Codex — Inicio arquitectónico de la conexión de Alumnos V2: confirmé que Neon + Prisma + `/api/v1` ya es la base/API compartida de los cuatro módulos. No se crea una segunda base ni se ejecutan migraciones. El contrato documenta las relaciones, límites de acceso, proxy con cookie HttpOnly y fases para sustituir `demoDB`; lecturas públicas de salud/rutas solo, sin cambios ni exposición de datos personales.

- 2026-10-30 — GPT/Codex — Publicado el panel de AI Studio `alumnos-julian/app v2/` en el proyecto Vercel independiente [alumnos-julian-v2.vercel.app](https://alumnos-julian-v2.vercel.app). Build de producción listo y HTTP 200 confirmado. No cambia el sitio unificado; la app todavía usa datos locales de demostración y no está conectada a la base institucional.

- 2026-10-30 — GPT/Codex — Preparación de publicación de Alumnos V2: el build incorpora `alumnos-julian/app v2/` en `/alumnos-julian/app-v2/`, Vercel recibe rewrite SPA y la landing ofrece V2 como acceso principal conservando la versión previa. Se adaptaron las rutas de logo y video al `BASE_URL` de Vite para que carguen bajo el subdirectorio. La publicación productiva queda pendiente de acceso al repo de despliegue `mjsis20052/sistema-gestion-i26`.

- 2026-10-28 — GPT/Codex — Aclaración de alcance pedida por el usuario: matriz de pruebas y pendientes
  en `docs/ESTADO_VALIDACION.md`, enlazada desde el relevo. No se ejecutaron pruebas nuevas ni se publicó código.

- 2026-10-28 — GPT/Codex — Revisión y conexión real de los cinco frontends a la API existente;
  SessionGate común con login/cambio de contraseña/referencias de roles; Directivos y Profesores con
  gestión académica y notas; portales Alumno con adaptadores reales y comunidad; consolidación con
  pantallas operativas sin stores demo. Build completo correcto, batería HTTP local de cinco escenarios
  comprobada. Respaldo y limpieza de demo en Neon; datos QA nuevos cargados. Prueba completa de Neon
  y verificación visual de todas las acciones quedan pendientes. El usuario pidió documentar para seguir en Claude.
# 2026-10-30 — Panel Alumno V2 conectado al contrato compartido (preparación local)

- La conexión usa la base Neon y API Hono/Prisma que ya comparten los cuatro módulos. No se creó otra base ni se cambió el esquema remoto.
- Se añadió login de servidor con cookie HttpOnly y lecturas personales; Centro/foro académico permanecen como dominios separados y Auxiliares no queda expuesto al alumno.
- Antes de considerar la integración lista, publicar esta revisión y comprobar sesión, lecturas y permisos en QA. Las operaciones sin endpoint de alumno (QR, justificativos nuevos, rectificaciones) continúan pendientes del contrato backend.
- Preferencias y recordatorios locales se identifican como tales; no representan estado compartido entre módulos.
