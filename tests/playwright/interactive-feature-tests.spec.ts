import { expect, test } from "@playwright/test";
import * as fs from "fs";
import * as path from "path";

// Screenshot directories
const baseDir = path.join(__dirname, "../../screenshots/release-blog");
const interactiveDir = path.join(baseDir, "interactive");
const assetMgmtDir = path.join(interactiveDir, "01-asset-management");
const aiFeaturesDir = path.join(interactiveDir, "02-ai-features");
const permissionsDir = path.join(interactiveDir, "03-permissions-roles");
const workflowDir = path.join(interactiveDir, "04-complete-workflow");

// Ensure directories exist
[interactiveDir, assetMgmtDir, aiFeaturesDir, permissionsDir, workflowDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Helper to add visual highlight to elements
async function highlightElement(page: any, selector: string, color = "red") {
  await page.evaluate(
    ({ sel, col }) => {
      const element = document.querySelector(sel);
      if (element) {
        (element as HTMLElement).style.outline = `3px solid ${col}`;
        (element as HTMLElement).style.outlineOffset = "2px";
      }
    },
    { sel: selector, col: color }
  );
}

// Helper to remove highlights
async function removeHighlights(page: any) {
  await page.evaluate(() => {
    document.querySelectorAll("*").forEach((el) => {
      (el as HTMLElement).style.outline = "";
      (el as HTMLElement).style.outlineOffset = "";
    });
  });
}

test.describe("Feature Set 1: Asset Management", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/user/login");
    await page.fill('input[name="name"]', "admin");
    await page.fill('input[name="pass"]', "admin");
    await page.click('input[type="submit"]');
    await page.waitForLoadState("networkidle");
  });

  test("1.1 - Asset Browser: Navigation and Layout", async ({ page }) => {
    await page.goto("/admin/content/cloudinary/assets");
    await page.waitForLoadState("networkidle");

    // Step 1: Highlight page title
    await highlightElement(page, "h1.page-title", "blue");
    await page.screenshot({
      path: path.join(assetMgmtDir, "step-01-page-title.png"),
      fullPage: true,
    });

    // Step 2: Highlight search form
    await removeHighlights(page);
    await highlightElement(page, "form.cloudinary-search-form", "green");
    await page.screenshot({
      path: path.join(assetMgmtDir, "step-02-search-form.png"),
      fullPage: true,
    });

    // Step 3: Highlight asset grid/list
    await removeHighlights(page);
    await highlightElement(page, ".cloudinary-assets-grid, .cloudinary-assets-list, .view-content", "orange");
    await page.screenshot({
      path: path.join(assetMgmtDir, "step-03-asset-grid.png"),
      fullPage: true,
    });

    await removeHighlights(page);
    await expect(page.locator("h1, .page-title")).toBeVisible();
  });

  test("1.2 - Asset Browser: Search Functionality", async ({ page }) => {
    await page.goto("/admin/content/cloudinary/assets");
    await page.waitForLoadState("networkidle");

    // Step 1: Highlight search input
    const searchInput = 'input[name="search"]';
    if (await page.locator(searchInput).count() > 0) {
      await highlightElement(page, searchInput, "blue");
      await page.screenshot({
        path: path.join(assetMgmtDir, "step-04-search-input-empty.png"),
        fullPage: true,
      });

      // Step 2: Fill search and highlight
      await page.fill(searchInput, "sample");
      await highlightElement(page, searchInput, "green");
      await page.screenshot({
        path: path.join(assetMgmtDir, "step-05-search-input-filled.png"),
        fullPage: true,
      });
    }

    await removeHighlights(page);
  });

  test("1.3 - Asset Browser: Filter Controls", async ({ page }) => {
    await page.goto("/admin/content/cloudinary/assets");
    await page.waitForLoadState("networkidle");

    // Highlight type filter
    const typeFilter = 'select[name="type"]';
    if (await page.locator(typeFilter).count() > 0) {
      await highlightElement(page, typeFilter, "purple");
      await page.screenshot({
        path: path.join(assetMgmtDir, "step-06-type-filter.png"),
        fullPage: true,
      });
    }

    await removeHighlights(page);
  });

  test("1.4 - Folder Manager: Interface Overview", async ({ page }) => {
    await page.goto("/admin/content/cloudinary/folders");
    await page.waitForLoadState("networkidle");

    // Step 1: Highlight page title
    await highlightElement(page, "h1.page-title", "blue");
    await page.screenshot({
      path: path.join(assetMgmtDir, "step-07-folder-page-title.png"),
      fullPage: true,
    });

    // Step 2: Highlight folder list/tree
    await removeHighlights(page);
    await highlightElement(page, ".folder-list, .folder-tree, table", "green");
    await page.screenshot({
      path: path.join(assetMgmtDir, "step-08-folder-list.png"),
      fullPage: true,
    });

    // Step 3: Highlight create folder form
    await removeHighlights(page);
    const folderInput = 'input[name="folder_path"]';
    if (await page.locator(folderInput).count() > 0) {
      await highlightElement(page, folderInput, "orange");
      await page.screenshot({
        path: path.join(assetMgmtDir, "step-09-create-folder-input.png"),
        fullPage: true,
      });
    }

    await removeHighlights(page);
    await expect(page.locator("h1, .page-title")).toBeVisible();
  });

  test("1.5 - Bulk Operations: Form Elements", async ({ page }) => {
    await page.goto("/admin/content/cloudinary/bulk");
    await page.waitForLoadState("networkidle");

    // Step 1: Highlight page title
    await highlightElement(page, "h1.page-title", "blue");
    await page.screenshot({
      path: path.join(assetMgmtDir, "step-10-bulk-ops-title.png"),
      fullPage: true,
    });

    // Step 2: Highlight form
    await removeHighlights(page);
    await highlightElement(page, "form", "green");
    await page.screenshot({
      path: path.join(assetMgmtDir, "step-11-bulk-ops-form.png"),
      fullPage: true,
    });

    await removeHighlights(page);
    await expect(page.locator("h1, .page-title")).toBeVisible();
  });
});

