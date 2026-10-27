'use client';
import * as React from 'react';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import { Info } from 'lucide-react';
import { cn } from '@/lib/utils';

export const TooltipProvider = TooltipPrimitive.Provider;

/** Small "i" icon explaining what a metric means and why it matters. */
export function InfoTip({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <TooltipPrimitive.Root delayDuration={100}>
      <TooltipPrimitive.Trigger asChild>
        <button
          type="button"
          className={cn('inline-flex text-muted-foreground/70 transition hover:text-foreground', className)}
          aria-label="Cosa significa?"
        >
          <Info className="h-3.5 w-3.5" />
        </button>
      </TooltipPrimitive.Trigger>
      <TooltipPrimitive.Portal>
        <TooltipPrimitive.Content
          sideOffset={6}
          className="z-50 max-w-[260px] rounded-xl border bg-popover px-3 py-2 text-xs leading-relaxed text-popover-foreground shadow-xl data-[state=delayed-open]:animate-in data-[state=delayed-open]:fade-in-0"
        >
          {children}
          <TooltipPrimitive.Arrow className="fill-popover" />
        </TooltipPrimitive.Content>
      </TooltipPrimitive.Portal>
    </TooltipPrimitive.Root>
  );
}
