# DEPLOY SU HOSTINGER

Guida completa per pubblicare FLIP AI su Hostinger con Supabase come backend.

> Le voci dei menu di hPanel e Supabase possono cambiare leggermente nel tempo: i passaggi restano gli stessi.

---

## 0. Panoramica e scelta del piano

FLIP AI è un’app **Next.js** che ha bisogno di **Node.js** per le parti server (protezione route, API AI). Il database, l’autenticazione e lo storage delle foto sono su **Supabase** (piano gratuito sufficiente per partire). Hostinger ospita solo la web app.

| Opzione | Piano Hostinger | Quando sceglierla |
| --- | --- | --- |
| **A – Node.js Web App** (consigliata) | Hosting Business / Cloud con “Node.js Apps” | Deploy più semplice: collegamento GitHub, build automatica, SSL incluso. |
| **B – VPS** | KVM VPS | Massimo controllo (PM2 + Nginx). Utile se il piano non include Node.js o per più traffico. |
| **C – Export statico** | Qualsiasi hosting web (anche Single/Premium) | Se non hai Node.js. Tutto funziona tranne l’AI remota (usa il motore locale) e la protezione route lato server (i dati restano protetti da RLS). |

Ti servono inoltre: un **dominio** (anche acquistato su Hostinger), un account **Supabase**, idealmente un account **GitHub**.

---

## 1. Configurare Supabase (una volta sola)

