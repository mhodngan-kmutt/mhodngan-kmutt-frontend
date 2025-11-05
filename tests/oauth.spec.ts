import { test, expect } from '@playwright/test';
import dotenv from 'dotenv';

dotenv.config();

const EMAIL = process.env.VALID_EMAIL!;
const PASSWORD = process.env.VALID_PASSWORD!;
const EXPECTED_USERNAME = process.env.EXPECTED_USERNAME!;

test('Open browser, go to MhodNgan then sign-in/sign-out', async ({ page }) => {
  // go to home page
  await page.goto('/');

  // verify title
  await expect(page).toHaveTitle(/MhodNgan/);

  const signIn = async () => {
    const signInButton = page.getByRole('button', { name: 'Sign in' });
    await signInButton.click();

    const emailInput = page.getByRole('textbox', { name: 'Email or phone' });
    await emailInput.fill(EMAIL);

    const nextButton = page.getByRole('button', { name: 'Next' });
    await nextButton.click();

    const passwordInput = page.getByRole('textbox', { name: 'Enter your password' });
    await passwordInput.fill(PASSWORD);

    await nextButton.click();
    await expect(page).toHaveTitle(/MhodNgan/, { timeout: 10000 });
  };

  // Attempt sign-in
  await signIn();

  // Final assertions
  const profileButton = page.getByLabel('Profile Menu');
  await expect(profileButton).toBeVisible({ timeout: 10000 });
  await expect(profileButton).toHaveText(EXPECTED_USERNAME);
});
