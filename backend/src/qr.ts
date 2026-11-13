// Códigos QR de asistencia: se genera un código corto y legible (también se puede tipear),
// y en la base se guarda solo su hash. El código en claro se devuelve una única vez.
import { createHash, randomInt } from 'node:crypto';

// Sin 0/O ni 1/I/L, para que no se confundan al tipearlo.
const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

/** Normaliza lo que manda la app: mayúsculas, sin espacios ni guiones. */
const normalize = (code: string) => code.toUpperCase().replace(/[^A-Z0-9]/g, '');

export const hashQrCode = (code: string) => createHash('sha256').update(normalize(code)).digest('hex');

/** Código de 10 caracteres en dos grupos ("K7QM2-X9PAR"): unos 49 bits de azar. */
export function newQrCode(): { code: string; hash: string } {
  let raw = '';
  for (let i = 0; i < 10; i++) raw += ALPHABET[randomInt(ALPHABET.length)];
  const code = `${raw.slice(0, 5)}-${raw.slice(5)}`;
  return { code, hash: hashQrCode(code) };
}
