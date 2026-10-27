'use client';

import { useMemo, useRef, useState } from 'react';
import { Camera, Check, Package, Percent, Receipt, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader, StatsSkeleton } from '@/components/shared/states';
import { StatCard } from '@/components/shared/stat-card';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Field } from '@/components/ui/label';
import { SimpleSelect } from '@/components/ui/select';
import { useApp } from '@/components/providers/app-provider';
import { useInventory, useProfile, useRevalidate, useSales } from '@/hooks/use-data';
import { computeKpis } from '@/lib/domain/analytics';
import { BUDGET_OPTIONS, CATEGORIES, GOAL_OPTIONS, NICHES, SUGGESTED_BRANDS } from '@/lib/domain/constants';
import type { ItemCategory, Niche, UserProfileBundle } from '@/lib/domain/types';
import { formatDate, formatEUR, formatNumber, formatPct } from '@/lib/format';
import { processImage, validateImageFile } from '@/lib/image';
import { cn, sanitizeText } from '@/lib/utils';

function ProfileForm({ bundle }: { bundle: UserProfileBundle }) {
  const { repo } = useApp();
  const revalidate = useRevalidate();
  const fileRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    fullName: bundle.profile.fullName ?? '',
    username: bundle.profile.username ?? '',
    budget: String(bundle.goals.budget ?? 250),
    monthlyGoal: String(bundle.goals.monthlyGoal ?? 250),
    targetRoi: String(bundle.goals.targetRoi),
    mainCategory: bundle.profile.mainCategory ?? 'streetwear',
  });
  const [brands, setBrands] = useState<string[]>(bundle.profile.favoriteBrands);
  const [cats, setCats] = useState<ItemCategory[]>(bundle.profile.favoriteCategories);
  const [newBrand, setNewBrand] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  async function changeAvatar(file: File) {
    if (!repo) return;
    const err = await validateImageFile(file);
    if (err) return toast.error(err);
    setUploading(true);
    try {
      const img = await processImage(file, 320, 0.85);
      const url = await repo.uploadImage(img.blob, img.name);
      await repo.updateProfileBundle({ profile: { avatarUrl: url } });
      await revalidate('profile');
      toast.success('Foto profilo aggiornata');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Upload non riuscito');
    } finally {
      setUploading(false);
    }
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!repo) return;
    const username = form.username.trim().toLowerCase();
    if (username && !/^[a-z0-9._]{3,30}$/.test(username))
      return toast.error('Username: 3-30 caratteri tra lettere minuscole, numeri, punto e underscore.');
    const targetRoi = Number(form.targetRoi);
    if (!Number.isFinite(targetRoi) || targetRoi < 0 || targetRoi > 1000)
      return toast.error('ROI target non valido (0-1000%).');
    setSaving(true);
    try {
      await repo.updateProfileBundle({
        profile: {
          fullName: sanitizeText(form.fullName, 80) || null,
          username: username || null,
          mainCategory: form.mainCategory as Niche,
          favoriteBrands: brands,
          favoriteCategories: cats,
        },
        goals: { budget: Number(form.budget), monthlyGoal: Number(form.monthlyGoal), targetRoi },
      });
      await revalidate('profile');
      toast.success('Profilo salvato');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Errore';
      toast.error(/duplicate|unique/i.test(msg) ? 'Username già in uso' : msg);
    } finally {
      setSaving(false);
    }
  }

  const initials = (bundle.profile.fullName || bundle.profile.email).slice(0, 2).toUpperCase();

  return (
    <form onSubmit={save} className="grid gap-4 lg:grid-cols-[320px_1fr]">
      <Card>
        <CardContent className="flex flex-col items-center p-6 text-center">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="group relative h-24 w-24 overflow-hidden rounded-full bg-gradient-to-br from-primary to-emerald-700"
            aria-label="Cambia foto profilo"
          >
            {bundle.profile.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={bundle.profile.avatarUrl} alt="Foto profilo" className="h-full w-full object-cover" />
            ) : (
              <span className="flex h-full w-full items-center justify-center text-2xl font-black text-primary-foreground">
                {initials}
              </span>
            )}
            <span className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition group-hover:opacity-100">
              <Camera className="h-5 w-5" />
            </span>
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && changeAvatar(e.target.files[0])}
          />
          {uploading && <p className="mt-2 text-xs text-muted-foreground">Caricamento…</p>}
          <p className="mt-4 text-lg font-bold">{bundle.profile.fullName || 'Reseller'}</p>
          <p className="text-sm text-muted-foreground">
            {bundle.profile.username ? `@${bundle.profile.username}` : 'username non impostato'}
          </p>
          <dl className="mt-5 w-full space-y-2 text-left text-sm">
            <div className="flex justify-between gap-2">
              <dt className="text-muted-foreground">Email</dt>
              <dd className="truncate">{bundle.profile.email}</dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="text-muted-foreground">Iscritto dal</dt>
              <dd>{formatDate(bundle.profile.createdAt)}</dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="text-muted-foreground">Categoria</dt>
              <dd>{NICHES.find((n) => n.value === bundle.profile.mainCategory)?.label ?? '—'}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Dati personali e obiettivi</CardTitle>
            <CardDescription>Usati per personalizzare Deal Finder, analisi e insight.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <Field label="Nome" htmlFor="p-name">
              <Input
                id="p-name"
                value={form.fullName}
                maxLength={80}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              />
            </Field>
            <Field label="Username" htmlFor="p-username">
              <Input
                id="p-username"
                value={form.username}
                maxLength={30}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                placeholder="mario.flips"
              />
            </Field>
            <Field label="Categoria principale" htmlFor="p-niche">
              <SimpleSelect
                id="p-niche"
                value={form.mainCategory}
                onValueChange={(v) => setForm({ ...form, mainCategory: v as Niche })}
                options={NICHES.map((n) => ({ value: n.value, label: n.label }))}
              />
            </Field>
            <Field label="Budget reselling" htmlFor="p-budget">
              <SimpleSelect
                id="p-budget"
                value={form.budget}
                onValueChange={(v) => setForm({ ...form, budget: v })}
                options={BUDGET_OPTIONS.map((b) => ({
                  value: String(b),
                  label: `€${b}${b === 1000 ? '+' : ''}`,
                }))}
              />
            </Field>
            <Field label="Obiettivo mensile" htmlFor="p-goal">
              <SimpleSelect
                id="p-goal"
                value={form.monthlyGoal}
                onValueChange={(v) => setForm({ ...form, monthlyGoal: v })}
                options={GOAL_OPTIONS.map((g) => ({
                  value: String(g),
                  label: `€${g}${g === 1000 ? '+' : ''} extra`,
                }))}
              />
            </Field>
            <Field
              label="ROI minimo desiderato (%)"
              htmlFor="p-roi"
              hint="Usato nei suggerimenti di acquisto"
            >
              <Input
                id="p-roi"
                type="number"
                min={0}
                max={1000}
                value={form.targetRoi}
                onChange={(e) => setForm({ ...form, targetRoi: e.target.value })}
              />
            </Field>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Brand e categorie preferite</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-wrap gap-2">
              {Array.from(new Set([...SUGGESTED_BRANDS, ...brands])).map((b) => (
                <button
                  type="button"
                  key={b}
                  onClick={() =>
                    setBrands((prev) => (prev.includes(b) ? prev.filter((x) => x !== b) : [...prev, b]))
                  }
                  className={cn(
                    'rounded-full border px-3 py-1.5 text-xs font-medium transition',
                    brands.includes(b)
                      ? 'border-primary bg-primary/10'
                      : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  {brands.includes(b) && <Check className="mr-1 inline h-3 w-3 text-primary" />}
                  {b}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={newBrand}
                maxLength={60}
                onChange={(e) => setNewBrand(e.target.value)}
                placeholder="Aggiungi brand…"
                aria-label="Nuovo brand"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  const b = sanitizeText(newBrand, 60);
                  if (b && !brands.includes(b)) setBrands([...brands, b]);
                  setNewBrand('');
                }}
              >
                Aggiungi
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((c) => (
                <button
                  type="button"
                  key={c.value}
                  onClick={() =>
                    setCats((prev) =>
                      prev.includes(c.value) ? prev.filter((x) => x !== c.value) : [...prev, c.value],
                    )
                  }
                  className={cn(
                    'rounded-full border px-3 py-1.5 text-xs font-medium transition',
                    cats.includes(c.value)
                      ? 'border-primary bg-primary/10'
                      : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
        <div className="flex justify-end">
          <Button type="submit" loading={saving}>
            Salva profilo
          </Button>
        </div>
      </div>
    </form>
  );
}

export default function ProfilePage() {
  const { data: bundle } = useProfile();
  const { data: items } = useInventory();
  const { data: sales } = useSales();
  const kpis = useMemo(() => (items && sales ? computeKpis(items, sales) : null), [items, sales]);

  return (
    <>
      <PageHeader title="Profilo" description="I tuoi dati, i tuoi obiettivi e i numeri del tuo business." />
      {kpis ? (
        <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard label="Articoli venduti" value={formatNumber(kpis.itemsSold)} icon={Receipt} />
          <StatCard
            label="Profitto totale"
            value={formatEUR(kpis.totalProfit)}
            icon={TrendingUp}
            tone="profit"
          />
          <StatCard label="ROI medio" value={formatPct(kpis.avgRoi)} icon={Percent} />
          <StatCard
            label="Valore inventario"
            value={formatEUR(kpis.inventoryValue, { decimals: false })}
            icon={Package}
          />
        </div>
      ) : (
        <div className="mb-4">
          <StatsSkeleton />
        </div>
      )}
      {bundle && <ProfileForm key={bundle.profile.id} bundle={bundle} />}
    </>
  );
}
