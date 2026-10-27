'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/shared/states';
import { GuideCard } from '@/components/shared/guide-card';
import { GUIDE_CATEGORIES, GUIDES, type GuideCategoryId } from '@/lib/guides/content';
import { cn } from '@/lib/utils';

export default function GuidePage() {
  const [category, setCategory] = useState<GuideCategoryId | 'all'>('all');
  const visible = category === 'all' ? GUIDES : GUIDES.filter((g) => g.category === category);
  const current = GUIDE_CATEGORIES.find((c) => c.id === category);
  return (
    <>
      <PageHeader
        title="Guida Reselling"
        description="Strategie pratiche per comprare meglio, vendere prima e guadagnare di più. Brevi, concrete, senza fuffa."
      />
      <div className="scrollbar-none -mx-4 mb-6 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
        <button
          onClick={() => setCategory('all')}
          className={cn(
            'shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-medium transition',
            category === 'all'
              ? 'border-primary bg-primary/10 text-foreground'
              : 'text-muted-foreground hover:text-foreground',
          )}
        >
          Tutte
        </button>
        {GUIDE_CATEGORIES.map((c) => (
          <button
            key={c.id}
            onClick={() => setCategory(c.id)}
            className={cn(
              'shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-medium transition',
              category === c.id
                ? 'border-primary bg-primary/10 text-foreground'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {c.emoji} {c.label}
          </button>
        ))}
      </div>
      {current && <p className="mb-4 text-sm text-muted-foreground">{current.description}</p>}
      {visible.length === 0 ? (
        <div className="rounded-2xl border border-dashed p-10 text-center text-sm text-muted-foreground">
          Le guide di questa sezione sono in arrivo. Intanto leggi “Come capire se un capo è un buon affare” e
          “10 errori dei nuovi reseller”.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {visible.map((g) => (
            <GuideCard key={g.slug} guide={g} />
          ))}
        </div>
      )}
    </>
  );
}
