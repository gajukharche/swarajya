'use client';

import React, { useState, useEffect } from 'react';
import { HeroSection } from '@/components/sections/hero-section';
import { FeaturedCollectionSection } from '@/components/sections/featured-collection-section';
import { PromoBannerSection } from '@/components/sections/promo-banner-section';
import { FaqSection } from '@/components/sections/faq-section';
import { PageSectionItem, DEFAULT_HOMEPAGE_SECTIONS } from '@/lib/theme/sections-registry';

export default function ThemePreviewIframePage() {
  const [sections, setSections] = useState<PageSectionItem[]>(DEFAULT_HOMEPAGE_SECTIONS);

  useEffect(() => {
    // Listen for live postMessage updates from parent split-pane customizer
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'APEX_THEME_UPDATE') {
        setSections(event.data.sections);
      }
    };

    window.addEventListener('message', handleMessage);
    // Tell parent iframe is ready
    window.parent.postMessage({ type: 'APEX_THEME_PREVIEW_READY' }, '*');

    return () => window.removeEventListener('message', handleMessage);
  }, []);

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {sections
        .filter((s) => s.isVisible)
        .map((s) => {
          switch (s.sectionType) {
            case 'Hero':
              return <HeroSection key={s.id} settings={s.settings} />;
            case 'FeaturedCollection':
              return <FeaturedCollectionSection key={s.id} settings={s.settings} />;
            case 'PromotionalBanner':
              return <PromoBannerSection key={s.id} settings={s.settings} />;
            case 'FAQ':
              return <FaqSection key={s.id} settings={s.settings} />;
            default:
              return null;
          }
        })}
    </div>
  );
}
