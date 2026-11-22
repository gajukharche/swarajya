# Project: Single-Merchant E-Commerce Platform (Shopify Parity)

## Overview
A bespoke, self-hosted, production-grade single-merchant e-commerce platform delivering functional parity with Shopify's core commerce engine, merchant admin dashboard, and customizable storefront—without SaaS transaction fees or platform vendor lock-in.

## Target Scale & Performance Metrics
- **Catalog Scale:** 2,000–5,000 Products with multi-variant matrices.
- **Storefront TTFB:** < 100ms via Next.js 16 Server Components, ISR, and On-Demand Cache Revalidation (`revalidateTag`).
- **Search & Filter Latency:** < 50ms via Meilisearch v1.12+ facets.
- **Inventory Concurrency:** 0% oversell under high-concurrency flash sales via PostgreSQL 17 row-level locks and `InventoryReservation` table.
- **Payment Reliability:** 100% idempotent order finalization via Stripe v23+ webhook deduplication.

## Modern Tech Stack (Latest 2026 Editions)
- **Framework:** Next.js 16 (App Router, Turbopack, Server Actions), React 19 (`useOptimistic`, `useActionState`), TypeScript (`strict: true`)
- **Styling & Components:** Tailwind CSS v4, shadcn/ui, Lucide Icons
- **Primary Database & ORM:** PostgreSQL 17 (Alpine) with Prisma ORM 7.x
- **Search Engine:** Meilisearch v1.12+ (typo-tolerant predictive search & multi-facet filtering)
- **Cache & Ephemeral Storage:** Redis 7.4 / Valkey 8.0 (ephemeral cart sessions, rate-limiting)
- **Client State:** Zustand 5.x
- **Object Storage:** Cloudflare R2 via AWS SDK v3 (`@aws-sdk/client-s3` v3.x, presigned browser uploads)
- **Payments:** Stripe SDK v23.x (`PaymentIntents`, `PaymentElement`, webhooks)
- **Background Jobs:** Trigger.dev v3 / Inngest (email notifications, Meilisearch sync, CSV imports)

## Source of Truth Documents
- [PRD Specification](file:///e:/Vibe%20Coding/Project%208%20-%20shopify%20like%20ecommece/e_commerce_platform_prd.md)
