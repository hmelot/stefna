-- Stefna D1 schema v2 — extends v1 with auth, conversations, orders, agent config
-- Run with: wrangler d1 execute stefna-db --remote --file=src/schema-v2.sql

-- Magic link auth tokens
CREATE TABLE IF NOT EXISTS magic_links (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  client_id INTEGER NOT NULL REFERENCES clients(id),
  token TEXT NOT NULL UNIQUE,
  expires_at TEXT NOT NULL,
  used INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Active sessions (after magic link is used)
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY, -- random session ID
  client_id INTEGER NOT NULL REFERENCES clients(id),
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- WhatsApp conversations
CREATE TABLE IF NOT EXISTS conversations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  client_id INTEGER NOT NULL REFERENCES clients(id),
  wa_from TEXT NOT NULL, -- customer's phone number
  customer_name TEXT, -- extracted from conversation
  messages TEXT NOT NULL DEFAULT '[]', -- JSON array of {role, content, timestamp}
  summary TEXT, -- AI-generated summary
  has_order INTEGER NOT NULL DEFAULT 0, -- 1 if a pedido was created from this
  amount_generated INTEGER NOT NULL DEFAULT 0, -- CLP generated from this conversation
  status TEXT NOT NULL DEFAULT 'active', -- active | resolved | escalated
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Orders (pedidos)
CREATE TABLE IF NOT EXISTS orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  client_id INTEGER NOT NULL REFERENCES clients(id),
  conversation_id INTEGER REFERENCES conversations(id),
  customer_name TEXT,
  customer_phone TEXT,
  items TEXT NOT NULL, -- JSON array of {name, qty, price}
  subtotal INTEGER NOT NULL DEFAULT 0,
  delivery_fee INTEGER NOT NULL DEFAULT 0,
  total INTEGER NOT NULL DEFAULT 0,
  delivery_address TEXT,
  payment_status TEXT NOT NULL DEFAULT 'pending', -- pending | paid | failed
  payment_link TEXT, -- MercadoPago link
  order_status TEXT NOT NULL DEFAULT 'new', -- new | confirmed | preparing | delivered | cancelled
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Agent configuration per client (system prompt, catalog, etc.)
CREATE TABLE IF NOT EXISTS agent_configs (
  client_id INTEGER PRIMARY KEY REFERENCES clients(id),
  system_prompt TEXT NOT NULL,
  catalog TEXT NOT NULL DEFAULT '[]', -- JSON array of {name, price, description, available}
  delivery_zones TEXT, -- JSON: {type: 'radius'|'communes', value: ...}
  greeting TEXT, -- custom greeting message
  escalation_contacts TEXT, -- JSON array of {name, phone} for manual escalation
  bsale_key TEXT,
  bsale_last_sync TEXT,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Web analytics (page views logged by a simple pixel/beacon)
CREATE TABLE IF NOT EXISTS page_views (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  client_id INTEGER NOT NULL REFERENCES clients(id),
  path TEXT NOT NULL,
  referrer TEXT,
  source TEXT, -- 'google' | 'maps' | 'direct' | 'social' | 'whatsapp'
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_conversations_client ON conversations(client_id, created_at);
CREATE INDEX IF NOT EXISTS idx_orders_client ON orders(client_id, created_at);
CREATE INDEX IF NOT EXISTS idx_page_views_client ON page_views(client_id, created_at);
CREATE INDEX IF NOT EXISTS idx_magic_links_token ON magic_links(token);
CREATE INDEX IF NOT EXISTS idx_sessions_id ON sessions(id);
