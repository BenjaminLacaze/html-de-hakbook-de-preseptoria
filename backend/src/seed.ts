// Carga inicial: datos institucionales y la PRIMERA cuenta (superadministrador).
// Uso: npm run db:seed   (lee SEED_ADMIN_* del .env)
//
// Se puede correr más de una vez: si la cuenta ya existe, no la toca.
// No carga datos de prueba de alumnos: los datos reales se importan aparte.
import 'dotenv/config';
import { hashPassword } from './auth/password.js';

const { prisma } = await import('./db.js');

const email = process.env.SEED_ADMIN_EMAIL?.trim().toLowerCase();
const password = process.env.SEED_ADMIN_PASSWORD;
if (!email || !password) {
  console.error('Faltan SEED_ADMIN_EMAIL y SEED_ADMIN_PASSWORD en el .env');
  process.exit(1);
}

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

const existing = await prisma.user.findUnique({ where: { email } });
if (existing) {
  console.log(`La cuenta ${email} ya existe: no se modifica.`);
} else {
  await prisma.user.create({
    data: {
      email,
      firstName: process.env.SEED_ADMIN_FIRST_NAME ?? 'Administración',
      lastName: process.env.SEED_ADMIN_LAST_NAME ?? 'ISFDyT 26',
      roles: ['SUPER_ADMIN', 'DIRECTOR'],
      passwordHash: await hashPassword(password),
      mustChangePassword: true,
    },
  });
  console.log(`Cuenta creada: ${email} (SUPER_ADMIN + DIRECTOR). Al entrar va a pedir cambiar la contraseña.`);
}

await prisma.$disconnect();
