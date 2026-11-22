# Product Requirements Document (PRD): Production-Grade Single-Merchant E-Commerce Platform

| Metadata | Details |
| :--- | :--- |
| **Document Status** | Draft v1.0 |
| **Author** | Principal Full-Stack Software Architect & E-Commerce Systems Engineer |
| **Target Scale** | 2,000–5,000 Products / Sub-second Storefront Latency |
| **Core Reference** | Shopify Functional Parity (Single-Merchant Architecture) |

---

## 1. Executive Summary & Objectives

### 1.1 Vision
Build a bespoke, self-hosted, production-grade single-merchant e-commerce platform delivering full functional parity with Shopify's core commerce engine, merchant admin, and customizable storefront—without SaaS transaction fees or platform lock-in.

### 1.2 Success Metrics & Performance Targets
* **Storefront Time to First Byte (TTFB):** < 100ms via Next.js Incremental Static Regeneration (ISR) and On-Demand Cache Revalidation (`revalidateTag`).
* **Search & Facet Filtering Latency:** < 50ms end-to-end via Meilisearch.
* **Inventory Integrity:** 0% oversell rate under high concurrency (flash sales) via Redis distributed locks and PostgreSQL row-level transactions.
* **Payment Reliability:** 100% idempotent order finalization via Stripe webhook deduplication.

---

## 2. System Architecture & Tech Stack

### 2.1 Technology Stack
* **Frontend & Full-Stack Framework:** Next.js (App Router), React, TypeScript (`strict: true`)
* **UI & Styling:** Tailwind CSS, shadcn/ui, Lucide Icons
* **Primary Database & ORM:** PostgreSQL with Prisma ORM
* **Search & Merchandising Engine:** Meilisearch (instant predictive search, typo tolerance, multi-facet filtering)
* **Caching, Cart & Locking:** Upstash Redis (ephemeral cart sessions, distributed inventory reservation TTLs, rate limiting)
* **Payment Processing:** Stripe SDK (`PaymentIntents`, `PaymentElement`, idempotent webhook handlers)
* **Object Storage:** Cloudflare R2 (S3-compatible API with presigned browser uploads)
* **Asynchronous Background Workers:** Queue worker architecture (BullMQ / Inngest / Trigger.dev) for transactional emails, Meilisearch index syncing, and bulk CSV imports/exports

### 2.2 High-Level Data Flow
1. **Storefront Reads:** Served from Next.js Edge/Data Cache tagged by entity (`product:{handle}`, `collection:{handle}`, `store:layout`).
2. **Storefront Search:** Queries hit Meilisearch directly for faceted filtering and autocomplete, returning product handles/IDs hydrated with live pricing/availability.
3. **Checkout & Inventory Hold:** Checkout initiation acquires a Redis/DB stock reservation hold (`expiresAt = now + 15m`), creates a Stripe `PaymentIntent`, and locks inventory rows inside a PostgreSQL transaction upon webhook confirmation (`payment_intent.succeeded`).
4. **Admin Mutations:** Admin updates write to PostgreSQL, enqueue a background job to sync Meilisearch, and call `revalidateTag()` to purge stale storefront pages immediately.

---

## 3. Functional Requirements

### 3.1 Storefront (`/`)
| Module | Requirements & Acceptance Criteria |
| :--- | :--- |
| **Dynamic Home & Theme Engine** | Renders JSON-driven `PageSection` blocks (`Hero`, `FeaturedCollection`, `PromotionalBanner`, `FAQ`) configured in `/admin`. |
| **Collections & Search** | URL-synced search params (`?price=10-50&color=black&inStock=true&sort=price_asc&page=2`) backed by Meilisearch facets and cursor/offset pagination. |
| **Product Detail Page (`/products/[handle]`)** | Interactive option matrix (`Size`, `Color`, etc.) resolving exact `ProductVariant` SKU, `price`, `compareAtPrice`, live stock status, and variant-mapped `ProductMedia`. Includes `Product` + `Offer` JSON-LD structured data. |
| **Cart Drawer & Checkout** | Slide-over cart backed by Redis session ID (merged with `Customer` record on login) with optimistic UI updates. Checkout supports guest or authenticated flows, shipping rate calculation, discount validation, and Stripe `PaymentElement`. |
| **Customer Account (`/account`)** | Magic-link and email/password authentication; views for order history, real-time `Fulfillment` tracking numbers, and saved `Address` book. |

### 3.2 Merchant Admin Dashboard (`/admin`)
Protected by Role-Based Access Control (RBAC: `OWNER`, `ADMIN`, `STAFF`).

