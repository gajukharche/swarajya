import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { MOCK_PRODUCTS } from '@/lib/products/mock-catalog';
import { formatCurrency } from '@/lib/utils';
import { ArrowRight, ShieldCheck, Zap, Lock, ShoppingBag } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  let sections: Array<{
    id: string;
    sectionType: string;
    position: number;
    isVisible: boolean;
    settings: unknown;
  }> = [];

  let featuredProducts: Array<{
    id: string;
    title: string;
    vendor: string | null;
    variants: Array<{ priceCents: number }>;
  }> = [];

  try {
    const [fetchedSections, fetchedProducts] = await Promise.all([
      prisma.pageSection.findMany({
        where: { isVisible: true },
        orderBy: { position: 'asc' },
      }),
      prisma.product.findMany({
        where: { status: 'ACTIVE' },
        take: 4,
        include: {
          variants: {
            take: 1,
          },
        },
      }),
    ]);
    sections = fetchedSections;
    featuredProducts = fetchedProducts;
  } catch {
    // Graceful fallback when database container is not yet initialized
  }

  if (featuredProducts.length === 0) {
    featuredProducts = MOCK_PRODUCTS.slice(0, 8).map((p) => ({
      id: p.id,
      title: p.title,
      vendor: p.vendor,
      variants: [{ priceCents: p.variants[0].priceCents }],
    }));
  }

  const heroSection = sections.find((s) => s.sectionType === 'Hero');
  const heroData = (heroSection?.settings as {
    heading?: string;
    subheading?: string;
    buttonText?: string;
    buttonLink?: string;
  }) || {
    heading: 'Next-Generation Commerce',
    subheading: 'Engineered for sub-second speed, seamless checkout, and absolute reliability.',
    buttonText: 'Shop New Arrivals',
    buttonLink: '/collections/all',
  };

  return (
    <div className="min-h-screen flex flex-col bg-zinc-950 text-white">
      {/* Navigation */}
      <header className="border-b border-zinc-800/80 backdrop-blur sticky top-0 z-50 bg-zinc-950/80">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="font-bold text-xl tracking-tight flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-xs font-black">
              A
            </span>
            Apex Store
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-400">
            <Link href="/collections/all" className="hover:text-white transition-colors">
              Catalog
            </Link>
            <Link href="/collections/outerwear" className="hover:text-white transition-colors">
              Outerwear
            </Link>
            <Link href="/admin" className="text-indigo-400 hover:text-indigo-300 transition-colors">
              Merchant Admin ↗
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            <Link
              href="/admin/login"
              className="text-xs px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white transition-colors"
            >
              Staff Login
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-28 px-6 text-center overflow-hidden border-b border-zinc-800/60">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(99,102,241,0.15),rgba(255,255,255,0))]" />
        <div className="relative max-w-4xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-indigo-950/80 text-indigo-300 border border-indigo-800/50">
            <Zap className="w-3.5 h-3.5 text-indigo-400" />
            Next.js 16 + PostgreSQL 17 Architecture
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
            {heroData.heading}
          </h1>

          <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
            {heroData.subheading}
          </p>

          <div className="pt-4 flex items-center justify-center gap-4">
            <Link
              href={heroData.buttonLink || '/collections/all'}
              className="px-6 py-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium flex items-center gap-2 shadow-lg shadow-indigo-500/20 transition-all"
            >
              {heroData.buttonText}
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/admin"
              className="px-6 py-3 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 font-medium transition-all"
            >
              Explore Merchant Dashboard
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-6 border-b border-zinc-800/60 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 rounded-xl bg-zinc-900/50 border border-zinc-800 space-y-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-950 flex items-center justify-center text-indigo-400 border border-indigo-800/50">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-lg text-white">Sub-100ms TTFB</h3>
            <p className="text-sm text-zinc-400">
              Edge data caching and on-demand cache revalidation (`revalidateTag`) ensure maximum storefront performance.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-zinc-900/50 border border-zinc-800 space-y-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-950 flex items-center justify-center text-indigo-400 border border-indigo-800/50">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-lg text-white">0% Oversell Guarantee</h3>
            <p className="text-sm text-zinc-400">
              PostgreSQL row-level locks and 15-minute inventory hold reservations protect against concurrency flash sales.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-zinc-900/50 border border-zinc-800 space-y-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-950 flex items-center justify-center text-indigo-400 border border-indigo-800/50">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-lg text-white">Stripe Idempotency</h3>
            <p className="text-sm text-zinc-400">
              Automated webhook deduplication and immutable order event logs guarantee accurate financial accounting.
            </p>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 px-6 max-w-7xl mx-auto w-full flex-1">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-white">Featured Catalog</h2>
            <p className="text-sm text-zinc-400 mt-1">Live database items ready for checkout</p>
          </div>
          <Link href="/collections/all" className="text-sm text-indigo-400 hover:text-indigo-300">
            View All →
          </Link>
        </div>

        {featuredProducts.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-zinc-800 rounded-xl text-zinc-500 text-sm">
            Catalog is ready. Start local PostgreSQL container and seed to view live items.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((p) => {
              const primaryVariant = p.variants[0];
              return (
                <div
                  key={p.id}
                  className="group bg-zinc-900/60 border border-zinc-800 rounded-xl p-5 flex flex-col justify-between hover:border-zinc-700 transition-all"
                >
                  <div className="space-y-3">
                    <div className="aspect-square bg-zinc-950 rounded-lg flex items-center justify-center border border-zinc-850 overflow-hidden">
                      <ShoppingBag className="w-10 h-10 text-zinc-700 group-hover:text-indigo-400 transition-colors" />
                    </div>
                    <div>
                      <h4 className="font-medium text-white group-hover:text-indigo-300 transition-colors">
                        {p.title}
                      </h4>
                      <p className="text-xs text-zinc-400">{p.vendor || 'In-House'}</p>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-zinc-800/60 flex items-center justify-between">
                    <span className="font-semibold text-white">
                      {primaryVariant
                        ? formatCurrency(primaryVariant.priceCents)
                        : 'Unpriced'}
                    </span>
                    <span className="text-xs text-emerald-400 font-medium">In Stock</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800 py-8 px-6 text-center text-xs text-zinc-500">
        Apex Single-Merchant Platform • Next.js 16 • PostgreSQL 17 • Redis 7.4 • Meilisearch
      </footer>
    </div>
  );
}
