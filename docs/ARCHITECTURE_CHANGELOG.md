# Architecture Change Log

This file tracks all architectural changes, database schema modifications, service additions, and route changes made to the Cool Technologies platform.

---

## 2026-08-26 — Dynamic Product Categories Page & Admin Category Manager

### Changes
- **Dedicated Product Categories Page** ([`CategoriesPage.tsx`](file:///Users/nafalkt/Documents/Websites/cool-technologies%20%283%29/src/components/CategoriesPage.tsx)):
  * Built a standalone Product Categories Page routed at `#/categories`.
  * Clean, cohesive corporate branding matching the rest of the Cool Technologies site:
    - Clean white header with breadcrumbs and deep navy typography (`#031b4e`).
    - Removed extraneous fancy gradient banners, search bars, and statistics chips for a pure, streamlined experience.
    - Category cards display dynamic products count, subtitle, description, and high-res thumbnail.
  * Clicking any category navigates seamlessly to `#/products?category={categoryName}` with filtered products.
  * Injected Schema.org `CollectionPage` / `ItemList` JSON-LD structured data for search engines.
  * Auto-triggers the **Smart Selection Assistant** pop-up upon landing on the Categories page so users can immediately get AI-assisted HVAC equipment matching.
- **Smart Selection Assistant Catalog Product Card & Dynamic Filter Button** ([`DynamicWizardFlow.tsx`](file:///Users/nafalkt/Documents/Websites/cool-technologies%20%283%29/src/components/selection-wizard/DynamicWizardFlow.tsx), [`MindMapCanvas.tsx`](file:///Users/nafalkt/Documents/Websites/cool-technologies%20%283%29/src/components/admin/MindMapCanvas.tsx), [`SelectionWizardModal.tsx`](file:///Users/nafalkt/Documents/Websites/cool-technologies%20%283%29/src/components/selection-wizard/SelectionWizardModal.tsx)):
  * **Exact Catalog Product Card**: Product carousel items use the exact design and architecture of the main store catalog cards (image frame `h-36 sm:h-44`, in-stock badges, `#2596be` taxonomy, wholesale rates, dual Add to Quote + View Specs buttons).
  * **Product Node & Filter Terminal Synchronization**: Connected `Product Result` and `Filter Terminal` nodes are now seamlessly merged in the wizard flow. When a customer reaches a Product node connected to a Filter Terminal node, the wizard automatically applies the Filter Terminal's settings (`primaryFilter`, `enabledFilters`, `selectedBrands`).
  * **Strict Admin Filter Checkbox Sync**: If the admin only enables Brand as the primary filter on the Filter Terminal node, the top Filter button is completely hidden from the user interface. It only renders when secondary filter options (`Price`, `Category`, `Stock`) are checked.
  * **Floating Overlay Filter Popover**: Zero-resize floating drawer with dismiss backdrop.
  * **Mobile Polish**: Centered cards and swipeable horizontal brand chips.
- **10 Dynamic Commercial HVAC Products & Permanent Deletion Architecture** ([`productService.ts`](file:///Users/nafalkt/Documents/Websites/cool-technologies%20%283%29/src/services/productService.ts), [`App.tsx`](file:///Users/nafalkt/Documents/Websites/cool-technologies%20%283%29/src/App.tsx), [`types.ts`](file:///Users/nafalkt/Documents/Websites/cool-technologies%20%283%29/src/types.ts)):
  * **10 Commercial Equipment Products**: Added 10 HVAC products across all core categories (Daikin VRV IV-X 18 HP, Carrier AquaForce 30XA 150 TR Chiller, Copeland Scroll Compressor ZP182KCE, Midea 25 TR Rooftop Package AC, York YVAA 250 TR Variable Speed Chiller, Danfoss Maneurop MTZ160 Compressor, Coated Commercial Condenser Coils, Mueller Seamless Copper Pipe Coil, Honeywell BACnet Touchscreen Controller, and Armacell Armaflex Class 0 Insulation).
  * **Complete & Permanent Product Deletion**: When an admin deletes a product (single or bulk delete), it is permanently removed from the local state, `localStorage`, and Firestore database. The application no longer resurrects or hardcode-reseeds deleted products.
- **Dynamic Careers & Hiring Management Module** ([`AdminCareersManager.tsx`](file:///Users/nafalkt/Documents/Websites/cool-technologies%20%283%29/src/components/admin/AdminCareersManager.tsx), [`careersService.ts`](file:///Users/nafalkt/Documents/Websites/cool-technologies%20%283%29/src/services/careersService.ts), [`CareersPage.tsx`](file:///Users/nafalkt/Documents/Websites/cool-technologies%20%283%29/src/components/CareersPage.tsx), [`storageService.ts`](file:///Users/nafalkt/Documents/Websites/cool-technologies%20%283%29/src/services/storageService.ts), [`AdminPanelPage.tsx`](file:///Users/nafalkt/Documents/Websites/cool-technologies%20%283%29/src/components/admin/AdminPanelPage.tsx)):
  * **Instant 0ms Page Load**: Initialized state synchronously from local cache in `CareersPage.tsx` and `AdminCareersManager.tsx`, eliminating the 10-second initial load wait time. Background Firestore synchronization is non-blocking with 1.2s timeout guards.
  * **Zero-Latency Candidate Status Shifting**: Made candidate recruiter status shifts (`New`, `Reviewed`, `Shortlisted`, `Rejected`) optimistic with instant 0ms UI feedback, syncing with Firestore asynchronously without UI blocking.
  * **Removed Equal Opportunity Box**: Removed the "Equal Opportunity Employer" card from the public Careers sidebar.
  * **Instant & Resilient Resume File Upload**: Added timeout and instant Base64 fallback in `storageService.ts` (`uploadDocumentFile`) so application submissions never get stuck on upload progress.
  * **Clean Arrow-Only Section Accordion (Default Minimised)**: All settings sections (Hero Banner, HR Department Contact, "Why Work With Us" Advantages) default to minimised on load with a clean, minimal arrow indicator (`ChevronDown` rotating 180° on expand).
  * **Open Hiring Posts Manager (`jobs`)**: Create, edit, duplicate, reorder, toggle active/hidden status, and delete hiring postings. Features dynamic responsibilities & requirements list builders, compensation, urgent badge toggling, and department tagging.
  * **Received Job Applications (`applications`)**: Manage incoming candidate applications with resume download links, candidate details, recruiter status tracking (`New`, `Reviewed`, `Shortlisted`, `Rejected`), and search/filters.
  * **Careers Page & HR Contact Customizer (`settings`)**: Live editing for the hero header (badge, title, subtitle), HR Department contact details (direct email, phone/toll-free, headquarters address, operating hours), equal opportunity employer statement, and "Why Work With Us" benefit cards.
  * **Dynamic Public Careers Page**:
    * Fully dynamic public page that reflects hiring posts and HR contact customization in real-time.
    * Dynamic department filtering and keyword search across all active roles.
    * Integrated candidate application form with cloud/Base64 resume file uploading (`uploadDocumentFile`), instant applicant reference generation, and submission confirmation.
  * **Dual Persistence**: Synchronizes with Firestore collections (`careers_jobs`, `careers_config`, `careers_applications`) and LocalStorage with real-time `cooltech_careers_updated` and `cooltech_career_applications_updated` custom event dispatchers.
- **Removed Leadership Timeline & Buttons from Management Page** ([`ManagementPage.tsx`](file:///Users/nafalkt/Documents/Websites/cool-technologies%20%283%29/src/components/ManagementPage.tsx)):
  * Removed the hero header CTA buttons ("Connect with Leadership" and "View Leadership Team").
  * Removed the bottom CTA buttons ("Explore Career Opportunities" and "Contact Management Desk").
  * Removed the redundant "Management Evolution — Leadership Timeline" section from `#/management`.
- **Admin Panel Product Catalog Sub-Tabs & Category Manager** ([`AdminCategoryManager.tsx`](file:///Users/nafalkt/Documents/Websites/cool-technologies%20%283%29/src/components/admin/AdminCategoryManager.tsx), [`AdminPanelPage.tsx`](file:///Users/nafalkt/Documents/Websites/cool-technologies%20%283%29/src/components/admin/AdminPanelPage.tsx)):
  * Added sub-tab navigation inside the **Products Catalog** section:
    1. **Products Inventory** (`inventory`)
    2. **Product Categories** (`categories`)
  * Full dynamic CRUD for categories: Add, Edit, Delete, Reorder (Up/Down), toggle visibility (Active/Hidden), and Reset Defaults.
  * Replaced preset image buttons with a complete **Image File Upload Uploader** supporting drag-and-drop file upload (JPG, PNG, WebP, SVG) to Cloud Storage with progress tracking, image replacement, and direct URL mode.
  * Category modal supports Name, custom Slug, Subtitle / Key Sub-items, Description, and Image file upload / URL.
- **Full Dynamic Category Synchronization** ([`categoryService.ts`](file:///Users/nafalkt/Documents/Websites/cool-technologies%20%283%29/src/services/categoryService.ts), [`Categories.tsx`](file:///Users/nafalkt/Documents/Websites/cool-technologies%20%283%29/src/components/Categories.tsx), [`ProductsPage.tsx`](file:///Users/nafalkt/Documents/Websites/cool-technologies%20%283%29/src/components/ProductsPage.tsx), [`ProductCatalog.tsx`](file:///Users/nafalkt/Documents/Websites/cool-technologies%20%283%29/src/components/ProductCatalog.tsx), [`ProductEditorModal.tsx`](file:///Users/nafalkt/Documents/Websites/cool-technologies%20%283%29/src/components/admin/ProductEditorModal.tsx)):
  * Changes made in Admin dynamically synchronize across the whole platform via `cooltech_categories_updated` custom event and Firestore / LocalStorage caching.
  * Homepage categories, product catalog category filters, and Admin product creation category dropdown reflect all newly created and updated categories immediately without page reload.
- **Navigation & Sitemap Updates** ([`Header.tsx`](file:///Users/nafalkt/Documents/Websites/cool-technologies%20%283%29/src/components/Header.tsx), [`Footer.tsx`](file:///Users/nafalkt/Documents/Websites/cool-technologies%20%283%29/src/components/Footer.tsx), [`AdminSeoSuite.tsx`](file:///Users/nafalkt/Documents/Websites/cool-technologies%20%283%29/src/components/admin/AdminSeoSuite.tsx)):
  * Desktop and mobile header "Product Categories" links and homepage "View All Categories >" button navigate to `#/categories`.
  * Added `https://cooltechnologies.ae/#/categories` to the XML sitemap.

---

## 2026-08-26 — Dynamic Contact FAQs, Collapsible Admin Panels & Technical SEO Schema

### Changes
- **Bug Fix: Suppress AI Selector Assistant Popup on Contact & Support Routes** ([`FloatingSelectorTrigger.tsx`](file:///Users/nafalkt/Documents/Websites/cool-technologies%20%283%29/src/components/selection-wizard/FloatingSelectorTrigger.tsx)):
  * Fixed an issue where the floating AI Selector Assistant card inadvertently popped up on `#/contact?category=product_support` due to a generic hash string match for `"product"`.
  * Explicitly disabled the pop-up on `#/contact`, `#/support`, `#/legal`, and other non-catalog pages.
- **Product Support Clean Red Prompt Text** ([`ContactPage.tsx`](file:///Users/nafalkt/Documents/Websites/cool-technologies%20%283%29/src/components/ContactPage.tsx)):
  * Removed all box/pill styling from field hints.
  * Both hints display in uniform clean **red text**:
    - Name field: `Please fill your details`
    - Message field: `Please fill your complaint`
  * Prompts strictly appear **only** when users arrive via the **Product Support** link (`isFromProductSupport`), while regular/casual visits to `#/contact` render clean standard form labels without any prompts.
- **Product Support Direct Redirection & Auto-Selection** ([`Header.tsx`](file:///Users/nafalkt/Documents/Websites/cool-technologies%20%283%29/src/components/Header.tsx), [`Footer.tsx`](file:///Users/nafalkt/Documents/Websites/cool-technologies%20%283%29/src/components/Footer.tsx), [`App.tsx`](file:///Users/nafalkt/Documents/Websites/cool-technologies%20%283%29/src/App.tsx), [`ContactPage.tsx`](file:///Users/nafalkt/Documents/Websites/cool-technologies%20%283%29/src/components/ContactPage.tsx)):
  * Clicking **Product Support** in the top navigation dropdown (and mobile menu / footer) directly redirects to the Contact Page.
  * The form automatically selects **"Product Support"** in the Inquiry Category dropdown.
  * Form heading and description dynamically update: *"Fill your details and submit your request here. Our engineering and support team will contact you promptly."*
- **Contact Page Design Refinement** ([`ContactPage.tsx`](file:///Users/nafalkt/Documents/Websites/cool-technologies%20%283%29/src/components/ContactPage.tsx)):
  * Removed category tags (`General`, `Quotations`, `Logistics`, `Facility`, etc.) from the FAQ items for a clean, professional, un-cluttered accordion view.
  * Streamlined FAQ section heading.
- **Data Model & Service Layer** ([`types.ts`](file:///Users/nafalkt/Documents/Websites/cool-technologies%20%283%29/src/types.ts), [`generalSettingsService.ts`](file:///Users/nafalkt/Documents/Websites/cool-technologies%20%283%29/src/services/generalSettingsService.ts)):
  * Added `ContactFaqItem` interface and `contactFaqs` field in `GeneralSiteSettings`.
  * Added full CRUD service methods: `getContactFaqs()`, `saveContactFaqs()`, `addContactFaq()`, `updateContactFaq()`, `deleteContactFaq()`, `moveContactFaq()`, and `resetDefaultContactFaqs()`.
- **Admin General Settings UX** ([`AdminGeneralSettings.tsx`](file:///Users/nafalkt/Documents/Websites/cool-technologies%20%283%29/src/components/admin/AdminGeneralSettings.tsx)):
  * **Collapsible / Accordion Sections**: Added maximize/minimize chevron toggles for Headquarters, Branches, and FAQ manager.
- Verified TypeScript lint (`0 errors`) and Vite production build (`0 errors`).

---

## 2026-08-26 — Admin Panel White / Light Theme Transformation

### Change
- Converted the entire Admin Portal, sidebar navigation, top header bar, operational tables, and detail inspector modals from dark theme (`bg-slate-950`/`bg-slate-900`) to a modern, high-contrast **white / light theme** (`bg-white`/`bg-slate-50`).
- Updated all admin subcomponents: `AdminPanelPage.tsx`, `AdminOrderManagement.tsx`, `AdminRfqManagement.tsx`, `AdminCompanyManagement.tsx`, `AdminUserManagement.tsx`, and `AdminLoginScreen.tsx`.
- Refined status badges to clean light pastel palettes with high-contrast text.

---

## 2026-08-26 — Production Architecture Upgrade (Firestore B2B Services, Orders, RFQs & RBAC)

### Change
1. Replaced simulated frontend checkout and RFQ `setTimeout` handlers with persistent Firestore service modules.
2. Built normalized Firestore service layer (`pricingService.ts`, `companyService.ts`, `userService.ts`, `productService.ts`, `categoryService.ts`, `orderService.ts`, `rfqService.ts`).
3. Upgraded `AuthContext.tsx` with Role-Based Access Control (RBAC) helpers (`isAdmin`, `isSales`, `isRetailer`) and Firestore profile synchronization.
4. Upgraded `AdminLoginScreen.tsx` to support real Firebase Auth (Email & Google OAuth) with development master fallback.
5. Integrated `CartDrawer.tsx` to generate persistent B2B Order Requests (`OT-YYYY-XXXXXX`) and associate corporate accounts in Firestore.
6. Integrated `QuoteModal.tsx` and `Hero.tsx` to generate persistent commercial RFQs (`RFQ-YYYY-XXXXXX`).
7. Added Enterprise Admin operational management interfaces (`AdminOrderManagement.tsx`, `AdminRfqManagement.tsx`, `AdminCompanyManagement.tsx`, and updated `AdminUserManagement.tsx`) into `AdminPanelPage.tsx`.
8. Created production `firestore.rules` enforcing security and access policies across all 9 collections.
9. Verified full TypeScript type safety and production build (`npm run lint` and `npm run build` pass with 0 errors).

### Reason
Transition from a prototype/intermediate architecture to a secure, production-ready, future-expandable B2B e-commerce and commercial HVAC sourcing platform while preserving 100% of existing frontend UI, styling, and animations.

### Files Affected
- `src/types.ts` — Added models: `Company`, `UserProfile`, `OrderRequest`, `RfqRequest`, `OrderStatus`, `RfqStatus`, `OrderItem`, `PricingTier`.
- `src/services/pricingService.ts` [NEW] — B2B tier discounts and UAE 5% VAT calculations.
- `src/services/companyService.ts` [NEW] — Firestore `companies` collection service.
- `src/services/userService.ts` [NEW] — Firestore `users` RBAC & profile service.
- `src/services/productService.ts` [NEW] — Firestore `products` real-time sync, CRUD, and initial seed.
- `src/services/categoryService.ts` [NEW] — Firestore `categories` service.
- `src/services/orderService.ts` [NEW] — Firestore `orders` CRUD and audit trail progression.
- `src/services/rfqService.ts` [NEW] — Firestore `rfqs` CRUD and proposal pricing.
- `src/services/cloudflareD1.ts` — Marked as legacy/deprecated with architectural migration notes.
- `src/context/AuthContext.tsx` — Extended with Firestore profile syncing and RBAC flags.
- `src/components/admin/AdminLoginScreen.tsx` — Real Firebase Auth + Google Sign-In + dev fallback.
- `src/components/CartDrawer.tsx` — Real B2B order request submission to Firestore with order identifiers.
- `src/components/QuoteModal.tsx` — Real RFQ submission to Firestore with quote references.
- `src/components/Hero.tsx` — Direct lead submission to Firestore `rfqs` collection.
- `src/components/admin/AdminOrderManagement.tsx` [NEW] — B2B Order requests management & inspector.
- `src/components/admin/AdminRfqManagement.tsx` [NEW] — Commercial RFQ sizing & proposal estimator.
- `src/components/admin/AdminCompanyManagement.tsx` [NEW] — Corporate accounts and TRN entity manager.
- `src/components/admin/AdminUserManagement.tsx` — Real-time Firestore user directory & RBAC.
- `src/components/admin/AdminPanelPage.tsx` — Integrated operational tabs (`orders`, `rfqs`, `companies`).
- `src/App.tsx` — Real-time Firestore subscriptions for products, orders, and RFQs.
- `firestore.rules` [NEW] — Enterprise security rules.

### Database Affected
- Collections added: `orders`, `rfqs`, `companies`, `users`, `products`, `categories`.
- Security rules: `firestore.rules` deployed at root.

### Compatibility Impact
- Backward compatibility preserved: YES. All existing localStorage fallbacks remain active as offline cache.
- Frontend UI preserved: YES. Zero breaking UI changes.

### structure.md Updated
YES

---

## 2026-08-26 — Initial Audit & Architectural Baseline
**Lead Architect**: Antigravity AI  
**Status**: Initial architecture documented. Complete audit of frontend, Firebase authentication, Firestore collections, routing, admin tools, and e-commerce workflows performed. Baseline documents generated.
