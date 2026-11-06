import {
  clearSessionCookie,
  ensureAuthTables,
  getCookie,
  getDatabase,
  removeSession,
  requireSession,
  setSessionCookie,
} from '../_auth.js';

export default async function handler(req: any, res: any) {
  if (!['GET', 'DELETE'].includes(req.method)) {
    res.setHeader('Allow', 'GET, DELETE');
    return res.status(405).json({ error: 'Método no permitido.' });
  }

  try {
    const sql = getDatabase();
    await ensureAuthTables(sql);
    const token = getCookie(req, 'perfil_directivo_session');

    if (req.method === 'DELETE') {
      await removeSession(sql, token);
      clearSessionCookie(res);
      return res.status(200).json({ success: true });
    }

    const session = await requireSession(req, sql);
    if (!session) {
      clearSessionCookie(res);
      return res.status(401).json({ error: 'Sesión vencida o inexistente.' });
    }
    return res.status(200).json({ user: session.user });
  } catch (error) {
    console.error('[Auth] No se pudo validar la sesión.', error);
    return res.status(500).json({ error: 'No se pudo validar la sesión.' });
  }
}
