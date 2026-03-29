import { expect, test } from "@playwright/test";
import * as fs from "fs";
import * as path from "path";

// High-quality screenshot directory (1600x900 @ 72dpi)
const baseDir = path.join(__dirname, "../../screenshots/release-blog");
const hqDir = path.join(baseDir, "high-quality");
const detailedDir = path.join(hqDir, "detailed-features");

// Ensure directories exist
[hqDir, detailedDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Helper to add visual highlight with enhanced styling
async function highlightElement(page: any, selector: string, color = "#3b82f6") {
  await page.evaluate(
    ({ sel, col }) => {
      const elements = document.querySelectorAll(sel);
      elements.forEach((element: any) => {
        element.style.outline = `4px solid ${col}`;
        element.style.outlineOffset = "3px";
        element.style.boxShadow = `0 0 20px ${col}`;
        element.style.position = "relative";
        element.style.zIndex = "1000";
      });
    },
    { sel: selector, col: color }
  );
}

// Helper to remove all highlights
async function removeHighlights(page: any) {
  await page.evaluate(() => {
    document.querySelectorAll("*").forEach((el: any) => {
      el.style.outline = "";
      el.style.outlineOffset = "";
      el.style.boxShadow = "";
    });
  });
}

// Helper for high-quality screenshots
async function captureHighQuality(page: any, filename: string) {
  await page.screenshot({
    path: path.join(detailedDir, filename),
    fullPage: true,
  });
}

test.describe("High-Quality Feature Documentation", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/user/login");
    await page.fill('input[name="name"]', "admin");
    await page.fill('input[name="pass"]', "admin");
    await page.click('input[type="submit"]');
    await page.waitForLoadState("networkidle");
  });

  test("HQ-01: Main Cloudinary Settings Page", async ({ page }) => {
    await page.goto("/admin/config/media/cloudinary");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(500);

    // Full page capture
    await captureHighQuality(page, "01-cloudinary-settings-full.png");

    // Highlight page title
    await highlightElement(page, "h1", "#3b82f6");
    await captureHighQuality(page, "02-cloudinary-settings-title-highlighted.png");
    await removeHighlights(page);

    // Highlight form if it exists
    if (await page.locator("form").count() > 0) {
      await highlightElement(page, "form", "#10b981");
      await captureHighQuality(page, "03-cloudinary-settings-form-highlighted.png");
      await removeHighlights(page);
    }

    await expect(page.locator("h1, .page-title")).toBeVisible();
  });

  test("HQ-02: Asset Browser with Enhanced Details", async ({ page }) => {
    await page.goto("/admin/content/cloudinary/assets");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(500);

    // Full page
    await captureHighQuality(page, "04-asset-browser-full.png");

    // Highlight title
    await highlightElement(page, "h1", "#3b82f6");
    await captureHighQuality(page, "05-asset-browser-title.png");
    await removeHighlights(page);

    // Highlight search/filter area if exists
    if (await page.locator("form, .views-exposed-form").count() > 0) {
      await highlightElement(page, "form, .views-exposed-form", "#10b981");
      await captureHighQuality(page, "06-asset-browser-filters.png");
      await removeHighlights(page);
    }

    // Highlight content area
    if (await page.locator(".view-content, main").count() > 0) {
      await highlightElement(page, ".view-content, main", "#f59e0b");
      await captureHighQuality(page, "07-asset-browser-content.png");
      await removeHighlights(page);
    }

    await expect(page.locator("h1, .page-title")).toBeVisible();
  });

  test("HQ-03: Usage Statistics Dashboard", async ({ page }) => {
    await page.goto("/admin/content/cloudinary/usage");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(500);

    // Full page
    await captureHighQuality(page, "08-usage-stats-full.png");

    // Highlight title
    await highlightElement(page, "h1", "#3b82f6");
    await captureHighQuality(page, "09-usage-stats-title.png");
    await removeHighlights(page);

    // Highlight any tables or stat displays
    if (await page.locator("table, .statistics, .usage-data").count() > 0) {
      await highlightElement(page, "table, .statistics, .usage-data", "#8b5cf6");
      await captureHighQuality(page, "10-usage-stats-data.png");
      await removeHighlights(page);
    }

    await expect(page.locator("h1.page-title")).toBeVisible();
  });

  test("HQ-04: Folder Management Interface", async ({ page }) => {
    await page.goto("/admin/content/cloudinary/folders");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(500);

    // Full page
    await captureHighQuality(page, "11-folder-manager-full.png");

    // Highlight title
    await highlightElement(page, "h1", "#3b82f6");
    await captureHighQuality(page, "12-folder-manager-title.png");
    await removeHighlights(page);

    // Highlight folder list/table
    if (await page.locator("table, .folder-list").count() > 0) {
      await highlightElement(page, "table, .folder-list", "#10b981");
      await captureHighQuality(page, "13-folder-manager-list.png");
      await removeHighlights(page);
    }

    // Highlight create form if visible
    if (await page.locator("form").count() > 0) {
      await highlightElement(page, "form", "#f59e0b");
      await captureHighQuality(page, "14-folder-manager-form.png");
      await removeHighlights(page);
    }

    await expect(page.locator("h1, .page-title")).toBeVisible();
  });

  test("HQ-05: Bulk Operations Form", async ({ page }) => {
    await page.goto("/admin/content/cloudinary/bulk");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(500);

    // Full page
    await captureHighQuality(page, "15-bulk-ops-full.png");

    // Highlight title
    await highlightElement(page, "h1", "#3b82f6");
    await captureHighQuality(page, "16-bulk-ops-title.png");
    await removeHighlights(page);

    // Highlight form
    if (await page.locator("form").count() > 0) {
      await highlightElement(page, "form", "#ec4899");
      await captureHighQuality(page, "17-bulk-ops-form.png");
      await removeHighlights(page);
    }

    await expect(page.locator("h1, .page-title")).toBeVisible();
  });

  test("HQ-06: Admin Settings Page", async ({ page }) => {
    await page.goto("/admin/config/media/cloudinary/admin");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(500);

    // Full page
    await captureHighQuality(page, "18-admin-settings-full.png");

    // Highlight title
    await highlightElement(page, "h1", "#3b82f6");
    await captureHighQuality(page, "19-admin-settings-title.png");
    await removeHighlights(page);

    // Highlight form
    if (await page.locator("form").count() > 0) {
      await highlightElement(page, "form", "#10b981");
      await captureHighQuality(page, "20-admin-settings-form.png");
      await removeHighlights(page);
    }

    await expect(page.locator("h1, .page-title")).toBeVisible();
  });

  test("HQ-07: AI Settings Configuration", async ({ page }) => {
    await page.goto("/admin/config/media/cloudinary/ai");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(500);

    // Full page
    await captureHighQuality(page, "21-ai-settings-full.png");

    // Highlight title
    await highlightElement(page, "h1", "#3b82f6");
    await captureHighQuality(page, "22-ai-settings-title.png");
    await removeHighlights(page);

    // Highlight form
    if (await page.locator("form").count() > 0) {
      await highlightElement(page, "form", "#8b5cf6");
      await captureHighQuality(page, "23-ai-settings-form.png");
      await removeHighlights(page);
    }

    await expect(page.locator("h1, .page-title")).toBeVisible();
  });

  test("HQ-08: Permissions Page - Cloudinary Section", async ({ page }) => {
    await page.goto("/admin/people/permissions");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(500);

    // Scroll to Cloudinary permissions
    const cloudinaryText = page.locator('text=Administer Cloudinary').first();
    if (await cloudinaryText.isVisible()) {
      await cloudinaryText.scrollIntoViewIfNeeded();
      await page.waitForTimeout(300);
    }

    // Full page
    await captureHighQuality(page, "24-permissions-full.png");

    // Highlight Cloudinary section
    await page.evaluate(() => {
      const elements = Array.from(document.querySelectorAll("*"));
      const cloudinaryElement = elements.find(el => 
        el.textContent?.includes("Administer Cloudinary")
      );
      if (cloudinaryElement) {
        const section = cloudinaryElement.closest("table, .permissions-table");
        if (section) {
          (section as HTMLElement).style.outline = "4px solid #3b82f6";
          (section as HTMLElement).style.boxShadow = "0 0 20px #3b82f6";
        }
      }
    });

    await captureHighQuality(page, "25-permissions-cloudinary-highlighted.png");
    await removeHighlights(page);

    await expect(page.locator("h1, .page-title")).toBeVisible();
  });

  test("HQ-09: Roles Management Page", async ({ page }) => {
    await page.goto("/admin/people/roles");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(500);

    // Full page
    await captureHighQuality(page, "26-roles-full.png");

    // Highlight title
    await highlightElement(page, "h1", "#3b82f6");
    await captureHighQuality(page, "27-roles-title.png");
    await removeHighlights(page);

    // Highlight roles table
    if (await page.locator("table").count() > 0) {
      await highlightElement(page, "table", "#10b981");
      await captureHighQuality(page, "28-roles-table.png");
      await removeHighlights(page);
    }

    await expect(page.locator("h1, .page-title")).toBeVisible();
  });

  test("HQ-10: Modules Page - Cloudinary Modules", async ({ page }) => {
    await page.goto("/admin/modules");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(500);

    // Full page
    await captureHighQuality(page, "29-modules-full.png");

    // Scroll to Cloudinary modules
    const cloudinaryModule = page.locator('text=Cloudinary').first();
    if (await cloudinaryModule.isVisible()) {
      await cloudinaryModule.scrollIntoViewIfNeeded();
      await page.waitForTimeout(300);
    }

    // Highlight Cloudinary section
    await page.evaluate(() => {
      const elements = Array.from(document.querySelectorAll("*"));
      const cloudinaryElement = elements.find(el => 
        el.textContent?.includes("Cloudinary")
      );
      if (cloudinaryElement) {
        const section = cloudinaryElement.closest("details, .package");
        if (section) {
          (section as HTMLElement).style.outline = "4px solid #8b5cf6";
          (section as HTMLElement).style.boxShadow = "0 0 20px #8b5cf6";
        }
      }
    });

    await captureHighQuality(page, "30-modules-cloudinary-highlighted.png");
    await removeHighlights(page);

    await expect(page.locator("h1, .page-title")).toBeVisible();
  });
});
