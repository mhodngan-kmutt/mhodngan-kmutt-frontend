import { test, expect } from '@playwright/test';

const VALID_CONTRIBUTOR_EMAIL = process.env.VALID_CONTRIBUTOR_EMAIL!;
const VALID_CONTRIBUTOR_PASSWORD = process.env.VALID_CONTRIBUTOR_PASSWORD!;
const VALID_CONTRIBUTOR_DISPLAY_NAME = process.env.VALID_CONTRIBUTOR_DISPLAY_NAME!;

test('User can sign in, search project, then sign out', async ({ page }) => {
  // ============================================
  // Step 1: Sign in as contributor
  // ============================================
  test.setTimeout(60_000);
  await page.goto('/');
  
  // Click Sign in button
  await page.getByRole('button', { name: 'Sign in' }).click({ timeout: 15000 });
  
  // Wait for Google sign-in page to load
  await page.waitForTimeout(2000);
  
  // Try to fill email - check if email field is visible
  const emailInput = page.getByRole('textbox', { name: 'Email or phone' });
  const isEmailVisible = await emailInput.isVisible({ timeout: 3000 }).catch(() => false);
  
  if (isEmailVisible) {
    await emailInput.fill(VALID_CONTRIBUTOR_EMAIL);
    await page.getByRole('button', { name: 'Next' }).click({ timeout: 15000 });
    await page.waitForTimeout(2000);
  }
  
  // Enter password
  const passwordInput = page.getByRole('textbox', { name: 'Enter your password' });
  await passwordInput.waitFor({ state: 'visible', timeout: 10000 });
  await passwordInput.fill(VALID_CONTRIBUTOR_PASSWORD);
  await page.getByRole('button', { name: 'Next' }).click({ timeout: 15000 });
  
  // Wait for redirect and authentication
  await page.waitForURL('**/en', { timeout: 15000 }).catch(() => {});
  
  // Verify successful sign-in
  await expect(page.getByRole('button', { name: 'Write Project' })).toBeVisible({ timeout: 10000 });
  await expect(page.getByRole('button', { name: 'Profile Menu' })).toBeVisible();
    
  // Verify user name is displayed
  const profileMenu = page.getByLabel('Profile Menu');
  await expect(profileMenu).toContainText(VALID_CONTRIBUTOR_DISPLAY_NAME, { timeout: 5000 });

  // ============================================
  // Step 2: Search Project
  // ============================================
  const wordToSearch = 'Next';

  // Search project
  await page.getByRole('textbox', { name: 'Search...' }).click();
  await page.getByRole('textbox', { name: 'Search...' }).fill(wordToSearch);
  await page.locator(`//button//*[name()='svg'  and contains(@class, 'lucide-search')]`).click({ timeout: 15000 });
  
  // Wait for project to be visible
  const project = page
    .locator('a')
    .filter({ has: page.getByRole('heading', { level: 4, name: wordToSearch }) });

  await expect(project).toBeVisible({ timeout: 10000 });
  await project.click({ timeout: 15000 });

  // Wait for navigation/success
  await page.waitForLoadState('networkidle');

    // On project detail page
  await expect(page.locator('#HeroProjectDetail')).toContainText(wordToSearch);

  // ============================================
  // Step 3: Sign Out
  // ============================================
  
  // Sign out
  await page.getByRole('button', { name: 'Profile Menu' }).click({ timeout: 15000 });
  await page.getByRole('menuitem', { name: 'Sign out' }).click({ timeout: 15000 });
  
  // Verify sign out
  await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible({ timeout: 10000 });
});