-- ─────────────────────────────────────────────────────────────────────────────
-- Cool Technologies D1 Database Migration: 0003_add_brands_table.sql
-- Purpose: Add brands table for dynamic manufacturer/partner brand management
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS brands (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  logo_url TEXT,
  description TEXT,
  website_url TEXT,
  display_type TEXT DEFAULT 'image',
  display_order INTEGER DEFAULT 0,
  is_active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_brands_slug ON brands(slug);
CREATE INDEX IF NOT EXISTS idx_brands_active ON brands(is_active);
