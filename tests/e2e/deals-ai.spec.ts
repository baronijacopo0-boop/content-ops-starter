import { expect, test } from '@playwright/test';
import path from 'node:path';
import { pickOption, registerAndOnboard } from './helpers';

test('Deal Finder: feed, filtri e ordinamento', async ({ page }) => {
  await registerAndOnboard(page);
  await page.goto('/deals');
  const cards = page.getByTestId('deal-card');
  // 20 demo listings + 3 real listings from the (fake) eBay and Etsy APIs
  await expect(page.getByTestId('sources-bar')).toContainText('eBay · 2 annunci');
  await expect(cards).toHaveCount(23);

  await page.getByRole('button', { name: /Solo Hot Deal/ }).click();
  const hotCount = await cards.count();
  expect(hotCount).toBeGreaterThan(0);
  expect(hotCount).toBeLessThan(23);
  await page.getByRole('button', { name: 'Azzera filtri' }).click();
  await expect(cards).toHaveCount(23);

  await pickOption(page, 'Brand', 'Nike');
  await expect(cards).toHaveCount(2);
  await page.getByRole('button', { name: 'Azzera filtri' }).click();

  await page.getByLabel('Prezzo massimo (€)').fill('12');
  for (const text of await cards.locator('p:has-text("Prezzo") + p').allTextContents()) {
    expect(Number(text.replace(/[^\d]/g, ''))).toBeLessThanOrEqual(12);
  }

  // detail
  await page.getByRole('button', { name: 'Azzera filtri' }).click();
  await cards.first().getByRole('button', { name: 'Dettagli' }).click();
  await expect(page.getByTestId('deal-result')).toBeVisible();
});

test('Deal Finder: annunci reali eBay ed Etsy', async ({ page }) => {
  await registerAndOnboard(page, { demo: false });
  await page.goto('/deals');
  const sources = page.getByTestId('sources-bar');
  await expect(sources).toContainText('eBay · 2 annunci');
  await expect(sources).toContainText('Etsy · 1 annuncio');
  await page.getByRole('button', { name: /Solo annunci reali \(3\)/ }).click();
  await expect(page.getByTestId('deal-card')).toHaveCount(3);
  await page.getByRole('button', { name: 'Azzera filtri' }).click();
  await expect(sources).toContainText('Depop · non attivo');

  const cards = page.getByTestId('deal-card');
  await pickOption(page, 'Fonte', 'eBay');
  await expect(cards).toHaveCount(2);
  const carhartt = cards.filter({ hasText: 'Felpa Carhartt WIP' });
  await expect(carhartt.getByTestId('deal-source')).toHaveText('eBay');
  await expect(carhartt).toContainText('+ 5,50 € sped.');
  await expect(carhartt.getByRole('link', { name: 'Apri su eBay' })).toHaveAttribute(
    'href',
    'https://www.ebay.it/itm/1111',
  );

  await pickOption(page, 'Fonte', 'Etsy');
  await expect(cards).toHaveCount(1);
  await expect(cards.first()).toContainText("Levi's 501");

  await pickOption(page, 'Fonte', 'Vinted (demo)');
  await expect(cards).toHaveCount(20);

  // Buying a real listing records price + shipping and the marketplace as source
  await pickOption(page, 'Fonte', 'eBay');
  await carhartt.getByRole('button', { name: /L’ho comprato/ }).click();
  await expect(page.getByText('Aggiunto all’inventario')).toBeVisible();
  await page.goto('/inventory');
  const row = page.getByTestId('inventory-table').locator('tr', { hasText: 'Felpa Carhartt WIP' });
  await expect(row).toContainText('23,50 €');
  await expect(row).toContainText('eBay');
});

test('analisi deal: verdetto, best buy price e spiegazione', async ({ page }) => {
  await registerAndOnboard(page);
  await page.goto('/analyze');
  await page.getByLabel('Brand').fill('Nike');
  await page.getByLabel('Prezzo richiesto (€)').fill('12');
  await page.getByRole('button', { name: 'ANALIZZA AFFARE' }).click();
  const result = page.getByTestId('deal-result');
  await expect(result).toBeVisible();
  await expect(result.getByText(/OTTIMO AFFARE|BUON AFFARE/)).toBeVisible();
  await expect(result.getByText('Best buy price')).toBeVisible();
  await expect(result.getByText('Spiegazione AI')).toBeVisible();
  await expect(page.getByText('Analisi recenti')).toBeVisible();
});

test('quick buy analysis in dashboard', async ({ page }) => {
  await registerAndOnboard(page);
  await page.getByLabel('Brand').fill('H&M');
  await page.getByLabel('Prezzo (€)').fill('25');
  await page.getByRole('button', { name: 'ANALIZZA' }).click();
  await expect(page.getByTestId('quick-result').getByText('SKIP')).toBeVisible();
});

