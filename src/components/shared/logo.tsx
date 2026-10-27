import Link from 'next/link';
import { cn } from '@/lib/utils';

/** FLIP AI wordmark: bold "FLIP" with an accent "AI" chip. */
export function Logo({
  className,
  href = '/',
  compact = false,
}: {
  className?: string;
  href?: string;
  compact?: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn('group inline-flex items-center gap-1.5 select-none', className)}
      aria-label="FLIP AI"
    >
      <span className="relative flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-[0_0_24px_-6px_hsl(var(--primary))] transition-transform group-hover:-rotate-6">
        <svg
          viewBox="0 0 24 24"
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.6}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M7 17 17 7M9 7h8v8" />
        </svg>
      </span>
      {!compact && (
        <span className="flex items-baseline gap-1 leading-none">
          <span className="text-lg font-black tracking-[-0.04em]">FLIP</span>
          <span className="rounded-md border border-primary/40 px-1 py-0.5 text-[10px] font-bold tracking-widest text-primary">
            AI
          </span>
        </span>
      )}
    </Link>
  );
}
