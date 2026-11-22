import { PrismaClient, Role, ProductStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

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

  // 4. Seed Demo Product
  const sampleProductHandle = 'apex-waterproof-jacket';
  const existingProduct = await prisma.product.findUnique({
    where: { handle: sampleProductHandle },
  });

  if (!existingProduct) {
    const product = await prisma.product.create({
      data: {
        title: 'Apex Waterproof Technical Shell',
        handle: sampleProductHandle,
        description: 'Engineered with 3-layer breathable Japanese ripstop, YKK Aquaguard zippers, and laser-cut venting.',
        vendor: 'Apex Outerwear',
        productType: 'Apparel',
        status: ProductStatus.ACTIVE,
        tags: ['outerwear', 'technical', 'waterproof', 'new-arrival'],
        seoTitle: 'Apex Waterproof Technical Shell | High Performance Outerwear',
        seoDescription: 'Shop the Apex Waterproof Technical Shell. Built for extreme conditions with sub-second comfort.',
        options: {
          create: [
            {
              name: 'Size',
              position: 0,
              values: {
                create: [
                  { value: 'M', position: 0 },
                  { value: 'L', position: 1 },
                ],
              },
            },
            {
              name: 'Color',
              position: 1,
              values: {
                create: [
                  { value: 'Obsidian Black', position: 0 },
                  { value: 'Arctic Slate', position: 1 },
                ],
              },
            },
          ],
        },
      },
    });

    // Create Cartesian variants (2 sizes x 2 colors = 4 variants)
    const variants = [
      { title: 'M / Obsidian Black', sku: 'APX-SHL-BLK-M', priceCents: 24900, inventoryQuantity: 25 },
      { title: 'L / Obsidian Black', sku: 'APX-SHL-BLK-L', priceCents: 24900, inventoryQuantity: 18 },
      { title: 'M / Arctic Slate', sku: 'APX-SHL-SLT-M', priceCents: 24900, inventoryQuantity: 12 },
      { title: 'L / Arctic Slate', sku: 'APX-SHL-SLT-L', priceCents: 24900, inventoryQuantity: 15 },
    ];

    for (const v of variants) {
      await prisma.productVariant.create({
        data: {
          productId: product.id,
          title: v.title,
          sku: v.sku,
          priceCents: v.priceCents,
          compareAtPriceCents: 29900,
          costPerItemCents: 9500,
          inventoryQuantity: v.inventoryQuantity,
        },
      });
    }

    console.log(`Seeded demo product: ${sampleProductHandle} with 4 variants.`);
  }

  console.log('Seeding complete.');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
