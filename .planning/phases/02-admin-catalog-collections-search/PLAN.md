# Phase 2 Plan: Admin Catalog, Collections & Search Indexing

## Phase Goal
Implement full merchant catalog management in `/admin`, including product & variant generation with Cartesian options, smart & manual collection rule engines, background CSV bulk imports, and real-time Meilisearch index synchronization.

---

## Architecture & Work Breakdown

```mermaid
flowchart TD
    subgraph S1["Task 2.1: Product & Variant CRUD"]
        A1["Product Editor UI (Status, SEO, Media)"] --> A2["Cartesian Option Matrix Generator"]
        A2 --> A3["Variant Bulk Pricing & Stock Editor"]
    end
    subgraph S2["Task 2.2: Collections Engine"]
        B1["Manual Collection Manager"] --> B2["Smart Collection AST Rule Evaluator"]
        B2 --> B3["Auto-Membership Update Triggers"]
    end
    subgraph S3["Task 2.3: CSV Import/Export"]
        C1["Streaming CSV Parser & Validator"] --> C2["Background Worker Batch Processor"]
    end
    subgraph S4["Task 2.4: Meilisearch Pipeline"]
        D1["Index Schema & Facet Configuration"] --> D2["Transactional Sync Hooks"]
        D2 --> D3["Cache Invalidation (revalidateTag)"]
    end
```

---

## Detailed Tasks

### Task 2.1: Admin Product & Variant Cartesian Matrix CRUD
- **Objective:** Build full catalog management with multi-attribute option matrix generation.
- **Files to Create/Modify:**
  - `src/app/admin/products/page.tsx` (Filterable product table with search & bulk actions)
  - `src/app/admin/products/new/page.tsx` & `src/app/admin/products/[id]/page.tsx` (Product form)
  - `src/components/admin/variant-matrix-generator.tsx` (Generates all variant combinations from Options e.g. Size × Color)
  - `src/components/admin/variant-table.tsx` (Inline spreadsheet-style editor for SKU, price, inventory, barcode)
  - `src/app/admin/products/actions.ts` (Server actions for atomic product + variant updates)
- **Key Logic:**
  - Automated Cartesian product generation:
    $$\text{Variants} = O_1 \times O_2 \times \dots \times O_n$$
  - Preserves existing variant IDs, prices, and stock counts when new options/values are added or removed.
- **Verification:**
  - Creating a product with 3 sizes and 2 colors creates 6 variants with unique SKUs and correct price/stock values.

---

### Task 2.2: Collections Engine (Manual & Smart Rule Evaluator)
- **Objective:** Implement manual collection ordering and dynamic smart collection rule evaluation.
- **Files to Create/Modify:**
  - `src/app/admin/collections/page.tsx` (Collections list)
  - `src/app/admin/collections/[id]/page.tsx` (Collection editor)
  - `src/lib/collections/smart-rules.ts` (AST rule evaluator)
  - `src/app/admin/collections/actions.ts`
- **Smart Rule Evaluation Schema:**
  - Fields: `title`, `tag`, `priceCents`, `vendor`, `inventoryQuantity`
  - Operators: `EQUALS`, `NOT_EQUALS`, `GREATER_THAN`, `LESS_THAN`, `CONTAINS`, `STARTS_WITH`
  - Combinator: `ALL` (AND) or `ANY` (OR)
- **Verification:**
  - Saving a smart collection with `priceCents < 5000 AND tag == 'sale'` automatically queries and associates matching products.

---

### Task 2.3: Streaming CSV Import & Export Worker
- **Objective:** Support high-throughput bulk catalog updates without HTTP request timeouts.
- **Files to Create/Modify:**
  - `src/lib/csv/product-csv-schema.ts` (Zod schema for Shopify-standard product CSV format)
  - `src/app/api/admin/products/import/route.ts` (Multipart file upload handler)
  - `src/app/api/admin/products/export/route.ts` (Streaming CSV response generator)
  - `src/lib/jobs/csv-import-job.ts` (Batch insertion worker in chunks of 100 rows)
- **Verification:**
  - Importing a 1,000-row CSV inserts products and variants in chunks with atomic error rollback reporting.

---

### Task 2.4: Meilisearch Index Sync & Cache Invalidation
- **Objective:** Keep Meilisearch search indexes and Next.js cache tags in sync with database mutations.
- **Files to Create/Modify:**
  - `src/lib/search/meilisearch.ts` (Meilisearch client singleton)
  - `src/lib/search/sync.ts` (Sync product document: ID, title, handle, description, tags, price min/max, inStock, facets)
  - `src/lib/search/setup-indices.ts` (Configure searchable, filterable, and sortable attributes)
- **Index Configuration:**
  - Filterable: `tags`, `vendor`, `inStock`, `minPriceCents`, `maxPriceCents`, `collectionHandles`, `options.Size`, `options.Color`
  - Sortable: `minPriceCents`, `createdAt`, `title`
- **Verification:**
  - Mutating a product in `/admin` updates Meilisearch document within 100ms and calls `revalidateTag('product:${handle}')`.

---

## Phase 2 Acceptance Gates
1. [ ] Admin can create, update, and archive products with multiple options and variants.
2. [ ] Cartesian variant table correctly generates and preserves unique SKUs and prices.
3. [ ] Smart Collections accurately query matching products based on JSON AST rules.
4. [ ] CSV import successfully processes catalog batches with validation error reporting.
5. [ ] Search index reflects changes immediately and supports faceted queries.
