import {
  createHash,
  randomBytes,
  scrypt as scryptCallback,
  timingSafeEqual,
} from 'node:crypto';
import { promisify } from 'node:util';
import { neon, type NeonQueryFunction } from '@neondatabase/serverless';
import type { User } from '../src/types';

const scrypt = promisify(scryptCallback);
const SESSION_COOKIE = 'perfil_directivo_session';
const SESSION_DAYS = 7;
const USER_ID = 'usr-mario-castaneda';

type Sql = NeonQueryFunction<false, false>;

export interface AuthenticatedRequest {
  user: User;
  sessionToken: string;
}

export async function ensureAuthTables(sql: Sql) {
  await sql`CREATE TABLE IF NOT EXISTS app_accounts (
    username TEXT PRIMARY KEY,
    password_hash TEXT NOT NULL,
    user_profile JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`;
  await sql`CREATE TABLE IF NOT EXISTS app_sessions (
    token_hash TEXT PRIMARY KEY,
    username TEXT NOT NULL REFERENCES app_accounts(username) ON DELETE CASCADE,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`;
  await sql`CREATE INDEX IF NOT EXISTS app_sessions_expiry_idx ON app_sessions (expires_at)`;
  await sql`CREATE TABLE IF NOT EXISTS app_login_attempts (
    attempt_key TEXT PRIMARY KEY,
    failures INTEGER NOT NULL DEFAULT 0,
    blocked_until TIMESTAMPTZ,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`;
}

export function normalizeUsername(value: string) {
  return value.trim().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

export async function createPasswordHash(password: string) {
  const salt = randomBytes(16);
  const derived = await scrypt(password, salt, 64) as Buffer;
  return `scrypt:${salt.toString('hex')}:${derived.toString('hex')}`;
}

export async function verifyPassword(password: string, stored: string) {
  const [algorithm, saltHex, hashHex] = stored.split(':');
  if (algorithm !== 'scrypt' || !saltHex || !hashHex) return false;
  const expected = Buffer.from(hashHex, 'hex');
  const actual = await scrypt(password, Buffer.from(saltHex, 'hex'), expected.length) as Buffer;
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

export function profileFor(username: string): User {
  return {
    id: USER_ID,
    name: 'Mario Castañeda',
    email: `${username}@cuenta.local`,
    role: 'DIRECTIVO',
    dni: '',
    phone: '',
    status: 'ACTIVO',
    lastLogin: new Date().toISOString(),
    createdAt: new Date().toISOString().slice(0, 10),
  };
}

export function getDatabase() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error('DATABASE_URL is not configured.');
  return neon(databaseUrl);
}

export function getCookie(req: any, name: string): string | undefined {
  const raw = req.headers?.cookie;
  if (!raw) return undefined;
  const item = String(raw).split(';').map((part) => part.trim()).find((part) => part.startsWith(`${name}=`));
  return item ? decodeURIComponent(item.slice(name.length + 1)) : undefined;
}

export function setSessionCookie(res: any, token: string, maxAge: number) {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  res.setHeader('Set-Cookie', `${SESSION_COOKIE}=${encodeURIComponent(token)}; HttpOnly; Path=/; SameSite=Strict; Max-Age=${maxAge}${secure}`);
}

export function clearSessionCookie(res: any) {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  res.setHeader('Set-Cookie', `${SESSION_COOKIE}=; HttpOnly; Path=/; SameSite=Strict; Max-Age=0${secure}`);
}

function digest(token: string) {
  return createHash('sha256').update(token).digest('hex');
}

export async function createSession(sql: Sql, username: string) {
  const token = randomBytes(32).toString('base64url');
  const seconds = SESSION_DAYS * 24 * 60 * 60;
  await sql`INSERT INTO app_sessions (token_hash, username, expires_at)
    VALUES (${digest(token)}, ${username}, NOW() + (${seconds} * INTERVAL '1 second'))`;
  return { token, maxAge: seconds };
}

export async function requireSession(req: any, sql: Sql): Promise<AuthenticatedRequest | null> {
  const token = getCookie(req, SESSION_COOKIE);
  if (!token) return null;
  const rows = await sql`
    SELECT account.user_profile
    FROM app_sessions AS session
    JOIN app_accounts AS account ON account.username = session.username
    WHERE session.token_hash = ${digest(token)} AND session.expires_at > NOW()
    LIMIT 1
  `;
  if (!rows[0]?.user_profile) return null;
  return { user: rows[0].user_profile as User, sessionToken: token };
}

export async function removeSession(sql: Sql, token?: string) {
  if (token) await sql`DELETE FROM app_sessions WHERE token_hash = ${digest(token)}`;
}

export async function upsertProfileInState(sql: Sql, user: User) {
  const institutionId = 'isfdyt26';
  const rows = await sql`SELECT payload FROM institution_state WHERE institution_id = ${institutionId} LIMIT 1`;
  const payload = rows[0]?.payload;
  if (!payload || !Array.isArray(payload.users)) return;
  const users = payload.users.some((entry: User) => entry.id === user.id)
    ? payload.users.map((entry: User) => entry.id === user.id ? user : entry)
    : [user, ...payload.users];
  await sql`UPDATE institution_state SET payload = ${JSON.stringify({ ...payload, users })}::jsonb,
    revision = revision + 1, updated_at = NOW() WHERE institution_id = ${institutionId}`;
}

export async function registerLoginFailure(sql: Sql, key: string) {
  const rows = await sql`
    INSERT INTO app_login_attempts (attempt_key, failures, blocked_until, updated_at)
    VALUES (${key}, 1, NULL, NOW())
    ON CONFLICT (attempt_key) DO UPDATE SET
      failures = CASE
        WHEN app_login_attempts.blocked_until > NOW() THEN app_login_attempts.failures
        WHEN app_login_attempts.blocked_until IS NOT NULL THEN 1
        ELSE app_login_attempts.failures + 1
      END,
      blocked_until = CASE
        WHEN app_login_attempts.blocked_until > NOW() THEN app_login_attempts.blocked_until
        WHEN app_login_attempts.blocked_until IS NOT NULL THEN NULL
        WHEN app_login_attempts.failures + 1 >= 5 THEN NOW() + INTERVAL '15 minutes'
        ELSE NULL
      END,
      updated_at = NOW()
    RETURNING blocked_until
  `;
  return Boolean(rows[0]?.blocked_until && new Date(rows[0].blocked_until).getTime() > Date.now());
}

export async function isLoginBlocked(sql: Sql, key: string) {
  const rows = await sql`SELECT blocked_until FROM app_login_attempts WHERE attempt_key = ${key} LIMIT 1`;
  return Boolean(rows[0]?.blocked_until && new Date(rows[0].blocked_until).getTime() > Date.now());
}

export async function clearLoginFailures(sql: Sql, key: string) {
  await sql`DELETE FROM app_login_attempts WHERE attempt_key = ${key}`;
}
