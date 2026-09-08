/* ─────────────────────────────────────────────────────────────────
   Cool Technologies — Unified B2B Type Definitions
───────────────────────────────────────────────────────────────── */

export type UserRole = "customer" | "retailer" | "sales" | "admin" | "superAdmin";
export type UserStatus = "active" | "pending" | "suspended";

export interface Company {
  id: string;
  name: string;
  legalName?: string;
  taxId?: string; // UAE TRN (Tax Registration Number)
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  tier?: "Standard" | "Silver" | "Gold" | "Platinum";
  status: "active" | "pending_verification" | "suspended";
  verifiedAt?: string;
  createdAt: string;
  updatedAt: string;
  notes?: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  name: string;
  phone?: string;
  address?: string;
  designation?: string;
  defaultShippingAddress?: string;
  billingAddress?: string;
  companyId?: string;
  companyName?: string;
  taxId?: string;
  role: UserRole;
  isVerifiedRetailer: boolean;
  status: UserStatus;
  emailVerified?: boolean;
  createdAt?: any;
  updatedAt?: any;
  lastLoginAt?: string;
}

export interface WorkflowOption {
  id: string;
  label: string;
  description?: string;
  image?: string;
  imagePosition?: string; // e.g. "50% 50%", "center top", "center bottom"
  imageOnly?: boolean;
  iconName?: string;
  badge?: string;
  nextStepId?: string; // Optional jump/branching target
  targetCategory?: string; // Target product category matching
  capacityKwMultiplier?: number;
}

export interface WorkflowStep {
  id: string;
  stepNumber: number;
  title: string;
  subtitle?: string;
  image?: string;
  displayMode?: "text" | "image" | "hybrid";
  inputType: "cards" | "checkboxes" | "range" | "yesno" | "products" | "services" | "info" | "redirect" | "end" | "filter";
  options: WorkflowOption[];
  position?: { x: number; y: number };
  minValue?: number;
  maxValue?: number;
  stepUnit?: string;
  /** inputType="products": admin-curated list of product IDs to show */
  selectedProductIds?: string[];
  /** inputType="services": admin-curated list of service IDs to show */
  selectedServiceIds?: string[];
  /** inputType="filter": filter configuration */
  filterType?: "brand" | "price" | "category" | "stock";
  primaryFilter?: "brand" | "price" | "category" | "stock";
  enabledFilters?: ("brand" | "price" | "category" | "stock")[];
  selectedBrands?: string[];
  selectedCategories?: string[];
  minPrice?: number;
  maxPrice?: number;
  inStockOnly?: boolean;
  brandFilterEnabled?: boolean;
  /** inputType="info": body text shown in the callout */
  infoContent?: string;
  /** inputType="info": visual style of the callout */
  infoStyle?: "info" | "warning" | "success" | "tip";
  /** inputType="redirect": destination URL */
  redirectUrl?: string;
  /** inputType="redirect": CTA button label */
  redirectLabel?: string;
  /** inputType="redirect": open in new tab */
  redirectNewTab?: boolean;
  /** inputType="end": completion headline message */
  endMessage?: string;
}

export interface Workflow {
  id: string;
  name: string;
  slug: string;
  description: string;
  displayMode?: "text" | "image";
  image?: string;
  imagePosition?: string; // e.g. "50% 50%", "center top"
  badge?: string;
  iconName: string;
  targetCategory: string;
  steps: WorkflowStep[];
}

