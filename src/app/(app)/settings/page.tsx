'use client';

import { useEffect, useState } from 'react';
import useSWR from 'swr';
import { Database, KeyRound, RotateCcw, Sliders, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/shared/states';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Field } from '@/components/ui/label';
import { SimpleSelect } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { useApp } from '@/components/providers/app-provider';
import { useProfile, useRevalidate } from '@/hooks/use-data';
import { DEFAULT_WEIGHTS, MARKETPLACES } from '@/lib/domain/constants';
import type { DealScoreWeights, MarketplaceId } from '@/lib/domain/types';
import { fieldErrors, resetPasswordSchema } from '@/lib/validation';
import { aiClient } from '@/services/ai/client';
import { COMPONENT_LABELS, normalizeWeights } from '@/services/ai/deal-score';

const ALL_DATA = ['profile', 'inventory', 'sales', 'listings', 'watchlists', 'notifications', 'analyses'];

export default function SettingsPage() {
  const { repo, auth } = useApp();
  const { data: bundle } = useProfile();
  const revalidate = useRevalidate();
  const { data: ai } = useSWR('ai-status', () => aiClient.status());
  const [weights, setWeights] = useState<DealScoreWeights>(DEFAULT_WEIGHTS);
  const [extraCosts, setExtraCosts] = useState('1.5');
  const [saving, setSaving] = useState(false);
  const [pwd, setPwd] = useState({ password: '', confirm: '' });
  const [pwdErrors, setPwdErrors] = useState<Record<string, string>>({});
  const [pwdSaving, setPwdSaving] = useState(false);
  const [clearOpen, setClearOpen] = useState(false);
  const [seeding, setSeeding] = useState(false);

  useEffect(() => {
    if (!bundle) return;
    /* eslint-disable react-hooks/set-state-in-effect -- sync form with loaded settings */
    setWeights(bundle.settings.dealScoreWeights);
    setExtraCosts(String(bundle.settings.defaultExtraCosts));
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [bundle]);

  const normalized = normalizeWeights(weights);

  async function saveSettings(
    patch: Parameters<NonNullable<typeof repo>['updateProfileBundle']>[0]['settings'],
    message = 'Impostazioni salvate',
  ) {
    if (!repo) return;
    try {
      await repo.updateProfileBundle({ settings: patch });
      await revalidate('profile');
      toast.success(message);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Errore');
    }
  }

  async function saveScoring() {
    const costs = Number(extraCosts);
    if (!Number.isFinite(costs) || costs < 0 || costs > 100) return toast.error('Costi extra non validi');
    setSaving(true);
    await saveSettings(
      { dealScoreWeights: weights, defaultExtraCosts: costs },
      'Deal Score aggiornato: il Deal Finder usa i nuovi pesi',
    );
    setSaving(false);
  }

  async function changePassword(e: React.FormEvent) {
    e.preventDefault();
    const parsed = resetPasswordSchema.safeParse(pwd);
    if (!parsed.success) return setPwdErrors(fieldErrors(parsed.error));
    setPwdErrors({});
    setPwdSaving(true);
    try {
      await auth.updatePassword(parsed.data.password);
      setPwd({ password: '', confirm: '' });
      toast.success('Password aggiornata');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Errore');
    } finally {
      setPwdSaving(false);
    }
  }

  return (
    <>
      <PageHeader
        title="Impostazioni"
        description="Personalizza il calcolo degli affari, le notifiche e gestisci i tuoi dati."
      />
      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sliders className="h-4 w-4 text-primary" /> Pesi del Deal Score
            </CardTitle>
            <CardDescription>
              Decidi quanto conta ogni fattore. I pesi vengono normalizzati a 100%.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {(Object.keys(COMPONENT_LABELS) as (keyof DealScoreWeights)[]).map((k) => (
              <div key={k}>
                <div className="flex items-center justify-between text-sm">
                  <span>{COMPONENT_LABELS[k].label}</span>
                  <span className="tabular-nums text-muted-foreground">{Math.round(normalized[k])}%</span>
                </div>
                <Slider
                  min={0}
                  max={50}
                  step={1}
                  value={[weights[k]]}
                  onValueChange={([v]) => setWeights({ ...weights, [k]: v })}
                  aria-label={`Peso ${COMPONENT_LABELS[k].label}`}
                />
                <p className="text-[11px] text-muted-foreground">{COMPONENT_LABELS[k].hint}</p>
              </div>
            ))}
            <Field
              label="Costi extra predefiniti per vendita (€)"
              htmlFor="s-extra"
              hint="Imballaggio e materiali: usati in tutte le stime di profitto."
            >
              <Input
                id="s-extra"
                type="number"
                min={0}
                step="0.5"
                value={extraCosts}
                onChange={(e) => setExtraCosts(e.target.value)}
              />
            </Field>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setWeights(DEFAULT_WEIGHTS)}>
                <RotateCcw /> Ripristina
              </Button>
              <Button className="flex-1" onClick={saveScoring} loading={saving}>
                Salva
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Notifiche e marketplace</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <label className="flex items-center justify-between gap-3 text-sm">
                <span>
                  Nuovi Hot Deal
                  <span className="block text-xs text-muted-foreground">
                    Avvisami quando trovi occasioni con Deal Score ≥ 80.
                  </span>
                </span>
                <Switch
                  checked={bundle?.settings.notifyHotDeals ?? true}
                  onCheckedChange={(v) => saveSettings({ notifyHotDeals: v })}
                />
              </label>
              <label className="flex items-center justify-between gap-3 text-sm">
                <span>
                  Match delle watchlist
                  <span className="block text-xs text-muted-foreground">
                    Avvisami quando una ricerca salvata trova qualcosa.
                  </span>
                </span>
                <Switch
                  checked={bundle?.settings.notifyWatchlist ?? true}
                  onCheckedChange={(v) => saveSettings({ notifyWatchlist: v })}
                />
              </label>
              <Field
                label="Marketplace principale"
                htmlFor="s-market"
                hint="Altri marketplace saranno disponibili tramite nuovi provider."
              >
                <SimpleSelect
                  id="s-market"
                  value={bundle?.settings.preferredMarketplace ?? 'vinted'}
                  onValueChange={(v) => saveSettings({ preferredMarketplace: v as MarketplaceId })}
                  options={MARKETPLACES.filter((m) => m.available).map((m) => ({
                    value: m.value,
                    label: m.label,
                  }))}
                />
              </Field>
              <div className="flex flex-wrap gap-1.5">
                {MARKETPLACES.filter((m) => !m.available).map((m) => (
                  <Badge key={m.value} tone="muted">
                    {m.label} · in arrivo
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <KeyRound className="h-4 w-4 text-primary" /> Cambia password
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={changePassword} className="grid gap-3 sm:grid-cols-2" noValidate>
                <Field label="Nuova password" htmlFor="s-pwd" error={pwdErrors.password}>
                  <Input
                    id="s-pwd"
                    type="password"
                    autoComplete="new-password"
                    value={pwd.password}
                    onChange={(e) => setPwd({ ...pwd, password: e.target.value })}
                  />
                </Field>
                <Field label="Conferma" htmlFor="s-pwd2" error={pwdErrors.confirm}>
                  <Input
                    id="s-pwd2"
                    type="password"
                    autoComplete="new-password"
                    value={pwd.confirm}
                    onChange={(e) => setPwd({ ...pwd, confirm: e.target.value })}
                  />
                </Field>
                <Button type="submit" variant="secondary" className="sm:col-span-2" loading={pwdSaving}>
                  Aggiorna password
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-4 w-4 text-primary" /> Dati e sistema
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 text-sm">
              <div className="flex flex-wrap gap-2">
                <Badge tone={auth.mode === 'supabase' ? 'profit' : 'warning'}>
                  Database: {auth.mode === 'supabase' ? 'Supabase' : 'demo locale (browser)'}
                </Badge>
                <Badge tone={ai?.enabled ? 'profit' : 'muted'}>
                  AI: {ai?.enabled ? `${ai.provider} · ${ai.model}` : 'motore locale (mock)'}
                </Badge>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Button
                  variant="outline"
                  className="flex-1"
                  loading={seeding}
                  onClick={async () => {
                    if (!repo) return;
                    setSeeding(true);
                    try {
                      await repo.seedDemoData();
                      await revalidate(...ALL_DATA);
                      toast.success('Dati demo caricati');
                    } catch (e) {
                      toast.error(e instanceof Error ? e.message : 'Errore');
                    } finally {
                      setSeeding(false);
                    }
                  }}
                >
                  Carica dati demo
                </Button>
                <Button variant="destructive" className="flex-1" onClick={() => setClearOpen(true)}>
                  <Trash2 /> Elimina tutti i dati
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                I tuoi dati sono visibili solo a te (Row Level Security). L’eliminazione non cancella
                l’account.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <ConfirmDialog
        open={clearOpen}
        onOpenChange={setClearOpen}
        title="Eliminare tutti i dati?"
        description="Inventario, annunci, vendite, watchlist e notifiche verranno eliminati definitivamente. Il profilo resta."
        confirmLabel="Elimina tutto"
        onConfirm={async () => {
          if (!repo) return;
          try {
            await repo.clearAllData();
            await revalidate(...ALL_DATA);
            toast.success('Dati eliminati');
          } catch (e) {
            toast.error(e instanceof Error ? e.message : 'Errore');
          }
        }}
      />
    </>
  );
}
