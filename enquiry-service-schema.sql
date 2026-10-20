CREATE TABLE IF NOT EXISTS enquiries (
  id TEXT PRIMARY KEY,
  request_key TEXT NOT NULL UNIQUE,
  payload_hash TEXT NOT NULL,
  receipt TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  company TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL,
  interest TEXT NOT NULL,
  brief TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new' CHECK(status IN ('new','following','done')),
  locale TEXT NOT NULL CHECK(locale IN ('zh','en')),
  consent_version TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS enquiries_order ON enquiries(created_at DESC, id DESC);
CREATE INDEX IF NOT EXISTS enquiries_status_order ON enquiries(status, created_at DESC, id DESC);

CREATE TABLE IF NOT EXISTS enquiry_device_logins (
 token_hash TEXT PRIMARY KEY, device_code TEXT NOT NULL, expires_at INTEGER NOT NULL,
 interval_seconds INTEGER NOT NULL, next_poll_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS enquiry_device_expiry ON enquiry_device_logins(expires_at);
CREATE TABLE IF NOT EXISTS enquiry_sessions (
 token_hash TEXT PRIMARY KEY, github_id TEXT NOT NULL, github_login TEXT NOT NULL, expires_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS enquiry_session_expiry ON enquiry_sessions(expires_at);