1. Vai su <https://supabase.com> → **New project**. Scegli una regione UE (es. *Frankfurt*), imposta una password del database e salvala in un posto sicuro.
2. **Crea le tabelle**: *SQL Editor* → *New query*. Incolla ed esegui **in ordine** il contenuto di:
   1. `supabase/migrations/20261027000001_schema.sql`
   2. `supabase/migrations/20261027000002_rls.sql`
   3. `supabase/migrations/20261027000003_storage.sql`
   4. `supabase/migrations/20261027000004_functions.sql`
   5. `supabase/migrations/20261027000005_reference_data.sql`
   6. *(facoltativo)* `supabase/seed.sql` – comparabili demo per le metriche di mercato.

   In alternativa, con la [Supabase CLI](https://supabase.com/docs/guides/cli): `supabase link --project-ref <ref>` e poi `supabase db push`.
3. **Verifica**: *Table Editor* deve mostrare le tabelle (`profiles`, `inventory_items`, `sales`, …) con l’icona RLS attiva; *Storage* deve contenere il bucket `item-photos`.
4. **Autenticazione** → *Authentication* → *URL Configuration*:
   - **Site URL**: `https://www.tuodominio.it`
   - **Redirect URLs**: aggiungi `https://www.tuodominio.it/auth/callback` (e `http://localhost:3000/auth/callback` per lo sviluppo).
5. *Authentication* → *Providers* → **Email**: abilitato. “Confirm email” attivo è consigliato (l’app gestisce il messaggio “controlla la tua email”).
6. *(Consigliato in produzione)* *Authentication* → *SMTP Settings*: configura un SMTP (anche quello della casella email Hostinger) per non avere i limiti del server email di default di Supabase.
7. **Chiavi**: *Project Settings* → *API* (o *API Keys*):
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` / *publishable key* → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` / *secret key* → `SUPABASE_SERVICE_ROLE_KEY` (**segreta**, serve solo per lo script demo; non metterla su Hostinger se non ti serve).

---

## 2. Variabili d’ambiente

| Variabile | Obbligatoria | Dove si usa | Note |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_APP_URL` | sì | build + browser | `https://www.tuodominio.it` (senza `/` finale) |
| `NEXT_PUBLIC_SUPABASE_URL` | sì | build + browser | URL progetto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | sì | build + browser | chiave pubblica, protetta da RLS |
| `AI_API_KEY` | no | solo server | chiave Anthropic; senza, AI locale |
| `AI_PROVIDER` | no | solo server | `anthropic` |
| `AI_MODEL` | no | solo server | default `claude-opus-5-5` |
| `AI_RATE_LIMIT_PER_MINUTE` | no | solo server | default `15` |
| `SUPABASE_SERVICE_ROLE_KEY` | no | solo script locali | **mai** nel frontend |

⚠️ Le variabili `NEXT_PUBLIC_*` vengono **incorporate durante la build**. Se le modifichi devi **rifare la build/redeploy**. Le altre (AI) vengono lette a runtime ma è comunque consigliato un riavvio.

Se le variabili Supabase mancano, l’app parte in **modalità demo locale** (banner arancione in alto): utile per test, non per produzione.

---

## 3. Opzione A — Hostinger Node.js Web App (consigliata)

### 3.1 Preparare il codice

Il repository è già pronto: `package.json` con `build` e `start`, `.nvmrc` (Node 20), nessuna dipendenza nativa obbligatoria (le immagini Next non usano `sharp`: `images.unoptimized`).

**Cosa serve caricare**: tutto il repository **tranne** `node_modules/`, `.next/`, `out/`, `.env*`, `test-results/`, `playwright-report/`.
Essenziali: `package.json`, `package-lock.json`, `next.config.ts`, `tsconfig.json`, `tailwind.config.ts`, `postcss.config.mjs`, `src/`, `public/`.
(`supabase/`, `scripts/`, `tests/`, `docs/` non servono in produzione ma non danno fastidio.)

### 3.2 Creare l’app

1. hPanel → **Websites** → **Add website** → **Node.js Apps** (o *Websites → Node.js*).
2. Scegli la sorgente:
   - **GitHub (consigliato)**: autorizza Hostinger, seleziona il repository e il branch da pubblicare.
   - **Upload ZIP**: crea l’archivio dal tuo computer con
     ```bash
     git archive --format=zip -o deploy.zip HEAD
     ```
     (include solo i file versionati: niente `node_modules` né `.env`).
3. Impostazioni di build (Hostinger di solito rileva Next.js automaticamente; verifica):
   - **Node.js version**: 20.x (o 22.x)
   - **Install command**: `npm ci`
   - **Build command**: `npm run build`
   - **Start command**: `npm start` (usa la variabile `PORT` fornita da Hostinger)
   - **Output directory** (se richiesto): `.next`
4. **Environment variables**: aggiungi quelle della sezione 2 *prima* di avviare il deploy.
5. Avvia il **Deploy** e attendi la fine della build (2-4 minuti). I log di build sono visibili nel pannello: in caso di errore controllali lì.
6. Collega il **dominio** all’app (sezione 6) e attiva SSL.

### 3.3 Aggiornamenti

- Con GitHub: `git push` sul branch collegato → redeploy automatico (o pulsante *Redeploy*).
- Con ZIP: ricrea `deploy.zip` e caricalo di nuovo.

---

## 4. Opzione B — VPS Hostinger (Ubuntu 22.04/24.04)

```bash
# 1. accesso
ssh root@IP_DEL_VPS
adduser flip && usermod -aG sudo flip && su - flip

# 2. Node.js 20 + PM2
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs nginx git
sudo npm install -g pm2

# 3. codice
git clone https://github.com/<utente>/<repo>.git flip-ai && cd flip-ai
cp .env.example .env.production   # compila i valori (nano .env.production)
npm ci
npm run build
PORT=3000 pm2 start npm --name flip-ai -- start
pm2 save && pm2 startup           # riavvio automatico al reboot
```

Nginx (`/etc/nginx/sites-available/flip-ai`):

```nginx
server {
    server_name tuodominio.it www.tuodominio.it;
    client_max_body_size 15m;  # upload foto per l’analisi AI
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/flip-ai /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx -d tuodominio.it -d www.tuodominio.it   # HTTPS + rinnovo automatico
sudo ufw allow OpenSSH && sudo ufw allow 'Nginx Full' && sudo ufw enable
```

Aggiornare: `git pull && npm ci && npm run build && pm2 restart flip-ai`.

---

## 5. Opzione C — Export statico su hosting condiviso

1. Sul tuo computer crea `.env.local` con le variabili `NEXT_PUBLIC_*` di produzione.
2. `npm ci && npm run build:static` → genera la cartella `out/` (con `.htaccess`: HTTPS, 404, header di sicurezza, cache).
3. hPanel → **File Manager** (o FTP) → apri `public_html/`, svuotala e carica **il contenuto** di `out/` (incluso il file nascosto `.htaccess`).
4. Configura Supabase (sezione 1) con il dominio.

In questa modalità: niente `/api/*` (l’AI usa il motore locale), protezione delle pagine solo lato browser (i dati sono comunque protetti da RLS). Per aggiornare ripeti i punti 2-3.

---

## 6. Dominio, DNS e HTTPS

**Dominio acquistato su Hostinger**: in hPanel collega il dominio al sito/app (*Websites → Manage → Domains* o dalla procedura di creazione). I DNS sono gestiti automaticamente.

**Dominio esterno** (Aruba, GoDaddy, Register…): due possibilità
- *Consigliato*: cambia i **nameserver** del dominio con quelli indicati da Hostinger (es. `ns1.dns-parking.com`, `ns2.dns-parking.com` – usa quelli mostrati nel tuo hPanel).
- Oppure crea i record nel pannello del provider:
  - `A` `@` → IP del sito/app/VPS (lo trovi in hPanel)
  - `CNAME` `www` → `tuodominio.it` (o il target indicato da Hostinger)

La propagazione richiede da pochi minuti a 24-48 ore. Verifica con <https://dnschecker.org>.

**HTTPS**:
- Opzioni A/C: hPanel → **Security → SSL** → installa il certificato gratuito (Let’s Encrypt) e attiva **Force HTTPS**.
- Opzione B: `certbot` come sopra.

Dopo aver attivato il dominio definitivo aggiorna **sempre**:
- `NEXT_PUBLIC_APP_URL` su Hostinger → **redeploy**;
- *Site URL* e *Redirect URLs* in Supabase.

---

## 7. Creare l’account demo (facoltativo)

Dal tuo computer, con `.env.local` contenente `NEXT_PUBLIC_SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY`:

```bash
npm run seed:demo
# → Demo ready → email: demo@flipai.app  password: <stampata una sola volta>
```

In alternativa ogni utente può caricare i dati demo durante l’onboarding o da *Impostazioni → Carica dati demo*.

---

## 8. Checklist di verifica dopo il deploy

**Frontend**
- [ ] `https://www.tuodominio.it` mostra la landing, il lucchetto HTTPS è presente, `http://` reindirizza a `https://`.
- [ ] Nessun banner arancione “Modalità demo locale” (altrimenti le variabili Supabase non erano presenti durante la build).
- [ ] Su smartphone: bottom navigation visibile, nessuno scroll orizzontale.

**Backend**
- [ ] `https://www.tuodominio.it/api/health` risponde `{"ok":true,"supabase":"configured","ai":{…}}`.
- [ ] `ai.enabled` è `true` se hai impostato `AI_API_KEY`.
- [ ] Aprire `/dashboard` da non loggato reindirizza a `/login`.

**Autenticazione**
- [ ] Registrazione con una email reale → arriva l’email di conferma → il link apre `/auth/callback` e poi l’onboarding.
- [ ] Logout e nuovo login funzionano; password errata mostra l’errore.
- [ ] “Password dimenticata?” → email → link → pagina “Nuova password” → login con la nuova password.

**Database**
- [ ] Completato l’onboarding, in Supabase *Table Editor* compaiono le righe in `profiles`, `user_goals`, `user_settings` (e in `inventory_items`/`sales` se hai caricato i dati demo).
- [ ] Aggiungi un articolo in Inventario, segnalo come venduto: compare in Vendite e in `sales` con `profit`/`roi` calcolati.
- [ ] **Isolamento RLS**: crea un secondo account in una finestra anonima → non deve vedere nessun dato del primo.

**Storage**
- [ ] *Crea annuncio AI* → carica una foto → salva la bozza → la foto appare nell’annuncio e in Supabase *Storage → item-photos/<user_id>/*.
- [ ] Caricare un file non immagine o > 5 MB viene rifiutato con un messaggio.

---

## 9. Aggiornare il progetto senza perdere dati

- **I dati non vivono su Hostinger**: utenti, inventario, vendite e foto sono su Supabase. Un redeploy o la sostituzione dei file su Hostinger **non cancella nulla**.
- **Mai** usare la modalità demo locale per dati reali (sono nel browser dell’utente).
- **Modifiche al database** = nuove migrations:
  1. crea un **nuovo** file `supabase/migrations/AAAAMMGGHHMMSS_descrizione.sql` (non modificare quelli già eseguiti);
  2. scrivi migrazioni **additive** (aggiungi colonne con default, non rinominare/eliminare senza una migrazione dati);
  3. prova in locale: `npm run test:db`;
  4. fai un **backup** prima di applicarla: Supabase *Database → Backups* (piani a pagamento) oppure `pg_dump "<connection string>" > backup.sql`;
  5. esegui la migration (SQL Editor o `supabase db push`) **prima** di pubblicare il codice che la usa.
- **Rollback del codice**: con GitHub fai revert del commit e redeploy; con ZIP ricarica l’archivio precedente (conserva sempre l’ultimo `deploy.zip` funzionante).
- **Segreti**: per cambiare una chiave aggiorna la variabile su Hostinger e fai redeploy; se una chiave Supabase/AI è stata esposta, rigenerala nel relativo pannello.

---

## 10. Problemi frequenti

| Sintomo | Causa probabile | Soluzione |
| --- | --- | --- |
| Banner “Modalità demo locale” in produzione | `NEXT_PUBLIC_SUPABASE_*` assenti al momento della build | Aggiungi le variabili e rifai il deploy |
| Il link nell’email porta a `localhost` | *Site URL* Supabase o `NEXT_PUBLIC_APP_URL` errati | Correggi entrambi e redeploy |
| “Link non valido o scaduto” | Redirect URL non autorizzato o link già usato | Aggiungi `/auth/callback` ai Redirect URLs; richiedi un nuovo link |
| Errore 401 su `/api/ai/*` | Sessione scaduta | Rifai il login |
| Errore 429 | Troppe richieste AI | Attendi un minuto o aumenta `AI_RATE_LIMIT_PER_MINUTE` |
| Upload foto fallisce | Migration storage non eseguita / file > 5 MB | Esegui `…03_storage.sql`; usa immagini più leggere |
| Build fallisce per memoria | Piano con poca RAM | Riprova il deploy; in alternativa usa l’opzione B o C |
| 502/503 su VPS | Processo fermo | `pm2 logs flip-ai`, `pm2 restart flip-ai` |
