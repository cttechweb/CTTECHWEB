# Technical Audit & Architectural Assessment
## Account, Authentication, User Profile & B2B Retailer System

**Project:** Cool Technologies (B2B E-Commerce & Sourcing Platform)  
**Date:** August 27, 2026  
**Auditor:** Senior Software Architect & Lead Systems Engineer  
**Status:** Audit & System Survey Only (No Code Modified)

---

## 1. Executive Summary

This document provides a comprehensive technical audit of the current **User Account, Authentication, Cart, and B2B Retailer System** in the Cool Technologies codebase.

### In Plain Language:
- **The Good News:** The project has the foundational pieces for modern cloud infrastructure (Firebase Authentication, Firestore Database, and a Role-Based Access Control system). The user interface is polished, modern, and visually appealing.
- **The Core Issue (Dual-System Disconnect):** The application currently runs **two parallel account systems** that are not fully wired together:
  1. **Firebase Authentication & Firestore Database:** A real cloud system that creates user accounts, assigns roles (`customer`, `retailer`, `sales`, `admin`), and stores data in the cloud.
  2. **Browser Local Storage (`localStorage`):** A temporary simulation running inside the user's browser that stores an active user snapshot (`cooltech_active_user`) and a local cart.
- **The B2B Retailer Gap:** The B2B application modal (`RetailerOnboardingModal`) collects trade license and company data from contractors, but upon submission, **it does not save this data to the database or notify administrators**. It displays a success message, but the data disappears into thin air.
- **Security Vulnerability:** The Firestore security rules (`firestore.rules`) currently have unrestricted access (`allow read, write: if true;`), meaning anyone could read or modify any database record if called directly.

---

## 2. Current Architecture

### 2.1 Technology Stack
- **Frontend Framework:** React 19 with TypeScript, bundled using Vite 6.
- **Styling:** Tailwind CSS (v4) with Lucide React icons.
- **Backend & Cloud Infrastructure:** Google Firebase (BaaS — Backend as a Service).
- **Database:** Google Cloud Firestore (a NoSQL document database).
- **Authentication:** Firebase Authentication (Email/Password and Google OAuth 2.0).
- **File Storage:** Firebase Storage & Cloudflare R2 configured for technical document/image hosting.

### 2.2 How the Current Pieces Connect
```text
[ Browser / Visitor ]
        │
        ├── 1. Clicks "Sign In" / "Sign Up"
        │       ▼
        │   [ LoginModal.tsx ]
        │       │
        │       ├── Authenticates with [ Firebase Auth ] (Email/Password or Google)
        │       │       │
        │       │       └── Creates Document in [ Firestore: 'users/{uid}' ]
        │       │
        │       └── SIMULTaneously sets [ localStorage: 'cooltech_active_user' ]
        │
        ├── 2. Clicks "My Saved Cart"
        │       ▼
        │   [ CartDrawer.tsx ]
        │       │
        │       ├── Reads products from [ React State & localStorage ('cooltech_cart_email') ]
        │       └── On Checkout: Creates Document in [ Firestore: 'orders/{orderId}' ]
        │
        ├── 3. Clicks "B2B Retailer Account -> Apply"
        │       ▼
        │   [ RetailerOnboardingModal.tsx ]
        │       │
        │       └── (DISCONNECTED: Shows animation, but does NOT write to Firestore)
        │
        └── 4. Admin Portal (#/admin)
                ▼
            [ AdminUserManagement.tsx & AdminCompanyManagement.tsx ]
                │
                ├── Reads & Writes to [ Firestore: 'users' & 'companies' ]
                └── Can manually promote users to 'retailer' (10% discount)
```

---

## 3. Authentication Audit

### 3.1 Authentication Features Matrix

