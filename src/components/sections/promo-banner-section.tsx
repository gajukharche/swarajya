import React from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';

interface PromoBannerSectionProps {
  settings?: {
    badge?: string;
    headline?: string;
    description?: string;
    ctaText?: string;
    ctaLink?: string;
  };
}

export function PromoBannerSection({ settings }: PromoBannerSectionProps) {
  const badge = settings?.badge || 'Limited Edition';
  const headline = settings?.headline || 'Spring 2026 Architectural Drop';
  const description = settings?.description || 'Precision-tailored apparel crafted with waterproof Japanese ripstop.';
  const ctaText = settings?.ctaText || 'Explore Capsule';
  const ctaLink = settings?.ctaLink || '/collections/all';

  return (
    <section className="py-12 px-6 max-w-7xl mx-auto w-full">
      <div className="relative rounded-2xl bg-gradient-to-r from-indigo-950 via-zinc-900 to-zinc-950 border border-indigo-900/40 p-8 sm:p-12 overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-900/60 text-indigo-300 border border-indigo-700/50">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            {badge}
          </div>

          <h3 className="text-2xl sm:text-4xl font-bold tracking-tight text-white leading-tight">
            {headline}
          </h3>

          <p className="text-sm sm:text-base text-zinc-300 leading-relaxed">
            {description}
          </p>

          <div className="pt-2">
            <Link
              href={ctaLink}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white text-zinc-950 font-medium text-sm hover:bg-zinc-200 transition-colors shadow-lg cursor-pointer"
            >
              {ctaText}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
