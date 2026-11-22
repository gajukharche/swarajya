import React from 'react';
import { HelpCircle } from 'lucide-react';

interface FaqItem {
  q: string;
  a: string;
}

interface FaqSectionProps {
  settings?: {
    heading?: string;
    questions?: FaqItem[];
  };
}

export function FaqSection({ settings }: FaqSectionProps) {
  const heading = settings?.heading || 'Frequently Asked Questions';
  const questions = settings?.questions || [
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
  ];

  return (
    <section className="py-20 px-6 max-w-4xl mx-auto w-full">
      <div className="text-center mb-12 space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-zinc-900 text-zinc-400 border border-zinc-800">
          <HelpCircle className="w-3.5 h-3.5 text-indigo-400" />
          Store Inquiries
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">{heading}</h2>
      </div>

      <div className="space-y-4">
        {questions.map((faq, idx) => (
          <div
            key={idx}
            className="p-6 rounded-xl bg-zinc-900/50 border border-zinc-800 space-y-2 hover:border-zinc-700 transition-colors"
          >
            <h4 className="font-semibold text-white text-base">{faq.q}</h4>
            <p className="text-sm text-zinc-400 leading-relaxed">{faq.a}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
