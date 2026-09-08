export type UserRole = "customer" | "retailer" | "sales" | "admin" | "superAdmin";
export type UserStatus = "active" | "pending" | "suspended";

export interface AuthenticatedUser {
  uid: string;
  email: string;
  name?: string;
  role: UserRole;
  isVerifiedRetailer: boolean;
  status: UserStatus;
  emailVerified?: boolean;
}

export interface D1UserRecord {
  id: string;
  email: string;
  name: string;
  phone?: string | null;
  address?: string | null;
  company_name?: string | null;
  company_id?: string | null;
  tax_id?: string | null;
  role: UserRole;
  is_verified_retailer: number;
  status: UserStatus;
  tier?: string | null;
  discount_rate: number;
  email_verified?: number | null;
  designation?: string | null;
  default_shipping_address?: string | null;
  billing_address?: string | null;
  created_at: string;
  updated_at: string;
  last_login_at?: string | null;
}

export interface ProductRecord {
  id: string;
  name: string;
  slug?: string | null;
  category: string;
  category_id?: string | null;
  brand: string;
  price: number;
  image_url?: string | null;
  in_stock: number;
  rating: number;
  min_order_qty: number;
  description?: string | null;
  specifications_json?: string | null;
  features_json?: string | null;
  tags_json?: string | null;
  is_active: number;
  created_at: string;
  updated_at: string;
}

export interface QuoteRecord {
  id: string;
  user_id: string;
  customer_name?: string | null;
  customer_email?: string | null;
  customer_phone?: string | null;
  company_name?: string | null;
  delivery_address?: string | null;
  project_description?: string | null;
  products_json: string;
  status: string;
  quoted_amount?: number | null;
  admin_notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface RetailerApplicationRecord {
  id: string;
  user_id: string;
  company_name: string;
  legal_name?: string | null;
  trade_license_number?: string | null;
  tax_registration_number?: string | null;
  contact_person: string;
  email: string;
  phone: string;
  city: string;
  emirate?: string | null;
  address?: string | null;
  designation?: string | null;
  whatsapp_number?: string | null;
  annual_volume_estimate?: string | null;
  business_type?: string | null;
  interested_categories?: string | null;
  payment_terms_requested?: string | null;
  trade_license_doc_url?: string | null;
  tax_certificate_doc_url?: string | null;
  trade_license_file_url?: string | null;
  tax_certificate_file_url?: string | null;
  application_payload_json?: string | null;
  status: string;
  rejection_reason?: string | null;
  reviewed_by?: string | null;
  reviewed_at?: string | null;
  crm_record_id?: string | null;
  crm_sync_status?: string | null;
  crm_last_synced_at?: string | null;
  crm_sync_error?: string | null;
  created_at: string;
  updated_at: string;
}