| Module | Requirements & Acceptance Criteria |
| :--- | :--- |
| **Analytics Dashboard** | Time-series charts for Gross/Net Sales, Order Volume, Average Order Value (AOV), and Top-Selling Products leaderboard. |
| **Catalog Management** | Full Product CRUD, automated Cartesian-product variant matrix generator, bulk status actions (`ACTIVE`, `DRAFT`, `ARCHIVED`), background CSV import/export, and live Google SERP SEO preview. |
| **Collections Engine** | Support for **Manual Collections** (explicit product linking) and **Smart Collections** (dynamic rule evaluation, e.g., `tag == 'summer' AND price < 50`). |
| **Inventory Management** | Inline spreadsheet-style quantity editor executing atomic Prisma transactions with audit logging and configurable low-stock alert thresholds. |
| **Order Management & Fulfillment** | Filterable order table (`Unfulfilled`, `Unpaid`, `Archived`), detailed order view with immutable `OrderEvent` audit timeline, fulfillment modal (carrier + tracking URL), and partial/full Stripe `Refund` execution. |
| **Discounts & Promotions** | Rule builder supporting `PERCENTAGE`, `FIXED_AMOUNT`, `FREE_SHIPPING`, and `BUY_X_GET_Y`, with usage limits, minimum subtotal requirements, and active date windows. |
| **Customer CRM** | Customer directory calculating Lifetime Value (LTV), total order count, average order value, and full order history. |
| **Online Store Customizer** | Visual block editor to add, reorder (drag-and-drop), toggle visibility, and edit JSON properties of homepage sections with a live split-pane preview. |

---

## 4. Database Schema Specification (Core Entities)

* **`Product` / `ProductOption` / `ProductVariant` / `ProductMedia`:** Normalized 1:N hierarchy. `ProductVariant` holds `sku` (unique), `barcode`, `price` (stored in integer cents), `compareAtPrice`, `costPerItem`, `weightGrams`, `inventoryQuantity`, and `reservedQuantity`.
* **`Collection` / `CollectionProduct`:** Includes `type` (`MANUAL` | `SMART`) and `rules` (`JsonB` rule AST for smart collections).
* **`Cart` / `CartItem`:** Hybrid Redis + PostgreSQL persistence for abandoned cart recovery and fast mutations.
* **`Order` / `OrderItem` / `Fulfillment` / `Refund` / `OrderEvent`:** Immutable financial ledger capturing line-item snapshots (`title`, `sku`, `unitPrice` at time of purchase), Stripe `paymentIntentId` (unique), and chronological state transitions.
* **`Customer` / `Address`:** Customer profile linked to orders and default shipping/billing addresses.
* **`Discount`:** Discount code, type, value, constraints (`minPurchaseCents`, `maxUses`, `usedCount`), and schedule (`startsAt`, `endsAt`).
* **`StoreSetting` / `PageSection`:** Key-value store configuration (currency, tax rate, shipping zones) and ordered JSON section definitions.

---

## 5. Non-Functional & Engineering Constraints

1. **Concurrency & Oversell Prevention:**
   * Checkout initiation creates an `InventoryReservation` record with a 15-minute expiration and increments `reservedQuantity` inside a `SERIALIZABLE` or row-locked (`SELECT ... FOR UPDATE`) transaction where `inventoryQuantity - reservedQuantity >= requestedQty`.
   * Expired reservations are reclaimed via a scheduled background sweep job.
2. **Strict Idempotency:**
   * Every Stripe webhook event ID (`evt_...`) is recorded in a `ProcessedWebhookEvent` table within the same database transaction that creates/updates the `Order`. Duplicate webhook deliveries return `200 OK` immediately without side effects.
   * Order creation endpoints require an `Idempotency-Key` header.
3. **Cache Invalidation Discipline:**
   * All storefront data fetches declare explicit `next: { tags: [...] }`.
   * Admin mutations call `revalidateTag()` for the mutated entity and affected collections immediately after transaction commit.

---

## 6. Phased Implementation Roadmap

* **Milestone 1: Foundation, Schema & Media Pipeline** — Next.js App Router setup, Prisma schema migration, RBAC auth, and Cloudflare R2 presigned upload service.
* **Milestone 2: Admin Catalog, Collections & Search Sync** — Product/Variant CRUD, Smart Collection rule evaluator, CSV worker, and Meilisearch indexing pipeline.
* **Milestone 3: Storefront & Theme Customizer** — JSON `PageSection` renderer, `/admin` customizer with live preview, Meilisearch faceted collection pages, and PDP variant resolver.
* **Milestone 4: Cart, Inventory Locks & Stripe Checkout** — Upstash Redis cart, atomic inventory reservation holds, Stripe `PaymentElement`, and idempotent webhook order finalization.
* **Milestone 5: Post-Purchase Operations & Analytics** — Admin fulfillment/refund workflows, customer `/account` portal, discount engine, and sales analytics dashboard.