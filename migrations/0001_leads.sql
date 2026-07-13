CREATE TABLE IF NOT EXISTS leads (
  id TEXT PRIMARY KEY,
  submission_id TEXT NOT NULL UNIQUE,
  form_type TEXT NOT NULL,
  name TEXT,
  email TEXT NOT NULL,
  phone TEXT,
  message TEXT,
  project_id TEXT,
  project_name TEXT,
  interest TEXT,
  budget TEXT,
  residence_size TEXT,
  timeline TEXT,
  represented_by_agent TEXT,
  landing_page TEXT,
  submission_page TEXT,
  referrer TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_term TEXT,
  utm_content TEXT,
  gclid TEXT,
  fbclid TEXT,
  cta_context TEXT,
  cta_label TEXT,
  cta_location TEXT,
  article_id TEXT,
  corridor TEXT,
  viewed_buildings_json TEXT,
  consent INTEGER NOT NULL DEFAULT 0,
  consent_version TEXT,
  consent_at TEXT,
  client_submitted_at TEXT,
  received_at TEXT NOT NULL,
  spam_status TEXT NOT NULL DEFAULT 'clear',
  spam_reason TEXT,
  ip_hash TEXT,
  user_agent_hash TEXT,
  notification_status TEXT NOT NULL DEFAULT 'pending',
  acknowledgment_status TEXT NOT NULL DEFAULT 'pending',
  notification_attempts INTEGER NOT NULL DEFAULT 0,
  acknowledgment_attempts INTEGER NOT NULL DEFAULT 0,
  notification_provider_id TEXT,
  acknowledgment_provider_id TEXT,
  notification_sent_at TEXT,
  acknowledgment_sent_at TEXT,
  last_error TEXT,
  last_error_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS leads_received_at_idx ON leads (received_at);
CREATE INDEX IF NOT EXISTS leads_email_idx ON leads (email);
CREATE INDEX IF NOT EXISTS leads_ip_hash_idx ON leads (ip_hash, received_at);
CREATE INDEX IF NOT EXISTS leads_delivery_idx ON leads (notification_status, acknowledgment_status, updated_at);

CREATE TABLE IF NOT EXISTS lead_delivery_attempts (
  id TEXT PRIMARY KEY,
  lead_id TEXT NOT NULL,
  delivery_type TEXT NOT NULL CHECK (delivery_type IN ('notification', 'acknowledgment')),
  attempt_number INTEGER NOT NULL,
  status TEXT NOT NULL,
  provider_id TEXT,
  error TEXT,
  attempted_at TEXT NOT NULL,
  FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS lead_delivery_attempts_lead_idx ON lead_delivery_attempts (lead_id, delivery_type, attempted_at);
