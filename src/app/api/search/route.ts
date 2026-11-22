import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getMeiliClient, PRODUCTS_INDEX } from '@/lib/search/meilisearch';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q') || '';

  if (!q.trim()) {
    return NextResponse.json({ products: [] });
  }

  // Attempt Meilisearch predictive query
  try {
    const client = getMeiliClient();
    const index = client.index(PRODUCTS_INDEX);
    const searchRes = await index.search(q, {
      limit: 6,
      filter: ['status = ACTIVE'],
    });

    if (searchRes.hits && searchRes.hits.length > 0) {
      return NextResponse.json({
        products: searchRes.hits.map((hit) => ({
          id: hit.id,
          title: hit.title,
          handle: hit.handle,
          minPriceCents: hit.minPriceCents,
          primaryImageUrl: hit.primaryImageUrl,
        })),
      });
    }
  } catch {
    // Meilisearch offline, fallback to PostgreSQL Prisma query
  }

  // Database fallback
  try {
    const products = await prisma.product.findMany({
      where: {
        status: 'ACTIVE',
        OR: [
          { title: { contains: q, mode: 'insensitive' } },
          { handle: { contains: q, mode: 'insensitive' } },
        ],
      },
      take: 6,
      include: {
        variants: { take: 1 },
        media: { take: 1 },
      },
    });

    return NextResponse.json({
      products: products.map((p) => ({
        id: p.id,
        title: p.title,
        handle: p.handle,
        minPriceCents: p.variants[0]?.priceCents || 0,
        primaryImageUrl: p.media[0]?.url || null,
      })),
    });
  } catch {
    return NextResponse.json({ products: [] });
  }
}
