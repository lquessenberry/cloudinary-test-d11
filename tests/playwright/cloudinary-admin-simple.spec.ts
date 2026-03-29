import { test, expect } from '@playwright/test';

test.describe('Cloudinary Admin UI - Basic Tests', () => {
  
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/user/login');
    await page.fill('input[name="name"]', 'admin');
    await page.fill('input[name="pass"]', 'admin');
    await page.click('input[type="submit"]');
    await page.waitForLoadState('networkidle');
  });

  test('should access Cloudinary settings page', async ({ page }) => {
    const response = await page.goto('/admin/config/media/cloudinary');
    expect(response?.status()).toBeLessThan(400);
  });

  test('should access asset browser', async ({ page }) => {
    const response = await page.goto('/admin/content/cloudinary/assets');
    expect(response?.status()).toBeLessThan(400);
  });

  test('should access usage statistics', async ({ page }) => {
    const response = await page.goto('/admin/content/cloudinary/usage');
    expect(response?.status()).toBeLessThan(400);
  });

  test('should access folder manager', async ({ page }) => {
    const response = await page.goto('/admin/content/cloudinary/folders');
    expect(response?.status()).toBeLessThan(400);
  });

  test('should access bulk operations', async ({ page }) => {
    const response = await page.goto('/admin/content/cloudinary/bulk');
    expect(response?.status()).toBeLessThan(400);
  });

  test('should access admin settings', async ({ page }) => {
    const response = await page.goto('/admin/config/media/cloudinary/admin');
    expect(response?.status()).toBeLessThan(400);
  });

  test('should access modules page', async ({ page }) => {
    const response = await page.goto('/admin/modules');
    expect(response?.status()).toBeLessThan(400);
  });

  test('should access content page', async ({ page }) => {
    const response = await page.goto('/admin/content');
    expect(response?.status()).toBeLessThan(400);
  });

});
