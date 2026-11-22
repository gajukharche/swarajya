import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth/session';
import { serializeProductsToCsv } from '@/lib/csv/product-csv-schema';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const products = await prisma.product.findMany({
      include: {
        variants: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const csvContent = serializeProductsToCsv(products);

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="store-catalog-${Date.now()}.csv"`,
      },
    });
  } catch (err: unknown) {
    console.error('CSV export route error:', err);
    return NextResponse.json({ error: 'Failed to export catalog.' }, { status: 500 });
  }
}
