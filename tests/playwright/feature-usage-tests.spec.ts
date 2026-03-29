import { expect, test } from "@playwright/test";
import * as fs from "fs";
import * as path from "path";

// Feature usage documentation directory
const baseDir = path.join(__dirname, "../../screenshots/release-blog");
const usageDir = path.join(baseDir, "feature-usage");
const searchDir = path.join(usageDir, "01-search-and-filter");
const foldersDir = path.join(usageDir, "02-folder-management");
const aiDir = path.join(usageDir, "03-ai-features");
const bulkDir = path.join(usageDir, "04-bulk-operations");
const settingsDir = path.join(usageDir, "05-settings-config");

// Ensure directories exist
[usageDir, searchDir, foldersDir, aiDir, bulkDir, settingsDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Helper to highlight elements
async function highlightElement(page: any, selector: string, color = "#3b82f6") {
  await page.evaluate(
    ({ sel, col }) => {
      const elements = document.querySelectorAll(sel);
      elements.forEach((element: any) => {
        element.style.outline = `4px solid ${col}`;
        element.style.outlineOffset = "3px";
        element.style.boxShadow = `0 0 20px ${col}`;
      });
    },
    { sel: selector, col: color }
  );
}

// Helper to remove highlights
async function removeHighlights(page: any) {
  await page.evaluate(() => {
    document.querySelectorAll("*").forEach((el: any) => {
      el.style.outline = "";
      el.style.outlineOffset = "";
      el.style.boxShadow = "";
    });
  });
}

// Helper for landscape screenshots
async function captureLandscape(page: any, filename: string) {
  await page.screenshot({
    path: filename,
    clip: {
      x: 0,
      y: 0,
      width: 1600,
      height: 900,
    },
  });
}

test.describe("Feature Usage: Search and Filter Assets", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/user/login");
    await page.fill('input[name="name"]', "admin");
    await page.fill('input[name="pass"]', "admin");
    await page.click('input[type="submit"]');
    await page.waitForLoadState("networkidle");
  });

  test("Usage 1.1: Navigate to Asset Browser", async ({ page }) => {
    await page.goto("/admin/content/cloudinary/assets");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(500);

    // Capture initial state
    await captureLandscape(page, path.join(searchDir, "step-01-asset-browser-initial.png"));

    // Highlight the page title
    await highlightElement(page, "h1", "#3b82f6");
    await captureLandscape(page, path.join(searchDir, "step-02-page-title-highlighted.png"));
    await removeHighlights(page);

    await expect(page.locator("h1, .page-title")).toBeVisible();
  });

  test("Usage 1.2: Use Search Functionality", async ({ page }) => {
    await page.goto("/admin/content/cloudinary/assets");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(500);

    // Look for search input
    const searchInput = page.locator('input[type="search"], input[name*="search"], input[placeholder*="Search"]').first();
    
    if (await searchInput.count() > 0) {
      // Highlight search field
      await highlightElement(page, 'input[type="search"], input[name*="search"], input[placeholder*="Search"]', "#10b981");
      await captureLandscape(page, path.join(searchDir, "step-03-search-field-highlighted.png"));
      await removeHighlights(page);

      // Type search query
      await searchInput.fill("sample");
      await page.waitForTimeout(300);
      await captureLandscape(page, path.join(searchDir, "step-04-search-query-entered.png"));

      // Submit search if there's a button
      const searchButton = page.locator('button[type="submit"], input[type="submit"]').first();
      if (await searchButton.count() > 0) {
        await searchButton.click();
        await page.waitForLoadState("networkidle");
        await page.waitForTimeout(500);
        await captureLandscape(page, path.join(searchDir, "step-05-search-results.png"));
      }
    }

    await expect(page.locator("h1, .page-title")).toBeVisible();
  });

  test("Usage 1.3: Apply Filters", async ({ page }) => {
    await page.goto("/admin/content/cloudinary/assets");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(500);

    // Look for filter dropdowns/selects
    const filterSelects = page.locator('select, .form-select').all();
    const selects = await filterSelects;

    if (selects.length > 0) {
      // Highlight first filter
      await highlightElement(page, 'select, .form-select', "#8b5cf6");
      await captureLandscape(page, path.join(searchDir, "step-06-filters-highlighted.png"));
      await removeHighlights(page);

      // Try to interact with first select
      const firstSelect = page.locator('select, .form-select').first();
      if (await firstSelect.count() > 0) {
        await firstSelect.scrollIntoViewIfNeeded();
        await captureLandscape(page, path.join(searchDir, "step-07-filter-options.png"));
      }
    }

    await expect(page.locator("h1, .page-title")).toBeVisible();
  });
});

