import React from 'react';
import Link from 'next/link';
import { ArrowRight, Zap } from 'lucide-react';

interface HeroSectionProps {
  settings?: {
    heading?: string;
    subheading?: string;
    buttonText?: string;
    buttonLink?: string;
    backgroundImageUrl?: string;
  };
}

export function HeroSection({ settings }: HeroSectionProps) {
  const heading = settings?.heading || 'Next-Generation Commerce';
  const subheading = settings?.subheading || 'Engineered for sub-second speed, seamless checkout, and absolute reliability.';
  const buttonText = settings?.buttonText || 'Shop New Arrivals';
  const buttonLink = settings?.buttonLink || '/collections/all';

  return (
    <section className="relative py-28 px-6 text-center overflow-hidden border-b border-zinc-800/60 bg-zinc-950">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(99,102,241,0.18),rgba(255,255,255,0))]" />
      
      <div className="relative max-w-4xl mx-auto space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-indigo-950/80 text-indigo-300 border border-indigo-800/50">
          <Zap className="w-3.5 h-3.5 text-indigo-400" />
          Next.js 16 + PostgreSQL 17 Performance
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
          {heading}
        </h1>

        <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
          {subheading}
        </p>

        <div className="pt-4 flex items-center justify-center gap-4">
          <Link
            href={buttonLink}
            className="px-6 py-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium flex items-center gap-2 shadow-lg shadow-indigo-500/20 transition-all cursor-pointer"
          >
            {buttonText}
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/admin"
            className="px-6 py-3 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 font-medium transition-all"
          >
            Merchant Admin ↗
          </Link>
        </div>
      </div>
    </section>
  );
}
