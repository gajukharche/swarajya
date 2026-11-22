import { MeiliSearch } from 'meilisearch';

const MEILISEARCH_HOST = process.env.MEILISEARCH_HOST || 'http://localhost:7700';
const MEILISEARCH_MASTER_KEY = process.env.MEILISEARCH_MASTER_KEY || 'meilimasterkey1234567890';

let meiliClientInstance: MeiliSearch | null = null;

export function getMeiliClient(): MeiliSearch {
  if (!meiliClientInstance) {
    meiliClientInstance = new MeiliSearch({
      host: MEILISEARCH_HOST,
      apiKey: MEILISEARCH_MASTER_KEY,
    });
  }
  return meiliClientInstance;
}

export const PRODUCTS_INDEX = 'products';
