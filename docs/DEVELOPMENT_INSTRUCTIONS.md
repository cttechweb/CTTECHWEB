# Development Instructions & Rulebook — Cool Technologies

> **Purpose**: This document is the permanent engineering rulebook for the Cool Technologies platform. Every developer, architect, and AI assistant working on this codebase must strictly adhere to these 20 fundamental development principles.

---

## The 20 Fundamental Engineering Rules

### 1. Consult the Architecture Baseline First
**ALWAYS** read [`structure.md`](file:///Users/nafalkt/Documents/Websites/cool-technologies%20%283%29/structure.md) before designing, planning, or implementing any architectural change. Understand how data flows through the current system before adding or altering any component.

### 2. Follow Development Instructions Prior to Execution
**ALWAYS** read [`DEVELOPMENT_INSTRUCTIONS.md`](file:///Users/nafalkt/Documents/Websites/cool-technologies%20%283%29/DEVELOPMENT_INSTRUCTIONS.md) before beginning any significant feature development, schema migration, or service restructuring.

### 3. Zero Module Duplication
**NEVER** create a new module, component, or helper that duplicates an existing module. Search the codebase (`src/components`, `src/lib`, `src/services`, `src/data`) first.

### 4. Database Collection Integrity
**NEVER** create duplicate database collections or tables when an existing collection (`users`, `blogs`, `reviews`) can be extended safely and logically.

### 5. Document All Schema Migrations
**NEVER** change an existing database schema, collection field, or document structure without documenting the change in [`structure.md`](file:///Users/nafalkt/Documents/Websites/cool-technologies%20%283%29/structure.md) and logging it in [`ARCHITECTURE_CHANGELOG.md`](file:///Users/nafalkt/Documents/Websites/cool-technologies%20%283%29/ARCHITECTURE_CHANGELOG.md).

### 6. Dependency & Reference Protection
**NEVER** rename important collections, document fields, hash routes, API endpoints, or shared components without first inspecting all dependent files across the codebase.

### 7. Separation of Concerns
Keep business logic, database transactions, and data sanitization cleanly separated from UI presentational components wherever practical. Place database operations in `src/lib/` or `src/services/`.

### 8. Reusable Services & Component Design
Prefer creating centralized, reusable services (e.g. `orderService.ts`, `quoteService.ts`) and modular UI components rather than scattering one-off Firestore queries or duplicated UI elements across views.

### 9. Separation of Authentication & Authorization
Keep authentication (who the user is via Firebase Auth) strictly separated from authorization (what the user is permitted to do based on their verified role and claims). Never rely on client-side state flags for security-critical operations.

### 10. Configurable Business Rules
Do not hardcode business rules, tax rates, discount percentages, or SLA thresholds inside JSX elements when they should be driven by configuration objects, database constants, or admin settings.

### 11. Maintain Relational Integrity
Maintain clear, coherent relationships and foreign key references between:
- `Users`
- `Companies`
- `Products`
- `Quotes`
- `Orders`
- and future ERP/CRM business modules.

### 12. Keep Architecture Documentation Synchronized
Every architectural modification, new service introduction, or route addition must be promptly reflected in [`structure.md`](file:///Users/nafalkt/Documents/Websites/cool-technologies%20%283%29/structure.md).

### 13. Audit Schema Changes in Change Log
Every database schema change, field addition, or deprecation must be documented with rationale in [`ARCHITECTURE_CHANGELOG.md`](file:///Users/nafalkt/Documents/Websites/cool-technologies%20%283%29/ARCHITECTURE_CHANGELOG.md).

### 14. Systematic 5-Step Feature Workflow
Before writing code for any new feature:
1. **Inspect** existing architecture and codebase patterns.
2. **Identify** reusable components, types, and services.
3. **Identify** affected database structures and models.
4. **Identify** dependencies and downstream impacts.
5. **Implement** with high quality and zero regressions.

### 15. Do Not Rewrite Working Code Unnecessarily
Do not rewrite, refactor, or delete working modules simply for stylistic preferences unless an approved architectural decision or bug fix explicitly requires it.

### 16. Preserve Backward Compatibility
Preserve backward compatibility wherever practical, especially for stored localStorage formats, existing Firestore documents, and shared URLs/hash routes.

### 17. Minimalist Dependency Policy
Do not introduce unnecessary third-party npm libraries or heavy dependencies when a standard browser API or lightweight utility accomplishes the task.

### 18. Avoid Unnecessary Complexity
Design for simplicity, readability, and maintainability. Avoid premature over-engineering, deeply nested abstractions, or convoluted state mechanisms.

### 19. Prioritize Security & Data Integrity
Security, authentication validation, input sanitization, and data integrity always take priority over development speed or cosmetic shortcuts.

### 20. End-to-End Verification Before Deployment
Before any deployment or release, thoroughly test affected workflows end-to-end (authentication, cart, checkout, admin management, real-time listeners, responsive UI).

---

> [!NOTE]
> These development instructions provide the governing rules for future development phases and do not constitute permission to refactor existing working code during the audit phase.
