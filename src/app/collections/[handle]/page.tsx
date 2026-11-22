import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { StorefrontHeader } from '@/components/storefront/header';
import { FacetFilters } from '@/components/storefront/facet-filters';
import { ProductCard } from '@/components/storefront/product-card';
import { notFound } from 'next/navigation';
import { MOCK_PRODUCTS } from '@/lib/products/mock-catalog';
import { Prisma } from '@prisma/client';

export const dynamic = 'force-dynamic';

export default async function CollectionPage({
  params,
  searchParams,
}: {
  params: Promise<{ handle: string }>;
  searchParams: Promise<{
    sort?: string;
    inStock?: string;
    minPrice?: string;
    maxPrice?: string;
  }>;
}) {
  const { handle } = await params;
  const query = await searchParams;

  const isAll = handle === 'all';

  let collection: { title: string; description: string | null } | null = null;
  if (!isAll) {
    try {
      collection = await prisma.collection.findUnique({
        where: { handle },
        select: { title: true, description: true },
      });
      if (!collection) notFound();
    } catch {
      // Database connection fallback during build
    }
  }

  // Build filter criteria
  const where: Prisma.ProductWhereInput = {
    status: 'ACTIVE',
  };

  if (!isAll && collection) {
    where.collections = {
      some: {
        collection: { handle },
      },
    };
  }

  if (query.inStock === 'true') {
    where.variants = {
      some: {
        inventoryQuantity: { gt: 0 },
      },
    };
  }

  if (query.minPrice || query.maxPrice) {
    const minCents = query.minPrice ? Math.round(parseFloat(query.minPrice) * 100) : undefined;
    const maxCents = query.maxPrice ? Math.round(parseFloat(query.maxPrice) * 100) : undefined;

    where.variants = {
      some: {
        priceCents: {
          gte: minCents,
          lte: maxCents,
        },
      },
    };
  }

  let products: Array<{
    id: string;
    title: string;
    handle: string;
    vendor: string | null;
    variants: Array<{ priceCents: number; inventoryQuantity: number }>;
    media: Array<{ url: string }>;
  }> = [];

  try {
    products = await prisma.product.findMany({
      where,
      include: {
        variants: true,
        media: { take: 1 },
      },
      orderBy:
        query.sort === 'price_desc'
          ? { variants: { _count: 'desc' } }
          : { createdAt: 'desc' },
    });
  } catch {}

  // Fallback to rich mock catalog when database has no records yet
  if (products.length === 0) {
    let list = [...MOCK_PRODUCTS];

    if (query.inStock === 'true') {
      list = list.filter((p) => p.variants.some((v) => v.inventoryQuantity > 0));
    }
    if (query.minPrice) {
      const minCents = Math.round(parseFloat(query.minPrice) * 100);
      list = list.filter((p) => p.variants.some((v) => v.priceCents >= minCents));
    }
    if (query.maxPrice) {
      const maxCents = Math.round(parseFloat(query.maxPrice) * 100);
      list = list.filter((p) => p.variants.some((v) => v.priceCents <= maxCents));
    }
    if (query.sort === 'price_asc') {
      list.sort((a, b) => a.variants[0].priceCents - b.variants[0].priceCents);
    } else if (query.sort === 'price_desc') {
      list.sort((a, b) => b.variants[0].priceCents - a.variants[0].priceCents);
    }

    products = list.map((p) => ({
      id: p.id,
      title: p.title,
      handle: p.handle,
      vendor: p.vendor,
      variants: p.variants.map((v) => ({
        priceCents: v.priceCents,
        inventoryQuantity: v.inventoryQuantity,
      })),
      media: p.media.map((m) => ({ url: m.url })),
    }));
  }

  const title = isAll ? 'All Catalog Products' : collection?.title || handle;

  return (
    <div className="min-h-screen flex flex-col bg-zinc-950 text-white">
      <StorefrontHeader />

      <main className="max-w-7xl mx-auto px-6 py-12 w-full flex-1">
        {/* Breadcrumb & Header */}
        <div className="mb-8 space-y-2">
          <div className="flex items-center gap-2 text-xs text-zinc-500">
            <Link href="/" className="hover:text-white">Home</Link>
            <span>/</span>
            <Link href="/collections/all" className="hover:text-white">Collections</Link>
            <span>/</span>
            <span className="text-white capitalize">{title}</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white capitalize">{title}</h1>
          <p className="text-sm text-zinc-400">
            {products.length} item{products.length === 1 ? '' : 's'} available
          </p>
        </div>

        {/* Content Layout */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Facets Sidebar */}
          <aside className="md:col-span-1">
            <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-5 sticky top-24">
              <FacetFilters />
            </div>
          </aside>

          {/* Product Grid */}
          <div className="md:col-span-3">
            {products.length === 0 ? (
              <div className="p-16 border border-dashed border-zinc-800 rounded-xl text-center text-zinc-500 text-sm">
                No products found matching the selected filters.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
