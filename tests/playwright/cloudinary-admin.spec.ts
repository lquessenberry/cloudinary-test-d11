import { expect, test } from "@playwright/test";

test.describe("Cloudinary Admin UI", () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto("/user/login");
    await page.fill('input[name="name"]', "admin");
    await page.fill('input[name="pass"]', "admin");
    await page.click('input[type="submit"]');
    // Wait for navigation after login
    await page.waitForLoadState("networkidle");
  });

  test("should display Cloudinary settings page", async ({ page }) => {
    await page.goto("/admin/config/media/cloudinary");

    // Check page loaded successfully
    await expect(page.locator("h1, .page-title")).toBeVisible();

    // Check for form presence
    await expect(page.locator("form")).toBeVisible();
  });

  test("should access asset browser", async ({ page }) => {
    await page.goto("/admin/content/cloudinary/assets");

    // Check page loaded
    await expect(page.locator("h1, .page-title")).toBeVisible();
  });

  test("should display usage statistics", async ({ page }) => {
    await page.goto("/admin/content/cloudinary/usage");

    // Check page loaded
    await expect(page.locator("h1.page-title")).toBeVisible();
  });

  test("should access folder manager", async ({ page }) => {
    await page.goto("/admin/content/cloudinary/folders");

    // Check page loaded
    await expect(page.locator("h1, .page-title")).toBeVisible();
  });

  test("should access bulk operations form", async ({ page }) => {
    await page.goto("/admin/content/cloudinary/bulk");

    // Check page loaded
    await expect(page.locator("h1, .page-title")).toBeVisible();
  });

  test("should access admin settings", async ({ page }) => {
    await page.goto("/admin/config/media/cloudinary/admin");

    // Check page loaded
    await expect(page.locator("h1, .page-title")).toBeVisible();
  });

  test("should access modules page", async ({ page }) => {
    await page.goto("/admin/modules");

    // Check page loaded
    await expect(page.locator("h1, .page-title")).toBeVisible();
  });

  test("should access admin content page", async ({ page }) => {
    await page.goto("/admin/content");

    // Check page loaded
    await expect(page.locator("h1, .page-title")).toBeVisible();
  });
});

test.describe("Cloudinary Asset Search", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/user/login");
    await page.fill('input[name="name"]', "admin");
    await page.fill('input[name="pass"]', "admin");
    await page.click('input[type="submit"]');
    await page.waitForLoadState("networkidle");
  });

  test("should load folder management page", async ({ page }) => {
    await page.goto("/admin/content/cloudinary/folders");

    // Check page loaded
    await expect(page.locator("h1, .page-title")).toBeVisible();
  });

  test("should fill folder creation form", async ({ page }) => {
    await page.goto("/admin/content/cloudinary/folders");

    // Fill folder path
    const timestamp = Date.now();
    await page.fill('input[name="folder_path"]', `test-folder-${timestamp}`);

    // Note: Not submitting to avoid creating test folders in live account
    await expect(page.locator('input[name="folder_path"]')).toHaveValue(
      `test-folder-${timestamp}`,
    );
  });
});
