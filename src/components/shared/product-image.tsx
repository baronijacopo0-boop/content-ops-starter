'use client';

import { useState } from 'react';
import type { ItemCategory } from '@/lib/domain/types';
import { hashString, cn } from '@/lib/utils';

const PALETTES = [
  ['#1f2937', '#374151'],
  ['#1e293b', '#334155'],
  ['#3f2a1d', '#5b3d29'],
  ['#14352a', '#1f4d3c'],
  ['#2a1f3d', '#3d2d58'],
  ['#3b1d24', '#572a35'],
  ['#1d2f3b', '#2a4557'],
];

// Simple garment silhouettes (24×24 viewBox) so items without photos still look intentional.
const SHAPES: Record<ItemCategory, string> = {
  hoodie:
    'M9 4.5C9 2.8 10.3 2 12 2s3 .8 3 2.5l5 2.5-1.6 4.5H17V21H7V11.5H5.6L4 7zM9 4.5c.6 1.6 1.7 2.5 3 2.5s2.4-.9 3-2.5M11 7.5v3M13 7.5v3M9.5 15h5v3h-5z',
  sweater: 'M8 3.5h8l4.5 2.5-1.8 5H17V21H7V11H5.3L3.5 6zM10 3.5c.5 1.2 1.2 1.8 2 1.8s1.5-.6 2-1.8',
  tshirt: 'M8.5 3.5h7L20 6l-1.6 4H16V21H8V10H5.6L4 6zM10 3.5c.4 1.2 1.1 1.8 2 1.8s1.6-.6 2-1.8',
  shirt: 'M8 3h8l4.5 3-1.6 5H17v10H7V11H5.1L3.5 6zM12 5.5V21M10 3l2 2.5L14 3',
  jacket: 'M8 2.5h8l4.5 3-1 15.5H15V12h-1v9h-4v-9H9v9H4.5l-1-15.5zM12 4v8',
  jeans: 'M6.5 3h11l1 18h-4.5L12 9.5 10 21H5.5zM6.5 6h11',
  pants: 'M6.5 3h11l1.5 18h-5L12 10l-2 11H5zM6.5 6h11',
  tracksuit: 'M8 3h8l4.5 3-1.6 5H17v10H7V11H5.1L3.5 6zM12 3v18M7.2 11v10M16.8 11v10',
  sneakers: 'M2.5 15.5c0-2 1-4.5 2.5-6l3 1.5c1.5.8 3.5 1 5 .5l2.5-1c2 1.5 4.5 2.5 6 3v3.5h-19zM2.5 18.5h19',
  accessories: 'M4 13a8 5 0 0 1 16 0zM2.5 13h19v2.5h-19z',
};

export function GarmentIllustration({
  category,
  seed,
  className,
}: {
  category: ItemCategory;
  seed: string;
  className?: string;
}) {
  const [from, to] = PALETTES[hashString(seed) % PALETTES.length];
  return (
    <div
      className={cn('flex h-full w-full items-center justify-center', className)}
      style={{ background: `radial-gradient(120% 120% at 30% 20%, ${to}, ${from})` }}
    >
      <svg
        viewBox="0 0 24 24"
        className="h-1/2 w-1/2 opacity-80"
        fill="rgba(255,255,255,0.08)"
        stroke="rgba(255,255,255,0.55)"
        strokeWidth={0.9}
        strokeLinejoin="round"
        aria-hidden
      >
        <path d={SHAPES[category] ?? SHAPES.tshirt} />
      </svg>
    </div>
  );
}

/** Lazy-loaded product photo with graceful fallback to the garment illustration. */
export function ProductImage({
  src,
  alt,
  category,
  className,
  rounded = 'rounded-xl',
}: {
  src?: string | null;
  alt: string;
  category: ItemCategory;
  className?: string;
  rounded?: string;
}) {
  const [failed, setFailed] = useState(false);
  return (
    <div className={cn('relative overflow-hidden bg-muted', rounded, className)}>
      {src && !failed ? (
        // eslint-disable-next-line @next/next/no-img-element -- user photos from Supabase Storage / data URLs, already resized on upload
        <img
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
          onError={() => setFailed(true)}
          className="h-full w-full object-cover"
        />
      ) : (
        <GarmentIllustration category={category} seed={alt} />
      )}
    </div>
  );
}
