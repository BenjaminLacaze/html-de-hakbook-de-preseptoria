-- Canonical state store for the current AppContext aggregate.
-- Its JSONB payload preserves every module and demo record as the app evolves.
CREATE TABLE IF NOT EXISTS institution_state (
  institution_id TEXT PRIMARY KEY,
  payload JSONB NOT NULL,
  revision INTEGER NOT NULL DEFAULT 1,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- App-managed sign-in accounts. Passwords are stored as salted scrypt hashes.
CREATE TABLE IF NOT EXISTS app_accounts (
  username TEXT PRIMARY KEY,
  password_hash TEXT NOT NULL,
  user_profile JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Opaque session tokens are stored only as SHA-256 hashes.
CREATE TABLE IF NOT EXISTS app_sessions (
  token_hash TEXT PRIMARY KEY,
  username TEXT NOT NULL REFERENCES app_accounts(username) ON DELETE CASCADE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS app_sessions_expiry_idx ON app_sessions (expires_at);

-- Persistent throttling across serverless function instances.
CREATE TABLE IF NOT EXISTS app_login_attempts (
  attempt_key TEXT PRIMARY KEY,
  failures INTEGER NOT NULL DEFAULT 0,
  blocked_until TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
