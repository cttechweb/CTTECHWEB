-- ─────────────────────────────────────────────────────────────────
-- Migration 0002: B2B Retailer Applications, Categories, Blogs, Reviews & Companies
-- Database: cooltech_db (044aed24-d4fa-49c8-9551-3bc83ac336ae)
-- ─────────────────────────────────────────────────────────────────

-- 6. B2B Corporate Entities Table
CREATE TABLE IF NOT EXISTS companies (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  legal_name TEXT,
  tax_id TEXT,                               -- UAE TRN Tax Number
  email TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  country TEXT DEFAULT 'UAE',
  tier TEXT DEFAULT 'Standard',
  status TEXT NOT NULL DEFAULT 'active',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_companies_tax_id ON companies(tax_id);

-- 7. B2B Retailer & Contractor Onboarding Applications
CREATE TABLE IF NOT EXISTS retailer_applications (
  id TEXT PRIMARY KEY,                       -- Format: APP-2026-XXXXXX
  user_id TEXT NOT NULL,                     -- References users(id)
  company_name TEXT NOT NULL,
  legal_name TEXT,
  trade_license_number TEXT,
  tax_registration_number TEXT,
  contact_person TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  city TEXT NOT NULL,
  address TEXT,
  annual_volume_estimate TEXT,
  business_type TEXT,                        -- 'contractor', 'distributor', 'installer', 'consultant'
  trade_license_doc_url TEXT,
  tax_certificate_doc_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending',    -- 'pending', 'under_review', 'approved', 'rejected'
  rejection_reason TEXT,
  reviewed_by TEXT,
  reviewed_at TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_retailer_apps_user ON retailer_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_retailer_apps_status ON retailer_applications(status);

-- 8. Product Categories Table
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  image_url TEXT,
  display_order INTEGER DEFAULT 0,
  is_active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);

-- 9. Blogs & Technical Articles Table
CREATE TABLE IF NOT EXISTS blogs (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  category TEXT,
  author TEXT,
  author_role TEXT,
  excerpt TEXT,
  content_html TEXT,
  image_url TEXT,
  read_time TEXT,
  status TEXT NOT NULL DEFAULT 'published',  -- 'published', 'draft', 'archived'
  sections_json TEXT,
  seo_json TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_blogs_slug ON blogs(slug);
CREATE INDEX IF NOT EXISTS idx_blogs_status ON blogs(status);

-- 10. Customer Reviews Table
CREATE TABLE IF NOT EXISTS reviews (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  company TEXT,
  role TEXT,
  rating INTEGER NOT NULL DEFAULT 5,
  text TEXT NOT NULL,
  project_type TEXT,
  verified INTEGER DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'approved',   -- 'approved', 'pending', 'hidden'
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_reviews_status ON reviews(status);
