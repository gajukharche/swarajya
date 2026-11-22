export type SectionType = 'Hero' | 'FeaturedCollection' | 'PromotionalBanner' | 'FAQ';

export interface PageSectionItem {
  id: string;
  sectionType: SectionType;
  position: number;
  isVisible: boolean;
  settings: Record<string, unknown>;
}

export const DEFAULT_HOMEPAGE_SECTIONS: PageSectionItem[] = [
  {
    id: 'hero-1',
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
    id: 'featured-1',
    sectionType: 'FeaturedCollection',
    position: 1,
    isVisible: true,
    settings: {
      heading: 'Trending Essentials',
      subheading: 'Precision-tailored designs built for performance.',
      collectionHandle: 'all',
      productLimit: 4,
    },
  },
  {
    id: 'promo-1',
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
  {
    id: 'faq-1',
    sectionType: 'FAQ',
    position: 3,
    isVisible: true,
    settings: {
      heading: 'Frequently Asked Questions',
      questions: [
        {
          q: 'What are your delivery timeframes?',
          a: 'Orders are processed immediately and delivered within 2-4 business days with end-to-end tracking.',
        },
        {
          q: 'What is your return policy?',
          a: 'We offer 30-day hassle-free returns on all unworn items with original tags attached.',
        },
        {
          q: 'How does inventory reservation work?',
          a: 'When you proceed to checkout, items in your cart are locked for 15 minutes to guarantee 0% oversell.',
        },
      ],
    },
  },
];
