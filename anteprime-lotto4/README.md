# Anteprime Lotto 4

Venti siti di anteprima, uno per ciascuno psicologo del Lotto 4, generati da un unico modello.

**Stack:** Next.js 15 (App Router, export statico) · TypeScript · Tailwind CSS · lucide-react.

## Avvio

```bash
npm install
npm run dev        # http://localhost:3000 → indice delle anteprime
npm run build      # genera il sito statico in /out
npm run typecheck
```

Ogni anteprima è in `/<slug>/` (es. `/giuseppe-cherri/`); la home è l'indice interno con tutte le schede.
Le pagine hanno `noindex` e un banner "Anteprima riservata".

## Dove si modificano i dati

- `data/psicologi.ts`: un oggetto per professionista. Fonte: `/mnt/project-files/lotto4/candidati.md`.
- I campi `null` o vuoti non compaiono sul sito. Nessun dato è inventato: indirizzi o recapiti segnati
  **[DA VERIFICARE]** nell'elenco sono lasciati vuoti e spiegati nel campo `notes`.
- `data/standard.ts`: testi comuni (frase dell'hero, come lavoro, passi, FAQ) usati quando manca un testo specifico.
- `data/themes.ts`: cinque palette (`salvia`, `argilla`, `notte`, `lavanda`, `mare`), assegnate con `theme`.

Al posto delle foto c'è un monogramma grafico, mai foto stock.

## Pubblicazione su Hostinger

1. `npm run build`: genera il sito statico nella cartella `out/` (include `.htaccess` per Apache).
2. In hPanel apri **File Manager** del dominio (o sottodominio) scelto ed entra in `public_html`.
3. Carica lo zip con il contenuto di `out/` ed estrailo lì: i file vanno direttamente in `public_html`, non in una sottocartella.

Ogni anteprima sarà su `https://<dominio>/<slug>/`, l'indice su `https://<dominio>/`.
