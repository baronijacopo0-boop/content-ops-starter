import { expect, test } from '@playwright/test';
import { pickOption, registerAndOnboard } from './helpers';

test('inventario: aggiunta, modifica, vendita, profitto/ROI, eliminazione', async ({ page }) => {
  await registerAndOnboard(page, { demo: false });
  await page.goto('/inventory');
  await expect(page.getByText('Il tuo inventario è vuoto')).toBeVisible();

  // Add
  await page.getByRole('button', { name: 'Aggiungi articolo' }).first().click();
  const dialog = page.getByRole('dialog');
  await dialog.getByLabel('Nome').fill('Felpa Carhartt test');
  await dialog.getByLabel('Brand').fill('Carhartt');
  await dialog.getByLabel('Prezzo acquisto (€)').fill('10');
  await dialog.getByRole('button', { name: 'Aggiungi', exact: true }).click();
  await expect(page.getByText('Articolo aggiunto all’inventario')).toBeVisible();
  const table = page.getByTestId('inventory-table');
  await expect(table.getByText('Felpa Carhartt test')).toBeVisible();
  await expect(table.getByText('NEW · 0g')).toBeVisible();

  // Edit
  await page.getByRole('button', { name: 'Azioni per Felpa Carhartt test' }).click();
  await page.getByRole('menuitem', { name: 'Modifica' }).click();
  await page.getByRole('dialog').getByLabel('Nome').fill('Felpa Carhartt WIP');
  await pickOption(page, 'Stato', 'Pubblicato');
  await page.getByRole('button', { name: 'Salva modifiche' }).click();
  await expect(table.getByText('Felpa Carhartt WIP')).toBeVisible();
  await expect(table.locator('tbody').getByText('Pubblicato')).toBeVisible();

  // Sell: 10 → 30 with 2 extra → profit 18, ROI 180%
  await page.getByRole('button', { name: 'Azioni per Felpa Carhartt WIP' }).click();
  await page.getByRole('menuitem', { name: 'Segna come venduto' }).click();
  const sell = page.getByRole('dialog');
  await sell.getByLabel('Prezzo di vendita (€)').fill('30');
  await sell.getByLabel('Costi extra (€)').fill('2');
  await expect(sell.getByText('+18,00 €')).toBeVisible();
  await expect(sell.getByText('180%')).toBeVisible();
  await sell.getByRole('button', { name: 'Conferma vendita' }).click();
  await expect(table.getByText('+18,00 €')).toBeVisible();
  await expect(table.getByText('180%')).toBeVisible();

  // Sales page
  await page.goto('/sales');
  const sales = page.getByTestId('sales-table');
  await expect(sales.getByText('Felpa Carhartt WIP')).toBeVisible();
  await expect(sales.getByText('+18,00 €')).toBeVisible();

  // Delete
  await page.goto('/inventory');
  await page.getByRole('button', { name: 'Azioni per Felpa Carhartt WIP' }).click();
  await page.getByRole('menuitem', { name: 'Elimina' }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Elimina' }).click();
  await expect(page.getByText('Il tuo inventario è vuoto')).toBeVisible();
});

test('calcolatore profitto e ROI', async ({ page }) => {
  await registerAndOnboard(page, { demo: false });
  await page.goto('/calculator');
  await page.getByLabel('Prezzo di acquisto (€)').fill('10');
  await page.getByLabel('Prezzo di vendita (€)').fill('30');
  await page.getByLabel('Costi extra (€)').fill('2');
  await expect(page.getByTestId('profit-value')).toHaveText('+18,00 €');
  await expect(page.getByTestId('roi-value')).toHaveText('180%');
  await expect(page.getByTestId('margin-value')).toHaveText('60%');
});
