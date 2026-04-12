-- Stefna D1 schema
-- Run with: wrangler d1 execute stefna-db --file=src/schema.sql

CREATE TABLE IF NOT EXISTS clients (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  -- Step 1: Account
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  whatsapp_phone TEXT NOT NULL,
  -- Step 2: Business
  business_name TEXT NOT NULL,
  industry TEXT NOT NULL,
  city TEXT NOT NULL DEFAULT 'Santiago',
  uses_bsale INTEGER NOT NULL DEFAULT 0,
  -- Step 3: WhatsApp & hours
  whatsapp_channel TEXT NOT NULL, -- 'existing' | 'new'
  open_time TEXT NOT NULL DEFAULT '09:00',
  close_time TEXT NOT NULL DEFAULT '20:00',
  days TEXT NOT NULL DEFAULT 'Lun,Mar,Mié,Jue,Vie,Sáb', -- comma-separated
  delivery INTEGER NOT NULL DEFAULT 0,
  -- Step 4: Cajas
  cajas TEXT NOT NULL, -- JSON array of CajaId[]
  monthly_total INTEGER NOT NULL, -- CLP
  -- Status
  status TEXT NOT NULL DEFAULT 'pending', -- pending | active | suspended | cancelled
  payment_status TEXT NOT NULL DEFAULT 'unpaid', -- unpaid | paid | overdue
  -- Timestamps
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS activity_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  client_id INTEGER NOT NULL REFERENCES clients(id),
  action TEXT NOT NULL, -- 'signup' | 'payment' | 'setup_web' | 'setup_wa' | etc
  details TEXT, -- JSON with extra context
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