export interface B2BUser {
  email: string;
  companyName: string;
  taxId: string;
  isRetailer?: boolean;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  categoryId?: string;
  description: string;
  image: string;
  images?: string[];
  price: number;
  rating: number;
  reviewsCount?: number;
  brand: string;
  inStock: boolean;
  minOrderQty?: number;
  leadTime?: string;
  specifications: Record<string, string>;
  features: string[];
  hidePrice?: boolean;
  modelId?: string;
  model?: string;
  capacity?: string;
  sku?: string;
  series?: string;
  sourcingChannel?: string;
  certification?: string;
  primaryRegion?: string;
  applications?: string[];
  documents?: { name: string; url: string; size?: string }[];
  status?: "active" | "archived" | "draft";
  visibility?: "public" | "wholesale_only" | "hidden";
  badge?: "Best Seller" | "Featured" | "New" | "Popular" | string;
  tags?: string[];
  isFeatured?: boolean;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  seoScore?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Category {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  image: string;
  slug: string;
  tag?: string;
  color?: string;
  status?: "active" | "inactive";
  sortOrder?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface WishlistItem {
  id: string;
  type: "product" | "service";
  product?: Product;
  service?: ServiceItem;
  addedAt: string;
}

/* ─────────────────────────────────────────────────────────────────
   B2B Order Request & Order Processing System
───────────────────────────────────────────────────────────────── */

export type OrderStatus = 
  | "NEW" 
  | "UNDER_REVIEW" 
  | "CONTACTED" 
  | "QUOTED" 
  | "CONFIRMED" 
  | "COMPLETED" 
  | "CANCELLED";

export interface StatusHistoryItem {
  status: string;
  timestamp: string;
  updatedBy: string; // User ID or Name
  notes?: string;
}

export interface OrderItem {
  productId: string;
  productSnapshot: {
    id: string;
    name: string;
    modelId?: string;
    brand: string;
    category: string;
    image: string;
    unitPrice: number;
    minOrderQty: number;
  };
  quantity: number;
  unitPrice: number;
  subtotal: number;
  notes?: string;
}

export interface OrderCustomerSnapshot {
  name: string;
  email: string;
  phone: string;
  companyName: string;
  taxId?: string;
  shippingAddress: string;
  city?: string;
}

export interface OrderRequest {
  id: string;
  orderNumber: string; // e.g. OT-2026-000001
  companyId?: string;
  userId?: string;
  customerSnapshot: OrderCustomerSnapshot;
  items: OrderItem[];
  itemCount: number;
  totalUnits: number;
  subtotal: number;
  discountAmount?: number;
  discountRate?: number;
  estimatedTotal?: number;
  poNumber?: string;
  paymentTerm: string; // "net30" | "net60" | "lc" | "advance" | "cod"
  source: "web_cart" | "sales_rep" | "phone" | "manual_admin";
  status: OrderStatus;
  notes?: string;
  internalNotes?: string;
  assignedTo?: string; // Sales rep UID or Name
  statusHistory: StatusHistoryItem[];
  createdAt: string;
  updatedAt: string;
}

/* ─────────────────────────────────────────────────────────────────
   B2B Request For Quotation (RFQ) System
───────────────────────────────────────────────────────────────── */

export type RfqStatus = 
  | "NEW" 
  | "UNDER_REVIEW" 
  | "PROPOSAL_SENT" 
  | "ACCEPTED" 
  | "DECLINED" 
  | "CANCELLED";

export interface RfqItem {
  productName: string;
  productId?: string;
  quantity: number;
  notes?: string;
}

export interface RfqRequest {
  id: string;
  rfqNumber: string; // e.g. RFQ-2026-000001
  companyId?: string;
  userId?: string;
  name: string;
  email: string;
  company: string;
  phone: string;
  projectLocation?: string;
  timeline?: string; // "immediate" | "1-3 months" | "planning"
  loadRequirements?: string; // e.g. "120 TR Chiller Plant"
  projectDescription?: string;
  products: RfqItem[];
  status: RfqStatus;
  assignedTo?: string;
  internalNotes?: string;
  proposalPrice?: number;
  statusHistory: StatusHistoryItem[];
  createdAt: string;
  updatedAt: string;
}

// Backward compatibility helper
export interface QuoteRequest {
  name: string;
  email: string;
  company: string;
  phone: string;
  projectDescription: string;
  products: { productName: string; quantity: number }[];
}

export interface Brand {
  name: string;
  logoUrl?: string;
  isPopular?: boolean;
}

export interface BlogSeoSettings {
  seoTitle?: string;
  seoDescription?: string;
  keywords?: string[];
  canonicalUrl?: string;
  noIndex?: boolean;
  noFollow?: boolean;
  hreflang?: string;
  redirect301Url?: string;

  // Open Graph
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogType?: "article" | "website" | "product";

  // Twitter Card
  twitterCard?: "summary" | "summary_large_image" | "player";
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  twitterCreator?: string;

  // Schemas
  enableArticleSchema?: boolean;
  enableBreadcrumbSchema?: boolean;
  enableProductSchema?: boolean;
  productSchemaData?: {
    productName: string;
    brand: string;
    price: number;
    currency: string;
    inStock: boolean;
  };
  enableReviewSchema?: boolean;
  reviewSchemaData?: {
    ratingValue: number;
    reviewCount: number;
    authorName: string;
  };
  enableOfferSchema?: boolean;
  offerSchemaData?: {
    price: number;
    priceCurrency: string;
    validUntil: string;
  };
  enableVideoSchema?: boolean;
  videoSchemaData?: {
    title: string;
    description: string;
    thumbnailUrl: string;
    contentUrl: string;
    uploadDate: string;
  };

  // Sitemap & Indexing
  includeInXmlSitemap?: boolean;
  includeInImageSitemap?: boolean;
  includeInVideoSitemap?: boolean;
  sitemapPriority?: "1.0" | "0.9" | "0.8" | "0.5";
  changeFreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly";

  // Performance & Media
  imageCompressionWebP?: boolean;
  lazyLoadMedia?: boolean;
  mobileOptimized?: boolean;
}

export interface RedirectRule {
  id: string;
  sourceUrl: string;
  destinationUrl: string;
  type: "301" | "302";
  createdAt: string;
  isActive: boolean;
  hitsCount?: number;
}

export interface ArticleSection {
  id?: string;
  h2?: string;
  h3?: string;
  paragraphs?: string[];
  bulletList?: string[];
  numberedList?: string[];
  quote?: {
    text: string;
    source?: string;
  };
  table?: {
    caption?: string;
    headers: string[];
    rows: string[][];
  };
  image?: {
    url: string;
    caption: string;
    alt: string;
  };
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  category: string;
  author?: string;
  authorRole?: string;
  date: string;
  lastUpdated: string;
  readTime: string;
  image: string;
  videoUrl?: string;
  excerpt: string;
  intro: string;
  status?: "published" | "draft";
  contentHtml?: string;
  sections?: ArticleSection[];
  seoSettings?: BlogSeoSettings;
  seoScore?: number;
}

export interface ServiceItem {
  id: string;
  category: string;
  title: string;
  tagline: string;
  description: string;
  iconName: string;
  features: string[];
  specs: {
    sla: string;
    warranty: string;
    targetAudience: string;
    certifiedFor: string;
  };
  image: string;
}

export interface BrandPartner {
  id: string;
  name: string;
  logo?: string;
  displayType: "image" | "text";
  tagline?: string;
  websiteUrl?: string;
  order: number;
  isActive: boolean;
  scale?: number; // Zoom level, e.g. 1.0 (0.5 - 2.5)
  imagePosition?: string; // e.g. "50% 50%", "center center"
  objectFit?: "contain" | "cover" | "scale-down";
  padding?: number; // e.g. 0 to 20px
  createdAt?: string;
  updatedAt?: string;
}

export interface AchievementMilestone {
  id: string;
  year: string;
  title: string;
  subtitle?: string;
  description: string;
  dealerships?: string[];
  color: string;
  borderColor?: string;
  lightBg?: string;
  iconName?: string; // e.g. "Building", "Award", "Trophy", "Zap", "Star", "Compass", "Settings", "HeartHandshake", "CheckCircle2"
  position: "up" | "down";
  order: number;
  isActive: boolean;
  image?: string; // Optional background showcase image (e.g. factory, award photo, certificate)
  imageOpacity?: number; // Opacity level from 0.05 to 1.0 (default: 0.3)
  createdAt?: string;
  updatedAt?: string;
}

export interface CompanyBranch {
  id: string;
  name: string; // e.g. "Abu Dhabi Main Headquarters", "Dubai Commercial Branch"
  city: string; // e.g. "Abu Dhabi", "Dubai", "Sharjah", "Al Ain"
  address: string; // e.g. "Plot-99, Sector M-42, Mussafah Industrial Area, Abu Dhabi, UAE"
  phone: string; // e.g. "+971 2 565 0123"
  mobile?: string; // e.g. "+971 50 123 4567"
  email: string; // e.g. "abudhabi@cooltechuae.com"
  workingHours?: string; // e.g. "Mon - Sat: 8:00 AM - 7:00 PM"
  mapUrl?: string; // Google Maps Location Link
  mapEmbedUrl?: string; // Embedded Google Maps iframe src
  isHeadquarters?: boolean;
  isActive: boolean;
  order: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ContactFaqItem {
  id: string;
  question: string;
  answer: string;
  category?: string;
  order: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface GeneralSiteSettings {
  companyName: string;
  tagline?: string;
  email: string;
  phone: string;
  whatsapp: string;
  address: string;
  locationMapUrl?: string;
  workingHours?: string;
  brandPartners: BrandPartner[];
  brandTickerSpeed?: number; // Speed in seconds, e.g. 25s (10 - 60)
  achievements?: AchievementMilestone[];
  achievementBgOpacity?: number; // Global background image opacity, e.g. 0.3 (30%)
  branches?: CompanyBranch[];
  contactFaqs?: ContactFaqItem[];
  storageProvider?: "cloudflare" | "firebase" | "local";
  cloudflarePublicDomain?: string; // e.g. https://pub-xxxx.r2.dev or https://cdn.cooltechuae.com
  cloudflareUploadEndpoint?: string; // Cloudflare Worker endpoint for R2 uploads
  emailIntegration?: EmailIntegrationSettings;
  socialLinks?: DynamicSocialLink[];
  whatsappSettings?: WhatsAppRoutingSettings;
  departmentHotlines?: DepartmentHotlines;
  updatedAt?: string;
}

export interface DynamicSocialLink {
  id: string;
  platform: string; // e.g. "LinkedIn", "Facebook", "Instagram", "Twitter / X", "YouTube", "WhatsApp", "TikTok"
  url: string;
  iconType: "preset" | "custom_upload";
  iconPresetName?: string; // "Facebook" | "Instagram" | "Linkedin" | "Twitter" | "Youtube" | "Whatsapp" | "Globe" | etc.
  customIconUrl?: string; // Uploaded custom icon / logo URL
  isActive: boolean;
  order: number;
}

export interface WhatsAppRoutingSettings {
  floatingWidgetEnabled: boolean;
  floatingPhoneNumber: string; // e.g. "+971 50 123 4567"
  floatingPrefilledMessage: string; // e.g. "Hello Cool Technologies, I would like to inquire about commercial cooling equipment."
  floatingButtonPosition?: "bottom-right" | "bottom-left";
  emailAutoReplyWhatsappNumber: string; // Used in email confirmation card
  contactPageWhatsappNumber: string; // Used on Contact Page direct button
}

export interface DepartmentHotlines {
  salesPhone?: string; // e.g. "+971 2 815 6111"
  servicesEmergencyPhone?: string; // e.g. "+971 2 815 6161" or "+971 2 565 0123"
  mediaPressEmail?: string; // e.g. "media@cooltechuae.com"
  pressEmail?: string; // e.g. "press@cooltechuae.com"
  pressDeskPhone?: string; // e.g. "+971 2 555 1234"
  pressWhatsapp?: string; // e.g. "+971 50 123 4567"
  legalEmail?: string; // e.g. "legal@cooltechuae.com"
  legalPhone?: string; // e.g. "+971 2 565 0123"
  privacyEmail?: string; // e.g. "privacy@cooltechuae.com"
}

export interface EmailIntegrationSettings {
  isEnabled: boolean;
  serviceId?: string;
  templateId?: string;
  publicKey?: string;
  brevoApiKey?: string;
  brevoSenderEmail?: string;
  brevoSenderName?: string;
  autoReplyEnabled?: boolean;
  defaultReceivingEmail: string;
  orderReceivingEmail?: string;
  rfqReceivingEmail?: string;
  contactReceivingEmail?: string;
  partnerReceivingEmail?: string;
  careerReceivingEmail?: string;
  reviewReceivingEmail?: string;
  accountReceivingEmail?: string;
  loginReceivingEmail?: string;
  notifyOnSignup?: boolean;
  notifyOnLogin?: boolean;
  notifyOnB2B?: boolean;
}

export type EnquirySource = "homepage" | "contact_page" | "product_page" | "support" | "services" | "other";
export type EnquiryType = "general" | "support" | "quotation" | "partnership" | "service";
export type EnquiryStatus = "NEW" | "IN_REVIEW" | "CONTACTED" | "RESOLVED" | "SPAM";
export type CrmSyncStatus = "pending" | "synced" | "failed";

export interface GeneralEnquiry {
  id: string;
  source: EnquirySource | string;
  type: EnquiryType | string;
  name: string;
  email: string;
  phone?: string;
  companyName?: string;
  subject?: string;
  message: string;
  metadata?: Record<string, any>;
  status: EnquiryStatus;
  crmRecordId?: string;
  crmSyncStatus?: CrmSyncStatus;
  crmLastSyncedAt?: string;
  crmSyncError?: string;
  createdAt: string;
  updatedAt?: string;
}
