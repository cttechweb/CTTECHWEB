-- ─────────────────────────────────────────────────────────────────
-- Migration 0006: Careers, Job Postings, Job Applications & Careers Config
-- Database: cooltech_db (044aed24-d4fa-49c8-9551-3bc83ac336ae)
-- ─────────────────────────────────────────────────────────────────

-- 1. Job Vacancies Table
CREATE TABLE IF NOT EXISTS jobs (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  department TEXT NOT NULL,
  location TEXT DEFAULT 'Abu Dhabi, UAE',
  type TEXT DEFAULT 'Full-Time',
  experience TEXT,
  summary TEXT,
  responsibilities_json TEXT,
  requirements_json TEXT,
  salary_range TEXT,
  is_urgent INTEGER DEFAULT 0,
  is_active INTEGER DEFAULT 1,
  display_order INTEGER DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_jobs_active ON jobs(is_active);
CREATE INDEX IF NOT EXISTS idx_jobs_department ON jobs(department);

-- 2. Job Applications Table
CREATE TABLE IF NOT EXISTS job_applications (
  id TEXT PRIMARY KEY,
  job_id TEXT NOT NULL,
  job_title TEXT NOT NULL,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  cover_message TEXT,
  resume_url TEXT,
  resume_file_name TEXT,
  status TEXT NOT NULL DEFAULT 'new',       -- 'new', 'reviewed', 'shortlisted', 'rejected'
  notes TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_job_apps_job ON job_applications(job_id);
CREATE INDEX IF NOT EXISTS idx_job_apps_status ON job_applications(status);

-- 3. Careers Page Global Configuration Table
CREATE TABLE IF NOT EXISTS careers_config (
  id TEXT PRIMARY KEY DEFAULT 'default',
  hero_title TEXT,
  hero_subtitle TEXT,
  hero_badge TEXT,
  hr_email TEXT,
  hr_phone TEXT,
  hr_address TEXT,
  hr_working_hours TEXT,
  allow_general_applications INTEGER DEFAULT 1,
  equal_opportunity_text TEXT,
  benefits_json TEXT,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);
