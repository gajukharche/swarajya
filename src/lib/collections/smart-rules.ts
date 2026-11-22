import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export type RuleField = 'title' | 'tag' | 'priceCents' | 'vendor' | 'inventoryQuantity';
export type RuleOperator =
  | 'EQUALS'
  | 'NOT_EQUALS'
  | 'GREATER_THAN'
  | 'LESS_THAN'
  | 'CONTAINS'
  | 'STARTS_WITH';

export interface SmartCollectionRule {
  field: RuleField;
  operator: RuleOperator;
  value: string | number;
}

export interface SmartCollectionRuleset {
  matchType: 'ALL' | 'ANY';
  rules: SmartCollectionRule[];
}

export function buildPrismaWhereFromRules(ruleset: SmartCollectionRuleset): Prisma.ProductWhereInput {
  if (!ruleset.rules || ruleset.rules.length === 0) {
    return {};
  }

  const conditions: Prisma.ProductWhereInput[] = ruleset.rules.map((rule) => {
    const { field, operator, value } = rule;

    switch (field) {
      case 'title':
        if (operator === 'EQUALS') return { title: { equals: String(value), mode: 'insensitive' } };
        if (operator === 'CONTAINS') return { title: { contains: String(value), mode: 'insensitive' } };
        if (operator === 'STARTS_WITH') return { title: { startsWith: String(value), mode: 'insensitive' } };
        return {};

      case 'vendor':
        if (operator === 'EQUALS') return { vendor: { equals: String(value), mode: 'insensitive' } };
        if (operator === 'CONTAINS') return { vendor: { contains: String(value), mode: 'insensitive' } };
        return {};

      case 'tag':
        if (operator === 'EQUALS') return { tags: { has: String(value) } };
        if (operator === 'CONTAINS') return { tags: { has: String(value) } };
        return {};

      case 'priceCents': {
        const numVal = Number(value);
        if (operator === 'LESS_THAN') {
          return { variants: { some: { priceCents: { lt: numVal } } } };
        }
        if (operator === 'GREATER_THAN') {
          return { variants: { some: { priceCents: { gt: numVal } } } };
        }
        if (operator === 'EQUALS') {
          return { variants: { some: { priceCents: { equals: numVal } } } };
        }
        return {};
      }

      case 'inventoryQuantity': {
        const numVal = Number(value);
        if (operator === 'GREATER_THAN') {
          return { variants: { some: { inventoryQuantity: { gt: numVal } } } };
        }
        if (operator === 'LESS_THAN') {
          return { variants: { some: { inventoryQuantity: { lt: numVal } } } };
        }
        return {};
      }

      default:
        return {};
    }
  });

  return ruleset.matchType === 'ALL' ? { AND: conditions } : { OR: conditions };
}

export async function evaluateSmartCollection(collectionId: string): Promise<number> {
  const collection = await prisma.collection.findUnique({
    where: { id: collectionId },
  });

  if (!collection || collection.type !== 'SMART' || !collection.rules) {
    return 0;
  }

  const ruleset = collection.rules as unknown as SmartCollectionRuleset;
  const where = buildPrismaWhereFromRules(ruleset);

  // Find all matching active products
  const matchingProducts = await prisma.product.findMany({
    where: {
      ...where,
      status: 'ACTIVE',
    },
    select: { id: true },
  });

  const matchingIds = matchingProducts.map((p) => p.id);

  // Atomic sync of CollectionProduct relations
  await prisma.$transaction(async (tx) => {
    // Remove existing products no longer matching
    await tx.collectionProduct.deleteMany({
      where: {
        collectionId,
        productId: { notIn: matchingIds },
      },
    });

    // Upsert current matching products
    for (let i = 0; i < matchingIds.length; i++) {
      const productId = matchingIds[i];
      await tx.collectionProduct.upsert({
        where: {
          collectionId_productId: {
            collectionId,
            productId,
          },
        },
        update: { position: i },
        create: {
          collectionId,
          productId,
          position: i,
        },
      });
    }
  });

  return matchingIds.length;
}
