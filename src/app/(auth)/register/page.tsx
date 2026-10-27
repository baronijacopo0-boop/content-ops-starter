'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { MailCheck } from 'lucide-react';
import { AuthCard } from '@/components/shared/auth-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Field } from '@/components/ui/label';
import { useApp } from '@/components/providers/app-provider';
import { fieldErrors, registerSchema } from '@/lib/validation';

export default function RegisterPage() {
  const router = useRouter();
  const { auth, status, refreshUser } = useApp();
  const [form, setForm] = useState({ fullName: '', email: '', password: '', confirm: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [confirmEmail, setConfirmEmail] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Already signed in → skip the form (but not right after signing up, which goes to onboarding).
  useEffect(() => {
    if (status === 'authenticated' && !submitted) router.replace('/dashboard');
  }, [status, router, submitted]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = registerSchema.safeParse(form);
    if (!parsed.success) return setErrors(fieldErrors(parsed.error));
    setErrors({});
    setLoading(true);
    setSubmitted(true);
    try {
      const { needsEmailConfirmation } = await auth.signUp(parsed.data);
      if (needsEmailConfirmation) {
        setConfirmEmail(true);
      } else {
        await refreshUser();
        toast.success('Account creato!');
        router.replace('/onboarding');
      }
    } catch (err) {
      setSubmitted(false);
      toast.error(err instanceof Error ? err.message : 'Registrazione non riuscita');
    } finally {
      setLoading(false);
    }
  }

  if (confirmEmail) {
    return (
      <AuthCard
        title="Controlla la tua email"
        description={`Ti abbiamo inviato un link di conferma a ${form.email}. Aprilo per attivare l’account.`}
      >
        <div className="flex flex-col items-center gap-4 py-4 text-center">
          <MailCheck className="h-10 w-10 text-primary" />
          <p className="text-sm text-muted-foreground">
            Non trovi l’email? Controlla anche nella cartella spam.
          </p>
          <Button variant="outline" asChild>
            <Link href="/login">Vai al login</Link>
          </Button>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Crea il tuo account"
      description="Pochi secondi e sei pronto a trovare il prossimo affare."
      footer={
        <>
          Hai già un account?{' '}
          <Link href="/login" className="font-semibold text-primary hover:underline">
            Accedi
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
        <Field label="Nome" htmlFor="fullName" error={errors.fullName}>
          <Input
            id="fullName"
            autoComplete="name"
            placeholder="Mario Rossi"
            value={form.fullName}
            onChange={(e) => setForm({ ...form, fullName: e.target.value })}
          />
        </Field>
        <Field label="Email" htmlFor="email" error={errors.email}>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="tu@email.com"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </Field>
        <Field
          label="Password"
          htmlFor="password"
          error={errors.password}
          hint="Almeno 8 caratteri, con lettere e numeri."
        >
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
        </Field>
        <Field label="Conferma password" htmlFor="confirm" error={errors.confirm}>
          <Input
            id="confirm"
            type="password"
            autoComplete="new-password"
            value={form.confirm}
            onChange={(e) => setForm({ ...form, confirm: e.target.value })}
          />
        </Field>
        <Button type="submit" size="lg" loading={loading}>
          Crea account
        </Button>
        <p className="text-center text-[11px] text-muted-foreground">
          Registrandoti accetti che i tuoi dati siano usati solo per far funzionare l’app.
        </p>
      </form>
    </AuthCard>
  );
}
