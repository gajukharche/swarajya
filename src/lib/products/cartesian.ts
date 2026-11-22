export interface ProductOptionInput {
  id?: string;
  name: string;
  position: number;
  values: string[];
}

export interface GeneratedVariant {
  title: string;
  sku: string;
  priceCents: number;
  compareAtPriceCents?: number;
  costPerItemCents?: number;
  inventoryQuantity: number;
  barcode?: string;
  weightGrams?: number;
  optionValues: Record<string, string>;
}

export function generateCartesianVariants(
  options: ProductOptionInput[],
  baseSku: string = 'ITEM',
  defaultPriceCents: number = 2999
): GeneratedVariant[] {
  const activeOptions = options.filter(
    (opt) => opt.name.trim() !== '' && opt.values.length > 0
  );

  if (activeOptions.length === 0) {
    return [
      {
        title: 'Default Title',
        sku: `${baseSku.toUpperCase()}-DEF`,
        priceCents: defaultPriceCents,
        inventoryQuantity: 10,
        optionValues: {},
      },
    ];
  }

  // Cartesian product accumulator
  let combinations: Array<Record<string, string>> = [{}];

  for (const option of activeOptions) {
    const nextCombinations: Array<Record<string, string>> = [];
    for (const combination of combinations) {
      for (const val of option.values) {
        nextCombinations.push({
          ...combination,
          [option.name]: val,
        });
      }
    }
    combinations = nextCombinations;
  }

  return combinations.map((combo) => {
    const titleParts = activeOptions.map((opt) => combo[opt.name]);
    const title = titleParts.join(' / ');
    
    // Generate clean SKU abbreviation (e.g. APX-BLK-M)
    const skuSuffix = titleParts
      .map((part) => part.replace(/[^a-zA-Z0-9]/g, '').slice(0, 3).toUpperCase())
      .join('-');
    const sku = `${baseSku.toUpperCase()}-${skuSuffix}`;

    return {
      title,
      sku,
      priceCents: defaultPriceCents,
      inventoryQuantity: 10,
      optionValues: combo,
    };
  });
}
