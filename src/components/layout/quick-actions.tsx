'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ChevronDown, PackagePlus, Plus, Receipt, ScanSearch, Sparkles, type LucideIcon } from 'lucide-react';
import { QuickSaleDialog } from '@/components/shared/quick-sale-dialog';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface QuickAction {
  label: string;
  hint: string;
  icon: LucideIcon;
  href?: string;
  sale?: boolean;
}

const ACTIONS: QuickAction[] = [
  {
    label: 'Nuovo articolo',
    hint: 'Hai appena comprato qualcosa',
    icon: PackagePlus,
    href: '/inventory?new=1',
  },
  {
    label: 'Crea annuncio AI',
    hint: 'Dalle foto all’annuncio pronto',
    icon: Sparkles,
    href: '/listings/new',
  },
  { label: 'Registra vendita', hint: 'Profitto calcolato in automatico', icon: Receipt, sale: true },
  { label: 'Analizza un affare', hint: 'Conviene comprarlo?', icon: ScanSearch, href: '/analyze' },
];

/** Desktop: "Nuovo" dropdown in the top bar. */
export function QuickActionsMenu() {
  const [selling, setSelling] = useState(false);
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="inline-flex h-9 items-center gap-2 rounded-xl bg-primary px-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90">
            <Plus className="h-4 w-4" /> Nuovo <ChevronDown className="h-3.5 w-3.5 opacity-70" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-60">
          {ACTIONS.map((a) =>
            a.sale ? (
              <DropdownMenuItem key={a.label} onSelect={() => setSelling(true)}>
                <a.icon /> {a.label}
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem key={a.label} asChild>
                <Link href={a.href!}>
                  <a.icon /> {a.label}
                </Link>
              </DropdownMenuItem>
            ),
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      <QuickSaleDialog open={selling} onOpenChange={setSelling} />
    </>
  );
}

/** Mobile: central "+" button of the bottom bar opening a sheet with the four most common actions. */
export function QuickActionsButton() {
  const [open, setOpen] = useState(false);
  const [selling, setSelling] = useState(false);
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex w-full flex-col items-center gap-1 py-1.5 text-[10px] font-medium text-muted-foreground"
        aria-label="Azioni rapide"
      >
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30">
          <Plus className="h-5 w-5" />
        </span>
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogTitle>Cosa vuoi fare?</DialogTitle>
          <DialogDescription className="sr-only">Azioni rapide</DialogDescription>
          <div className="grid grid-cols-2 gap-2">
            {ACTIONS.map((a) => {
              const body = (
                <>
                  <a.icon className="h-5 w-5 text-primary" />
                  <span className="text-sm font-semibold">{a.label}</span>
                  <span className="text-[11px] leading-tight text-muted-foreground">{a.hint}</span>
                </>
              );
              const cls =
                'flex min-h-24 flex-col items-start gap-1 rounded-2xl border bg-muted/20 p-3 text-left transition hover:bg-accent';
              return a.sale ? (
                <button
                  key={a.label}
                  className={cls}
                  onClick={() => {
                    setOpen(false);
                    setSelling(true);
                  }}
                >
                  {body}
                </button>
              ) : (
                <Link key={a.label} href={a.href!} className={cls} onClick={() => setOpen(false)}>
                  {body}
                </Link>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>
      <QuickSaleDialog open={selling} onOpenChange={setSelling} />
    </>
  );
}
