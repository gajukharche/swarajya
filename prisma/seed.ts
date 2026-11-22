import { PrismaClient, Role, ProductStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { MOCK_PRODUCTS } from '../src/lib/products/mock-catalog';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // 1. Seed Owner Admin User
  const defaultAdminEmail = 'admin@store.local';
  const existingAdmin = await prisma.user.findUnique({
    where: { email: defaultAdminEmail },
  });

  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash('Admin123456!', 10);
    await prisma.user.create({
      data: {
        email: defaultAdminEmail,
        name: 'Store Principal',
        passwordHash,
        role: Role.OWNER,
      },
    });
    console.log(`Created default OWNER user: ${defaultAdminEmail} (password: Admin123456!)`);
  }

  // 2. Seed Initial Store Settings
  await prisma.storeSetting.upsert({
    where: { key: 'general' },
    update: {},
    create: {
      key: 'general',
      value: {
        storeName: 'Apex Storefront',
        currency: 'USD',
        taxRatePercent: 8.25,
        supportEmail: 'support@store.local',
      },
    },
  });

  // 3. Seed Default Homepage PageSections
  const existingSections = await prisma.pageSection.count();
  if (existingSections === 0) {
    await prisma.pageSection.createMany({
      data: [
        {
          sectionType: 'Hero',
          position: 0,
          isVisible: true,
          settings: {
            heading: 'Next-Generation Commerce',
            subheading: 'Engineered for sub-second speed, seamless checkout, and absolute reliability.',
            buttonText: 'Shop New Arrivals',
            buttonLink: '/collections/all',
            backgroundImageUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1600&q=80',
          },
        },
        {
          sectionType: 'FeaturedCollection',
          position: 1,
          isVisible: true,
          settings: {
            heading: 'Trending Essentials',
            collectionHandle: 'frontpage',
            productLimit: 4,
          },
        },
        {
          sectionType: 'PromotionalBanner',
          position: 2,
          isVisible: true,
          settings: {
            badge: 'Limited Edition',
            headline: 'Spring 2026 Architectural Drop',
            description: 'Precision-tailored apparel crafted with waterproof Japanese ripstop.',
            ctaText: 'Explore Capsule',
            ctaLink: '/collections/all',
          },
        },
      ],
    });
    console.log('Seeded initial PageSections for homepage.');
  }

  // 4. Seed Comprehensive 25-Product Catalog
  console.log(`Seeding ${MOCK_PRODUCTS.length} catalog products...`);

  for (const item of MOCK_PRODUCTS) {
    const existing = await prisma.product.findUnique({
      where: { handle: item.handle },
    });

    if (!existing) {
      const created = await prisma.product.create({
        data: {
          id: item.id,
          title: item.title,
          handle: item.handle,
          description: item.description,
          vendor: item.vendor,
          productType: item.productType,
          status: ProductStatus.ACTIVE,
          tags: item.tags,
          seoTitle: `${item.title} | Swarajya`,
          seoDescription: item.description.slice(0, 150),
          options: {
            create: item.options.map((opt) => ({
              name: opt.name,
              position: opt.position,
              values: {
                create: opt.values.map((v) => ({
                  value: v.value,
                  position: v.position,
                })),
              },
            })),
          },
          media: {
            create: item.media.map((m) => ({
              url: m.url,
              altText: m.altText,
              position: m.position,
            })),
          },
        },
      });

      for (const v of item.variants) {
        await prisma.productVariant.create({
          data: {
            productId: created.id,
            title: v.title,
            sku: v.sku,
            priceCents: v.priceCents,
            compareAtPriceCents: v.compareAtPriceCents,
            inventoryQuantity: v.inventoryQuantity,
            reservedQuantity: 0,
          },
        });
      }
    }
  }

  console.log('Seeding complete with all 25 products.');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
