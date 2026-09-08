-- ─────────────────────────────────────────────────────────────────
-- Migration 0001: Initial D1 Baseline Schema
-- Database: cooltech_db (044aed24-d4fa-49c8-9551-3bc83ac336ae)
-- Recreates baseline tables cleanly to ensure all modern columns exist.
-- ─────────────────────────────────────────────────────────────────

-- Clean existing empty baseline tables
DROP TABLE IF EXISTS workflows;
DROP TABLE IF EXISTS services;
DROP TABLE IF EXISTS quotes;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS users;

-- 1. Users Table (Keyed to Firebase Auth UID)
CREATE TABLE users (
  id TEXT PRIMARY KEY,                       -- Firebase Auth UID
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  company_name TEXT,
  company_id TEXT,
  tax_id TEXT,
  role TEXT NOT NULL DEFAULT 'customer',     -- 'customer', 'retailer', 'sales', 'admin', 'superAdmin'
  is_verified_retailer INTEGER DEFAULT 0,    -- 0 = False, 1 = True
  status TEXT NOT NULL DEFAULT 'active',     -- 'active', 'pending', 'suspended'
  tier TEXT DEFAULT 'Standard',              -- 'Standard', 'Silver', 'Gold', 'Platinum'
  discount_rate REAL DEFAULT 0.0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  last_login_at TEXT
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- 2. Products Table
CREATE TABLE products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT,
  category TEXT NOT NULL,
  category_id TEXT,
  brand TEXT NOT NULL,
  price REAL NOT NULL DEFAULT 0.0,
  image_url TEXT,
  in_stock INTEGER DEFAULT 1,
  rating REAL DEFAULT 4.8,
  min_order_qty INTEGER DEFAULT 1,
  description TEXT,
  specifications_json TEXT,                  -- JSON object of key-value technical specs
  features_json TEXT,                        -- JSON array of feature highlights
  tags_json TEXT,                            -- JSON array of search tags
  is_active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_brand ON products(brand);
CREATE INDEX idx_products_is_active ON products(is_active);

-- 3. Quotations & Equipment Sourcing Requests Table
CREATE TABLE quotes (
  id TEXT PRIMARY KEY,                       -- Format: REQ-2026-XXXXXX / RFQ-2026-XXXXXX
  user_id TEXT NOT NULL DEFAULT 'anonymous', -- References users(id) or anonymous
  customer_name TEXT,
  customer_email TEXT,
  customer_phone TEXT,
  company_name TEXT,
  delivery_address TEXT,
  project_description TEXT,
  products_json TEXT NOT NULL,               -- JSON array of requested equipment with quantities
  status TEXT NOT NULL DEFAULT 'Pending',    -- 'Pending', 'In_Review', 'Quoted', 'Approved', 'Rejected', 'Fulfilled'
  quoted_amount REAL,
  admin_notes TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_quotes_user_id ON quotes(user_id);
CREATE INDEX idx_quotes_status ON quotes(status);

-- 4. Services Table
CREATE TABLE services (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  tagline TEXT,
  description TEXT,
  sla TEXT DEFAULT '24/7',
  image_url TEXT,
  specs_json TEXT,
  features_json TEXT,
  is_active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_services_category ON services(category);

-- 5. Selection Wizard Workflows Table
CREATE TABLE workflows (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  target_category TEXT,
  steps_json TEXT NOT NULL,                  -- JSON array of steps and logic options
  is_active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_workflows_slug ON workflows(slug);
