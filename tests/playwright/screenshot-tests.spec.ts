import { expect, test } from "@playwright/test";
import * as fs from "fs";
import * as path from "path";

// Screenshot directory
const screenshotDir = path.join(__dirname, "../../screenshots/release-blog");

// Ensure directory exists
if (!fs.existsSync(screenshotDir)) {
  fs.mkdirSync(screenshotDir, { recursive: true });
}

test.describe("Cloudinary Admin - Release Screenshots", () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto("/user/login");
    await page.fill('input[name="name"]', "admin");
    await page.fill('input[name="pass"]', "admin");
    await page.click('input[type="submit"]');
    await page.waitForLoadState("networkidle");
  });

  test("01 - Cloudinary Settings Page", async ({ page }) => {
    await page.goto("/admin/config/media/cloudinary");
    await page.waitForLoadState("networkidle");
    
    await page.screenshot({
      path: path.join(screenshotDir, "01-cloudinary-settings.png"),
      fullPage: true,
    });
    
    await expect(page.locator("h1, .page-title")).toBeVisible();
  });

  test("02 - Asset Browser", async ({ page }) => {
    await page.goto("/admin/content/cloudinary/assets");
    await page.waitForLoadState("networkidle");
    
    await page.screenshot({
      path: path.join(screenshotDir, "02-asset-browser.png"),
      fullPage: true,
    });
    
    await expect(page.locator("h1, .page-title")).toBeVisible();
  });

  test("03 - Usage Statistics Dashboard", async ({ page }) => {
    await page.goto("/admin/content/cloudinary/usage");
    await page.waitForLoadState("networkidle");
    
    await page.screenshot({
      path: path.join(screenshotDir, "03-usage-statistics.png"),
      fullPage: true,
    });
    
    await expect(page.locator("h1.page-title")).toBeVisible();
  });

  test("04 - Folder Manager", async ({ page }) => {
    await page.goto("/admin/content/cloudinary/folders");
    await page.waitForLoadState("networkidle");
    
    await page.screenshot({
      path: path.join(screenshotDir, "04-folder-manager.png"),
      fullPage: true,
    });
    
    await expect(page.locator("h1, .page-title")).toBeVisible();
  });

  test("05 - Bulk Operations Form", async ({ page }) => {
    await page.goto("/admin/content/cloudinary/bulk");
    await page.waitForLoadState("networkidle");
    
    await page.screenshot({
      path: path.join(screenshotDir, "05-bulk-operations.png"),
      fullPage: true,
    });
    
    await expect(page.locator("h1, .page-title")).toBeVisible();
  });

  test("06 - Admin Settings", async ({ page }) => {
    await page.goto("/admin/config/media/cloudinary/admin");
    await page.waitForLoadState("networkidle");
    
    await page.screenshot({
      path: path.join(screenshotDir, "06-admin-settings.png"),
      fullPage: true,
    });
    
    await expect(page.locator("h1, .page-title")).toBeVisible();
  });

  test("07 - AI Settings", async ({ page }) => {
    await page.goto("/admin/config/media/cloudinary/ai");
    await page.waitForLoadState("networkidle");
    
    await page.screenshot({
      path: path.join(screenshotDir, "07-ai-settings.png"),
      fullPage: true,
    });
    
    await expect(page.locator("h1, .page-title")).toBeVisible();
  });

  test("08 - Modules Page (Cloudinary Modules)", async ({ page }) => {
    await page.goto("/admin/modules");
    await page.waitForLoadState("networkidle");
    
    // Scroll to Cloudinary section if needed
    const cloudinarySection = page.locator('text=Cloudinary').first();
    if (await cloudinarySection.isVisible()) {
      await cloudinarySection.scrollIntoViewIfNeeded();
    }
    
    await page.screenshot({
      path: path.join(screenshotDir, "08-modules-page.png"),
      fullPage: true,
    });
    
    await expect(page.locator("h1, .page-title")).toBeVisible();
  });

  test("09 - Admin Content Page", async ({ page }) => {
    await page.goto("/admin/content");
    await page.waitForLoadState("networkidle");
    
    await page.screenshot({
      path: path.join(screenshotDir, "09-admin-content.png"),
      fullPage: true,
    });
    
    await expect(page.locator("h1, .page-title")).toBeVisible();
  });

  test("10 - Permissions Page (Cloudinary Permissions)", async ({ page }) => {
    await page.goto("/admin/people/permissions");
    await page.waitForLoadState("networkidle");
    
    // Scroll to Cloudinary permissions
    const cloudinaryPerms = page.locator('text=Cloudinary').first();
    if (await cloudinaryPerms.isVisible()) {
      await cloudinaryPerms.scrollIntoViewIfNeeded();
    }
    
    await page.screenshot({
      path: path.join(screenshotDir, "10-permissions-cloudinary.png"),
      fullPage: true,
    });
    
    await expect(page.locator("h1, .page-title")).toBeVisible();
  });

  test("11 - Roles Page (Cloudinary Roles)", async ({ page }) => {
    await page.goto("/admin/people/roles");
    await page.waitForLoadState("networkidle");
    
    await page.screenshot({
      path: path.join(screenshotDir, "11-roles-page.png"),
      fullPage: true,
    });
    
    await expect(page.locator("h1, .page-title")).toBeVisible();
  });
});
