import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth/session';
import { parseCsv, productCsvRowSchema } from '@/lib/csv/product-csv-schema';
import { syncProductToMeili } from '@/lib/search/sync';

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No CSV file provided.' }, { status: 400 });
    }

    const text = await file.text();
    const rawRows = parseCsv(text);

    if (rawRows.length === 0) {
      return NextResponse.json({ error: 'The CSV file is empty or formatted incorrectly.' }, { status: 400 });
    }

    // Group rows by handle
    const productsByHandle: Record<string, typeof rawRows> = {};
    for (const row of rawRows) {
      const handle = (row['Handle'] || row['handle'] || '').trim().toLowerCase();
      if (!handle) continue;
      if (!productsByHandle[handle]) {
        productsByHandle[handle] = [];
      }
      productsByHandle[handle].push(row);
    }

    let importedCount = 0;
    const errors: string[] = [];

    // Process in batches
    for (const [handle, rows] of Object.entries(productsByHandle)) {
      try {
        const firstRow = rows[0];
        const title = firstRow['Title'] || firstRow['title'] || handle;
        const description = firstRow['Description'] || firstRow['description'] || '';
        const vendor = firstRow['Vendor'] || firstRow['vendor'] || '';
        const productType = firstRow['Type'] || firstRow['productType'] || '';
        const tagsString = firstRow['Tags'] || firstRow['tags'] || '';
        const tags = tagsString
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean);

        // Upsert Product
        const product = await prisma.product.upsert({
          where: { handle },
          update: {
            title,
            description,
            vendor,
            productType,
            tags,
            status: 'ACTIVE',
          },
          create: {
            handle,
            title,
            description,
            vendor,
            productType,
            tags,
            status: 'ACTIVE',
          },
        });

        // Insert/Upsert Variants
        for (const row of rows) {
          const sku = row['Variant SKU'] || row['sku'] || `${handle}-${Math.random().toString(36).substring(7)}`;
          const rawPrice = parseFloat(row['Variant Price'] || row['price'] || '29.99');
          const priceCents = Math.round(rawPrice * 100);
          const rawCompare = parseFloat(row['Variant Compare Price'] || row['compareAtPrice'] || '0');
          const compareAtPriceCents = rawCompare > 0 ? Math.round(rawCompare * 100) : null;
          const inventory = parseInt(row['Variant Inventory'] || row['inventoryQuantity'] || '10', 10);
          const variantTitle = row['Variant Title'] || row['title'] || 'Default';

          await prisma.productVariant.upsert({
            where: { sku },
            update: {
              title: variantTitle,
              priceCents,
              compareAtPriceCents,
              inventoryQuantity: inventory,
            },
            create: {
              productId: product.id,
              sku,
              title: variantTitle,
              priceCents,
              compareAtPriceCents,
              inventoryQuantity: inventory,
            },
          });
        }

        await syncProductToMeili(product.id);
        importedCount++;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Unknown error';
        errors.push(`Error on handle "${handle}": ${msg}`);
      }
    }

    return NextResponse.json({
      success: true,
      importedProducts: importedCount,
      errors,
    });
  } catch (error: unknown) {
    console.error('CSV import route error:', error);
    return NextResponse.json({ error: 'Failed to process CSV file.' }, { status: 500 });
  }
}