test.describe("Feature Set 2: AI & Performance Features", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/user/login");
    await page.fill('input[name="name"]', "admin");
    await page.fill('input[name="pass"]', "admin");
    await page.click('input[type="submit"]');
    await page.waitForLoadState("networkidle");
  });

  test("2.1 - AI Settings: Auto-Tagging Configuration", async ({ page }) => {
    await page.goto("/admin/config/media/cloudinary/ai");
    await page.waitForLoadState("networkidle");

    // Step 1: Highlight page title
    await highlightElement(page, "h1.page-title", "blue");
    await page.screenshot({
      path: path.join(aiFeaturesDir, "step-01-ai-settings-title.png"),
      fullPage: true,
    });

    // Step 2: Highlight auto-tagging section
    await removeHighlights(page);
    const autoTagCheckbox = 'input[name="enable_auto_tagging"]';
    if (await page.locator(autoTagCheckbox).count() > 0) {
      await highlightElement(page, autoTagCheckbox, "green");
      await page.screenshot({
        path: path.join(aiFeaturesDir, "step-02-auto-tagging-enable.png"),
        fullPage: true,
      });

      // Step 3: Highlight confidence threshold
      await removeHighlights(page);
      const confidenceInput = 'input[name="auto_tagging_confidence"]';
      if (await page.locator(confidenceInput).count() > 0) {
        await highlightElement(page, confidenceInput, "orange");
        await page.screenshot({
          path: path.join(aiFeaturesDir, "step-03-confidence-threshold.png"),
          fullPage: true,
        });
      }
    }

    await removeHighlights(page);
  });

  test("2.2 - AI Settings: Background Removal", async ({ page }) => {
    await page.goto("/admin/config/media/cloudinary/ai");
    await page.waitForLoadState("networkidle");

    const bgRemovalCheckbox = 'input[name="enable_background_removal"]';
    if (await page.locator(bgRemovalCheckbox).count() > 0) {
      await highlightElement(page, bgRemovalCheckbox, "purple");
      await page.screenshot({
        path: path.join(aiFeaturesDir, "step-04-background-removal.png"),
        fullPage: true,
      });
    }

    await removeHighlights(page);
  });

  test("2.3 - AI Settings: Moderation & OCR", async ({ page }) => {
    await page.goto("/admin/config/media/cloudinary/ai");
    await page.waitForLoadState("networkidle");

    // Highlight moderation
    const moderationCheckbox = 'input[name="enable_moderation"]';
    if (await page.locator(moderationCheckbox).count() > 0) {
      await highlightElement(page, moderationCheckbox, "red");
      await page.screenshot({
        path: path.join(aiFeaturesDir, "step-05-moderation.png"),
        fullPage: true,
      });
    }

    await removeHighlights(page);

    // Highlight OCR
    const ocrCheckbox = 'input[name="enable_ocr"]';
    if (await page.locator(ocrCheckbox).count() > 0) {
      await highlightElement(page, ocrCheckbox, "blue");
      await page.screenshot({
        path: path.join(aiFeaturesDir, "step-06-ocr.png"),
        fullPage: true,
      });
    }

    await removeHighlights(page);
  });

  test("2.4 - AI Settings: Performance - Caching", async ({ page }) => {
    await page.goto("/admin/config/media/cloudinary/ai");
    await page.waitForLoadState("networkidle");

    const cacheTtlInput = 'input[name="cache_ttl"]';
    if (await page.locator(cacheTtlInput).count() > 0) {
      await highlightElement(page, cacheTtlInput, "green");
      await page.screenshot({
        path: path.join(aiFeaturesDir, "step-07-cache-ttl.png"),
        fullPage: true,
      });
    }

    await removeHighlights(page);
  });

  test("2.5 - AI Settings: Performance - Batch Processing", async ({ page }) => {
    await page.goto("/admin/config/media/cloudinary/ai");
    await page.waitForLoadState("networkidle");

    const batchSizeInput = 'input[name="batch_size"]';
    if (await page.locator(batchSizeInput).count() > 0) {
      await highlightElement(page, batchSizeInput, "orange");
      await page.screenshot({
        path: path.join(aiFeaturesDir, "step-08-batch-size.png"),
        fullPage: true,
      });
    }

    await removeHighlights(page);
  });

  test("2.6 - Usage Statistics: Dashboard Overview", async ({ page }) => {
    await page.goto("/admin/content/cloudinary/usage");
    await page.waitForLoadState("networkidle");

    // Highlight page title
    await highlightElement(page, "h1.page-title", "blue");
    await page.screenshot({
      path: path.join(aiFeaturesDir, "step-09-usage-stats-title.png"),
      fullPage: true,
    });

    await removeHighlights(page);

    // Highlight stats sections
    await highlightElement(page, ".usage-stats, table, .statistics", "green");
    await page.screenshot({
      path: path.join(aiFeaturesDir, "step-10-usage-stats-data.png"),
      fullPage: true,
    });

    await removeHighlights(page);
  });
});