| Feature | Implementation Status | Where It Lives | How It Works |
| :--- | :--- | :--- | :--- |
| **Email + Password Login** | **PARTIALLY COMPLETE** | `src/context/AuthContext.tsx` & `src/components/LoginModal.tsx` | Calls Firebase `signInWithEmailAndPassword`. However, errors are caught and swallowed, falling back to a dummy login. |
| **Email + Password Registration** | **PARTIALLY COMPLETE** | `src/context/AuthContext.tsx` | Calls Firebase `createUserWithEmailAndPassword`, then writes a profile doc to `users/{uid}`. |
| **Google Sign-In (OAuth)** | **PARTIALLY COMPLETE** | `src/context/AuthContext.tsx` | Uses Firebase `signInWithPopup(auth, googleProvider)`. |
| **Password Reset / Forgot Password** | **NOT IMPLEMENTED** | None | No "Forgot Password" link or `sendPasswordResetEmail` handler exists in the UI. |
| **Email Verification** | **NOT IMPLEMENTED** | None | Users are logged in immediately without email verification. |
| **Session Persistence** | **COMPLETE** | `src/context/AuthContext.tsx` | Managed automatically by Firebase SDK via IndexedDB/LocalState. |
| **Auth State Detection** | **COMPLETE** | `src/context/AuthContext.tsx` | Listens to `onAuthStateChanged(auth, callback)`. |
| **Sign Out / Logout** | **PARTIALLY COMPLETE** | `src/context/AuthContext.tsx` & `src/App.tsx` | Signs out of Firebase Auth, but requires manual clearing of local cart & user storage. |
| **Protected Routes** | **PARTIALLY COMPLETE** | `src/App.tsx` | Admin panel is protected by a session password (`sessionStorage`), but not by Firebase role verification. |

### 3.2 The User Journey (Step-by-Step)
1. **Visitor arrives at website:** App initializes `AuthContext`. Firebase checks if a token exists in browser memory.
2. **Visitor opens Login Modal:** Can choose "Login" or "Sign Up" tab, or click "Continue with Google".
3. **Authentication Execution:** 
   - If Google Sign-In is chosen, Google popup opens.
   - If Email/Password is chosen, Firebase creates the account or validates credentials.
4. **Profile Creation:** `fetchOrCreateProfile()` runs in `AuthContext.tsx`. If it is a new account, it writes to Firestore collection `users` with document ID equal to the user's unique ID (`uid`).
5. **The Disconnect:** `LoginModal.tsx` catches any Firebase error and still invokes `onLoginSuccess` with mock client data (`taxId: "CLIENT-VERIFIED-01"`), which sets `localStorage.setItem("cooltech_active_user", ...)`.

---

## 4. User Database / Profile Audit

### 4.1 Database Location
- **Firestore Collection Name:** `users`
- **Document ID:** The Firebase Authentication User ID (`uid`).

### 4.2 Field-by-Field Breakdown

| Field Name | Type | Currently Stored? | Description |
| :--- | :--- | :---: | :--- |
| `uid` | string | **YES** | Unique Firebase Authentication User ID. |
| `email` | string | **YES** | User's email address. |
| `name` | string | **YES** | Full Name or display name. |
| `phone` | string | **OPTIONAL / PARTIAL** | Stored if updated in Profile, but missing during initial registration. |
| `role` | string | **YES** | `"customer"`, `"retailer"`, `"sales"`, `"admin"`, `"superAdmin"`. |
| `isVerifiedRetailer` | boolean | **YES** | `true` if approved for 10% B2B discount; `false` by default. |
| `status` | string | **YES** | `"active"`, `"pending"`, or `"suspended"`. |
| `companyId` | string | **PARTIAL** | Defined in TypeScript type, but not linked when user registers. |
| `companyName` | string | **PARTIAL** | Editable in profile, but not linked to a formal company record. |
| `taxId` | string | **PARTIAL** | TRN (Tax Registration Number) stored as free text. |
| `createdAt` | timestamp | **YES** | Server timestamp when account was created. |
| `lastLoginAt` | string | **YES** | ISO timestamp updated upon each login. |
| `address` / `city` / `country` | string | **NO (in Firestore)** | Exists in modal state, but not saved in Firestore `users` document. |
| `profileImage` | string | **NO** | Not stored. The UI uses the first letter of the company/name as an avatar. |
| `creditLimit` | number | **NO** | Not stored. |
| `assignedSalesRep` | string | **NO** | Not stored. |

