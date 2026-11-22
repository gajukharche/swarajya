import { prisma } from '@/lib/prisma';
import { CollectionForm } from '@/components/admin/collection-form';

export const dynamic = 'force-dynamic';

export default async function NewCollectionPage() {
  let products: Array<{ id: string; title: string; handle: string }> = [];

  try {
    products = await prisma.product.findMany({
      where: { status: 'ACTIVE' },
      select: { id: true, title: true, handle: true },
      orderBy: { title: 'asc' },
    });
  } catch {}

  return <CollectionForm availableProducts={products} />;
}
