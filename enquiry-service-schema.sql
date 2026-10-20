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
