'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { AuthCard } from '@/components/shared/auth-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Field } from '@/components/ui/label';
import { useApp } from '@/components/providers/app-provider';
import { fieldErrors, resetPasswordSchema } from '@/lib/validation';

export default function ResetPasswordPage() {
  const router = useRouter();
  const { auth, status } = useApp();
  const [form, setForm] = useState({ password: '', confirm: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = resetPasswordSchema.safeParse(form);
    if (!parsed.success) return setErrors(fieldErrors(parsed.error));
    setErrors({});
    setLoading(true);
    try {
      await auth.updatePassword(parsed.data.password);
      toast.success('Password aggiornata!');
      router.replace(status === 'authenticated' ? '/dashboard' : '/login');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Aggiornamento non riuscito');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthCard title="Nuova password" description="Scegli una nuova password per il tuo account.">
      <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
        <Field
          label="Nuova password"
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
          Salva password
        </Button>
      </form>
    </AuthCard>
  );
}
