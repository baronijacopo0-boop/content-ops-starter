# FLIP AI

**AI + reselling + marketplace intelligence.** Web app per chi compra vestiti per rivenderli (Vinted e, in futuro, altri marketplace): trova occasioni, valuta se conviene comprare, stima prezzo di rivendita / profitto / ROI, genera annunci dalle foto, gestisce inventario e vendite e mostra analytics e insight sul business.

> Deploy su Hostinger: vedi **[docs/DEPLOY_HOSTINGER.md](docs/DEPLOY_HOSTINGER.md)**.

---

## Indice

1. [Funzionalità](#funzionalità)
2. [Architettura](#architettura)
3. [Struttura del progetto](#struttura-del-progetto)
4. [Installazione e sviluppo locale](#installazione-e-sviluppo-locale)
5. [Supabase: schema, migrations, RLS](#supabase-schema-migrations-rls)
6. [Layer AI](#layer-ai)
7. [Marketplace provider](#marketplace-provider)
8. [Sicurezza](#sicurezza)
9. [Test](#test)
10. [Cosa è reale, cosa è mock, cosa collegare in futuro](#cosa-è-reale-cosa-è-mock-cosa-collegare-in-futuro)
11. [Limitazioni note](#limitazioni-note)
12. [Idee per la V2](#idee-per-la-v2)

---

## Funzionalità

| Area | Cosa fa |
| --- | --- |
| **Autenticazione** | Registrazione, login, logout, recupero e reset password, conferma email, route protette (server + client). |
| **Onboarding** | Budget, categoria principale, brand preferiti, obiettivo mensile, ROI minimo, dati demo opzionali. |
| **Dashboard** | Saluto, obiettivo del mese, 4 KPI principali + capitale investito, fatturato, margine, sell-through, tempo medio vendita; grafico profitto (7g/30g/3m/6m/1a), vendite mensili, top brand, ultimi articoli, Inventory Health, consiglio del giorno, widget **“Sto per comprare…”** (BUY / MAYBE / SKIP). |
| **Deal Finder** | Feed di 20 occasioni con Deal Score, badge HOT/GOOD/MAYBE/SKIP, profitto, ROI, tempo vendita; filtri (brand, categoria, taglia, condizione, prezzo max, profitto min, ROI min, score min, giorni max, solo brand preferiti) e 6 ordinamenti; dettaglio con analisi completa e “L’ho comprato” → inventario. |
| **Analizza prodotto** | Valore di mercato, prezzo consigliato, profitto, ROI, Deal Score con scomposizione, tempo vendita, verdetto, **best buy price**, spiegazione AI, Price Advisor, storico analisi. |
| **Crea annuncio AI** | Upload 1-8 foto (validazione MIME/magic bytes/dimensione, resize, rimozione EXIF), analisi foto, campi “da confermare”, titoli SEO, descrizione pronta da copiare, Price Advisor a 3 strategie, salvataggio Bozza/Pubblicato/Venduto, collegamento all’inventario, modifica annunci esistenti. |
| **I miei annunci** | Filtri Tutti/Attivi/Venduti/Bozze, azioni Modifica/Duplica/Segna venduto/Elimina (UI ottimistica). |
| **Inventario** | Tutti i campi richiesti, stati (Da fotografare → Venduto), stock age NEW/NORMAL/SLOW/OLD STOCK, Inventory Health, profitto e ROI automatici, vendita con anteprima profitto. |
| **Vendite** | Storico con profitto, ROI, giorni per vendere; KPI; filtri periodo; export CSV. |
| **Watchlist** | Ricerche salvate con tutti i filtri, match in tempo reale con il Deal Finder, attiva/disattiva, notifiche in-app (“Controlla ora”), pipeline predisposta per email/push. |
| **Analytics** | 10 KPI, AI Insights, profitto e vendite per mese, ROI per brand, profitto per categoria, tempo vendita per brand, prezzo medio acquisto vs vendita, top 5 e 5 peggiori brand. |
| **Guida Reselling** | 16 categorie, 8 guide complete. |
| **Calcolatore** | Profitto, ROI, margine in tempo reale + prezzo massimo da pagare / prezzo minimo di vendita per un ROI target. |
| **Profilo / Impostazioni** | Foto profilo, username, obiettivi, brand/categorie preferite, statistiche; pesi del Deal Score modificabili, costi extra predefiniti, notifiche, cambio password, carica/elimina dati demo, stato DB/AI. |

UI: dark mode, mobile-first (bottom navigation + menu a scomparsa su smartphone, sidebar su desktop), skeleton loader, stati vuoti/errore, toast, tooltip che spiegano **cosa significa ogni dato e perché è importante**.

## Architettura

```
┌─────────────────────────── Hostinger (Node.js app) ───────────────────────────┐
│ Next.js 16 (App Router, TypeScript, Tailwind, componenti stile shadcn/ui)      │
│                                                                                │
│  Frontend (pagine client)  ──►  DataRepository ──► Supabase JS (RLS) ──────────┼──► Supabase
│        │                         └► LocalRepository (demo, localStorage)        │    (Auth, Postgres,
│        │                                                                        │     Storage)
│        ├──► MarketplaceProvider ──► MockVintedProvider (dati demo)              │
│        │                         └► (futuro) API ufficiali / import CSV         │
│        │                                                                        │
│        └──► aiClient ──► /api/ai/* (route server) ──► services/ai/server.ts ────┼──► Anthropic API
│                    └──► fallback motore locale (mock) se API non disponibile    │    (opzionale)
│  src/proxy.ts: refresh sessione Supabase + protezione route lato server         │
└────────────────────────────────────────────────────────────────────────────────┘
```

Scelte principali:

- **Supabase come backend esterno** (Auth + PostgreSQL + Storage + RLS). Hostinger ospita solo la web app: nessun database o servizio a pagamento aggiuntivo.
- **Accesso ai dati dal browser con la chiave anon** e **Row Level Security** su ogni tabella: ogni utente vede solo i propri dati. La service role key non è mai usata dall’app (solo dallo script `seed:demo`).
- **AI solo lato server** in `/api/ai/*` (chiave mai esposta), con rate limit, validazione e **fallback automatico** al motore locale: l’app funziona anche senza chiave AI.
- **Due modalità di deploy** dallo stesso codice: Node.js (consigliata) oppure **export statico** (`npm run build:static`) per piani condivisi senza Node.js — in quel caso le API route sono escluse e l’AI usa il motore locale.
- **Modalità demo locale**: senza variabili Supabase l’app funziona interamente nel browser (utile per sviluppo, demo e test E2E).
- **Separazione netta**: `src/app` (UI) · `src/lib/data` (persistenza) · `src/lib/marketplace` (dati di mercato) · `src/services/ai` (AI) · `supabase/` (database).

## Struttura del progetto

```
├── docs/DEPLOY_HOSTINGER.md        guida completa al deploy
├── public/                          icona, robots.txt
├── scripts/
│   ├── generate-sql.ts              genera reference data + seed SQL dalle costanti TS
│   ├── seed-demo-user.ts            crea l’account demo su Supabase (service role, solo locale)
│   └── static-htaccess.mjs          .htaccess per l’export statico
├── src/
│   ├── proxy.ts                     sessione Supabase + protezione route (Next 16 “proxy”)
│   ├── app/
│   │   ├── page.tsx                 landing page
│   │   ├── (auth)/                  login, register, forgot-password, reset-password
│   │   ├── auth/callback/           link email Supabase (conferma / recovery)
│   │   ├── onboarding/
│   │   ├── (app)/                   area protetta: dashboard, deals, analyze, listings(/new),
│   │   │                            inventory, sales, watchlist, analytics, guide(/[slug]),
│   │   │                            calculator, profile, settings
│   │   └── api/                     health, ai/{deal,listing,analyze-images,insights}
│   ├── components/
│   │   ├── ui/                      button, card, dialog, select, tabs, … (stile shadcn/ui)
│   │   ├── layout/app-shell.tsx     sidebar, bottom nav, guard, notifiche
│   │   ├── deals/                   DealCard, DealScore, AIAnalysis, PriceSuggestion, QuickDealAnalyzer
│   │   ├── inventory/               InventoryTable, InventoryHealth, InventoryItemDialog, RecentItems
│   │   ├── listings/                ListingCard
│   │   ├── charts/                  ProfitChart, SalesChart, BarListChart, BuySellChart
│   │   └── shared/                  StatCard, ProfitCard, ImageUploader, WatchlistCard, GuideCard, BrandAnalytics…
│   ├── hooks/                       use-data (SWR), use-deal-feed
│   ├── lib/
│   │   ├── domain/                  tipi, costanti, finanza (profitto/ROI), stock age, analytics
│   │   ├── data/                    DataRepository: Supabase + Local, demo seed
│   │   ├── marketplace/             MarketplaceProvider, MockVintedProvider, metriche di mercato
│   │   ├── supabase/                client browser / server / proxy
│   │   ├── deals/filter.ts          filtri e ordinamenti (Deal Finder + Watchlist)
│   │   ├── validation.ts            schemi zod
│   │   └── image.ts                 validazione/resize immagini, colori dominanti
│   └── services/ai/                 analyzeItemImages, generateListing, estimatePrice,
│                                    calculateDealScore, analyzeDeal, generateBusinessInsights,
│                                    generateResellingAdvice, server (Claude), client, rate-limit
├── supabase/
│   ├── migrations/                  001 schema · 002 RLS · 003 storage · 004 funzioni · 005 reference data
│   ├── seed.sql                     comparabili demo per market intelligence (facoltativo)
│   └── tests/                       test RLS su PostgreSQL locale
└── tests/                           unit (Vitest) ed E2E (Playwright)
```

## Installazione e sviluppo locale

Requisiti: **Node.js ≥ 20.9** (consigliato 20 o 22), npm.

```bash
npm install
cp .env.example .env.local     # facoltativo: senza Supabase parte la modalità demo locale
npm run dev                    # http://localhost:3000
```

- **Senza Supabase**: registrati oppure clicca “Entra con l’account demo” nella pagina di login. I dati restano nel browser.
- **Con Supabase**: compila `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` in `.env.local` (vedi sezione Supabase) e riavvia `npm run dev`.
- **Con AI reale**: imposta `AI_API_KEY` (Anthropic). Senza chiave l’AI usa il motore locale.

Script utili:

| Comando | Descrizione |
| --- | --- |
| `npm run dev` | sviluppo |
| `npm run build` / `npm start` | build e avvio produzione (Node.js) |
| `npm run build:static` | export statico in `out/` (+ `.htaccess`) |
| `npm run lint` / `npm run typecheck` | ESLint / TypeScript |
| `npm test` | unit test (Vitest) |
| `npm run test:e2e` | test E2E (Playwright, build di produzione in modalità demo) |
| `npm run test:db` | applica migrations + seed su un PostgreSQL locale e verifica le policy RLS |
| `npm run seed:demo` | crea/aggiorna l’account demo su Supabase (usa la service role key da `.env.local`) |
| `npm run db:generate` | rigenera `reference_data.sql` e `seed.sql` dalle costanti TypeScript |

## Supabase: schema, migrations, RLS

Migrations in `supabase/migrations/` (da eseguire **in ordine**):

| File | Contenuto |
| --- | --- |
| `…01_schema.sql` | tabelle, vincoli, indici, colonne calcolate (`profit`, `roi`, `days_to_sell`), trigger `updated_at`, trigger `handle_new_user` (crea profilo, obiettivi e impostazioni alla registrazione) |
| `…02_rls.sql` | RLS su tutte le tabelle, grant minimi, policy “solo i propri dati”; i riferimenti a inventario/annunci di altri utenti sono bloccati |
| `…03_storage.sql` | bucket `item-photos` (5 MB, JPG/PNG/WEBP) e policy: ogni utente scrive solo nella cartella `<user_id>/` |
| `…04_functions.sql` | `mark_item_sold()` (vendita atomica), `market_metrics()` (media, mediana, range, tempo vendita, domanda, vendite, annunci, sell-through), `refresh_market_prices()` (solo service_role) |
| `…05_reference_data.sql` | categorie e brand (generati da `scripts/generate-sql.ts`) |

Tabelle: `profiles`, `user_goals`, `user_settings`, `inventory_items`, `listings`, `sales`, `watchlists`, `watchlist_filters`, `ai_generations`, `deal_analyses`, `notifications`, `market_items`, `market_prices`, `brands`, `categories`.
Tutte le tabelle utente hanno `user_id → auth.users(id)` con `on delete cascade`.

Le policy sono testate (`npm run test:db`): un utente non può leggere, modificare, cancellare o referenziare righe di un altro utente, né caricare file nella sua cartella; `anon` non ha accesso; i dati di riferimento sono in sola lettura.

## Layer AI

`src/services/ai/` contiene le funzioni richieste:

| Funzione | Dove | Note |
| --- | --- | --- |
| `calculateDealScore()` | `deal-score.ts` | 30% prezzo vs mercato · 20% domanda brand · 20% ROI · 15% velocità · 10% condizione · 5% taglia. Pesi modificabili dall’utente (Impostazioni) e normalizzati. |
| `estimatePrice()` | `pricing.ts` | valore di mercato dai comparabili (normalizzati per condizione) + 3 strategie (veloce / consigliato / massimo profitto) con giorni stimati. |
| `analyzeDeal()` | `deal.ts` | verdetto, profitto, ROI, margine, tempo vendita, prezzo massimo da pagare per il ROI target, spiegazione basata sui dati. |
| `analyzeItemImages()` | `images.ts` / `server.ts` | mock: colori misurati dai pixel, brand/tipo da nome file e suggerimenti; con AI: visione Claude con output strutturato. Taglia e condizione sono **sempre** da confermare. |
| `generateListing()` | `listing.ts` / `server.ts` | titoli SEO naturali (con accordo dei colori in italiano), descrizione pronta, hashtag, avvisi per i dati mancanti. Non inventa autenticità, materiali, condizioni, difetti, taglia o provenienza. |
| `generateBusinessInsights()` | `insights.ts` | insight calcolati dai dati reali dell’utente (confronto brand, brand lenti, quota categoria, capitale bloccato, leva sul prezzo d’acquisto, brand in perdita, obiettivo mensile, articoli non pubblicati). |
| `generateResellingAdvice()` | `advice.ts` | consiglio del giorno + guida collegata. |

Con `AI_API_KEY` impostata, `server.ts` usa l’SDK ufficiale Anthropic (modello `AI_MODEL`, default `claude-opus-5-5`, effort basso, output strutturato con schema zod, fallback lato server in caso di rifiuto). Qualsiasi errore → risultato del motore locale. La logica numerica (score, prezzi, ROI) resta sempre deterministica: l’LLM migliora solo testi e riconoscimento visivo.

## Marketplace provider

`src/lib/marketplace/types.ts` definisce `MarketplaceProvider` con `searchItems`, `getItem`, `getUserItems`, `getSoldItems`, `getProfile`, `getMarketData`, `getComparableItems`, `getEstimatedMarketValue`.
`MockVintedProvider` genera localmente e in modo deterministico 20 occasioni e ~1.600 comparabili: **nessuna richiesta a Vinted**, niente scraping, auto-buy, auto-like o messaggi automatici.

Per aggiungere Depop, eBay, Grailed, Vestiaire, Wallapop, un’API ufficiale o un import CSV: implementa l’interfaccia in `src/lib/marketplace/providers/` e registrala in `src/lib/marketplace/index.ts`. Le metriche (`computeMarketMetrics`) e il resto dell’app restano invariati. La tabella `market_items` + `market_metrics()` / `refresh_market_prices()` è pronta per ospitare dati reali.

## Sicurezza

- Supabase **RLS** su tutte le tabelle + storage per cartella utente.
- **Protezione route** server-side (`src/proxy.ts`, verifica JWT con `auth.getUser()`) e client-side (AppShell); redirect `?next=` solo relativi (no open redirect).
- **Validazione input** con zod (client e server), lunghezze massime anche nei CHECK SQL, normalizzazione testi (caratteri di controllo/zero-width rimossi); React esegue l’escape di tutto l’output.
- **Immagini**: whitelist MIME, controllo magic bytes, max 5 MB per file, max 8 foto, ridimensionamento e ricodifica JPEG (rimuove EXIF/GPS); limiti ribaditi dal bucket Storage.
- **AI**: chiave solo server-side, controllo origin, autenticazione obbligatoria (con Supabase), rate limit per utente/IP, limite dimensione richiesta, validazione schema, log in `ai_generations` senza immagini.
- **Header di sicurezza** (X-Frame-Options, nosniff, Referrer-Policy, Permissions-Policy); `.htaccess` equivalente per l’export statico.
- Segreti solo in variabili d’ambiente; `.env*` esclusi da git.

## Test

```bash
npm test            # 31 unit test: finanza, Deal Score, stock age, analytics, listing, provider, filtri, validazione
npm run test:e2e    # 14 flussi E2E (desktop + mobile)
npm run test:db     # migrations + RLS su PostgreSQL ≥ 15 locale
```

Flussi E2E coperti: registrazione → onboarding → dashboard · route protette · login/logout · validazioni e recupero password · account demo · aggiunta/modifica/vendita/eliminazione inventario con calcolo profitto e ROI · storico vendite · calcolatore · Deal Finder (feed, filtri, dettaglio) · analisi deal · quick analysis · creazione annuncio AI da foto + salvataggio bozza (incluso rifiuto file non immagine) · watchlist + notifiche · analytics e guide · responsive mobile (nessun overflow orizzontale su 13 pagine).

## Cosa è reale, cosa è mock, cosa collegare in futuro

**Funzionante e reale**: auth Supabase, database con RLS, storage foto, inventario, annunci, vendite, watchlist, analytics, insight, calcoli di profitto/ROI/stock age, Deal Score, prezzi dai comparabili, generazione annunci (motore locale), modalità demo, export CSV.

**Mock / demo**:
- Dati marketplace (`MockVintedProvider`): occasioni e comparabili generati localmente.
- Visualizzazioni e preferiti degli annunci (non sincronizzati con Vinted).
- Riconoscimento visivo senza `AI_API_KEY` (solo colori + nome file + suggerimenti).
- Notifiche watchlist: generate on-demand con “Controlla ora”, solo in-app.

**Da collegare in futuro**:
- Provider marketplace reali (API ufficiali / integrazioni autorizzate / import CSV dei propri dati).
- Job programmato per watchlist e `refresh_market_prices()` (Supabase Cron + Edge Function o cron Hostinger) + email/push.
- Import automatico delle vendite dal marketplace (solo tramite API autorizzate).
- Multi-valuta / multi-lingua.

## Limitazioni note

- Le stime di prezzo si basano su dati demo finché non si collega una fonte reale.
- Il rate limit AI è in memoria: corretto con un singolo processo Node (Hostinger Node.js / VPS); con più istanze usare Redis o una tabella.
- In export statico non ci sono API route: niente AI remota e protezione route solo client-side (i dati restano comunque protetti da RLS).
- La modalità demo locale salva nel `localStorage` (≈5 MB): pensata per prove, non per uso reale.
- La cancellazione di una vendita non riporta l’articolo “in vendita”.
- Non è stato possibile eseguire in questo ambiente un progetto Supabase completo (Auth/Storage): schema e RLS sono testati su PostgreSQL 16 con uno shim degli schemi `auth`/`storage`; il repository Supabase è verificato contro lo schema (colonne) ma va provato end-to-end sul progetto reale con la checklist di `docs/DEPLOY_HOSTINGER.md`.

## Idee per la V2

- Integrazioni marketplace autorizzate e import CSV dello storico vendite.
- Notifiche email/push programmate per watchlist e Hot Deal.
- Riconoscimento capo da foto anche per il Deal Finder; stima autenticità **solo** come checklist assistita.
- Pianificatore riprezzamenti automatico (suggerimenti a 14/30/60 giorni).
- Gestione spedizioni ed etichette, bundle, costi per fonte d’acquisto.
- PWA installabile con upload foto offline; app mobile.
- Team / multi-account per reseller professionali; esportazione fiscale.
- Piani a pagamento (Stripe) con limiti AI per piano.
