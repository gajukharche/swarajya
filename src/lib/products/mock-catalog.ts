export interface MockVariant {
  id: string;
  productId: string;
  title: string;
  sku: string;
  barcode?: string | null;
  priceCents: number;
  compareAtPriceCents?: number | null;
  inventoryQuantity: number;
  reservedQuantity: number;
  weightGrams?: number | null;
}

export interface MockOptionValue {
  id: string;
  optionId: string;
  value: string;
  position: number;
}

export interface MockOption {
  id: string;
  productId: string;
  name: string;
  position: number;
  values: MockOptionValue[];
}

export interface MockMedia {
  id: string;
  url: string;
  altText: string | null;
  position: number;
}

export interface MockProduct {
  id: string;
  title: string;
  handle: string;
  description: string;
  vendor: string;
  productType: string;
  status: 'ACTIVE' | 'DRAFT' | 'ARCHIVED';
  tags: string[];
  options: MockOption[];
  variants: MockVariant[];
  media: MockMedia[];
  createdAt: Date;
  updatedAt: Date;
}

export const MOCK_PRODUCTS: MockProduct[] = [
  {
    id: 'prod-01',
    title: 'Swarajya Technical Weatherproof Shell',
    handle: 'swarajya-technical-weatherproof-shell',
    description: 'Engineered with 3-layer breathable Japanese ripstop, YKK Aquaguard zippers, and laser-cut underarm ventilation. Designed for extreme alpine conditions and urban daily transit.',
    vendor: 'Swarajya Outerwear',
    productType: 'Apparel',
    status: 'ACTIVE',
    tags: ['outerwear', 'waterproof', 'technical', 'best-seller'],
    options: [
      {
        id: 'opt-01-size',
        productId: 'prod-01',
        name: 'Size',
        position: 0,
        values: [
          { id: 'v-01-s', optionId: 'opt-01-size', value: 'Small', position: 0 },
          { id: 'v-01-m', optionId: 'opt-01-size', value: 'Medium', position: 1 },
          { id: 'v-01-l', optionId: 'opt-01-size', value: 'Large', position: 2 },
        ],
      },
    ],
    variants: [
      { id: 'var-01-s', productId: 'prod-01', title: 'Small', sku: 'SW-SHELL-BLK-S', priceCents: 29500, compareAtPriceCents: 34000, inventoryQuantity: 18, reservedQuantity: 0 },
      { id: 'var-01-m', productId: 'prod-01', title: 'Medium', sku: 'SW-SHELL-BLK-M', priceCents: 29500, compareAtPriceCents: 34000, inventoryQuantity: 24, reservedQuantity: 0 },
      { id: 'var-01-l', productId: 'prod-01', title: 'Large', sku: 'SW-SHELL-BLK-L', priceCents: 29500, compareAtPriceCents: 34000, inventoryQuantity: 12, reservedQuantity: 0 },
    ],
    media: [
      { id: 'm-01', url: 'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=1000&q=80', altText: 'Black technical jacket', position: 0 },
    ],
    createdAt: new Date('2026-01-10'),
    updatedAt: new Date('2026-02-01'),
  },
  {
    id: 'prod-02',
    title: 'Sahyadri Merino Wool Heavyweight Hoodie',
    handle: 'sahyadri-merino-heavyweight-hoodie',
    description: 'Crafted from 100% 320gsm ultra-fine Australian merino wool with double-stitched flatlock seams and structured kangaroo pouch. Thermal-regulating and naturally odor resistant.',
    vendor: 'Sahyadri Craft',
    productType: 'Apparel',
    status: 'ACTIVE',
    tags: ['merino', 'hoodie', 'apparel', 'cozy'],
    options: [
      {
        id: 'opt-02-size',
        productId: 'prod-02',
        name: 'Size',
        position: 0,
        values: [
          { id: 'v-02-s', optionId: 'opt-02-size', value: 'S', position: 0 },
          { id: 'v-02-m', optionId: 'opt-02-size', value: 'M', position: 1 },
          { id: 'v-02-l', optionId: 'opt-02-size', value: 'L', position: 2 },
        ],
      },
    ],
    variants: [
      { id: 'var-02-s', productId: 'prod-02', title: 'S', sku: 'SY-HOOD-CHAR-S', priceCents: 16500, compareAtPriceCents: null, inventoryQuantity: 15, reservedQuantity: 0 },
      { id: 'var-02-m', productId: 'prod-02', title: 'M', sku: 'SY-HOOD-CHAR-M', priceCents: 16500, compareAtPriceCents: null, inventoryQuantity: 30, reservedQuantity: 0 },
      { id: 'var-02-l', productId: 'prod-02', title: 'L', sku: 'SY-HOOD-CHAR-L', priceCents: 16500, compareAtPriceCents: null, inventoryQuantity: 20, reservedQuantity: 0 },
    ],
    media: [
      { id: 'm-02', url: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=1000&q=80', altText: 'Charcoal merino hoodie', position: 0 },
    ],
    createdAt: new Date('2026-01-12'),
    updatedAt: new Date('2026-02-02'),
  },
  {
    id: 'prod-03',
    title: 'Deccan Aerospace Titanium Chronograph',
    handle: 'deccan-aerospace-titanium-chronograph',
    description: 'Grade 5 aerospace titanium case, domed scratch-proof sapphire crystal, Japanese meca-quartz movement, and 100m water resistance. Finished with matte sandblasted bezel.',
    vendor: 'Deccan Horology',
    productType: 'Accessories',
    status: 'ACTIVE',
    tags: ['edc', 'watch', 'titanium', 'luxury'],
    options: [
      {
        id: 'opt-03-strap',
        productId: 'prod-03',
        name: 'Strap',
        position: 0,
        values: [
          { id: 'v-03-ti', optionId: 'opt-03-strap', value: 'Titanium Link', position: 0 },
          { id: 'v-03-fkm', optionId: 'opt-03-strap', value: 'FKM Rubber', position: 1 },
        ],
      },
    ],
    variants: [
      { id: 'var-03-ti', productId: 'prod-03', title: 'Titanium Link', sku: 'DC-WATCH-TI', priceCents: 42000, compareAtPriceCents: 48000, inventoryQuantity: 8, reservedQuantity: 0 },
      { id: 'var-03-fkm', productId: 'prod-03', title: 'FKM Rubber', sku: 'DC-WATCH-FKM', priceCents: 36000, compareAtPriceCents: null, inventoryQuantity: 14, reservedQuantity: 0 },
    ],
    media: [
      { id: 'm-03', url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1000&q=80', altText: 'Titanium chronograph watch', position: 0 },
    ],
    createdAt: new Date('2026-01-15'),
    updatedAt: new Date('2026-02-04'),
  },
  {
    id: 'prod-04',
    title: 'Kailas Modular EDC Cordura Backpack 28L',
    handle: 'kailas-modular-edc-backpack-28l',
    description: 'Waterproof 1000D Cordura nylon construction with magnetic Fidlock buckles, dedicated padded 16" laptop sleeve, and expandable clamshell luggage compartment.',
    vendor: 'Sahyadri Craft',
    productType: 'Gear',
    status: 'ACTIVE',
    tags: ['backpack', 'travel', 'cordura', 'edc'],
    options: [
      {
        id: 'opt-04-col',
        productId: 'prod-04',
        name: 'Color',
        position: 0,
        values: [
          { id: 'v-04-blk', optionId: 'opt-04-col', value: 'Stealth Black', position: 0 },
          { id: 'v-04-olv', optionId: 'opt-04-col', value: 'Olive Drab', position: 1 },
        ],
      },
    ],
    variants: [
      { id: 'var-04-blk', productId: 'prod-04', title: 'Stealth Black', sku: 'KL-BP-28L-BLK', priceCents: 19500, compareAtPriceCents: 22000, inventoryQuantity: 25, reservedQuantity: 0 },
      { id: 'var-04-olv', productId: 'prod-04', title: 'Olive Drab', sku: 'KL-BP-28L-OLV', priceCents: 19500, compareAtPriceCents: 22000, inventoryQuantity: 19, reservedQuantity: 0 },
    ],
    media: [
      { id: 'm-04', url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=1000&q=80', altText: 'Tactical EDC backpack', position: 0 },
    ],
    createdAt: new Date('2026-01-18'),
    updatedAt: new Date('2026-02-05'),
  },
  {
    id: 'prod-05',
    title: 'Torna Trail Carbon All-Terrain Sneaker',
    handle: 'torna-trail-carbon-sneaker',
    description: 'Vibram Megagrip traction outsole bonded to an ultra-responsive carbon fiber propulsion plate. Kevlar-reinforced upper provides breathable trail durability.',
    vendor: 'Veloce Atelier',
    productType: 'Footwear',
    status: 'ACTIVE',
    tags: ['footwear', 'trail', 'carbon', 'running'],
    options: [
      {
        id: 'opt-05-size',
        productId: 'prod-05',
        name: 'US Men Size',
        position: 0,
        values: [
          { id: 'v-05-9', optionId: 'opt-05-size', value: '9', position: 0 },
          { id: 'v-05-10', optionId: 'opt-05-size', value: '10', position: 1 },
          { id: 'v-05-11', optionId: 'opt-05-size', value: '11', position: 2 },
        ],
      },
    ],
    variants: [
      { id: 'var-05-9', productId: 'prod-05', title: '9', sku: 'TR-SHOE-09', priceCents: 21000, compareAtPriceCents: null, inventoryQuantity: 12, reservedQuantity: 0 },
      { id: 'var-05-10', productId: 'prod-05', title: '10', sku: 'TR-SHOE-10', priceCents: 21000, compareAtPriceCents: null, inventoryQuantity: 18, reservedQuantity: 0 },
      { id: 'var-05-11', productId: 'prod-05', title: '11', sku: 'TR-SHOE-11', priceCents: 21000, compareAtPriceCents: null, inventoryQuantity: 14, reservedQuantity: 0 },
    ],
    media: [
      { id: 'm-05', url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1000&q=80', altText: 'Carbon all-terrain sneaker', position: 0 },
    ],
    createdAt: new Date('2026-01-20'),
    updatedAt: new Date('2026-02-06'),
  },
  {
    id: 'prod-06',
    title: 'Shivaji Raw Denim Selvedge Jeans 14oz',
    handle: 'shivaji-raw-denim-selvedge-14oz',
    description: 'Woven on vintage shuttle looms using long-staple organic cotton. Custom solid brass hardware, red-line selvedge ID, and tailored tapered silhouette that patinas uniquely.',
    vendor: 'Deccan Craft',
    productType: 'Apparel',
    status: 'ACTIVE',
    tags: ['denim', 'selvedge', 'vintage', 'apparel'],
    options: [
      {
        id: 'opt-06-waist',
        productId: 'prod-06',
        name: 'Waist',
        position: 0,
        values: [
          { id: 'v-06-30', optionId: 'opt-06-waist', value: '30x32', position: 0 },
          { id: 'v-06-32', optionId: 'opt-06-waist', value: '32x32', position: 1 },
          { id: 'v-06-34', optionId: 'opt-06-waist', value: '34x32', position: 2 },
        ],
      },
    ],
    variants: [
      { id: 'var-06-30', productId: 'prod-06', title: '30x32', sku: 'SH-DNM-30', priceCents: 17500, compareAtPriceCents: null, inventoryQuantity: 10, reservedQuantity: 0 },
      { id: 'var-06-32', productId: 'prod-06', title: '32x32', sku: 'SH-DNM-32', priceCents: 17500, compareAtPriceCents: null, inventoryQuantity: 22, reservedQuantity: 0 },
      { id: 'var-06-34', productId: 'prod-06', title: '34x32', sku: 'SH-DNM-34', priceCents: 17500, compareAtPriceCents: null, inventoryQuantity: 15, reservedQuantity: 0 },
    ],
    media: [
      { id: 'm-06', url: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=1000&q=80', altText: 'Raw selvedge denim jeans', position: 0 },
    ],
    createdAt: new Date('2026-01-22'),
    updatedAt: new Date('2026-02-08'),
  },
  {
    id: 'prod-07',
    title: 'Pratapgarh Full-Grain Leather Minimalist Wallet',
    handle: 'pratapgarh-full-grain-leather-wallet',
    description: 'Handcrafted vegetable-tanned Italian leather with RFID-blocking alloy mesh. Holds up to 8 cards and cash while maintaining a slim 8mm profile.',
    vendor: 'Deccan Craft',
    productType: 'Accessories',
    status: 'ACTIVE',
    tags: ['leather', 'wallet', 'edc', 'minimalist'],
    options: [
      {
        id: 'opt-07-col',
        productId: 'prod-07',
        name: 'Color',
        position: 0,
        values: [
          { id: 'v-07-tan', optionId: 'opt-07-col', value: 'Cognac Tan', position: 0 },
          { id: 'v-07-blk', optionId: 'opt-07-col', value: 'Obsidian Black', position: 1 },
        ],
      },
    ],
    variants: [
      { id: 'var-07-tan', productId: 'prod-07', title: 'Cognac Tan', sku: 'PR-WLT-TAN', priceCents: 6500, compareAtPriceCents: 7500, inventoryQuantity: 40, reservedQuantity: 0 },
      { id: 'var-07-blk', productId: 'prod-07', title: 'Obsidian Black', sku: 'PR-WLT-BLK', priceCents: 6500, compareAtPriceCents: 7500, inventoryQuantity: 35, reservedQuantity: 0 },
    ],
    media: [
      { id: 'm-07', url: 'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=1000&q=80', altText: 'Full grain leather wallet', position: 0 },
    ],
    createdAt: new Date('2026-01-25'),
    updatedAt: new Date('2026-02-09'),
  },
  {
    id: 'prod-08',
    title: 'Sinhagad Ergonomic Walnut Desk Mat',
    handle: 'sinhagad-walnut-felt-desk-mat',
    description: 'Premium merino wool felt backing with natural American walnut accents. Provides precise mouse tracking, scratch protection, and thermal comfort for modern workstations.',
    vendor: 'Sahyadri Living',
    productType: 'Living',
    status: 'ACTIVE',
    tags: ['workspace', 'desk', 'walnut', 'minimalist'],
    options: [
      {
        id: 'opt-08-sz',
        productId: 'prod-08',
        name: 'Size',
        position: 0,
        values: [
          { id: 'v-08-med', optionId: 'opt-08-sz', value: 'Medium (31x12")', position: 0 },
          { id: 'v-08-lrg', optionId: 'opt-08-sz', value: 'Large (36x18")', position: 1 },
        ],
      },
    ],
    variants: [
      { id: 'var-08-med', productId: 'prod-08', title: 'Medium (31x12")', sku: 'SN-MAT-M', priceCents: 7800, compareAtPriceCents: null, inventoryQuantity: 28, reservedQuantity: 0 },
      { id: 'var-08-lrg', productId: 'prod-08', title: 'Large (36x18")', sku: 'SN-MAT-L', priceCents: 9500, compareAtPriceCents: null, inventoryQuantity: 18, reservedQuantity: 0 },
    ],
    media: [
      { id: 'm-08', url: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=1000&q=80', altText: 'Desk pad workspace accessory', position: 0 },
    ],
    createdAt: new Date('2026-01-28'),
    updatedAt: new Date('2026-02-10'),
  },
  {
    id: 'prod-09',
    title: 'Raigad ANC Wireless Studio Headphones',
    handle: 'raigad-anc-wireless-studio-headphones',
    description: 'Custom 40mm bio-cellulose drivers delivering ultra-low distortion. Features hybrid active noise cancellation, 45-hour battery life, and plush memory foam lambskin earcups.',
    vendor: 'Veloce Atelier',
    productType: 'Tech',
    status: 'ACTIVE',
    tags: ['audio', 'wireless', 'headphones', 'tech'],
    options: [
      {
        id: 'opt-09-col',
        productId: 'prod-09',
        name: 'Finish',
        position: 0,
        values: [
          { id: 'v-09-mblk', optionId: 'opt-09-col', value: 'Matte Black', position: 0 },
          { id: 'v-09-slv', optionId: 'opt-09-col', value: 'Silver Sand', position: 1 },
        ],
      },
    ],
    variants: [
      { id: 'var-09-mblk', productId: 'prod-09', title: 'Matte Black', sku: 'RG-HP-BLK', priceCents: 34000, compareAtPriceCents: 38000, inventoryQuantity: 16, reservedQuantity: 0 },
      { id: 'var-09-slv', productId: 'prod-09', title: 'Silver Sand', sku: 'RG-HP-SLV', priceCents: 34000, compareAtPriceCents: 38000, inventoryQuantity: 11, reservedQuantity: 0 },
    ],
    media: [
      { id: 'm-09', url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1000&q=80', altText: 'Wireless ANC studio headphones', position: 0 },
    ],
    createdAt: new Date('2026-02-01'),
    updatedAt: new Date('2026-02-12'),
  },
  {
    id: 'prod-10',
    title: 'Purandar Insulated Double-Wall Titanium Flask 750ml',
    handle: 'purandar-insulated-titanium-flask-750ml',
    description: 'Vacuum-insulated pure medical-grade titanium keeping beverages chilled for 24 hours or piping hot for 12. Weighs merely 240g with a zero-metallic taste guarantee.',
    vendor: 'Sahyadri Gear',
    productType: 'Gear',
    status: 'ACTIVE',
    tags: ['titanium', 'flask', 'hydration', 'edc'],
    options: [
      {
        id: 'opt-10-cap',
        productId: 'prod-10',
        name: 'Cap Style',
        position: 0,
        values: [
          { id: 'v-10-loop', optionId: 'opt-10-cap', value: 'Carabiner Loop', position: 0 },
          { id: 'v-10-bmb', optionId: 'opt-10-cap', value: 'Bamboo Cap', position: 1 },
        ],
      },
    ],
    variants: [
      { id: 'var-10-loop', productId: 'prod-10', title: 'Carabiner Loop', sku: 'PU-FLASK-LOOP', priceCents: 8500, compareAtPriceCents: null, inventoryQuantity: 32, reservedQuantity: 0 },
      { id: 'var-10-bmb', productId: 'prod-10', title: 'Bamboo Cap', sku: 'PU-FLASK-BMB', priceCents: 8900, compareAtPriceCents: null, inventoryQuantity: 24, reservedQuantity: 0 },
    ],
    media: [
      { id: 'm-10', url: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=1000&q=80', altText: 'Insulated travel bottle', position: 0 },
    ],
    createdAt: new Date('2026-02-03'),
    updatedAt: new Date('2026-02-14'),
  },
  {
    id: 'prod-11',
    title: 'Harishchandragad Heavyweight Oversized Tee 280gsm',
    handle: 'harishchandragad-heavyweight-oversized-tee',
    description: 'Combed organic ring-spun cotton with reinforced 1.25" rib collar and dropped shoulders. Pre-shrunk to retain its boxy architectural drape wash after wash.',
    vendor: 'Swarajya Outerwear',
    productType: 'Apparel',
    status: 'ACTIVE',
    tags: ['apparel', 'tshirt', 'cotton', 'minimalist'],
    options: [
      {
        id: 'opt-11-sz',
        productId: 'prod-11',
        name: 'Size',
        position: 0,
        values: [
          { id: 'v-11-s', optionId: 'opt-11-sz', value: 'S', position: 0 },
          { id: 'v-11-m', optionId: 'opt-11-sz', value: 'M', position: 1 },
          { id: 'v-11-l', optionId: 'opt-11-sz', value: 'L', position: 2 },
          { id: 'v-11-xl', optionId: 'opt-11-sz', value: 'XL', position: 3 },
        ],
      },
    ],
    variants: [
      { id: 'var-11-s', productId: 'prod-11', title: 'S', sku: 'HG-TEE-S', priceCents: 4800, compareAtPriceCents: null, inventoryQuantity: 45, reservedQuantity: 0 },
      { id: 'var-11-m', productId: 'prod-11', title: 'M', sku: 'HG-TEE-M', priceCents: 4800, compareAtPriceCents: null, inventoryQuantity: 60, reservedQuantity: 0 },
      { id: 'var-11-l', productId: 'prod-11', title: 'L', sku: 'HG-TEE-L', priceCents: 4800, compareAtPriceCents: null, inventoryQuantity: 50, reservedQuantity: 0 },
      { id: 'var-11-xl', productId: 'prod-11', title: 'XL', sku: 'HG-TEE-XL', priceCents: 4800, compareAtPriceCents: null, inventoryQuantity: 30, reservedQuantity: 0 },
    ],
    media: [
      { id: 'm-11', url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1000&q=80', altText: 'Heavyweight black tee', position: 0 },
    ],
    createdAt: new Date('2026-02-05'),
    updatedAt: new Date('2026-02-15'),
  },
  {
    id: 'prod-12',
    title: 'Rajmachi Anodized Aluminum Mechanical Keyboard',
    handle: 'rajmachi-aluminum-mechanical-keyboard-75',
    description: 'CNC-machined 6063 aluminum chassis, gasket-mounted hot-swappable PCB, factory-lubed linear switches, and dye-sub PBT keycaps with custom sound-dampening foam.',
    vendor: 'Veloce Atelier',
    productType: 'Tech',
    status: 'ACTIVE',
    tags: ['keyboard', 'tech', 'workspace', 'aluminum'],
    options: [
      {
        id: 'opt-12-sw',
        productId: 'prod-12',
        name: 'Switch Type',
        position: 0,
        values: [
          { id: 'v-12-lin', optionId: 'opt-12-sw', value: 'Linear Smooth (45g)', position: 0 },
          { id: 'v-12-tac', optionId: 'opt-12-sw', value: 'Tactile Bump (55g)', position: 1 },
        ],
      },
    ],
    variants: [
      { id: 'var-12-lin', productId: 'prod-12', title: 'Linear Smooth (45g)', sku: 'RM-KB-LIN', priceCents: 21500, compareAtPriceCents: 24500, inventoryQuantity: 14, reservedQuantity: 0 },
      { id: 'var-12-tac', productId: 'prod-12', title: 'Tactile Bump (55g)', sku: 'RM-KB-TAC', priceCents: 21500, compareAtPriceCents: 24500, inventoryQuantity: 18, reservedQuantity: 0 },
    ],
    media: [
      { id: 'm-12', url: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=1000&q=80', altText: 'Mechanical keyboard desk setup', position: 0 },
    ],
    createdAt: new Date('2026-02-07'),
    updatedAt: new Date('2026-02-16'),
  },
  {
    id: 'prod-13',
    title: 'Sindhudurg Hydrophobic Ripstop Duffle 45L',
    handle: 'sindhudurg-hydrophobic-duffle-45l',
    description: 'Submersible-grade TPU laminate waterproof duffle bag with airtight pressure zipper and tuck-away ergonomic backpack straps. Built for ocean expeditions and gym gear.',
    vendor: 'Sahyadri Gear',
    productType: 'Gear',
    status: 'ACTIVE',
    tags: ['duffle', 'waterproof', 'travel', 'gear'],
    options: [
      {
        id: 'opt-13-col',
        productId: 'prod-13',
        name: 'Color',
        position: 0,
        values: [
          { id: 'v-13-camo', optionId: 'opt-13-col', value: 'Arctic White', position: 0 },
          { id: 'v-13-blk', optionId: 'opt-13-col', value: 'Deep Navy', position: 1 },
        ],
      },
    ],
    variants: [
      { id: 'var-13-camo', productId: 'prod-13', title: 'Arctic White', sku: 'SD-DUF-WHT', priceCents: 15500, compareAtPriceCents: null, inventoryQuantity: 20, reservedQuantity: 0 },
      { id: 'var-13-blk', productId: 'prod-13', title: 'Deep Navy', sku: 'SD-DUF-NVY', priceCents: 15500, compareAtPriceCents: null, inventoryQuantity: 28, reservedQuantity: 0 },
    ],
    media: [
      { id: 'm-13', url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=1000&q=80', altText: 'Waterproof expedition duffle', position: 0 },
    ],
    createdAt: new Date('2026-02-09'),
    updatedAt: new Date('2026-02-18'),
  },
  {
    id: 'prod-14',
    title: 'Konkan Coast Ceramic Pour-Over Dripper Set',
    handle: 'konkan-coast-ceramic-dripper-set',
    description: 'Hand-thrown stoneware clay with matte charcoal glaze. Designed with 60-degree spiral extraction ribs to produce clean, nuanced single-origin pour-overs.',
    vendor: 'Sahyadri Living',
    productType: 'Living',
    status: 'ACTIVE',
    tags: ['coffee', 'ceramic', 'living', 'craft'],
    options: [
      {
        id: 'opt-14-set',
        productId: 'prod-14',
        name: 'Kit Option',
        position: 0,
        values: [
          { id: 'v-14-std', optionId: 'opt-14-set', value: 'Dripper Only', position: 0 },
          { id: 'v-14-srv', optionId: 'opt-14-set', value: 'With Glass Server 500ml', position: 1 },
        ],
      },
    ],
    variants: [
      { id: 'var-14-std', productId: 'prod-14', title: 'Dripper Only', sku: 'KC-CF-DRIP', priceCents: 5200, compareAtPriceCents: null, inventoryQuantity: 30, reservedQuantity: 0 },
      { id: 'var-14-srv', productId: 'prod-14', title: 'With Glass Server 500ml', sku: 'KC-CF-SET', priceCents: 7800, compareAtPriceCents: 8500, inventoryQuantity: 25, reservedQuantity: 0 },
    ],
    media: [
      { id: 'm-14', url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=1000&q=80', altText: 'Ceramic coffee dripper', position: 0 },
    ],
    createdAt: new Date('2026-02-11'),
    updatedAt: new Date('2026-02-19'),
  },
  {
    id: 'prod-15',
    title: 'Murud Janjira Titanium Polarized Sunglasses',
    handle: 'murud-janjira-titanium-sunglasses',
    description: 'Ultralight 18-gram Japanese beta-titanium wire frame equipped with Category 3 polarized nylon lenses and anti-reflective backside coating.',
    vendor: 'Deccan Horology',
    productType: 'Accessories',
    status: 'ACTIVE',
    tags: ['eyewear', 'titanium', 'accessories', 'edc'],
    options: [
      {
        id: 'opt-15-lens',
        productId: 'prod-15',
        name: 'Lens Tint',
        position: 0,
        values: [
          { id: 'v-15-g15', optionId: 'opt-15-lens', value: 'Polarized G-15 Green', position: 0 },
          { id: 'v-15-gry', optionId: 'opt-15-lens', value: 'Slate Polarized Smoke', position: 1 },
        ],
      },
    ],
    variants: [
      { id: 'var-15-g15', productId: 'prod-15', title: 'Polarized G-15 Green', sku: 'MJ-SUN-G15', priceCents: 18500, compareAtPriceCents: 21000, inventoryQuantity: 15, reservedQuantity: 0 },
      { id: 'var-15-gry', productId: 'prod-15', title: 'Slate Polarized Smoke', sku: 'MJ-SUN-SMK', priceCents: 18500, compareAtPriceCents: 21000, inventoryQuantity: 20, reservedQuantity: 0 },
    ],
    media: [
      { id: 'm-15', url: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=1000&q=80', altText: 'Titanium polarized sunglasses', position: 0 },
    ],
    createdAt: new Date('2026-02-12'),
    updatedAt: new Date('2026-02-20'),
  },
  {
    id: 'prod-16',
    title: 'Panhala Tactical Wool Overshirt',
    handle: 'panhala-tactical-wool-overshirt',
    description: 'Heavy 380gsm boiled melton wool blend with reinforced Cordura elbow patches, dual concealed chest pockets, and custom antique brass snaps.',
    vendor: 'Swarajya Outerwear',
    productType: 'Apparel',
    status: 'ACTIVE',
    tags: ['wool', 'overshirt', 'outerwear', 'apparel'],
    options: [
      {
        id: 'opt-16-sz',
        productId: 'prod-16',
        name: 'Size',
        position: 0,
        values: [
          { id: 'v-16-m', optionId: 'opt-16-sz', value: 'Medium', position: 0 },
          { id: 'v-16-l', optionId: 'opt-16-sz', value: 'Large', position: 1 },
        ],
      },
    ],
    variants: [
      { id: 'var-16-m', productId: 'prod-16', title: 'Medium', sku: 'PH-SHIRT-M', priceCents: 18500, compareAtPriceCents: null, inventoryQuantity: 22, reservedQuantity: 0 },
      { id: 'var-16-l', productId: 'prod-16', title: 'Large', sku: 'PH-SHIRT-L', priceCents: 18500, compareAtPriceCents: null, inventoryQuantity: 18, reservedQuantity: 0 },
    ],
    media: [
      { id: 'm-16', url: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=1000&q=80', altText: 'Heavy wool overshirt', position: 0 },
    ],
    createdAt: new Date('2026-02-14'),
    updatedAt: new Date('2026-02-21'),
  },
  {
    id: 'prod-17',
    title: 'Khanderi Brass & Ceramic Mill Grinder',
    handle: 'khanderi-brass-coffee-grinder',
    description: 'Precision 48mm heptagonal stainless steel burrs housed in a solid knurled brass barrel. Dual ball bearings provide zero-wobble consistency from espresso to French press.',
    vendor: 'Sahyadri Living',
    productType: 'Living',
    status: 'ACTIVE',
    tags: ['coffee', 'brass', 'edc', 'kitchen'],
    options: [
      {
        id: 'opt-17-br',
        productId: 'prod-17',
        name: 'Body',
        position: 0,
        values: [
          { id: 'v-17-raw', optionId: 'opt-17-br', value: 'Raw Knurled Brass', position: 0 },
        ],
      },
    ],
    variants: [
      { id: 'var-17-raw', productId: 'prod-17', title: 'Raw Knurled Brass', sku: 'KH-GRD-BRS', priceCents: 14500, compareAtPriceCents: 16500, inventoryQuantity: 19, reservedQuantity: 0 },
    ],
    media: [
      { id: 'm-17', url: 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?auto=format&fit=crop&w=1000&q=80', altText: 'Precision hand grinder', position: 0 },
    ],
    createdAt: new Date('2026-02-15'),
    updatedAt: new Date('2026-02-22'),
  },
  {
    id: 'prod-18',
    title: 'Lohagad Weatherproof Field Trench Coat',
    handle: 'lohagad-weatherproof-field-trench',
    description: 'A contemporary utilitarian reinterpretation of the military trench. Crafted in structured Ventile cotton with taped internal seams and storm flap throat latch.',
    vendor: 'Swarajya Outerwear',
    productType: 'Apparel',
    status: 'ACTIVE',
    tags: ['outerwear', 'trench', 'apparel', 'waterproof'],
    options: [
      {
        id: 'opt-18-sz',
        productId: 'prod-18',
        name: 'Size',
        position: 0,
        values: [
          { id: 'v-18-38', optionId: 'opt-18-sz', value: '38 Regular', position: 0 },
          { id: 'v-18-40', optionId: 'opt-18-sz', value: '40 Regular', position: 1 },
        ],
      },
    ],
    variants: [
      { id: 'var-18-38', productId: 'prod-18', title: '38 Regular', sku: 'LH-TRN-38', priceCents: 38000, compareAtPriceCents: 44000, inventoryQuantity: 9, reservedQuantity: 0 },
      { id: 'var-18-40', productId: 'prod-18', title: '40 Regular', sku: 'LH-TRN-40', priceCents: 38000, compareAtPriceCents: 44000, inventoryQuantity: 14, reservedQuantity: 0 },
    ],
    media: [
      { id: 'm-18', url: 'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=1000&q=80', altText: 'Field trench coat', position: 0 },
    ],
    createdAt: new Date('2026-02-16'),
    updatedAt: new Date('2026-02-22'),
  },
  {
    id: 'prod-19',
    title: 'Visapur Titanium Folding Camp Knife',
    handle: 'visapur-titanium-folding-knife',
    description: 'CPM-20CV powdered metallurgy blade steel with cryo heat treat at 61 HRC. Grade 5 titanium frame lock with ceramic ball-bearing pivot for fluid deployment.',
    vendor: 'Sahyadri Gear',
    productType: 'Gear',
    status: 'ACTIVE',
    tags: ['edc', 'knife', 'titanium', 'outdoor'],
    options: [
      {
        id: 'opt-19-fin',
        productId: 'prod-19',
        name: 'Finish',
        position: 0,
        values: [
          { id: 'v-19-stn', optionId: 'opt-19-fin', value: 'Stonewashed Blade', position: 0 },
          { id: 'v-19-dlc', optionId: 'opt-19-fin', value: 'DLC Blackout', position: 1 },
        ],
      },
    ],
    variants: [
      { id: 'var-19-stn', productId: 'prod-19', title: 'Stonewashed Blade', sku: 'VP-KNF-STN', priceCents: 16800, compareAtPriceCents: null, inventoryQuantity: 21, reservedQuantity: 0 },
      { id: 'var-19-dlc', productId: 'prod-19', title: 'DLC Blackout', sku: 'VP-KNF-DLC', priceCents: 18500, compareAtPriceCents: null, inventoryQuantity: 15, reservedQuantity: 0 },
    ],
    media: [
      { id: 'm-19', url: 'https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?auto=format&fit=crop&w=1000&q=80', altText: 'Titanium folding knife', position: 0 },
    ],
    createdAt: new Date('2026-02-17'),
    updatedAt: new Date('2026-02-23'),
  },
  {
    id: 'prod-20',
    title: 'Sudhagad Linen Field Trousers',
    handle: 'sudhagad-linen-field-trousers',
    description: '100% Belgian natural flax linen garment-dyed in small batches. Features pleated front, side waist tab adjusters, and deep slash pockets for effortless breathability.',
    vendor: 'Deccan Craft',
    productType: 'Apparel',
    status: 'ACTIVE',
    tags: ['linen', 'trousers', 'apparel', 'summer'],
    options: [
      {
        id: 'opt-20-sz',
        productId: 'prod-20',
        name: 'Waist',
        position: 0,
        values: [
          { id: 'v-20-30', optionId: 'opt-20-sz', value: '30 Waist', position: 0 },
          { id: 'v-20-32', optionId: 'opt-20-sz', value: '32 Waist', position: 1 },
          { id: 'v-20-34', optionId: 'opt-20-sz', value: '34 Waist', position: 2 },
        ],
      },
    ],
    variants: [
      { id: 'var-20-30', productId: 'prod-20', title: '30 Waist', sku: 'SD-TRS-30', priceCents: 13500, compareAtPriceCents: null, inventoryQuantity: 14, reservedQuantity: 0 },
      { id: 'var-20-32', productId: 'prod-20', title: '32 Waist', sku: 'SD-TRS-32', priceCents: 13500, compareAtPriceCents: null, inventoryQuantity: 28, reservedQuantity: 0 },
      { id: 'var-20-34', productId: 'prod-20', title: '34 Waist', sku: 'SD-TRS-34', priceCents: 13500, compareAtPriceCents: null, inventoryQuantity: 16, reservedQuantity: 0 },
    ],
    media: [
      { id: 'm-20', url: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&w=1000&q=80', altText: 'Flax linen trousers', position: 0 },
    ],
    createdAt: new Date('2026-02-18'),
    updatedAt: new Date('2026-02-23'),
  },
  {
    id: 'prod-21',
    title: 'Rajgad Italian Calfskin Chelsea Boots',
    handle: 'rajgad-italian-calfskin-chelsea-boots',
    description: 'Goodyear-welted full-grain Italian box calf leather with custom elastic side gussets, stacked leather heel, and non-slip Dainite studded rubber sole.',
    vendor: 'Veloce Atelier',
    productType: 'Footwear',
    status: 'ACTIVE',
    tags: ['boots', 'footwear', 'chelsea', 'leather'],
    options: [
      {
        id: 'opt-21-sz',
        productId: 'prod-21',
        name: 'Size',
        position: 0,
        values: [
          { id: 'v-21-9', optionId: 'opt-21-sz', value: '42 EU / 9 US', position: 0 },
          { id: 'v-21-10', optionId: 'opt-21-sz', value: '43 EU / 10 US', position: 1 },
          { id: 'v-21-11', optionId: 'opt-21-sz', value: '44 EU / 11 US', position: 2 },
        ],
      },
    ],
    variants: [
      { id: 'var-21-9', productId: 'prod-21', title: '42 EU / 9 US', sku: 'RG-BOOT-42', priceCents: 28500, compareAtPriceCents: 32000, inventoryQuantity: 11, reservedQuantity: 0 },
      { id: 'var-21-10', productId: 'prod-21', title: '43 EU / 10 US', sku: 'RG-BOOT-43', priceCents: 28500, compareAtPriceCents: 32000, inventoryQuantity: 17, reservedQuantity: 0 },
      { id: 'var-21-11', productId: 'prod-21', title: '44 EU / 11 US', sku: 'RG-BOOT-44', priceCents: 28500, compareAtPriceCents: 32000, inventoryQuantity: 13, reservedQuantity: 0 },
    ],
    media: [
      { id: 'm-21', url: 'https://images.unsplash.com/photo-1638247025967-b4e38f787b76?auto=format&fit=crop&w=1000&q=80', altText: 'Calfskin chelsea boots', position: 0 },
    ],
    createdAt: new Date('2026-02-19'),
    updatedAt: new Date('2026-02-23'),
  },
  {
    id: 'prod-22',
    title: 'Tikona Solid Brass Minimalist Rollerball Pen',
    handle: 'tikona-solid-brass-rollerball-pen',
    description: 'Precision-machined from single-billet C360 brass with Schmidt 5888 liquid ink refill. Seamless threads and engineered center of gravity for hours of fatigue-free writing.',
    vendor: 'Sahyadri Living',
    productType: 'Accessories',
    status: 'ACTIVE',
    tags: ['pen', 'brass', 'edc', 'workspace'],
    options: [
      {
        id: 'opt-22-ink',
        productId: 'prod-22',
        name: 'Ink',
        position: 0,
        values: [
          { id: 'v-22-blk', optionId: 'opt-22-ink', value: 'Black 0.6mm', position: 0 },
        ],
      },
    ],
    variants: [
      { id: 'var-22-blk', productId: 'prod-22', title: 'Black 0.6mm', sku: 'TK-PEN-BLK', priceCents: 5800, compareAtPriceCents: null, inventoryQuantity: 42, reservedQuantity: 0 },
    ],
    media: [
      { id: 'm-22', url: 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?auto=format&fit=crop&w=1000&q=80', altText: 'Solid brass machined pen', position: 0 },
    ],
    createdAt: new Date('2026-02-20'),
    updatedAt: new Date('2026-02-24'),
  },
  {
    id: 'prod-23',
    title: 'Ajinkyatara Magnetic Charging Station 3-in-1',
    handle: 'ajinkyatara-magnetic-charging-station',
    description: 'Forged from aircraft-grade aluminum and weighted glass. Powers your phone (15W Qi2), wireless earbuds (5W), and smartwatch simultaneously with single braided cable.',
    vendor: 'Veloce Atelier',
    productType: 'Tech',
    status: 'ACTIVE',
    tags: ['tech', 'charging', 'workspace', 'wireless'],
    options: [
      {
        id: 'opt-23-col',
        productId: 'prod-23',
        name: 'Finish',
        position: 0,
        values: [
          { id: 'v-23-spg', optionId: 'opt-23-col', value: 'Space Gray', position: 0 },
          { id: 'v-23-slv', optionId: 'opt-23-col', value: 'Pure Silver', position: 1 },
        ],
      },
    ],
    variants: [
      { id: 'var-23-spg', productId: 'prod-23', title: 'Space Gray', sku: 'AJ-CHG-GRY', priceCents: 12500, compareAtPriceCents: 14500, inventoryQuantity: 26, reservedQuantity: 0 },
      { id: 'var-23-slv', productId: 'prod-23', title: 'Pure Silver', sku: 'AJ-CHG-SLV', priceCents: 12500, compareAtPriceCents: 14500, inventoryQuantity: 21, reservedQuantity: 0 },
    ],
    media: [
      { id: 'm-23', url: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?auto=format&fit=crop&w=1000&q=80', altText: 'Magnetic wireless charging stand', position: 0 },
    ],
    createdAt: new Date('2026-02-20'),
    updatedAt: new Date('2026-02-24'),
  },
  {
    id: 'prod-24',
    title: 'Chanderi Handwoven Khadi Throw Blanket',
    handle: 'chanderi-handwoven-khadi-throw',
    description: 'Hand-spun organic cotton crafted on indigenous pit looms by master artisans. Generous 60" x 80" dimensions with hand-knotted fringe edges.',
    vendor: 'Deccan Craft',
    productType: 'Living',
    status: 'ACTIVE',
    tags: ['living', 'blanket', 'cotton', 'handwoven'],
    options: [
      {
        id: 'opt-24-col',
        productId: 'prod-24',
        name: 'Pattern',
        position: 0,
        values: [
          { id: 'v-24-nat', optionId: 'opt-24-col', value: 'Natural Indigo Stripe', position: 0 },
        ],
      },
    ],
    variants: [
      { id: 'var-24-nat', productId: 'prod-24', title: 'Natural Indigo Stripe', sku: 'CH-THRW-IND', priceCents: 8500, compareAtPriceCents: null, inventoryQuantity: 18, reservedQuantity: 0 },
    ],
    media: [
      { id: 'm-24', url: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=1000&q=80', altText: 'Handwoven cotton throw blanket', position: 0 },
    ],
    createdAt: new Date('2026-02-21'),
    updatedAt: new Date('2026-02-24'),
  },
  {
    id: 'prod-25',
    title: 'Bhimashankar Gore-Tex All-Weather Gloves',
    handle: 'bhimashankar-goretex-gloves',
    description: 'Windproof, 100% waterproof Gore-Tex membrane lined with PrimaLoft Gold thermal insulation. Pittards digital leather palms provide touchscreen sensitivity.',
    vendor: 'Swarajya Outerwear',
    productType: 'Accessories',
    status: 'ACTIVE',
    tags: ['gloves', 'outerwear', 'accessories', 'winter'],
    options: [
      {
        id: 'opt-25-sz',
        productId: 'prod-25',
        name: 'Size',
        position: 0,
        values: [
          { id: 'v-25-m', optionId: 'opt-25-sz', value: 'M (8.5")', position: 0 },
          { id: 'v-25-l', optionId: 'opt-25-sz', value: 'L (9.5")', position: 1 },
        ],
      },
    ],
    variants: [
      { id: 'var-25-m', productId: 'prod-25', title: 'M (8.5")', sku: 'BS-GLV-M', priceCents: 9500, compareAtPriceCents: 11000, inventoryQuantity: 24, reservedQuantity: 0 },
      { id: 'var-25-l', productId: 'prod-25', title: 'L (9.5")', sku: 'BS-GLV-L', priceCents: 9500, compareAtPriceCents: 11000, inventoryQuantity: 19, reservedQuantity: 0 },
    ],
    media: [
      { id: 'm-25', url: 'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=1000&q=80', altText: 'All weather technical gloves', position: 0 },
    ],
    createdAt: new Date('2026-02-22'),
    updatedAt: new Date('2026-02-24'),
  },
];
