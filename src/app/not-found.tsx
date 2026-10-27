import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/shared/logo';

export default function NotFound() {
  return (
    <div className="grid-bg flex min-h-dvh flex-col items-center justify-center gap-6 px-6 text-center">
      <Logo />
      <div>
        <p className="text-6xl font-black tracking-tighter text-gradient">404</p>
        <p className="mt-2 text-muted-foreground">Questa pagina non esiste (o è già stata venduta 😉).</p>
      </div>
      <Button asChild>
        <Link href="/dashboard">Torna alla dashboard</Link>
      </Button>
    </div>
  );
}
