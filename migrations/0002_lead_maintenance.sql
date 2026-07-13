CREATE TABLE IF NOT EXISTS lead_maintenance_runs (
  id TEXT PRIMARY KEY,
  run_type TEXT NOT NULL CHECK (run_type IN ('retry', 'retention_purge')),
  started_at TEXT NOT NULL,
  completed_at TEXT,
  status TEXT NOT NULL CHECK (status IN ('running', 'completed', 'failed')),
  affected_count INTEGER NOT NULL DEFAULT 0,
  summary_json TEXT,
  error TEXT
);

CREATE INDEX IF NOT EXISTS lead_maintenance_runs_started_at_idx ON lead_maintenance_runs (started_at);
