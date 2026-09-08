/* ─────────────────────────────────────────────────────────────────
   Cool Technologies — Careers Service
   Database: Cloudflare D1 (via Cloudflare Worker API)
───────────────────────────────────────────────────────────────── */

import { apiClient } from "./apiClient";

export interface JobPosting {
  id: string;
  title: string;
  department: string;
  location: string;
  type: "Full-Time" | "Part-Time" | "Contract" | "Internship" | string;
  experience: string;
  summary: string;
  responsibilities: string[];
  requirements: string[];
  salaryRange?: string;
  isUrgent?: boolean;
  isActive: boolean;
  order: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CareerBenefit {
  id: string;
  title: string;
  description: string;
  iconName: string;
  order: number;
  isActive: boolean;
}

export interface CareersConfig {
  heroTitle: string;
  heroSubtitle: string;
  heroBadge: string;
  hrEmail: string;
  hrPhone: string;
  hrAddress: string;
  hrWorkingHours: string;
  allowGeneralApplications: boolean;
  equalOpportunityText: string;
  benefits: CareerBenefit[];
  updatedAt?: string;
}

export interface JobApplication {
  id: string;
  jobId: string;
  jobTitle: string;
  fullName: string;
  email: string;
  phone: string;
  coverMessage?: string;
  resumeUrl?: string;
  resumeFileName?: string;
  status: "new" | "reviewed" | "shortlisted" | "rejected";
  notes?: string;
  submittedAt: string;
  updatedAt?: string;
}

const LOCAL_JOBS_KEY = "cooltech_careers_jobs_v1";
const LOCAL_CONFIG_KEY = "cooltech_careers_config_v1";
const LOCAL_APPLICATIONS_KEY = "cooltech_careers_applications_v1";

export const DEFAULT_CAREER_BENEFITS: CareerBenefit[] = [
  {
    id: "b1",
    title: "Competitive Tax-Free Compensation",
    description: "Industry-benchmarked remuneration with comprehensive UAE health insurance coverage.",
    iconName: "ShieldCheck",
    order: 1,
    isActive: true
  },
  {
    id: "b2",
    title: "Career Growth Opportunities",
    description: "Structured career advancement pathways with merit-based performance rewards.",
    iconName: "TrendingUp",
    order: 2,
    isActive: true
  },
  {
    id: "b3",
    title: "Factory & OEM Training",
    description: "Specialized training certifications with tier-1 global cooling equipment manufacturers.",
    iconName: "GraduationCap",
    order: 3,
    isActive: true
  },
  {
    id: "b4",
    title: "Collaborative Engineering Team",
    description: "Work alongside veteran MEP consultants, mechanical engineers, and HVAC specialists.",
    iconName: "Users",
    order: 4,
    isActive: true
  }
];

export const DEFAULT_CAREERS_CONFIG: CareersConfig = {
  heroTitle: "Careers at Cool Technologies",
  heroSubtitle: "Join a team dedicated to innovation, quality, and customer satisfaction. Build your career with one of the UAE's trusted industrial cooling solution providers.",
  heroBadge: "JOIN OUR ENGINEERING TEAM",
  hrEmail: "careers@cooltech.ae",
  hrPhone: "+971 2 565 0123",
  hrAddress: "Plot-99, Sector M-42, Mussafah Industrial Area, Abu Dhabi, UAE",
  hrWorkingHours: "Mon - Sat: 8:00 AM - 6:00 PM (GST)",
  allowGeneralApplications: true,
  equalOpportunityText: "Cool Technologies is committed to equal opportunity employment for all qualified individuals regardless of race, nationality, or gender.",
  benefits: DEFAULT_CAREER_BENEFITS
};

export const DEFAULT_JOB_POSTINGS: JobPosting[] = [
  {
    id: "hvac-project-engineer",
    title: "HVAC Project Engineer",
    department: "Engineering & Projects",
    location: "Abu Dhabi, UAE",
    type: "Full-Time",
    experience: "3-6 Years (UAE MEP Experience)",
    summary: "Lead commercial chiller, VRV, and cooling tower installations from engineering design review to site commissioning and client handover.",
    responsibilities: [
      "Manage mechanical HVAC equipment installations on commercial and industrial project sites",
      "Coordinate with MEP consultants, main contractors, and municipal authorities (ADDC / DEWA)",
      "Prepare equipment submittals, schematic shop drawings, and psychrometric load verifications",
      "Supervise chiller commissioning, hydronic balancing, and automated BMS integration"
    ],
    requirements: [
      "Bachelor's degree in Mechanical Engineering or related discipline",
      "Minimum 3 years of hands-on HVAC project execution experience in the UAE",
      "Proficient in AutoCAD, Carrier HAP, psychrometric charts, and MEP submittals",
      "Valid UAE Driver's License and fluent English communication (Arabic is an advantage)"
    ],
    salaryRange: "AED 9,000 - 14,000 / month + Benefits",
    isUrgent: true,
    isActive: true,
    order: 1
  },
  {
    id: "chiller-technician-specialist",
    title: "Senior Chiller Specialist Technician",
    department: "Field Operations & AMC",
    location: "Dubai & Northern Emirates",
    type: "Full-Time",
    experience: "4-8 Years",
    summary: "Perform advanced diagnostic troubleshooting, compressor overhauls, and preventative AMC servicing on centrifugal, screw, and scroll chiller plants.",
    responsibilities: [
      "Diagnose refrigeration circuit faults, electrical control logic, and variable frequency drives",
      "Execute scheduled AMC services, chemical condenser de-scaling, and laser alignment",
      "Carry out refrigerant recovery, system evacuation, leak tracing, and precision charging"
    ],
    requirements: [
      "Diploma or Technical Certificate in Refrigeration & Air Conditioning",
      "Expert knowledge of Daikin, York, Trane, Carrier, and Dunham-Bush chiller architectures",
      "Demonstrated safety certifications in handling high-pressure refrigerants (R-134a, R-410A, R-32)",
      "Ability to respond to 24/7 critical emergency breakdown callouts"
    ],
    salaryRange: "AED 5,500 - 8,500 / month + Overtime & Housing",
    isUrgent: false,
    isActive: true,
    order: 2
  }
];

export function getLocalJobPostings(): JobPosting[] {
  try {
    const saved = localStorage.getItem(LOCAL_JOBS_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
    localStorage.setItem(LOCAL_JOBS_KEY, JSON.stringify(DEFAULT_JOB_POSTINGS));
    return DEFAULT_JOB_POSTINGS;
  } catch {
    return DEFAULT_JOB_POSTINGS;
  }
}

export function saveLocalJobPostings(jobs: JobPosting[]): JobPosting[] {
  try {
    localStorage.setItem(LOCAL_JOBS_KEY, JSON.stringify(jobs));
    window.dispatchEvent(new CustomEvent("cooltech_careers_updated", { detail: { jobs } }));
  } catch {}
  return jobs;
}

/**
 * Fetch all active job postings from Cloudflare D1
 */
export async function getJobPostings(): Promise<JobPosting[]> {
  try {
    const res = await apiClient.getJobs();
    if (res?.jobs && Array.isArray(res.jobs) && res.jobs.length > 0) {
      saveLocalJobPostings(res.jobs);
      return res.jobs as JobPosting[];
    }
  } catch (err) {
    console.warn("[Careers Service] Error fetching jobs from D1:", err);
  }

  return getLocalJobPostings();
}

/**
 * Save or update a job posting in Cloudflare D1 (Admin)
 */
export async function saveJobPosting(job: JobPosting): Promise<JobPosting> {
  const current = getLocalJobPostings();
  const existsIdx = current.findIndex((j) => j.id === job.id);
  let updated: JobPosting[];

  const enrichedJob: JobPosting = {
    ...job,
    updatedAt: new Date().toISOString(),
    createdAt: job.createdAt || new Date().toISOString()
  };

  if (existsIdx >= 0) {
    updated = [...current];
    updated[existsIdx] = enrichedJob;
  } else {
    updated = [enrichedJob, ...current];
  }

  saveLocalJobPostings(updated);

  try {
    if (existsIdx >= 0) {
      await apiClient.updateJob(enrichedJob.id, enrichedJob);
    } else {
      await apiClient.createJob(enrichedJob);
    }
  } catch (err) {
    console.warn("[Careers Service] Error saving job posting to D1:", err);
  }

  return enrichedJob;
}

/**
 * Delete a job posting in Cloudflare D1 (Admin)
 */
export async function deleteJobPosting(jobId: string): Promise<boolean> {
  const current = getLocalJobPostings();
  const filtered = current.filter((j) => j.id !== jobId);
  saveLocalJobPostings(filtered);

  try {
    await apiClient.deleteJob(jobId);
    return true;
  } catch (err) {
    console.warn("[Careers Service] Error deleting job posting in D1:", err);
    return false;
  }
}

export function reorderJobPostings(jobs: JobPosting[]): JobPosting[] {
  const reindexed = jobs.map((j, idx) => ({ ...j, order: idx + 1 }));
  saveLocalJobPostings(reindexed);
  reindexed.forEach((job) => {
    saveJobPosting(job).catch(() => {});
  });
  return reindexed;
}

export function resetDefaultJobs(): JobPosting[] {
  saveLocalJobPostings(DEFAULT_JOB_POSTINGS);
  DEFAULT_JOB_POSTINGS.forEach((job) => {
    saveJobPosting(job).catch(() => {});
  });
  return DEFAULT_JOB_POSTINGS;
}

/* ─────────────────────────────────────────────────────────────────
   CAREERS PAGE CONFIG (HERO & HR CONTACT)
───────────────────────────────────────────────────────────────── */

export function getLocalCareersConfig(): CareersConfig {
  try {
    const saved = localStorage.getItem(LOCAL_CONFIG_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return { ...DEFAULT_CAREERS_CONFIG, ...parsed };
    }
    localStorage.setItem(LOCAL_CONFIG_KEY, JSON.stringify(DEFAULT_CAREERS_CONFIG));
    return DEFAULT_CAREERS_CONFIG;
  } catch {
    return DEFAULT_CAREERS_CONFIG;
  }
}

export function saveLocalCareersConfig(config: CareersConfig): CareersConfig {
  try {
    localStorage.setItem(LOCAL_CONFIG_KEY, JSON.stringify(config));
    window.dispatchEvent(new CustomEvent("cooltech_careers_updated", { detail: { config } }));
  } catch {}
  return config;
}

export async function getCareersConfig(): Promise<CareersConfig> {
  try {
    const res = await apiClient.getCareersConfig();
    if (res?.config) {
      const merged = { ...DEFAULT_CAREERS_CONFIG, ...res.config };
      saveLocalCareersConfig(merged);
      return merged;
    }
  } catch (err) {
    console.warn("[Careers Service] Error fetching config from D1:", err);
  }

  return getLocalCareersConfig();
}

export async function saveCareersConfig(config: CareersConfig): Promise<CareersConfig> {
  const updated: CareersConfig = {
    ...config,
    updatedAt: new Date().toISOString()
  };
  saveLocalCareersConfig(updated);

  try {
    await apiClient.saveCareersConfig(updated);
  } catch (err) {
    console.warn("[Careers Service] Error saving config to D1:", err);
  }

  return updated;
}

/* ─────────────────────────────────────────────────────────────────
   JOB APPLICATIONS CRUD & SYNC
───────────────────────────────────────────────────────────────── */

export function getLocalJobApplications(): JobApplication[] {
  try {
    const saved = localStorage.getItem(LOCAL_APPLICATIONS_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) return parsed;
    }
    return [];
  } catch {
    return [];
  }
}

export function saveLocalJobApplications(apps: JobApplication[]): JobApplication[] {
  try {
    localStorage.setItem(LOCAL_APPLICATIONS_KEY, JSON.stringify(apps));
    window.dispatchEvent(new CustomEvent("cooltech_career_applications_updated", { detail: apps }));
  } catch {}
  return apps;
}

export async function getJobApplications(): Promise<JobApplication[]> {
  try {
    const res = await apiClient.getApplications();
    if (res?.applications && Array.isArray(res.applications)) {
      saveLocalJobApplications(res.applications);
      return res.applications as JobApplication[];
    }
  } catch (err) {
    console.warn("[Careers Service] Error fetching applications from D1:", err);
  }

  return getLocalJobApplications();
}

export async function submitJobApplication(
  appData: Omit<JobApplication, "id" | "submittedAt" | "status">
): Promise<JobApplication> {
  const newApp: JobApplication = {
    ...appData,
    id: `app_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    status: "new",
    submittedAt: new Date().toISOString()
  };

  const current = getLocalJobApplications();
  const updated = [newApp, ...current];
  saveLocalJobApplications(updated);

  try {
    const res = await apiClient.submitApplication(newApp);
    if (res?.application) {
      return res.application as JobApplication;
    }
  } catch (err) {
    console.warn("[Careers Service] Error submitting application to D1:", err);
  }

  return newApp;
}

export async function updateJobApplication(app: JobApplication): Promise<JobApplication> {
  const current = getLocalJobApplications();
  const idx = current.findIndex((a) => a.id === app.id);
  const enriched = { ...app, updatedAt: new Date().toISOString() };

  if (idx >= 0) {
    const updated = [...current];
    updated[idx] = enriched;
    saveLocalJobApplications(updated);
  }

  try {
    const res = await apiClient.updateApplication(app.id, enriched);
    if (res?.application) {
      return res.application as JobApplication;
    }
  } catch (err) {
    console.warn("[Careers Service] Error updating application in D1:", err);
  }

  return enriched;
}

export async function deleteJobApplication(id: string): Promise<boolean> {
  const current = getLocalJobApplications();
  const filtered = current.filter((a) => a.id !== id);
  saveLocalJobApplications(filtered);

  try {
    await apiClient.deleteApplication(id);
    return true;
  } catch (err) {
    console.warn("[Careers Service] Error deleting application in D1:", err);
    return false;
  }
}
