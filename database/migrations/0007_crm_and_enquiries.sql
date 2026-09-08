-- ─────────────────────────────────────────────────────────────────
-- Migration 0007: General Enquiries & CRM Integration Foundation
-- Database: cooltech_db (044aed24-d4fa-49c8-9551-3bc83ac336ae)
-- ─────────────────────────────────────────────────────────────────

-- 1. Create unified general enquiries table
CREATE TABLE IF NOT EXISTS enquiries (
  id TEXT PRIMARY KEY,                         -- Format: ENQ-2026-XXXXXX / enq_XXXXXX
  source TEXT NOT NULL DEFAULT 'contact_page', -- 'homepage', 'contact_page', 'product_page', 'support', 'services', 'other'
  type TEXT NOT NULL DEFAULT 'general',        -- 'general', 'support', 'quotation', 'partnership', 'service'
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  company_name TEXT,
  subject TEXT,
  message TEXT NOT NULL,
  metadata_json TEXT,                          -- Additional form / source payload
  status TEXT NOT NULL DEFAULT 'NEW',          -- 'NEW', 'IN_REVIEW', 'CONTACTED', 'RESOLVED', 'SPAM'
  crm_record_id TEXT,                          -- External CRM Entity Reference ID
  crm_sync_status TEXT DEFAULT 'pending',      -- 'pending', 'synced', 'failed'
  crm_last_synced_at TEXT,
  crm_sync_error TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_enquiries_status ON enquiries(status);
CREATE INDEX IF NOT EXISTS idx_enquiries_source ON enquiries(source);
CREATE INDEX IF NOT EXISTS idx_enquiries_crm_sync ON enquiries(crm_sync_status);
CREATE INDEX IF NOT EXISTS idx_enquiries_created ON enquiries(created_at);

-- 2. Ensure CRM tracking fields exist on B2B Orders & Retailer Applications
ALTER TABLE orders ADD COLUMN crm_record_id TEXT;
ALTER TABLE orders ADD COLUMN crm_sync_status TEXT DEFAULT 'pending';
ALTER TABLE orders ADD COLUMN crm_last_synced_at TEXT;
ALTER TABLE orders ADD COLUMN crm_sync_error TEXT;

ALTER TABLE retailer_applications ADD COLUMN crm_record_id TEXT;
ALTER TABLE retailer_applications ADD COLUMN crm_sync_status TEXT DEFAULT 'pending';
ALTER TABLE retailer_applications ADD COLUMN crm_last_synced_at TEXT;
ALTER TABLE retailer_applications ADD COLUMN crm_sync_error TEXT;
