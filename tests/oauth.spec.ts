import { test, expect } from '@playwright/test';
import dotenv from 'dotenv';

// Load .env
dotenv.config();

const EMAIL = process.env.VALID_EMAIL!;
const PASSWORD = process.env.VALID_PASSWORD!;
const EXPECTED_USERNAME = process.env.EXPECTED_USERNAME!;

test('Open browser, go to MhodNgan then sign-in/sign-out', async ({ page }, testInfo) => {
  // go to home page
  await page.goto('/');

  // verify title
  await expect(page).toHaveTitle(/MhodNgan/);

  // Sign in
  const signInButton = page.getByRole('button', { name: 'Sign in' });
  await expect(signInButton).toBeVisible();
  await signInButton.click();

  const emailInput = page.getByRole('textbox', { name: 'Email or phone' });
  await emailInput.click();
  await emailInput.fill(EMAIL);

  const nextButton = page.getByRole('button', { name: 'Next' });
  await nextButton.click();

  const passwordInput = page.getByRole('textbox', { name: 'Enter your password' });
  await passwordInput.click();
  await passwordInput.fill(PASSWORD);

  await nextButton.click();

  // Navigate to Explore and wait for Profile Menu
  let profileButton = page.getByRole('button', { name: 'Profile Menu' });

  while (!(await profileButton.isVisible())) {
    await page.getByRole('link', { name: 'Explore' }).click();
    await page.waitForTimeout(2000); // wait for 2 seconds
    await signInButton.click();
    await page.waitForTimeout(2000); // wait for 2 seconds

    // re-assign after actions
    profileButton = page.getByRole('button', { name: 'Profile Menu' });
  }

  // Final assertions
  await expect(profileButton).toBeVisible({ timeout: 10000 });
  await expect(page.getByLabel('Profile Menu')).toContainText(EXPECTED_USERNAME);
});