test.describe("Feature Usage: Folder Management", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/user/login");
    await page.fill('input[name="name"]', "admin");
    await page.fill('input[name="pass"]', "admin");
    await page.click('input[type="submit"]');
    await page.waitForLoadState("networkidle");
  });

  test("Usage 2.1: Access Folder Manager", async ({ page }) => {
    await page.goto("/admin/content/cloudinary/folders");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(500);

    // Capture initial view
    await captureLandscape(page, path.join(foldersDir, "step-01-folder-manager-initial.png"));

    // Highlight folder list if exists
    if (await page.locator("table, .folder-list").count() > 0) {
      await highlightElement(page, "table, .folder-list", "#10b981");
      await captureLandscape(page, path.join(foldersDir, "step-02-folder-list-highlighted.png"));
      await removeHighlights(page);
    }

    await expect(page.locator("h1, .page-title")).toBeVisible();
  });

  test("Usage 2.2: Create New Folder Form", async ({ page }) => {
    await page.goto("/admin/content/cloudinary/folders");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(500);

    // Look for create folder form
    const folderNameInput = page.locator('input[name*="folder"], input[name*="name"]').first();
    
    if (await folderNameInput.count() > 0) {
      // Highlight the form
      await highlightElement(page, 'form', "#f59e0b");
      await captureLandscape(page, path.join(foldersDir, "step-03-create-form-highlighted.png"));
      await removeHighlights(page);

      // Highlight input field
      await highlightElement(page, 'input[name*="folder"], input[name*="name"]', "#10b981");
      await captureLandscape(page, path.join(foldersDir, "step-04-folder-name-field.png"));
      await removeHighlights(page);

      // Fill in folder name
      await folderNameInput.fill("test-documentation-folder");
      await page.waitForTimeout(300);
      await captureLandscape(page, path.join(foldersDir, "step-05-folder-name-entered.png"));

      // Highlight submit button
      const submitButton = page.locator('button[type="submit"], input[type="submit"]').first();
      if (await submitButton.count() > 0) {
        await highlightElement(page, 'button[type="submit"], input[type="submit"]', "#3b82f6");
        await captureLandscape(page, path.join(foldersDir, "step-06-submit-button-highlighted.png"));
        await removeHighlights(page);
      }
    }

    await expect(page.locator("h1, .page-title")).toBeVisible();
  });

  test("Usage 2.3: Browse Folder Contents", async ({ page }) => {
    await page.goto("/admin/content/cloudinary/folders");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(500);

    // Look for browse links
    const browseLinks = page.locator('a:has-text("Browse")').all();
    const links = await browseLinks;

    if (links.length > 0) {
      // Highlight browse links
      await highlightElement(page, 'a:has-text("Browse")', "#ec4899");
      await captureLandscape(page, path.join(foldersDir, "step-07-browse-links-highlighted.png"));
      await removeHighlights(page);
    }

    await expect(page.locator("h1, .page-title")).toBeVisible();
  });
});

