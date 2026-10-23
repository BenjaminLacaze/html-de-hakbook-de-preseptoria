// Configuración de Prisma (CLI). La API se conecta en backend/src/db.ts.
//
// DATABASE_URL         conexión que usa la API (en Neon: la "pooled", con -pooler en el host)
// DIRECT_DATABASE_URL  conexión directa, solo para migraciones (en Neon: la que NO tiene -pooler).
//                      Si no está, se usa DATABASE_URL.
import 'dotenv/config';
import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: 'backend/prisma/schema.prisma',
  migrations: {
    path: 'backend/prisma/migrations',
  },
  datasource: {
    url: process.env.DIRECT_DATABASE_URL ?? process.env.DATABASE_URL ?? '',
    shadowDatabaseUrl: process.env.SHADOW_DATABASE_URL,
  },
});
