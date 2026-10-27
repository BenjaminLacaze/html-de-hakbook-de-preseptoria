/**
 * Usuarios de PRUEBA — uno por app, para que el equipo pueda entrar y probar.
 *
 * ⚠️ El repo es público: esta contraseña la puede leer cualquiera. Por eso:
 *   - Ninguno es superadministrador.
 *   - Las pantallas de login los muestran SOLO en desarrollo (npm run dev) o con
 *     VITE_SHOW_TEST_USERS="true". En el sitio publicado no aparecen.
 *   - Antes de usar el sistema con datos reales: `npm run db:test-users:off`
 *     (los desactiva a todos de una vez).
 *
 * Crear o reactivar (y resetear la contraseña): `npm run db:test-users` en la raíz.
 * Si alguien les cambia la contraseña, volver a correrlo la deja como está acá.
 */
import type { AppId, Role } from './types.js';

export const TEST_USERS_PASSWORD = 'Prueba-I26-2026';

export interface TestUser {
  app: AppId;
  role: Role;
  /** Para mostrar en el login. */
  label: string;
  email: string;
  firstName: string;
  lastName: string;
}

export const TEST_USERS: readonly TestUser[] = [
  {
    app: 'directivos',
    role: 'DIRECTOR',
    label: 'Directivo',
    email: 'prueba.directivo@isfdyt26.edu.ar',
    firstName: 'Directivo',
    lastName: 'Prueba',
  },
  {
    app: 'directivos',
    role: 'ADMINISTRATIVE',
    label: 'Secretaría (permisos acotados)',
    email: 'prueba.secretaria@isfdyt26.edu.ar',
    firstName: 'Secretaría',
    lastName: 'Prueba',
  },
  {
    app: 'preceptoria',
    role: 'PRECEPTOR',
    label: 'Preceptor/a',
    email: 'prueba.preceptor@isfdyt26.edu.ar',
    firstName: 'Preceptor',
    lastName: 'Prueba',
  },
  {
    app: 'profesores',
    role: 'TEACHER',
    label: 'Profesor/a',
    email: 'prueba.profesor@isfdyt26.edu.ar',
    firstName: 'Profesor',
    lastName: 'Prueba',
  },
  {
    app: 'auxiliares',
    role: 'STAFF',
    label: 'Auxiliar',
    email: 'prueba.auxiliar@isfdyt26.edu.ar',
    firstName: 'Auxiliar',
    lastName: 'Prueba',
  },
  {
    app: 'centro',
    role: 'STUDENT_REP',
    label: 'Centro de Estudiantes',
    email: 'prueba.centro@isfdyt26.edu.ar',
    firstName: 'Centro',
    lastName: 'Prueba',
  },
  {
    app: 'alumnos',
    role: 'STUDENT',
    label: 'Alumno/a',
    email: 'prueba.alumno@isfdyt26.edu.ar',
    firstName: 'Alumno',
    lastName: 'Prueba',
  },
];

/** Usuarios de prueba que sirven para una app. */
export const testUsersFor = (app: AppId): TestUser[] => TEST_USERS.filter((u) => u.app === app);

/**
 * true si el login tiene que mostrar los usuarios de prueba:
 * en desarrollo (npm run dev) o con VITE_SHOW_TEST_USERS="true".
 */
export const SHOW_TEST_USERS: boolean = (() => {
  const env = (import.meta as unknown as { env?: Record<string, string | boolean | undefined> }).env;
  return env?.DEV === true || env?.VITE_SHOW_TEST_USERS === 'true';
})();
