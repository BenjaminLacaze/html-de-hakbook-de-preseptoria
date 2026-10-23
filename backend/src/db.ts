// Conexión a PostgreSQL (Neon en producción, local en desarrollo).
// Se usa el adaptador "pg", que funciona igual con Neon (cadena pooled) y con un Postgres local.
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from './generated/prisma/client.js';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('Falta la variable DATABASE_URL (ver .env.example en la raíz del repo).');
}

// En Vercel cada función reutiliza el cliente entre pedidos mientras está "caliente".
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({ adapter: new PrismaPg({ connectionString, max: 5 }) });

globalForPrisma.prisma = prisma;
