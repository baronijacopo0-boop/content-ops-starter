'use client';

import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'sonner';
import { MailCheck } from 'lucide-react';
import { AuthCard } from '@/components/shared/auth-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Field } from '@/components/ui/label';
import { useApp } from '@/components/providers/app-provider';
import { emailSchema } from '@/lib/validation';

export default function ForgotPasswordPage() {
  const { auth } = useApp();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = emailSchema.safeParse(email);
    if (!parsed.success) return setError(parsed.error.issues[0].message);
    setError(undefined);
    setLoading(true);
    try {
      await auth.requestPasswordReset(parsed.data);
      setSent(true);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Richiesta non riuscita');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthCard
      title="Recupera password"
      description="Inserisci l’email del tuo account: ti invieremo un link per crearne una nuova."
      footer={
        <Link href="/login" className="font-semibold text-primary hover:underline">
          Torna al login
        </Link>
      }
    >
      {sent ? (
        <div className="flex flex-col items-center gap-3 py-2 text-center">
          <MailCheck className="h-10 w-10 text-primary" />
          <p className="text-sm text-muted-foreground">
            Se esiste un account con questa email, riceverai a breve il link per reimpostare la password.
          </p>
          {auth.mode === 'local' && (
            <Button variant="outline" asChild>
              <Link href="/reset-password">Modalità demo: imposta la nuova password</Link>
            </Button>
          )}
        </div>
      ) : (
        <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
          <Field label="Email" htmlFor="email" error={error}>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
            />
          </Field>
          <Button type="submit" size="lg" loading={loading}>
            Invia link di reset
          </Button>
        </form>
      )}
    </AuthCard>
  );
}