---

## 5. User Identity and Data Connection

### 5.1 How the System Identifies Users
Every authenticated user is assigned a unique string by Firebase Auth called a **UID** (User Identifier, e.g., `k8J9xLm2Pq0vWz...`).

### 5.2 Relationship Diagram
```text
Firebase Auth (UID: "abc-123")
      │
      ├──> Firestore: users/abc-123
      │         ├── role: "retailer"
      │         ├── isVerifiedRetailer: true
      │         └── companyId: "comp-456"
      │
      ├──> Firestore: companies/comp-456
      │         ├── name: "Al Khaleej Contracting LLC"
      │         ├── taxId: "100-29384-00000"
      │         └── tier: "Gold" (10% discount)
      │
      ├──> Firestore: orders (Query: where("userId", "==", "abc-123"))
      │         └── Order OT-2026-0001
      │
      └──> Browser localStorage: cooltech_cart_user@email.com
                └── [ Active Shopping Cart Items ]
```

---

## 6. Saved Cart Audit

### 6.1 Current Functionality
1. **Storage Mechanism:** The cart is stored in the browser's `localStorage` under the key `cooltech_cart_{email}`.
2. **User Association:** It uses the user's **email address** rather than their immutable **UID**.
3. **Product Information:** Full product snapshots (ID, name, brand, category, price, MOQ, image) are saved in the cart object.
4. **Checkout Submission:** When the user clicks "Submit Order Request", `CartDrawer.tsx` packages the items and creates an official record in Firestore under collection `orders`.

### 6.2 Limitations for a B2B Platform
- **No Cloud Cart Sync:** If a procurement manager adds items on their office laptop, they will not see those items on their mobile phone or tablet because the cart is saved only in that specific browser's storage.
- **Email-Key Dependency:** If a user changes their email address, their saved cart is lost because the key was tied to their old email string.

---

## 7. B2B Retailer Account & Application Audit

### 7.1 The Current "Apply" Feature
In the header dropdown under **Account**, there is a button:
`B2B Retailer Account -> [ Apply ]`

### 7.2 What Happens Under the Hood
1. User clicks **Apply**.
2. `RetailerOnboardingModal.tsx` opens.
3. User enters:
   - Company / Trade Business Name
   - Trade License / Tax Registration Number (TRN)
   - Contact Person Name
   - Direct Phone / WhatsApp
   - Annual Sourcing Volume
   - Primary Emirate (Abu Dhabi, Dubai, etc.)
4. User clicks **"Verify Business & Unlock B2B Wholesale Portal"**.
5. The modal shows a loading spinner for 1.5 seconds, then displays:
   > *"Thank you. Your trade registration has been logged. Wholesale pricing tiers & retailer portal credit access are now active on your account."*
6. **The Critical Finding:** The modal does **not execute any database query**. The data is discarded, and the user's role remains unchanged in Firestore.

---

## 8. B2B Retailer Account vs. Normal User Account

### 8.1 Current Distinction

| Attribute | Normal Customer | B2B Retailer (Approved) |
| :--- | :--- | :--- |
| **Firestore Role** | `role: "customer"` | `role: "retailer"` |
| **Verification Flag** | `isVerifiedRetailer: false` | `isVerifiedRetailer: true` |
| **Catalog Pricing** | List Wholesale Price (Standard) | 10% Trade Discount applied across catalog |
| **Payment Terms** | Advance / Standard | Net 30, Net 60, Letter of Credit (LC) |
| **RFQ Access** | Standard RFQ | Priority Contractor RFQ |

### 8.2 How Admin Currently Approves Retailers
In `#/admin` under **Users & RBAC**:
- The administrator can search for any user and click **"Promote Retailer"** or change their role to `retailer`.
- This calls `verifyRetailer(uid, true)` in `userService.ts`, which successfully updates Firestore.

---

## 9. B2B Dedicated Portal Status

### 9.1 What Exists vs. What Is Missing

