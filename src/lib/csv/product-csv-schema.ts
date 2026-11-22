import { z } from 'zod';

export const productCsvRowSchema = z.object({
  handle: z.string().min(1),
  title: z.string().min(1),
  description: z.string().optional().default(''),
  vendor: z.string().optional().default(''),
  productType: z.string().optional().default(''),
  tags: z.string().optional().default(''),
  status: z.enum(['DRAFT', 'ACTIVE', 'ARCHIVED']).default('ACTIVE'),
  option1Name: z.string().optional().default(''),
  option1Value: z.string().optional().default(''),
  option2Name: z.string().optional().default(''),
  option2Value: z.string().optional().default(''),
  sku: z.string().min(1),
  priceCents: z.coerce.number().int().positive(),
  compareAtPriceCents: z.coerce.number().int().optional(),
  inventoryQuantity: z.coerce.number().int().default(0),
});

export type ProductCsvRow = z.infer<typeof productCsvRowSchema>;

export function parseCsv(csvText: string): Record<string, string>[] {
  const lines = csvText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map((h) => h.replace(/^["']|["']$/g, '').trim());
  const rows: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    // Basic comma splitter respecting quotes
    const values: string[] = [];
    let inQuotes = false;
    let currentValue = '';

    for (let c = 0; c < lines[i].length; c++) {
      const char = lines[i][c];
      if (char === '"' || char === "'") {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(currentValue.trim());
        currentValue = '';
      } else {
        currentValue += char;
      }
    }
    values.push(currentValue.trim());

    const row: Record<string, string> = {};
    for (let j = 0; j < headers.length; j++) {
      row[headers[j]] = (values[j] || '').replace(/^["']|["']$/g, '');
    }
    rows.push(row);
  }

  return rows;
}

export function serializeProductsToCsv(
  products: Array<{
    title: string;
    handle: string;
    description: string | null;
    vendor: string | null;
    productType: string | null;
    status: string;
    tags: string[];
    variants: Array<{
      title: string;
      sku: string;
      priceCents: number;
      compareAtPriceCents: number | null;
      inventoryQuantity: number;
    }>;
  }>
): string {
  const headers = [
    'Handle',
    'Title',
    'Description',
    'Vendor',
    'Type',
    'Tags',
    'Status',
    'Variant Title',
    'Variant SKU',
    'Variant Price',
    'Variant Compare Price',
    'Variant Inventory',
  ];

  const rows: string[] = [headers.join(',')];

  for (const p of products) {
    const escapedDesc = `"${(p.description || '').replace(/"/g, '""')}"`;
    const escapedTags = `"${p.tags.join(', ')}"`;

    for (const v of p.variants) {
      rows.push(
        [
          p.handle,
          `"${p.title.replace(/"/g, '""')}"`,
          escapedDesc,
          `"${(p.vendor || '').replace(/"/g, '""')}"`,
          `"${(p.productType || '').replace(/"/g, '""')}"`,
          escapedTags,
          p.status,
          `"${v.title.replace(/"/g, '""')}"`,
          v.sku,
          (v.priceCents / 100).toFixed(2),
          v.compareAtPriceCents ? (v.compareAtPriceCents / 100).toFixed(2) : '',
          v.inventoryQuantity.toString(),
        ].join(',')
      );
    }
  }

  return rows.join('\n');
}
