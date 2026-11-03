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
  // Default extra costs: imballaggio 1 + altro 1 = 2 €
  await expect(page.getByTestId('profit-value')).toHaveText('+18,00 €');
  await expect(page.getByTestId('roi-value')).toHaveText('180%');
  await expect(page.getByTestId('margin-value')).toHaveText('60%');
  // 10% platform fee on 30 € = 3 € more costs
  await page.getByLabel('Commissione (%)').fill('10');
  await expect(page.getByTestId('profit-value')).toHaveText('+15,00 €');
});

test('flusso: dashboard, registra vendita rapida, confronto periodi', async ({ page }) => {
  await registerAndOnboard(page);
  await page.goto('/dashboard');
  await expect(page.getByTestId('workflow-steps')).toContainText('Prossimo passo');

  await page.goto('/sales');
  await expect(page.getByTestId('period-comparison')).toBeVisible();
  const before = await page.getByTestId('sales-table').locator('tbody tr').count();
  await page.getByRole('button', { name: 'Registra vendita' }).first().click();
  const list = page.getByTestId('quick-sale-list');
  const first = list.getByRole('button').first();
  const name = (await first.locator('span span').first().textContent())!.trim();
  await first.click();
  const dialog = page.getByRole('dialog');
  await dialog.getByLabel('Prezzo di vendita (€)').fill('40');
  await dialog.getByRole('button', { name: 'Dettaglia costi extra' }).click();
  await dialog.getByLabel('Imballaggio (€)').fill('1');
  await expect(dialog.getByLabel('Costi extra (€)')).toHaveValue('1');
  await dialog.getByRole('button', { name: 'Conferma vendita' }).click();
  await expect(page.getByText('Vendita registrata')).toBeVisible();
  await expect(page.getByTestId('sales-table').locator('tbody tr')).toHaveCount(before + 1);
  await expect(page.getByTestId('sales-table')).toContainText(name);
});