| Portal Feature | Exists in Code? | Status | Details |
| :--- | :---: | :---: | :--- |
| **B2B Retailer Route (`#/retailer` or `#/b2b`)** | **NO** | NOT IMPLEMENTED | There is no dedicated portal view or dashboard for retailers. |
| **B2B Dynamic Pricing** | **YES** | COMPLETE | `pricingService.ts` automatically calculates 10% contractor discount when `isRetailer` is true. |
| **B2B Order Tracking** | **PARTIAL** | ADMIN ONLY | Orders are tracked in Admin Panel, but customers do not have an order tracking screen. |
| **Credit Limit & Financials** | **NO** | NOT IMPLEMENTED | Fields for credit limits, statements, and invoices are not yet built. |
| **Contractor Quotations (RFQ)** | **YES** | COMPLETE | Customers can submit RFQs; admins review them in `AdminRfqManagement.tsx`. |

---

## 10. Security Audit

### 10.1 Key Vulnerabilities Identified

1. **CRITICAL — Open Firestore Security Rules:**
   - In `firestore.rules`, lines 45, 47, 53, 55, 61, 65, 67, and 92 contain fallback clauses like `|| true`.
   - **Risk:** Anyone with basic technical tools could read, modify, or delete database documents directly without going through the website.
2. **HIGH — Error Swallowing in Authentication Modal:**
   - `LoginModal.tsx` swallows authentication errors in `catch` blocks and logs the user into a local mock state.
   - **Risk:** Users with wrong passwords or deleted accounts may believe they are logged in when they are not.
3. **HIGH — Client-Side Admin Authentication:**
   - Admin access is stored in `sessionStorage.getItem("cooltech_admin_authed") === "true"` rather than checking if the authenticated Firebase user has `role === 'admin'`.

---

## 11. Important Files in the Codebase

### Frontend Components (`src/components/`)
- `Header.tsx`: Renders the desktop/mobile navigation bar, account dropdown, and triggers modals.
- `LoginModal.tsx`: Login and Sign-Up dialog (Email/Password & Google).
- `account/UserProfileModal.tsx`: Dialog for viewing and updating personal profile data.
- `account/RetailerOnboardingModal.tsx`: Dialog for contractor trade application.
- `CartDrawer.tsx`: Shopping cart drawer and checkout order submission.
- `admin/AdminUserManagement.tsx`: Admin RBAC user directory and role assignment.
- `admin/AdminCompanyManagement.tsx`: Admin corporate directory and TRN database.

### Core Services & Contexts (`src/services/` & `src/context/`)
- `context/AuthContext.tsx`: Manages Firebase Auth state, user login/logout, and Firestore profile loading.
- `services/userService.ts`: CRUD operations for the `users` Firestore collection.
- `services/companyService.ts`: CRUD operations for corporate accounts in `companies`.
- `services/orderService.ts`: Order request submission and status tracking in `orders`.
- `services/pricingService.ts`: Calculates tier discounts (Retailer 10%, Platinum 15%).
- `lib/firebase.ts`: Initializes Firebase SDK, Auth, Firestore, and Storage.

---

## 12. Current Status Table

| Feature | Current Status | Code Location | Key Notes |
| :--- | :--- | :--- | :--- |
| **Login (Email/PW & Google)** | PARTIALLY COMPLETE | `AuthContext.tsx`, `LoginModal.tsx` | Works with Firebase, but needs strict error feedback. |
| **Registration** | PARTIALLY COMPLETE | `AuthContext.tsx` | Creates user in Auth and Firestore; needs profile completion step. |
| **User Profile View & Edit** | PARTIALLY COMPLETE | `UserProfileModal.tsx` | Updates local state; needs direct Firestore sync on save. |
| **Saved Cart** | PARTIALLY COMPLETE | `CartDrawer.tsx`, `App.tsx` | Persists in browser `localStorage`; needs Firestore cloud sync. |
| **B2B Trade Application** | IMPLEMENTED BUT INCOMPLETE | `RetailerOnboardingModal.tsx` | Beautiful UI form exists, but does not yet write to Firestore. |
| **Admin B2B Approval** | COMPLETE | `AdminUserManagement.tsx` | Admins can view users and promote them to Retailer status. |
| **B2B Dedicated Portal** | NOT IMPLEMENTED | None | Needs a dedicated `#/retailer-portal` dashboard for approved retailers. |
| **User Permissions (RBAC)** | COMPLETE (Frontend) | `types.ts`, `userService.ts` | 5 roles defined (`customer`, `retailer`, `sales`, `admin`, `superAdmin`). |
| **Security Rules** | NEEDS IMPROVEMENT | `firestore.rules` | Rules currently allow open access (`|| true`) and must be hardened. |