test.describe("Feature Usage: AI Features Configuration", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/user/login");
    await page.fill('input[name="name"]', "admin");
    await page.fill('input[name="pass"]', "admin");
    await page.click('input[type="submit"]');
    await page.waitForLoadState("networkidle");
  });

  test("Usage 3.1: Access AI Settings", async ({ page }) => {
    await page.goto("/admin/config/media/cloudinary/ai");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(500);

    // Capture initial state
    await captureLandscape(page, path.join(aiDir, "step-01-ai-settings-initial.png"));

    // Highlight page title
    await highlightElement(page, "h1", "#3b82f6");
    await captureLandscape(page, path.join(aiDir, "step-02-ai-settings-title.png"));
    await removeHighlights(page);

    await expect(page.locator("h1, .page-title")).toBeVisible();
  });

  test("Usage 3.2: Configure Auto-Tagging", async ({ page }) => {
    await page.goto("/admin/config/media/cloudinary/ai");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(500);

    // Look for auto-tagging settings
    const autoTagCheckbox = page.locator('input[type="checkbox"][name*="auto"], input[type="checkbox"][name*="tag"]').first();
    
    if (await autoTagCheckbox.count() > 0) {
      await autoTagCheckbox.scrollIntoViewIfNeeded();
      
      // Highlight auto-tag section
      await highlightElement(page, 'input[type="checkbox"][name*="auto"], input[type="checkbox"][name*="tag"]', "#10b981");
      await captureLandscape(page, path.join(aiDir, "step-03-auto-tagging-checkbox.png"));
      await removeHighlights(page);

      // Show checkbox state
      const isChecked = await autoTagCheckbox.isChecked();
      await captureLandscape(page, path.join(aiDir, `step-04-auto-tagging-${isChecked ? 'enabled' : 'disabled'}.png`));
    }

    await expect(page.locator("h1, .page-title")).toBeVisible();
  });

  test("Usage 3.3: Configure AI Moderation", async ({ page }) => {
    await page.goto("/admin/config/media/cloudinary/ai");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(500);

    // Look for moderation settings
    const moderationCheckbox = page.locator('input[type="checkbox"][name*="moderation"], input[type="checkbox"][name*="moderate"]').first();
    
    if (await moderationCheckbox.count() > 0) {
      await moderationCheckbox.scrollIntoViewIfNeeded();
      
      // Highlight moderation section
      await highlightElement(page, 'input[type="checkbox"][name*="moderation"], input[type="checkbox"][name*="moderate"]', "#ef4444");
      await captureLandscape(page, path.join(aiDir, "step-05-moderation-checkbox.png"));
      await removeHighlights(page);
    }

    await expect(page.locator("h1, .page-title")).toBeVisible();
  });

  test("Usage 3.4: Save AI Configuration", async ({ page }) => {
    await page.goto("/admin/config/media/cloudinary/ai");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(500);

    // Highlight save button
    const saveButton = page.locator('button[type="submit"], input[type="submit"]').first();
    
    if (await saveButton.count() > 0) {
      await saveButton.scrollIntoViewIfNeeded();
      await highlightElement(page, 'button[type="submit"], input[type="submit"]', "#10b981");
      await captureLandscape(page, path.join(aiDir, "step-06-save-configuration.png"));
      await removeHighlights(page);
    }

    await expect(page.locator("h1, .page-title")).toBeVisible();
  });
});

