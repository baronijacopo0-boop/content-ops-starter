'use client';

import { useState } from 'react';
import { Check, Copy, Download, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { vintedSellUrl } from '@/lib/marketplace/links';
import { cn } from '@/lib/utils';

export interface PublishPayload {
  title: string;
  description: string;
  price: number | null;
  photos: string[];
}

async function copy(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

/** Downloads a photo (data URL or remote URL) so it can be uploaded on Vinted. */
async function downloadPhoto(src: string, name: string) {
  const blob = src.startsWith('data:')
    ? await (await fetch(src)).blob()
    : await (await fetch(src, { mode: 'cors' })).blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

function Step({ n, done, children }: { n: number; done: boolean; children: React.ReactNode }) {
  return (
    <li className="flex items-center gap-3">
      <span
        className={cn(
          'flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[11px] font-bold',
          done ? 'border-primary bg-primary text-primary-foreground' : 'text-muted-foreground',
        )}
      >
        {done ? <Check className="h-3.5 w-3.5" /> : n}
      </span>
      <div className="flex min-w-0 flex-1 flex-wrap items-center justify-between gap-2">{children}</div>
    </li>
  );
}

/**
 * "Pubblica su Vinted": copy title / description / price, download photos and open Vinted's sell page
 * in a new tab. The user creates the listing on Vinted themselves – nothing is automated.
 */
export function PublishVintedDialog({
  open,
  onOpenChange,
  payload,
  onMarkPublished,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  payload: PublishPayload;
  onMarkPublished?: () => Promise<void> | void;
}) {
  const [done, setDone] = useState<Record<string, boolean>>({});
  const [marking, setMarking] = useState(false);
  const mark = (k: string) => setDone((d) => ({ ...d, [k]: true }));

  async function copyField(key: string, label: string, text: string) {
    if (!text) return toast.error(`${label} vuoto: compilalo prima.`);
    if (await copy(text)) {
      mark(key);
      toast.success(`${label} copiato: incollalo su Vinted`);
    } else toast.error('Copia non riuscita: seleziona il testo manualmente.');
  }

  async function downloadAll() {
    try {
      for (const [i, src] of payload.photos.entries()) await downloadPhoto(src, `rivendo-foto-${i + 1}.jpg`);
      mark('photos');
      toast.success(`${payload.photos.length} foto scaricate`);
    } catch {
      toast.error('Download non riuscito: salva le foto tenendo premuto sull’immagine.');
    }
  }

  async function openVinted() {
    // Copy the title first so it is ready to paste as soon as Vinted opens.
    if (payload.title && (await copy(payload.title))) mark('title');
    window.open(vintedSellUrl(), '_blank', 'noopener,noreferrer');
    mark('open');
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Pubblica su Vinted</DialogTitle>
          <DialogDescription>
            Vinted si apre in una nuova scheda: copia qui i campi uno alla volta e incollali nel modulo
            “Vendi”. La pubblicazione la fai tu, RIVENDO non accede al tuo account.
          </DialogDescription>
        </DialogHeader>
        <ol className="flex flex-col gap-3" data-testid="publish-steps">
          <Step n={1} done={!!done.open}>
            <span className="text-sm">Apri la pagina “Vendi” di Vinted</span>
            <Button size="sm" onClick={openVinted}>
              <ExternalLink /> Apri Vinted
            </Button>
          </Step>
          <Step n={2} done={!!done.photos}>
            <span className="text-sm">Foto ({payload.photos.length})</span>
            <Button size="sm" variant="secondary" onClick={downloadAll} disabled={!payload.photos.length}>
              <Download /> Scarica foto
            </Button>
          </Step>
          <Step n={3} done={!!done.title}>
            <span className="min-w-0 flex-1 truncate text-sm" title={payload.title}>
              Titolo: <span className="text-muted-foreground">{payload.title || '—'}</span>
            </span>
            <Button size="sm" variant="secondary" onClick={() => copyField('title', 'Titolo', payload.title)}>
              <Copy /> Copia titolo
            </Button>
          </Step>
          <Step n={4} done={!!done.description}>
            <span className="text-sm">Descrizione ({payload.description.length} caratteri)</span>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => copyField('description', 'Descrizione', payload.description)}
            >
              <Copy /> Copia descrizione
            </Button>
          </Step>
          <Step n={5} done={!!done.price}>
            <span className="text-sm">Prezzo: {payload.price !== null ? `€${payload.price}` : '—'}</span>
            <Button
              size="sm"
              variant="secondary"
              onClick={() =>
                copyField('price', 'Prezzo', payload.price !== null ? String(payload.price) : '')
              }
            >
              <Copy /> Copia prezzo
            </Button>
          </Step>
        </ol>
        <p className="rounded-xl bg-muted/40 p-3 text-xs text-muted-foreground">
          Categoria, taglia, brand e condizione si scelgono dai menu di Vinted: usa quelli indicati
          nell’annuncio.
        </p>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Chiudi
          </Button>
          {onMarkPublished && (
            <Button
              loading={marking}
              onClick={async () => {
                setMarking(true);
                try {
                  await onMarkPublished();
                  onOpenChange(false);
                } finally {
                  setMarking(false);
                }
              }}
            >
              <Check /> Fatto: segna come pubblicato
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
