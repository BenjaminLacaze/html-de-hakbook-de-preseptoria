// Usuarios de prueba (uno por app). La lista y la contraseña están en shared/testUsers.ts.
//
//   npm run db:test-users       crea o reactiva todos y les deja la contraseña de prueba
//   npm run db:test-users:off   los desactiva a todos (y cierra sus sesiones)
//
// No piden cambio de contraseña al entrar (si no, el primero que entra se la cambia a todos).
import 'dotenv/config';
import { TEST_USERS, TEST_USERS_PASSWORD } from '../../shared/testUsers.js';
import { hashPassword } from './auth/password.js';

const { prisma } = await import('./db.js');
const off = process.argv.includes('--off');
const emails = TEST_USERS.map((u) => u.email);

if (off) {
  const users = await prisma.user.findMany({ where: { email: { in: emails } }, select: { id: true } });
  await prisma.authSession.deleteMany({ where: { userId: { in: users.map((u) => u.id) } } });
  const r = await prisma.user.updateMany({ where: { email: { in: emails } }, data: { status: 'INACTIVE' } });
  console.log(`Usuarios de prueba desactivados: ${r.count}.`);
} else {
  const passwordHash = await hashPassword(TEST_USERS_PASSWORD);
  for (const u of TEST_USERS) {
    const data = {
      firstName: u.firstName,
      lastName: u.lastName,
      roles: [u.role],
      status: 'ACTIVE' as const,
      passwordHash,
      mustChangePassword: false,
      failedLoginCount: 0,
      lockedUntil: null,
    };
    await prisma.user.upsert({ where: { email: u.email }, update: data, create: { email: u.email, ...data } });
    console.log(`  ${u.label.padEnd(32)} ${u.email}`);
  }
  console.log(`Listo: ${TEST_USERS.length} usuarios de prueba activos (contraseña en shared/testUsers.ts).`);
}

await prisma.$disconnect();
