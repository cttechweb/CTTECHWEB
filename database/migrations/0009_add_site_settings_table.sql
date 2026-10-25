-- ─────────────────────────────────────────────────────────────────
-- Migration 0009: Site Settings Table (Global Dynamic Configs & Contact Center)
-- Database: cooltech_db (044aed24-d4fa-49c8-9551-3bc83ac336ae)
-- ─────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS site_settings (
  id TEXT PRIMARY KEY DEFAULT 'default',
  settings_json TEXT NOT NULL,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);
