-- ─────────────────────────────────────────────────────────────────
-- Migration 0008: User Account & Retailer Application Foundation
-- Database: cooltech_db (044aed24-d4fa-49c8-9551-3bc83ac336ae)
-- Adds fields for professional user accounts and full B2B reseller form support.
-- ─────────────────────────────────────────────────────────────────

-- 1. Extend users table for professional account management
ALTER TABLE users ADD COLUMN email_verified INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN designation TEXT;
ALTER TABLE users ADD COLUMN default_shipping_address TEXT;
ALTER TABLE users ADD COLUMN billing_address TEXT;

-- 2. Extend retailer_applications table with reseller registration fields
ALTER TABLE retailer_applications ADD COLUMN emirate TEXT;
ALTER TABLE retailer_applications ADD COLUMN designation TEXT;
ALTER TABLE retailer_applications ADD COLUMN whatsapp_number TEXT;
ALTER TABLE retailer_applications ADD COLUMN interested_categories TEXT;
ALTER TABLE retailer_applications ADD COLUMN payment_terms_requested TEXT;
ALTER TABLE retailer_applications ADD COLUMN trade_license_file_url TEXT;
ALTER TABLE retailer_applications ADD COLUMN tax_certificate_file_url TEXT;
ALTER TABLE retailer_applications ADD COLUMN application_payload_json TEXT;
