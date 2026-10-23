import { randomInt } from 'node:crypto';
import bcrypt from 'bcryptjs';

// 10 rondas: seguro y rápido para funciones serverless.
const ROUNDS = 10;

export const hashPassword = (plain: string) => bcrypt.hash(plain, ROUNDS);

export const verifyPassword = (plain: string, hash: string) => bcrypt.compare(plain, hash);

/** Hash de relleno: se compara igual cuando el usuario no existe, para no revelar qué emails hay. */
export const DUMMY_HASH = bcrypt.hashSync('contraseña-inexistente', ROUNDS);

// Sin caracteres que se confundan al dictarla (0/O, 1/l/I).
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';

/** Contraseña temporal legible, ej. "kT7m-Qx4p-Zr9w". La persona la cambia al entrar. */
export function generateTemporaryPassword(): string {
  const block = () => Array.from({ length: 4 }, () => ALPHABET[randomInt(ALPHABET.length)]).join('');
  return `${block()}-${block()}-${block()}`;
}
