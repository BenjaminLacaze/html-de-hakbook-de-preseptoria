// Cuentas de prueba de la versión ONLINE del ecosistema (proyecto Vercel i26-ecosistema-api).
// Son las mismas personas que shared/testUsers.ts, pero con una contraseña PRIVADA que llega por
// la variable ONLINE_ACCOUNTS_PASSWORD (nunca la contraseña pública del repo).
//
// Lo corre la publicación solo cuando se pide (ONLINE_SEED=1), ver scripts/deploy-api.mjs.
// No imprime la contraseña.
import { TEST_USERS } from '../../shared/testUsers.js';
import { hashPassword } from './auth/password.js';

const password = process.env.ONLINE_ACCOUNTS_PASSWORD;
if (!password || password.length < 12) {
  console.error('Falta ONLINE_ACCOUNTS_PASSWORD (12 caracteres o más).');
  process.exit(1);
}

const { prisma } = await import('./db.js');

await prisma.institutionSettings.upsert({
  where: { id: 1 },
  update: {},
  create: {
    id: 1,
    name: 'Instituto Superior de Formación Docente y Técnica N.° 26',
    shortName: 'ISFDyT N.° 26',
    city: 'Dolores',
    district: 'Dolores',
  },
});

const passwordHash = await hashPassword(password);
const accounts = [
  ...TEST_USERS.map((u) => ({ email: u.email, firstName: u.firstName, lastName: u.lastName, role: u.role })),
  // Compañero para probar los cambios de turno en Auxiliares.
  { email: 'demo.auxiliar2@example.invalid', firstName: 'Auxiliar', lastName: 'Ejemplo', role: 'STAFF' as const },
];
for (const a of accounts) {
  const data = {
    firstName: a.firstName,
    lastName: a.lastName,
    roles: [a.role],
    status: 'ACTIVE' as const,
    passwordHash,
    mustChangePassword: false,
    failedLoginCount: 0,
    lockedUntil: null,
  };
  await prisma.user.upsert({ where: { email: a.email }, update: data, create: { email: a.email, ...data } });
}
console.log(`Cuentas de prueba online listas: ${accounts.length}.`);
await prisma.$disconnect();
