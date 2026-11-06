import {
  clearLoginFailures,
  createPasswordHash,
  createSession,
  ensureAuthTables,
  getDatabase,
  normalizeUsername,
  profileFor,
  registerLoginFailure,
  setSessionCookie,
  verifyPassword,
  isLoginBlocked,
} from '../_auth.js';
import { createHash } from 'node:crypto';

function attemptKey(username: string, ip: string) {
  return createHash('sha256').update(`${username}|${ip}`).digest('hex');
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Método no permitido.' });
  }

  const username = normalizeUsername(String(req.body?.username ?? ''));
  const password = String(req.body?.password ?? '');
  if (!username || username.length > 80 || !password || password.length > 256) {
    return res.status(400).json({ error: 'Ingresá tu usuario y contraseña.' });
  }

  try {
    const sql = getDatabase();
    await ensureAuthTables(sql);

    // The initial account is created once from private deployment variables.
    const accountCount = await sql`SELECT COUNT(*)::int AS count FROM app_accounts`;
    if (accountCount[0].count === 0) {
      const initialUsername = process.env.INITIAL_ADMIN_USERNAME
        ? normalizeUsername(process.env.INITIAL_ADMIN_USERNAME)
        : '';
      const initialPassword = process.env.INITIAL_ADMIN_PASSWORD;
      if (!initialUsername || !initialPassword) {
        return res.status(503).json({ error: 'El primer usuario todavía no está configurado.' });
      }
      await sql`INSERT INTO app_accounts (username, password_hash, user_profile)
        VALUES (${initialUsername}, ${await createPasswordHash(initialPassword)}, ${JSON.stringify(profileFor(initialUsername))}::jsonb)
        ON CONFLICT (username) DO NOTHING`;
    }

    const ip = String(req.headers['x-forwarded-for'] ?? req.socket?.remoteAddress ?? 'unknown').split(',')[0].trim();
    const key = attemptKey(username, ip);
    if (await isLoginBlocked(sql, key)) {
      return res.status(429).json({ error: 'Demasiados intentos. Probá de nuevo en 15 minutos.' });
    }

    const rows = await sql`SELECT password_hash, user_profile FROM app_accounts WHERE username = ${username} LIMIT 1`;
    if (!rows[0] || !(await verifyPassword(password, rows[0].password_hash))) {
      const blocked = await registerLoginFailure(sql, key);
      return res.status(blocked ? 429 : 401).json({
        error: blocked ? 'Demasiados intentos. Probá de nuevo en 15 minutos.' : 'El usuario o la contraseña no son correctos.',
      });
    }

    await clearLoginFailures(sql, key);
    const { token, maxAge } = await createSession(sql, username);
    setSessionCookie(res, token, maxAge);
    return res.status(200).json({ user: rows[0].user_profile });
  } catch (error) {
    console.error('[Auth] No se pudo iniciar sesión.', error);
    return res.status(500).json({ error: 'No se pudo iniciar sesión. Intentá nuevamente.' });
  }
}
