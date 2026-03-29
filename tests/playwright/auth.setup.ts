import { test as setup, expect } from '@playwright/test';

const authFile = 'tests/playwright/.auth/user.json';

setup('authenticate', async ({ page }) => {
  // Navigate to login page
  await page.goto('/user/login');
  
  // Fill in credentials
  await page.fill('input[name="name"]', 'admin');
  await page.fill('input[name="pass"]', 'admin');
  
  // Click login button
  await page.click('input[type="submit"]');
  
  // Wait for navigation to complete
  await page.waitForURL('/admin/content');
  
  // Verify we're logged in
  await expect(page.locator('text=Logged in as admin')).toBeVisible();
  
  // Save authentication state
  await page.context().storageState({ path: authFile });
});