test.describe("Feature Usage: Bulk Operations", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/user/login");
    await page.fill('input[name="name"]', "admin");
    await page.fill('input[name="pass"]', "admin");
    await page.click('input[type="submit"]');
    await page.waitForLoadState("networkidle");
  });

  test("Usage 4.1: Access Bulk Operations", async ({ page }) => {
    await page.goto("/admin/content/cloudinary/bulk");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(500);

    // Capture initial state
    await captureLandscape(page, path.join(bulkDir, "step-01-bulk-ops-initial.png"));

    // Highlight form
    if (await page.locator("form").count() > 0) {
      await highlightElement(page, "form", "#ec4899");
      await captureLandscape(page, path.join(bulkDir, "step-02-bulk-form-highlighted.png"));
      await removeHighlights(page);
    }

    await expect(page.locator("h1, .page-title")).toBeVisible();
  });

  test("Usage 4.2: Select Bulk Operation Type", async ({ page }) => {
    await page.goto("/admin/content/cloudinary/bulk");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(500);

    // Look for operation type selector
    const operationSelect = page.locator('select[name*="operation"], select[name*="action"]').first();
    
    if (await operationSelect.count() > 0) {
      // Highlight operation selector
      await highlightElement(page, 'select[name*="operation"], select[name*="action"]', "#8b5cf6");
      await captureLandscape(page, path.join(bulkDir, "step-03-operation-selector.png"));
      await removeHighlights(page);

      // Show options
      await operationSelect.scrollIntoViewIfNeeded();
      await captureLandscape(page, path.join(bulkDir, "step-04-operation-options.png"));
    }

    await expect(page.locator("h1, .page-title")).toBeVisible();
  });

  test("Usage 4.3: Configure Bulk Operation Parameters", async ({ page }) => {
    await page.goto("/admin/content/cloudinary/bulk");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(500);

    // Look for input fields
    const inputFields = page.locator('input[type="text"], textarea').all();
    const fields = await inputFields;

    if (fields.length > 0) {
      // Highlight input fields
      await highlightElement(page, 'input[type="text"], textarea', "#10b981");
      await captureLandscape(page, path.join(bulkDir, "step-05-operation-parameters.png"));
      await removeHighlights(page);
    }

    await expect(page.locator("h1, .page-title")).toBeVisible();
  });
});

test.describe("Feature Usage: Settings Configuration", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/user/login");
    await page.fill('input[name="name"]', "admin");
    await page.fill('input[name="pass"]', "admin");
    await page.click('input[type="submit"]');
    await page.waitForLoadState("networkidle");
  });

  test("Usage 5.1: Main Cloudinary Settings", async ({ page }) => {
    await page.goto("/admin/config/media/cloudinary");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(500);

    // Capture initial state
    await captureLandscape(page, path.join(settingsDir, "step-01-main-settings-initial.png"));

    // Highlight configuration form
    if (await page.locator("form").count() > 0) {
      await highlightElement(page, "form", "#3b82f6");
      await captureLandscape(page, path.join(settingsDir, "step-02-config-form-highlighted.png"));
      await removeHighlights(page);
    }

    await expect(page.locator("h1, .page-title")).toBeVisible();
  });

  test("Usage 5.2: Admin Module Settings", async ({ page }) => {
    await page.goto("/admin/config/media/cloudinary/admin");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(500);

    // Capture initial state
    await captureLandscape(page, path.join(settingsDir, "step-03-admin-settings-initial.png"));

    // Look for settings fields
    const settingsFields = page.locator('input, select, textarea').all();
    const fields = await settingsFields;

    if (fields.length > 0) {
      await highlightElement(page, 'input, select, textarea', "#10b981");
      await captureLandscape(page, path.join(settingsDir, "step-04-admin-settings-fields.png"));
      await removeHighlights(page);
    }

    await expect(page.locator("h1, .page-title")).toBeVisible();
  });

  test("Usage 5.3: View Usage Statistics", async ({ page }) => {
    await page.goto("/admin/content/cloudinary/usage");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(500);

    // Capture usage stats
    await captureLandscape(page, path.join(settingsDir, "step-05-usage-statistics.png"));

    // Highlight stats if they exist
    if (await page.locator("table, .statistics, .usage-data").count() > 0) {
      await highlightElement(page, "table, .statistics, .usage-data", "#8b5cf6");
      await captureLandscape(page, path.join(settingsDir, "step-06-usage-data-highlighted.png"));
      await removeHighlights(page);
    }

    await expect(page.locator("h1.page-title")).toBeVisible();
  });
});
