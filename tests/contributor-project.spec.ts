import { test, expect } from '@playwright/test';

const VALID_CONTRIBUTOR_EMAIL = process.env.VALID_CONTRIBUTOR_EMAIL!;
const VALID_CONTRIBUTOR_PASSWORD = process.env.VALID_CONTRIBUTOR_PASSWORD!;
const VALID_CONTRIBUTOR_DISPLAY_NAME = process.env.VALID_CONTRIBUTOR_DISPLAY_NAME!;

test('Contributor can sign in to create/update/delete a project, then sign out', async ({ page }) => {
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
  // Step 2: Navigate to Create Project page
  // ============================================
  await page.getByRole('button', { name: 'Write Project' }).click({ timeout: 15000 });
  
  // Wait for create project page to load
  await page.waitForLoadState('networkidle');
  await expect(page).toHaveURL(/.*\/writeProject$/, { timeout: 5000 });
  
  // ============================================
  // Step 3: Fill in project details
  // ============================================
  const timestamp = Date.now();
  const projectTitle = `E2E TEST ${timestamp}`;
  const badge = 'Thesis';
  const projectContent = `This is a test project for E2E testing.`;
  const externalUrl = 'https://mhodngan.vercel.app/en';
  const categories = ['Data Visualization', 'UI/UX Design', 'Web Development'];
  const shortDescription = `Short description for E2E test ${timestamp}`;
  
  // Fill Title
  await page.getByRole('textbox', { name: 'Add title' }).click({ timeout: 15000 });
  await page.getByRole('textbox', { name: 'Add title' }).fill(projectTitle);
  
  // Select Badge
  await page.getByRole('button', { name: 'Select Project Badge' }).click({ timeout: 15000 });
  await page.getByRole('menuitem', { name: badge }).click({ timeout: 15000 });
  
  // Fill Content
  const editor = page.locator("//div[@contenteditable='true']");
  await editor.click({ timeout: 15000 });
  await editor.pressSequentially(projectContent + "\n\n", { delay: 20 });
  await page.waitForTimeout(1000);
  
  // Add URL
  await page.getByRole('textbox', { name: 'Add URL' }).click({ timeout: 15000 });
  await page.getByRole('textbox', { name: 'Add URL' }).fill(externalUrl);
  await page.getByRole('button').nth(5).click({ timeout: 15000 });
  
  // Add Categories
  let clicked_category = [];
  for (const category of categories) {
    if (await page.getByRole('button', { name: category }).isVisible({ timeout: 5000 })) {
      await page.getByRole('button', { name: category }).click({ timeout: 15000 });
      clicked_category.push(category);
    }
  }
  
  if (clicked_category.length === 0) {
    throw new Error('No categories found');
  }

  // Fill short description
  await page.getByRole('textbox', { name: 'Add short description' }).click({ timeout: 15000 });
  await page.getByRole('textbox', { name: 'Add short description' }).fill(shortDescription);

  // ============================================
  // Step 4: Publish Project
  // ============================================
  await page.getByRole('button', { name: 'Publish' }).click({ timeout: 15000 });
  
  // ============================================
  // Step 5: Verify Creation
  // ============================================

  // On project detail page
  await expect(page.locator('#HeroProjectDetail')).toContainText(projectTitle);
  for (const category of clicked_category) {
    await expect(page.locator('#HeroProjectDetail')).toContainText(category);
  }
  await expect(page.locator('#ContentProjectDetail')).toContainText(projectContent);
  await expect(page.locator('#ExternalLinksProjectDetail')).toContainText(externalUrl);

  // On project list page

  // Go to my project page first
  await page.getByRole('button', { name: 'Profile Menu' }).click({ timeout: 15000 });
  await page.getByRole('menuitem', { name: 'My Project' }).click({ timeout: 15000 });

  // Wait for navigation/success
  await page.waitForLoadState('networkidle');
  await page.waitForURL('**/en/project/me', { timeout: 10000 });

  // Verify project is in my project page
  await expect(page.getByRole('main')).toContainText(projectTitle);
  await expect(page.getByRole('main')).toContainText(shortDescription);

  // ============================================
  // Step 6: Modify - Edit the Project
  // ============================================
  const new_timestamp = Date.now();
  const new_projectTitle = `[NEW] E2E TEST ${new_timestamp}`;
  const new_projectContent = `This is a new test project for E2E testing.`;
  const new_shortDescription = `Updated short description for E2E test ${new_timestamp}`;
  const new_collaborator = `rangsiman.jera`
  const new_collaborator_display_name = `RANGSIMAN JERABUNJERCHAI`

   // Click on project action dropdown
  await page.locator(`//a[.//h4[contains(text(), '${projectTitle}')]]//*[name()='svg' and contains(@class, 'lucide-ellipsis')]`).click({ timeout: 15000 });
  await page.waitForTimeout(500);

  // Click Edit
  await page.getByRole('menuitem', { name: 'Edit' }).click({ timeout: 15000 });
  
  // Wait for navigation/success
  await expect(page).toHaveURL(/.*\/project\/edit\//, { timeout: 5000 });
  await expect(page.getByRole('textbox', { name: 'Add title' })).toHaveValue(projectTitle);

  // Edit project
  await page.getByRole('textbox', { name: 'Add title' }).click({ timeout: 15000 });
  await page.getByRole('textbox', { name: 'Add title' }).fill(new_projectTitle);
  
  await editor.click({ timeout: 15000 });
  await editor.pressSequentially(new_projectContent + "\n\n", { delay: 20 });
  await page.waitForTimeout(1000);

  await page.getByRole('textbox', { name: 'Add short description' }).click({ timeout: 15000 });
  await page.getByRole('textbox', { name: 'Add short description' }).fill(new_shortDescription);

  await page.getByRole('textbox', { name: 'Add collaborators by username' }).click({ timeout: 15000 });
  await page.getByRole('textbox', { name: 'Add collaborators by username' }).fill(new_collaborator);
  await page.locator('.lucide.lucide-plus.text-main-primary').click({ timeout: 15000 });
  await expect(page.locator('body')).toContainText(new_collaborator);

  // ============================================
  // Step 7: Publish Updated Project
  // ============================================
  await page.getByRole('button', { name: 'Publish' }).click({ timeout: 15000 });
  
  // Wait for navigation/success
  await page.waitForLoadState('networkidle');

  // ============================================
  // Step 5: Verify Updated
  // ============================================

  // On project detail page
  await expect(page.locator('#HeroProjectDetail')).toContainText(new_projectTitle);
  await expect(page.locator('#ContentProjectDetail')).toContainText(new_projectContent);
  await expect(page.locator('#ContributorProjectDetail')).toContainText(new_collaborator_display_name);

  // On project list page

  // Go to my project page first
  await page.getByRole('button', { name: 'Profile Menu' }).click({ timeout: 15000 });
  await page.getByRole('menuitem', { name: 'My Project' }).click({ timeout: 15000 });

  // Wait for navigation/success
  await page.waitForURL('**/en/project/me', { timeout: 10000 });

  // Verify project is in my project page
  await expect(page.getByRole('main')).toContainText(new_projectTitle);
  await expect(page.getByRole('main')).toContainText(new_shortDescription);
  
  // ============================================
  // Step 9: Cleanup - Delete the Project
  // ============================================
  // Click on project action dropdown
  await page.locator(`//a[.//h4[contains(text(), '${new_projectTitle}')]]//*[name()='svg' and contains(@class, 'lucide-ellipsis')]`).click({ timeout: 15000 });

  // Click Delete
  await page.waitForTimeout(1000);
  await page.getByRole('menuitem', { name: 'Delete' }).click({ timeout: 15000 });
  await expect(page.getByRole('heading', { name: 'Confirm Delete' })).toBeVisible();
  await page.getByRole('button', { name: 'Delete' }).click({ timeout: 15000 });

  // Verify Deletion
  const projectCard = page.locator(`//a[.//h4[contains(text(), '${new_projectTitle}')]]`);
  await expect(projectCard).toHaveCount(0, { timeout: 15000 });

  // // ============================================
  // // Step 10: Sign Out
  // // ============================================
  
  // Sign out
  await page.getByRole('button', { name: 'Profile Menu' }).click({ timeout: 15000 });
  await page.getByRole('menuitem', { name: 'Sign out' }).click({ timeout: 15000 });
  
  // Verify sign out - 404 page
  await expect(page.locator("//h1[contains(text(), '404')]")).toBeVisible({ timeout: 15000 });
});