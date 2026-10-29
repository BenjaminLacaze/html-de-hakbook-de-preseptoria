# Relevo del sistema de gestión i26

Antes de trabajar: `git status -sb`, leer `MEJORAS.md`, `docs/RELEVO_CLAUDE_2026-10-28.md` y las entradas recientes de `CHANGELOG.md`.
Hacer `git pull` antes de modificar archivos. Preservar cambios locales de otros agentes.

El repo del equipo es `BenjaminLacaze/html-de-hakbook-de-preseptoria`.
Producción se publica desde OTRO repo: `mjsis20052/sistema-gestion-i26`, rama main, Vercel.
Un push al repo del equipo NO actualiza ese deploy. No confundir este proyecto con `hub mp`.

Las credenciales están en `.env`; los manifest QA en `backend/.local-test/`; los respaldos en `.local-backups/`.
Nunca subir esas rutas ni imprimir contraseñas. No alterar Neon al probar una base local: establecer AMBAS
`DATABASE_URL` y `DIRECT_DATABASE_URL` de forma explícita para migraciones.

Al terminar: bitácora en MEJORAS, detalle en CHANGELOG, commit y push al repo autorizado.
Separar siempre: implementado, compilado, probado en base local, probado en Neon, publicado y probado desde pantalla.
