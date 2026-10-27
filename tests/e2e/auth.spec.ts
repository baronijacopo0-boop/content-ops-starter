import { expect, test } from '@playwright/test';
import { PASSWORD, registerAndOnboard } from './helpers';

test('registrazione → onboarding → dashboard', async ({ page }) => {
  await registerAndOnboard(page, { name: 'Marco Rossi' });
  await expect(page.getByText('Profitto totale')).toBeVisible();
  await expect(page.getByText('Valore inventario')).toBeVisible();
  await expect(page.getByText('Articoli venduti').first()).toBeVisible();
  await expect(page.getByText('ROI medio').first()).toBeVisible();
  await expect(page.getByText('Profitto nel tempo')).toBeVisible();
});

test('route protette: senza login si viene rimandati al login', async ({ page }) => {
  await page.goto('/inventory');
  await page.waitForURL(/\/login/);
  await expect(page.getByRole('heading', { name: /Bentornato/ })).toBeVisible();
});

test('login → logout → login', async ({ page }) => {
  const email = await registerAndOnboard(page, { demo: false });
  await page.getByRole('button', { name: 'Logout' }).first().click();
  await page.waitForURL('**/login');
  await page.goto('/dashboard');
  await page.waitForURL(/\/login/);

  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill('sbagliata123');
  await page.getByRole('button', { name: 'Accedi' }).click();
  await expect(page.getByText('Email o password non corretti.')).toBeVisible();

  await page.getByLabel('Password').fill(PASSWORD);
  await page.getByRole('button', { name: 'Accedi' }).click();
  await page.waitForURL('**/dashboard');
});

test('validazione registrazione e recupero password', async ({ page }) => {
  await page.goto('/register');
  await page.getByRole('button', { name: 'Crea account' }).click();
  await expect(page.getByText('Inserisci il tuo nome')).toBeVisible();
  await expect(page.getByText('Email non valida')).toBeVisible();

  await page.goto('/forgot-password');
  await page.getByLabel('Email').fill('chiunque@example.com');
  await page.getByRole('button', { name: 'Invia link di reset' }).click();
  await expect(page.getByText(/riceverai a breve il link/)).toBeVisible();
});

test('account demo', async ({ page }) => {
  await page.goto('/login');
  await page.getByRole('button', { name: /account demo/ }).click();
  await page.waitForURL('**/dashboard');
  await expect(page.getByText('Top brand')).toBeVisible();
});