test.describe("Feature Set 3: Permissions & Roles", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/user/login");
    await page.fill('input[name="name"]', "admin");
    await page.fill('input[name="pass"]', "admin");
    await page.click('input[type="submit"]');
    await page.waitForLoadState("networkidle");
  });

  test("3.1 - Permissions: Cloudinary Permissions Overview", async ({ page }) => {
    await page.goto("/admin/people/permissions");
    await page.waitForLoadState("networkidle");

    // Scroll to Cloudinary section
    const cloudinaryText = page.locator('text=Administer Cloudinary').first();
    if (await cloudinaryText.isVisible()) {
      await cloudinaryText.scrollIntoViewIfNeeded();
      await page.waitForTimeout(500);
    }

    // Highlight Cloudinary permissions section
    await page.screenshot({
      path: path.join(permissionsDir, "step-01-permissions-overview.png"),
      fullPage: true,
    });
  });

  test("3.2 - Permissions: Individual Permission Highlighting", async ({ page }) => {
    await page.goto("/admin/people/permissions");
    await page.waitForLoadState("networkidle");

    const permissions = [
      { name: "administer cloudinary", color: "red", step: "02" },
      { name: "browse cloudinary assets", color: "blue", step: "03" },
      { name: "manage cloudinary assets", color: "green", step: "04" },
      { name: "manage cloudinary folders", color: "orange", step: "05" },
      { name: "view cloudinary usage", color: "purple", step: "06" },
      { name: "use cloudinary ai features", color: "cyan", step: "07" },
      { name: "sync cloudinary media", color: "magenta", step: "08" },
      { name: "configure cloudinary", color: "red", step: "09" },
    ];

    for (const perm of permissions) {
      const permText = page.locator(`text=${perm.name}`).first();
      if (await permText.isVisible()) {
        await permText.scrollIntoViewIfNeeded();
        await page.waitForTimeout(300);
        
        // Highlight the permission row
        await page.evaluate(
          ({ name, col }) => {
            const elements = Array.from(document.querySelectorAll("*"));
            const permElement = elements.find(el => 
              el.textContent?.toLowerCase().includes(name.toLowerCase())
            );
            if (permElement) {
              const row = permElement.closest("tr") || permElement.closest(".form-item");
              if (row) {
                (row as HTMLElement).style.outline = `3px solid ${col}`;
                (row as HTMLElement).style.outlineOffset = "2px";
              }
            }
          },
          { name: perm.name, col: perm.color }
        );

        await page.screenshot({
          path: path.join(permissionsDir, `step-${perm.step}-permission-${perm.name.replace(/\s+/g, "-")}.png`),
          fullPage: true,
        });

        await removeHighlights(page);
      }
    }
  });

  test("3.3 - Roles: Cloudinary Roles Overview", async ({ page }) => {
    await page.goto("/admin/people/roles");
    await page.waitForLoadState("networkidle");

    // Highlight page title
    await highlightElement(page, "h1.page-title", "blue");
    await page.screenshot({
      path: path.join(permissionsDir, "step-10-roles-title.png"),
      fullPage: true,
    });

    await removeHighlights(page);

    // Highlight roles table
    await highlightElement(page, "table", "green");
    await page.screenshot({
      path: path.join(permissionsDir, "step-11-roles-table.png"),
      fullPage: true,
    });

    await removeHighlights(page);
  });

  test("3.4 - Roles: Individual Role Highlighting", async ({ page }) => {
    await page.goto("/admin/people/roles");
    await page.waitForLoadState("networkidle");

    const roles = [
      { name: "Cloudinary Administrator", color: "red", step: "12" },
      { name: "Cloudinary Editor", color: "blue", step: "13" },
      { name: "Cloudinary Viewer", color: "green", step: "14" },
    ];

    for (const role of roles) {
      const roleText = page.locator(`text=${role.name}`).first();
      if (await roleText.isVisible()) {
        await page.evaluate(
          ({ name, col }) => {
            const elements = Array.from(document.querySelectorAll("*"));
            const roleElement = elements.find(el => 
              el.textContent?.includes(name)
            );
            if (roleElement) {
              const row = roleElement.closest("tr");
              if (row) {
                (row as HTMLElement).style.outline = `3px solid ${col}`;
                (row as HTMLElement).style.outlineOffset = "2px";
              }
            }
          },
          { name: role.name, col: role.color }
        );

        await page.screenshot({
          path: path.join(permissionsDir, `step-${role.step}-role-${role.name.replace(/\s+/g, "-").toLowerCase()}.png`),
          fullPage: true,
        });

        await removeHighlights(page);
      }
    }
  });
});

