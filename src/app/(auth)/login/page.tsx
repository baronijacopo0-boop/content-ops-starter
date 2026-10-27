'use client';

import Link from 'next/link';
import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { Play } from 'lucide-react';
import { AuthCard, safeNext } from '@/components/shared/auth-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Field } from '@/components/ui/label';
import { useApp } from '@/components/providers/app-provider';
import { LocalAuthService } from '@/lib/data/local-repository';
import { fieldErrors, loginSchema } from '@/lib/validation';

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const { auth, status, refreshUser } = useApp();
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const next = safeNext(params.get('next'));

  useEffect(() => {
    if (status === 'authenticated') router.replace(next);
  }, [status, router, next]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = loginSchema.safeParse(form);
    if (!parsed.success) return setErrors(fieldErrors(parsed.error));
    setErrors({});
    setLoading(true);
    try {
      await auth.signIn(parsed.data);
      await refreshUser();
      toast.success('Bentornato!');
      router.replace(next);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Login non riuscito');
    } finally {
      setLoading(false);
    }
  }

  async function demo() {
    setDemoLoading(true);
    try {
      await (auth as LocalAuthService).signInDemo();
      await refreshUser();
      router.replace('/dashboard');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Errore');
      setDemoLoading(false);
    }
  }

  return (
    <AuthCard
      title="Bentornato 👋"
      description="Accedi per vedere i tuoi affari, l’inventario e i profitti."
      footer={
        <>
          Non hai un account?{' '}
          <Link href="/register" className="font-semibold text-primary hover:underline">
            Registrati
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
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
        <Field label="Password" htmlFor="password" error={errors.password}>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
        </Field>
        <div className="-mt-1 text-right">
          <Link href="/forgot-password" className="text-xs text-muted-foreground hover:text-foreground">
            Password dimenticata?
          </Link>
        </div>
        <Button type="submit" size="lg" loading={loading}>
          Accedi
        </Button>
        {auth.mode === 'local' && (
          <Button type="button" variant="outline" size="lg" onClick={demo} loading={demoLoading}>
            <Play /> Entra con l’account demo
          </Button>
        )}
      </form>
    </AuthCard>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
