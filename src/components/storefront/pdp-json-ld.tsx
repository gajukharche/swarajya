import React from 'react';

interface PdpJsonLdProps {
  product: {
    title: string;
    description?: string | null;
    vendor?: string | null;
    handle: string;
    variants: Array<{
      sku: string;
      priceCents: number;
      inventoryQuantity: number;
    }>;
    media: Array<{ url: string }>;
  };
  storeUrl?: string;
}

export function PdpJsonLd({ product, storeUrl = 'http://localhost:3000' }: PdpJsonLdProps) {
  const primaryVariant = product.variants[0];
  const images = product.media.map((m) => m.url);

  const jsonLd = {
    '@context': 'https://schema.org/',
    '@type': 'Product',
    name: product.title,
    image: images.length > 0 ? images : undefined,
    description: product.description || undefined,
    brand: {
      '@type': 'Brand',
      name: product.vendor || 'Apex Merchant',
    },
    sku: primaryVariant?.sku,
    offers: {
      '@type': 'Offer',
      url: `${storeUrl}/products/${product.handle}`,
      priceCurrency: 'USD',
      price: primaryVariant ? (primaryVariant.priceCents / 100).toFixed(2) : '0.00',
      availability:
        primaryVariant && primaryVariant.inventoryQuantity > 0
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
      itemCondition: 'https://schema.org/NewCondition',
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
