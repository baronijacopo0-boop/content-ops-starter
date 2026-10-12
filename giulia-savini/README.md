# Sito Dott.ssa Giulia Savini

Sito personale della Dott.ssa Giulia Savini – Psicologa · Sessuologa Clinica · Psicoterapeuta Sistemico-Relazionale in formazione (Teramo e online).

**Stack:** Next.js 15 (App Router) · TypeScript · Tailwind CSS · lucide-react. Nessun'altra dipendenza runtime.

## Avvio

```bash
npm install
npm run dev        # sviluppo su http://localhost:3000
npm run build      # build di produzione
npm start          # avvia la build
npm run typecheck  # controllo TypeScript
```

## Dove si modificano i contenuti

Tutti i testi e i dati sono in **`data/profile.ts`**: profilo, titoli, formazione, indirizzo, contatti, percorsi, aree di intervento, FAQ, valutazione e recensioni, stato delle pagine legali.

- I campi impostati a `null` (telefono, email, numero civico, Ordine regionale…) **non vengono mostrati**: basta valorizzarli.
- I commenti `TODO` indicano le informazioni da verificare con la Dott.ssa.

### Fotografie

Caricare in `public/images/`:

| File | Uso | Formato consigliato |
| --- | --- | --- |
| `giulia-savini.jpg` | Hero (verticale 4:5) | almeno 1200×1500 px |
| `giulia-savini-studio.jpg` | Sezione "Chi sono" (verticale 4:5) | almeno 1000×1250 px |
| `studio-1.jpg` | Galleria "Lo studio" (verticale 4:5) | almeno 1000×1250 px |
| `studio-2.jpg` | Galleria "Lo studio" (verticale 3:4) | almeno 900×1200 px |
| `studio-3.jpg` | Galleria "Lo studio" (quadrata o orizzontale) | almeno 1000×1000 px |

Il sito rileva automaticamente i file al momento della build. Finché mancano mostra una composizione grafica astratta (mai foto stock), oppure, con `SHOW_PHOTO_PLACEHOLDERS=true`, una cornice demo che indica quale foto inserire e con quale nome. La galleria "Lo studio" compare solo se c'è almeno una foto o se le cornici demo sono attive. Next.js converte le immagini in AVIF/WebP responsive.

### Recensioni

Inserire in `profile.reviews` **solo** testi realmente pubblicati e verificabili, riportati fedelmente con autore/iniziali, data e fonte. Con l'array vuoto la sezione mostra solo la valutazione (4,9/5 · 4 opinioni su GuidaPsicologi) con il link alla fonte. Per nasconderla: `rating.show = false`.
La valutazione **non** è inserita nei dati strutturati Schema.org, perché le linee guida Google escludono le recensioni di terze parti.

### Prenotazione online (calendario collegato a Google Calendar)

Il sito ha un calendario proprio, con mese, giorni e orari. Gli orari liberi sono calcolati così:
**orari di ricevimento** (`bookingConfig` in `data/profile.ts`) **−** impegni già presenti nel Google Calendar della Dott.ssa **−** preavviso minimo.
Ogni prenotazione diventa un evento nel suo Google Calendar; prima di confermare il sito ricontrolla che l'orario sia ancora libero.

**1. Orari** — in `data/profile.ts` → `bookingConfig`: giorni e fasce orarie (`weeklyHours`), durata (`slotMinutes`), pausa (`bufferMinutes`), preavviso (`minNoticeHours`), giorni prenotabili (`daysAhead`), chiusure (`closedDates`). Poi `hoursConfirmed: true`.

