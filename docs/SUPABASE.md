# Base unificada en Supabase

El backend existente usa Prisma y PostgreSQL: funciona con Supabase sin cambiar los portales.
La sesión continúa en `/api/v1/auth`; las credenciales de PostgreSQL son exclusivamente del servidor.
No se necesita una clave `anon` ni `service_role` dentro del navegador.

## Conexión

1. En el proyecto Supabase, abrir **Connect**. Copiar **Session pooler**, puerto 5432, a `DATABASE_URL` del `.env` local.
2. Copiar conexión directa a `DIRECT_DATABASE_URL`. Si la conexión IPv6 no funciona en esta red, usar también Session pooler 5432.
3. Reemplazar la contraseña con su valor codificado para URL. No compartir el `.env` por Git ni cargar estos valores con prefijo `VITE_`.
4. Desde la raíz: `npm run db:supabase:check`; después `npm run db:supabase:prepare`.

`prepare` aplica las migraciones existentes y restringe el acceso público a las tablas del sistema.
No modifica los esquemas internos `auth` o `storage`. El usuario de conexión debe ser propietario de las tablas o tener privilegios equivalentes;
la API se conecta con ese usuario, mientras `anon` y `authenticated` no tienen acceso directo.
Como todas las operaciones pasan por nuestra API, se recomienda desactivar **Data API** en Supabase Settings → API.

La comprobación rechaza cadenas de Neon: evita que una migración destinada a Supabase termine aplicada a la base anterior.
El uso de Session pooler y las restricciones de red están documentados por [Supabase](https://supabase.com/docs/guides/database/connecting-to-postgres).
La integración con Prisma y la recomendación de desactivar Data API están en su [guía de Prisma](https://supabase.com/docs/guides/database/prisma).

## Primera cuenta y datos

En una base nueva, completar `SEED_ADMIN_EMAIL`, `SEED_ADMIN_PASSWORD`, nombre y apellido en `.env`, y ejecutar `npm run db:seed`.
La contraseña inicial se cambia al entrar. Dirección crea el resto de las cuentas y las vincula con las fichas de alumnos o docentes.

La base nueva queda vacía de datos inventados. Si hay que trasladar registros institucionales desde Neon, hacer una copia antes;
no ejecutar borrados generales ni sobreescribir cuentas existentes. Los datos QA se mantienen en la base local de verificación.

## Publicación

Con Supabase verificado, cargar `DATABASE_URL` en el proyecto Vercel del sistema y publicar el mismo código.
Verificar login, identidad, comisión asignada, guardado de asistencia, consulta desde ambos portales de Alumno y reporte de Dirección.
Conservar Neon hasta terminar esta verificación; cambiar la URL no copia datos entre proveedores.

## Estado de esta sesión

La aplicación está preparada para Supabase. La conexión y la migración remotas solo pueden confirmarse cuando las cadenas nuevas estén en `.env`.
Las pruebas automatizadas utilizan PostgreSQL local aislado; el resultado se detalla en `VALIDACION_FLUJO.md`.
