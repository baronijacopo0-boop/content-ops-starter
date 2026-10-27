import { expect, type Page } from '@playwright/test';

export function uniqueEmail() {
  return `test.${Date.now()}.${Math.floor(Math.random() * 1e6)}@flipai.test`;
}

export const PASSWORD = 'Flipper2026';

/** Registers a new local account and completes onboarding (optionally with demo data). */
export async function registerAndOnboard(page: Page, opts: { demo?: boolean; name?: string } = {}) {
  const email = uniqueEmail();
  await page.goto('/register');
  await page.getByLabel('Nome').fill(opts.name ?? 'Giulia Test');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password', { exact: true }).fill(PASSWORD);
  await page.getByLabel('Conferma password').fill(PASSWORD);
  await page.getByRole('button', { name: 'Crea account' }).click();
  await page.waitForURL('**/onboarding');

  await page.getByRole('button', { name: '€250' }).click();
  await page.getByRole('button', { name: 'Continua' }).click();
  await page.getByRole('button', { name: /Streetwear/ }).click();
  await page.getByRole('button', { name: 'Continua' }).click();
  await page.getByRole('button', { name: 'Nike' }).click();
  await page.getByRole('button', { name: 'Carhartt' }).click();
  await page.getByRole('button', { name: 'Continua' }).click();
  await page.getByRole('button', { name: '€500 extra' }).click();
  if (opts.demo === false) await page.getByRole('switch', { name: 'Carica dati demo' }).click();
  await page.getByRole('button', { name: 'Vai alla dashboard' }).click();
  await page.waitForURL('**/dashboard');
  await expect(page.getByRole('heading', { level: 1 })).toContainText(opts.name?.split(' ')[0] ?? 'Giulia');
  return email;
}

export async function pickOption(page: Page, label: string, option: string) {
  await page.getByLabel(label, { exact: true }).click();
  await page.getByRole('option', { name: option, exact: true }).click();
}