---

## 13. Problems Found (Ranked by Severity)

### 🔴 CRITICAL
1. **Unrestricted Firestore Security Rules:** `firestore.rules` contains permissive wildcards that allow unauthorized writes.
2. **B2B Application Data Loss:** Submitted contractor applications in `RetailerOnboardingModal` are not saved to the database.

### 🟠 HIGH
3. **Dual State Disconnect:** `App.tsx` uses `localStorage` (`b2bUser`) while `AuthContext.tsx` uses Firebase Auth (`profile`). They must be unified into a single source of truth.
4. **Swallowed Auth Errors:** `LoginModal.tsx` creates mock login states even when Firebase authentication fails.
5. **No Password Reset:** Users who forget their password cannot recover their account without admin intervention.

### 🟡 MEDIUM
6. **Cart Tied to Email String:** Cart is stored by email key in browser storage rather than being synced to the user's cloud account.
7. **No Customer Order History Screen:** Customers who place orders cannot view their previous order statuses on the website.

### 🟢 LOW
8. **Avatar Images:** User avatars default to initial letters; no custom avatar image upload feature exists.

---

## 14. Recommended Future Architecture

```text
================================================================================
                    UNIFIED ARCHITECTURE BLUEPRINT
================================================================================

1. AUTHENTICATION (Firebase Auth)
   └── Single Source of Truth for identity (UID, Email, Auth Token)

2. USER PROFILE (Firestore: users/{uid})
   ├── uid (matches Auth UID)
   ├── role: 'customer' | 'retailer' | 'sales' | 'admin'
   ├── b2bStatus: 'not_applied' | 'pending' | 'approved' | 'rejected'
   ├── companyId: Reference to companies/{companyId}
   └── cart: Sub-collection or array of active cart items (Cloud-synced)

3. CORPORATE ENTITY (Firestore: companies/{companyId})
   ├── companyName, legalName, taxId (TRN)
   ├── documents (Trade license URL in Firebase Storage)
   ├── wholesaleTier ('Standard', 'Silver', 'Gold', 'Platinum')
   └── creditLimit, paymentTerms ('net30', 'net60', 'advance')

4. B2B RETAILER PORTAL (Route: #/retailer-portal)
   ├── Real-time Wholesale Price Sheet
   ├── Line of Credit & Statement Overview
   ├── Past Order Requests & Status Tracker (NEW -> UNDER_REVIEW -> CONFIRMED)
   └── Fast Bulk Procurement Table
================================================================================
```

---

## 15. Implementation Roadmap

When you are ready to proceed, here is the recommended sequence of implementation:

1. **Step 1 — Unify Authentication & State:** Connect `LoginModal.tsx` strictly to `AuthContext.tsx`, ensure genuine error reporting, and eliminate duplicate `localStorage` auth hacks.
2. **Step 2 — Wire Up the B2B Application Form:** Connect `RetailerOnboardingModal.tsx` to Firestore so contractor applications are stored under `companies` and set the user's `b2bStatus` to `pending`.
3. **Step 3 — Admin Review & Approval Queue:** Connect the admin panel so administrators receive notifications of pending contractor applications and can approve/reject them with one click.
4. **Step 4 — Cloud Cart Sync:** Move saved carts from browser storage into Firestore under `users/{uid}/cart` so carts sync across all devices.
5. **Step 5 — Customer Account & Order History Portal:** Create a dedicated dashboard where customers and B2B retailers can view their profile, past orders, RFQ quotes, and wholesale pricing tiers.
6. **Step 6 — Security Hardening:** Update and deploy strict Firestore security rules that prevent unauthorized access.
