'use client';

import { Button } from '@/components/ui/button';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[60dvh] flex-col items-center justify-center gap-4 px-6 text-center">
      <h2 className="text-xl font-bold">Ops, qualcosa è andato storto</h2>
      <p className="max-w-md text-sm text-muted-foreground">{error.message || 'Errore imprevisto.'}</p>
      <Button onClick={reset}>Riprova</Button>
    </div>
  );
}