**2. Collegamento a Google** (una volta, circa 10 minuti):
1. [Google Cloud Console](https://console.cloud.google.com/) → nuovo progetto → **API e servizi → Libreria** → abilitare **Google Calendar API**.
2. **API e servizi → Credenziali → Crea credenziali → Account di servizio**. Poi nell'account: **Chiavi → Aggiungi chiave → JSON** (scarica il file).
3. Nel Google Calendar della Dott.ssa: **Impostazioni del calendario → Condividi con persone specifiche** → aggiungere l'email dell'account di servizio con il permesso **"Apportare modifiche agli eventi"**.
4. Impostare le variabili `GOOGLE_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_PRIVATE_KEY` (campo `private_key` del JSON) e `GOOGLE_CALENDAR_ID` (l'indirizzo Gmail della Dott.ssa) e rifare la build.

Con l'email configurata (Resend) arrivano anche la notifica alla Dott.ssa e la conferma alla persona che ha prenotato.
Il sito legge dal calendario **solo gli intervalli occupati** (non titoli né dettagli degli impegni). Nessun iframe e nessun cookie di Google nel browser dei visitatori.

Senza collegamento, con `SHOW_DEMO_PLACEHOLDERS=true` il calendario funziona con gli orari di esempio e le prenotazioni sono simulate (badge "Anteprima demo").

## Variabili d'ambiente

Vedi `.env.example`.

| Variabile | Descrizione |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | URL definitivo (es. `https://www.dominio.it`). Usato per canonical, sitemap e OpenGraph. Su Netlify, se vuoto, viene usato `URL`. |
| `WHATSAPP_NUMBER` | Numero professionale, solo cifre con prefisso (es. `39…`). Se vuoto, il pulsante WhatsApp non compare. |
| `RESEND_API_KEY`, `CONTACT_TO_EMAIL`, `CONTACT_FROM_EMAIL` | Invio delle richieste del form via [Resend](https://resend.com) (il dominio mittente va verificato). |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_PRIVATE_KEY`, `GOOGLE_CALENDAR_ID` | Collegamento del calendario di prenotazione a Google Calendar (vedi sopra). |
| `SHOW_DEMO_PLACEHOLDERS` | Solo per la demo: `true` mostra le cornici al posto delle foto mancanti e il calendario con orari di esempio (prenotazioni simulate). Da rimuovere al lancio. |
| `CONTACT_FORM_DEMO` | Solo per la demo: `true` simula un invio riuscito se l'email non è configurata. Da rimuovere in produzione. |

Senza configurazione email, in produzione il form mostra un messaggio di errore gentile (stato "error"); in sviluppo l'invio viene simulato.

## Pubblicazione (Netlify)

1. Nuovo sito da Git → **Base directory: `giulia-savini`** (build e publish sono in `netlify.toml`).
2. Impostare le variabili d'ambiente.
3. Collegare il dominio e impostare `NEXT_PUBLIC_SITE_URL`.

Funziona anche su Vercel (Root Directory: `giulia-savini`).

## Prima della pubblicazione

- [ ] Inserire telefono/email professionali, numero civico, Ordine regionale di iscrizione (`data/profile.ts`)
- [ ] Caricare le fotografie
- [ ] Completare le FAQ con durata/frequenza degli incontri (TODO in `faqs`)
- [ ] Far verificare **Privacy Policy** e **Cookie Policy** a un consulente; poi `legal.reviewed = true` (rimuove l'avviso "bozza" e rende le pagine indicizzabili)
- [ ] Configurare l'invio email del form e rimuovere `CONTACT_FORM_DEMO`
- [ ] Verificare con la Dott.ssa tutti i testi

## Struttura

```
app/                  pagine (home, /percorsi/[slug], /privacy, /cookie-policy), API form, SEO (sitemap, robots, OG image)
components/layout/    Navbar, Footer, WhatsApp, pagine legali, animazioni
components/sections/  sezioni della homepage
components/ui/        bottoni, ritratto, icone, intestazioni
data/profile.ts       ← tutti i contenuti modificabili
lib/                  utilità (SEO, Schema.org, validazione form)
styles/globals.css    design system (Tailwind + componenti)
assets/               font per l'immagine OpenGraph (Cormorant Garamond, OFL)
```

## Note tecniche

- **SEO:** metadata per pagina, canonical, OpenGraph e Twitter, `sitemap.xml`, `robots.txt`, JSON-LD (`WebSite`, `Person`, `ProfessionalService`, `Service`).
- **Privacy:** nessun cookie e nessuno script di terze parti; i font sono self-hosted. Nessun banner cookie necessario finché non si aggiungono analytics/marketing (in quel caso serve un consenso preventivo).
- **Accessibilità:** HTML semantico, skip link, focus visibile, menu mobile con focus trap e chiusura con Esc, errori del form collegati via `aria-describedby`, `prefers-reduced-motion`.
- **Anti-spam:** honeypot, tempo minimo di compilazione, limite di richieste per IP.
