-- ─────────────────────────────────────────────────────────────────
-- Migration 0005: Enhance Customer Reviews & Technical Articles
-- Database: cooltech_db (044aed24-d4fa-49c8-9551-3bc83ac336ae)
-- ─────────────────────────────────────────────────────────────────

-- Enhance reviews table with location, review target, and service metadata
ALTER TABLE reviews ADD COLUMN location TEXT;
ALTER TABLE reviews ADD COLUMN target TEXT DEFAULT 'homepage';
ALTER TABLE reviews ADD COLUMN service_title TEXT;
ALTER TABLE reviews ADD COLUMN author_avatar TEXT;
