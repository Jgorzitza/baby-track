import { expect, test } from '@playwright/test';

const hasSupabaseEnv = Boolean(
  process.env.VITE_SUPABASE_URL &&
    (process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
      process.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY ||
      process.env.VITE_SUPABASE_ANON_KEY)
);

test.describe('Connected onboarding', () => {
  test.skip(
    !hasSupabaseEnv,
    'Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY to run connected E2E tests. VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY is also accepted for quickstart compatibility. VITE_SUPABASE_ANON_KEY remains a local/self-hosted fallback.'
  );

  test('creates a household and baby profile from a new account', async ({ page }) => {
    const unique = Date.now();
    const email = `bbtrack+${unique}@example.com`;
    const password = `Bbtrack!${unique}`;

    await page.goto('/login');
    await page.getByRole('button', { name: 'Create Account' }).click();
    await page.getByLabel('Email Address').fill(email);
    await page.getByLabel('Password').fill(password);
    await page.getByRole('button', { name: 'Create Account' }).click();

    await expect(page.getByRole('heading', { name: 'Your Household' })).toBeVisible();
    await page.getByLabel('Household Name').fill("Leo's Family");
    await page.getByRole('button', { name: 'Create New Household' }).click();

    await expect(page.getByRole('heading', { name: /Profile/i })).toBeVisible();
    await page.getByLabel('Full Name').fill('Leo');
    await page.getByLabel('Birth Date').fill('2026-03-20');
    await page.getByLabel('Birth Weight (kg)').fill('3.4');
    await page.getByLabel('Birth Length (cm)').fill('51');
    await page.getByRole('button', { name: 'Save Profile' }).click();

    await expect(page.getByRole('heading', { name: 'Leo' })).toBeVisible();
    await expect(page.getByText('Doctor Mode')).toBeVisible();
  });
});
