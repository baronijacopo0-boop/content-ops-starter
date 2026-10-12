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

Il sito rileva automaticamente i file al momento della build: finché mancano, mostra una composizione grafica astratta (mai foto stock). Next.js converte le immagini in AVIF/WebP responsive.

### Recensioni

Inserire in `profile.reviews` **solo** testi realmente pubblicati e verificabili, riportati fedelmente con autore/iniziali, data e fonte. Con l'array vuoto la sezione mostra solo la valutazione (4,9/5 · 4 opinioni su GuidaPsicologi) con il link alla fonte. Per nasconderla: `rating.show = false`.
La valutazione **non** è inserita nei dati strutturati Schema.org, perché le linee guida Google escludono le recensioni di terze parti.

## Variabili d'ambiente

Vedi `.env.example`.

| Variabile | Descrizione |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | URL definitivo (es. `https://www.dominio.it`). Usato per canonical, sitemap e OpenGraph. Su Netlify, se vuoto, viene usato `URL`. |
| `WHATSAPP_NUMBER` | Numero professionale, solo cifre con prefisso (es. `39…`). Se vuoto, il pulsante WhatsApp non compare. |
| `RESEND_API_KEY`, `CONTACT_TO_EMAIL`, `CONTACT_FROM_EMAIL` | Invio delle richieste del form via [Resend](https://resend.com) (il dominio mittente va verificato). |
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