test.describe("Complete Workflow: End-to-End Feature Tour", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/user/login");
    await page.fill('input[name="name"]', "admin");
    await page.fill('input[name="pass"]', "admin");
    await page.click('input[type="submit"]');
    await page.waitForLoadState("networkidle");
  });

  test("4.1 - Complete Workflow: Configuration to Usage", async ({ page }) => {
    // Step 1: Main settings
    await page.goto("/admin/config/media/cloudinary");
    await page.waitForLoadState("networkidle");
    await highlightElement(page, "h1.page-title", "blue");
    await page.screenshot({
      path: path.join(workflowDir, "workflow-01-main-settings.png"),
      fullPage: true,
    });
    await removeHighlights(page);

    // Step 2: AI settings
    await page.goto("/admin/config/media/cloudinary/ai");
    await page.waitForLoadState("networkidle");
    await highlightElement(page, "form", "green");
    await page.screenshot({
      path: path.join(workflowDir, "workflow-02-ai-configuration.png"),
      fullPage: true,
    });
    await removeHighlights(page);

    // Step 3: Asset browser
    await page.goto("/admin/content/cloudinary/assets");
    await page.waitForLoadState("networkidle");
    await highlightElement(page, ".view-content, .cloudinary-assets-grid", "orange");
    await page.screenshot({
      path: path.join(workflowDir, "workflow-03-browse-assets.png"),
      fullPage: true,
    });
    await removeHighlights(page);

    // Step 4: Folder management
    await page.goto("/admin/content/cloudinary/folders");
    await page.waitForLoadState("networkidle");
    await highlightElement(page, "table, .folder-list", "purple");
    await page.screenshot({
      path: path.join(workflowDir, "workflow-04-manage-folders.png"),
      fullPage: true,
    });
    await removeHighlights(page);

    // Step 5: Bulk operations
    await page.goto("/admin/content/cloudinary/bulk");
    await page.waitForLoadState("networkidle");
    await highlightElement(page, "form", "cyan");
    await page.screenshot({
      path: path.join(workflowDir, "workflow-05-bulk-operations.png"),
      fullPage: true,
    });
    await removeHighlights(page);

    // Step 6: Usage statistics
    await page.goto("/admin/content/cloudinary/usage");
    await page.waitForLoadState("networkidle");
    await highlightElement(page, ".usage-stats, table", "magenta");
    await page.screenshot({
      path: path.join(workflowDir, "workflow-06-view-usage.png"),
      fullPage: true,
    });
    await removeHighlights(page);

    // Step 7: Permissions
    await page.goto("/admin/people/permissions");
    await page.waitForLoadState("networkidle");
    const cloudinaryPerm = page.locator('text=Administer Cloudinary').first();
    if (await cloudinaryPerm.isVisible()) {
      await cloudinaryPerm.scrollIntoViewIfNeeded();
    }
    await page.screenshot({
      path: path.join(workflowDir, "workflow-07-configure-permissions.png"),
      fullPage: true,
    });

    // Step 8: Roles
    await page.goto("/admin/people/roles");
    await page.waitForLoadState("networkidle");
    await highlightElement(page, "table", "blue");
    await page.screenshot({
      path: path.join(workflowDir, "workflow-08-manage-roles.png"),
      fullPage: true,
    });
    await removeHighlights(page);
  });
});
