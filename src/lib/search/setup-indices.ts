import { getMeiliClient, PRODUCTS_INDEX } from './meilisearch';

export async function setupProductIndex(): Promise<boolean> {
  try {
    const client = getMeiliClient();
    const index = client.index(PRODUCTS_INDEX);

    // 1. Searchable attributes (ordered by relevance ranking)
    await index.updateSearchableAttributes([
      'title',
      'tags',
      'vendor',
      'productType',
      'description',
      'skus',
    ]);

    // 2. Filterable attributes for instant faceted search
    await index.updateFilterableAttributes([
      'id',
      'handle',
      'status',
      'tags',
      'vendor',
      'productType',
      'inStock',
      'minPriceCents',
      'maxPriceCents',
      'collectionHandles',
      'options.Size',
      'options.Color',
    ]);

    // 3. Sortable attributes
    await index.updateSortableAttributes([
      'minPriceCents',
      'createdAt',
      'title',
    ]);

    return true;
  } catch (err: unknown) {
    console.warn('Meilisearch setup notice (engine may be offline or initializing):', err);
    return false;
  }
}
