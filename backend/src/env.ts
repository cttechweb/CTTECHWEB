export interface Env {
  DB: D1Database;
  STORAGE_BUCKET?: R2Bucket;
  R2_PUBLIC_URL?: string;
  FIREBASE_PROJECT_ID: string;
  ENVIRONMENT?: string;
  CORS_ORIGIN?: string;
  CRM_API_BASE_URL?: string;
  CRM_API_KEY?: string;
  CRM_WEBHOOK_SECRET?: string;
}
