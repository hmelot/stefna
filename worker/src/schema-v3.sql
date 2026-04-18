-- Stefna D1 schema v3 — Mission Control + autonomous onboarding pipelines
-- Apply via: wrangler d1 execute stefna-db --remote --command="..."
-- (CF API token does not support --file upload, must run commands individually)

-- Onboarding tasks per client per capability (state machine)
CREATE TABLE IF NOT EXISTS onboarding_tasks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  client_id INTEGER NOT NULL REFERENCES clients(id),
  caja TEXT NOT NULL,           -- web | whatsapp | seo | social | payments | dashboard | general
  task_key TEXT NOT NULL,       -- e.g. 'upload_photos', 'upload_menu', 'confirm_number', 'pick_template'
  title TEXT NOT NULL,          -- human-readable title
  description TEXT,             -- short sentence
  bucket TEXT NOT NULL DEFAULT 'currently_due',  -- eventually_due | currently_due | past_due | completed
  order_num INTEGER NOT NULL DEFAULT 0,          -- display order within caja
  payload TEXT,                 -- JSON: task-specific data (selected template, uploaded file IDs, etc)
  completed_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(client_id, caja, task_key)
);

-- Uploaded assets (photos, menus, logos) — indexed for quick per-client lookup
CREATE TABLE IF NOT EXISTS uploads (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  client_id INTEGER NOT NULL REFERENCES clients(id),
  kind TEXT NOT NULL,           -- photo | menu | logo | exterior
  slot TEXT,                    -- 'hero' | 'gallery' | 'exterior' | 'menu_page_1' | etc
  cf_image_id TEXT,             -- Cloudflare Images ID
  r2_key TEXT,                  -- R2 object key (for raw menu PDFs)
  filename TEXT,
  mime_type TEXT,
  size_bytes INTEGER,
  meta TEXT,                    -- JSON metadata
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Menu items extracted from OCR (separate table so editing is granular)
CREATE TABLE IF NOT EXISTS menu_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  client_id INTEGER NOT NULL REFERENCES clients(id),
  upload_id INTEGER REFERENCES uploads(id),
  name TEXT NOT NULL,
  price_clp INTEGER,
  description TEXT,
  category TEXT,
  confidence TEXT,              -- high | medium | low (from Claude Vision)
  confirmed INTEGER NOT NULL DEFAULT 0,  -- 1 = client confirmed via portal
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Pipeline execution log (who ran what, when, result)
CREATE TABLE IF NOT EXISTS pipeline_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  client_id INTEGER NOT NULL REFERENCES clients(id),
  pipeline TEXT NOT NULL,       -- photo_process | menu_ocr | web_generate | gbp_submit
  status TEXT NOT NULL,         -- started | success | failed | retry
  duration_ms INTEGER,
  details TEXT,                 -- JSON: inputs, outputs, errors
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Generated website previews (staging URLs per client)
CREATE TABLE IF NOT EXISTS site_previews (
  client_id INTEGER PRIMARY KEY REFERENCES clients(id),
  template_id TEXT NOT NULL,    -- minimal | modern | classic | bold
  staging_url TEXT,
  production_url TEXT,
  content_json TEXT,            -- all the content (headings, copy, hours, etc) for rendering
  approved_at TEXT,
  launched_at TEXT,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_tasks_client ON onboarding_tasks(client_id, bucket);
CREATE INDEX IF NOT EXISTS idx_uploads_client ON uploads(client_id, kind);
CREATE INDEX IF NOT EXISTS idx_menu_items_client ON menu_items(client_id);
CREATE INDEX IF NOT EXISTS idx_pipeline_logs_client ON pipeline_logs(client_id, created_at);
