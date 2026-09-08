-- ─────────────────────────────────────────────────────────────────
-- Migration 0004: Relational RFQ, Quotes, Orders, Quote Items & Order Items
-- Database: cooltech_db (044aed24-d4fa-49c8-9551-3bc83ac336ae)
-- ─────────────────────────────────────────────────────────────────

-- 1. Enhance quotes table with RFQ specifications
ALTER TABLE quotes ADD COLUMN company_id TEXT;
ALTER TABLE quotes ADD COLUMN project_location TEXT;
ALTER TABLE quotes ADD COLUMN timeline TEXT;
ALTER TABLE quotes ADD COLUMN load_requirements TEXT;
ALTER TABLE quotes ADD COLUMN assigned_to TEXT;
ALTER TABLE quotes ADD COLUMN status_history_json TEXT;

-- 2. Create relational quote_items table for normalized item snapshots
CREATE TABLE IF NOT EXISTS quote_items (
  id TEXT PRIMARY KEY,
  quote_id TEXT NOT NULL,
  product_id TEXT,
  product_name TEXT NOT NULL,
  brand TEXT,
  category TEXT,
  unit_price REAL DEFAULT 0.0,
  quantity INTEGER NOT NULL DEFAULT 1,
  subtotal REAL DEFAULT 0.0,
  notes TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (quote_id) REFERENCES quotes(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_quote_items_quote ON quote_items(quote_id);

-- 3. Create transactional B2B orders table
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,                       -- Format: OT-2026-XXXXXX / order-XXXXXX
  order_number TEXT NOT NULL UNIQUE,         -- OT-2026-XXXXXX
  user_id TEXT NOT NULL DEFAULT 'anonymous', -- Verified Firebase UID
  company_id TEXT,                           -- References companies(id)
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  company_name TEXT NOT NULL,
  tax_id TEXT,                               -- TRN
  shipping_address TEXT NOT NULL,
  city TEXT DEFAULT 'Abu Dhabi',
  po_number TEXT,
  payment_term TEXT DEFAULT 'net30',         -- 'net30', 'net60', 'lc', 'advance', 'cod'
  source TEXT DEFAULT 'web_cart',            -- 'web_cart', 'sales_rep', 'phone', 'manual_admin'
  status TEXT NOT NULL DEFAULT 'NEW',        -- 'NEW', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'
  subtotal REAL NOT NULL DEFAULT 0.0,
  discount_rate REAL DEFAULT 0.0,
  discount_amount REAL DEFAULT 0.0,
  estimated_total REAL NOT NULL DEFAULT 0.0,
  item_count INTEGER DEFAULT 0,
  total_units INTEGER DEFAULT 0,
  customer_notes TEXT,
  admin_notes TEXT,
  assigned_to TEXT,
  status_history_json TEXT,                  -- JSON array of StatusHistoryItem
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_company ON orders(company_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_number ON orders(order_number);

-- 4. Create relational order_items table
CREATE TABLE IF NOT EXISTS order_items (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL,
  product_id TEXT NOT NULL,
  product_name TEXT NOT NULL,
  model_id TEXT,
  brand TEXT,
  category TEXT,
  image_url TEXT,
  unit_price REAL NOT NULL DEFAULT 0.0,
  quantity INTEGER NOT NULL DEFAULT 1,
  subtotal REAL NOT NULL DEFAULT 0.0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