test('crea annuncio AI: foto → analisi → testo → bozza', async ({ page }) => {
  await registerAndOnboard(page, { demo: false });
  await page.goto('/listings/new');
  await page.getByTestId('image-input').setInputFiles([path.join(__dirname, 'fixtures/fake-image.png')]);
  await expect(page.getByText(/non è un’immagine valida/)).toBeVisible();

  await page
    .getByTestId('image-input')
    .setInputFiles([path.join(__dirname, 'fixtures/felpa-nike-grigia.png')]);
  await expect(page.getByAltText('Foto 1')).toBeVisible();
  await page.getByRole('button', { name: 'ANALIZZA FOTO' }).click();
  await expect(page.getByLabel('Brand')).toHaveValue('Nike');
  await expect(page.getByLabel('Colori')).toHaveValue(/grigio/);
  await expect(page.getByText('da confermare').first()).toBeVisible();

  await pickOption(page, 'Taglia', 'M');
  await pickOption(page, 'Condizione', 'Ottime condizioni');
  await page.getByRole('button', { name: 'Genera titolo e descrizione' }).click();
  await expect(page.getByLabel('Titolo')).toHaveValue(/Felpa Nike .*Taglia M/);
  await expect(page.getByLabel('Descrizione')).toHaveValue(/Per misure o altre foto scrivetemi pure/);
  await expect(page.getByText('Vendita veloce')).toBeVisible();
  await expect(page.getByText('Massimo profitto')).toBeVisible();

  await page.getByRole('button', { name: 'Bozza' }).click();
  await page.waitForURL('**/listings');
  const card = page.getByTestId('listing-card').first();
  await expect(card).toContainText('Felpa Nike');
  await expect(card).toContainText('Bozza');
});

test('watchlist: creazione e match', async ({ page }) => {
  await registerAndOnboard(page, { demo: false });
  await page.goto('/watchlist');
  await page.getByRole('button', { name: 'Nuova watchlist' }).click();
  const d = page.getByRole('dialog');
  await d.getByLabel('Nome').fill('Ralph Lauren < €20');
  await d.getByLabel('Brand').fill('Ralph Lauren');
  await d.getByLabel('Prezzo massimo (€)').fill('20');
  await d.getByRole('button', { name: 'Salva' }).click();
  const card = page.getByTestId('watchlist-card');
  await expect(card).toHaveCount(1);
  await expect(card).toContainText('Ralph Lauren < €20');
  await expect(card).toContainText('2 occasioni attuali');
  await page.getByRole('button', { name: 'Controlla ora' }).click();
  await expect(page.getByText(/nuovi match/)).toBeVisible();
});

test('analytics e guide', async ({ page }) => {
  await registerAndOnboard(page);
  await page.goto('/analytics');
  await expect(page.getByText('ROI per brand')).toBeVisible();
  await expect(page.getByText('5 brand peggiori')).toBeVisible();
  await expect(page.getByTestId('insights').locator('li').first()).toBeVisible();

  await page.goto('/guide');
  await expect(page.getByTestId('guide-card')).toHaveCount(8);
  await page.getByText('Come calcolare il ROI').click();
  await expect(page.getByRole('heading', { name: 'Come calcolare il ROI', level: 1 })).toBeVisible();
});

test('pubblica su Vinted: copia campi, apre Vinted e segna come pubblicato', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  // Never hit the real Vinted site from tests.
  await context.route('https://www.vinted.it/**', (route) => route.fulfill({ status: 200, body: 'vinted' }));
  await registerAndOnboard(page);
  await page.goto('/listings');
  await page.getByRole('tab', { name: /Bozze/ }).click();
  const card = page.getByTestId('listing-card').first();
  const title = (await card.locator('h3').textContent())!.trim();
  await card.getByRole('button', { name: 'Azioni annuncio' }).click();
  await page.getByRole('menuitem', { name: 'Pubblica su Vinted' }).click();

  const dialog = page.getByRole('dialog');
  await dialog.getByRole('button', { name: 'Copia descrizione' }).click();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toContain(
    'Per misure o altre foto scrivetemi pure.',
  );

  const [vinted] = await Promise.all([
    context.waitForEvent('page'),
    dialog.getByRole('button', { name: 'Apri Vinted' }).click(),
  ]);
  expect(vinted.url()).toBe('https://www.vinted.it/items/new');
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(title);
  await vinted.close();

  await dialog.getByRole('button', { name: /salva come pubblicato/ }).click();
  await expect(page.getByText('Annuncio segnato come pubblicato su Vinted')).toBeVisible();
  await page.getByRole('tab', { name: /Attivi/ }).click();
  await expect(page.getByTestId('listing-card').filter({ hasText: title })).toContainText('Pubblicato');
});
