import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { StorefrontHeader } from '@/components/storefront/header';
import { PdpClient } from '@/components/storefront/pdp-client';
import { PdpJsonLd } from '@/components/storefront/pdp-json-ld';
import { MOCK_PRODUCTS } from '@/lib/products/mock-catalog';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;

  let product = null;
  try {
    product = await prisma.product.findUnique({
      where: { handle },
      include: {
        options: {
          include: { values: true },
          orderBy: { position: 'asc' },
        },
        variants: {
          orderBy: { createdAt: 'asc' },
        },
        media: {
          orderBy: { position: 'asc' },
        },
      },
    });
  } catch {
    // Database connection fallback during build
  }

  if (!product) {
    const mock = MOCK_PRODUCTS.find((p) => p.handle === handle);
    if (mock) {
      product = mock;
    }
  }

  if (!product) {
    notFound();
  }

  return (
    <div className="min-h-screen flex flex-col bg-zinc-950 text-white">
      <StorefrontHeader />

      <PdpJsonLd product={product} />

      <main className="max-w-7xl mx-auto px-6 py-12 w-full flex-1">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-zinc-500 mb-8">
          <Link href="/" className="hover:text-white">Home</Link>
          <span>/</span>
          <Link href="/collections/all" className="hover:text-white">Catalog</Link>
          <span>/</span>
          <span className="text-white truncate">{product.title}</span>
        </div>

        <PdpClient product={product} />
      </main>
    </div>
  );
}
