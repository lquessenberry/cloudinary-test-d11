import { expect, test } from "@playwright/test";
import * as fs from "fs";
import * as path from "path";

// High-quality screenshot directory
const baseDir = path.join(__dirname, "../../screenshots/release-blog");
const advancedDir = path.join(baseDir, "advanced-features");
const configDir = path.join(advancedDir, "01-configuration");
const adminSettingsDir = path.join(advancedDir, "02-admin-settings");
const integrationDir = path.join(advancedDir, "03-integration");
const advancedWorkflowDir = path.join(advancedDir, "04-advanced-workflows");

// Ensure directories exist
[advancedDir, configDir, adminSettingsDir, integrationDir, advancedWorkflowDir].forEach(dir => {
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
        (element as HTMLElement).style.outline = `4px solid ${col}`;
        (element as HTMLElement).style.outlineOffset = "3px";
        (element as HTMLElement).style.boxShadow = `0 0 15px ${col}`;
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
      (el as HTMLElement).style.boxShadow = "";
    });
  });
}

// Helper to take high-quality screenshot
async function takeHighQualityScreenshot(page: any, filepath: string) {
  await page.screenshot({
    path: filepath,
    fullPage: true,
    quality: 100, // Maximum quality for JPEG (PNG is lossless)
  });
}

test.describe("Advanced Features: Configuration Deep Dive", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/user/login");
    await page.fill('input[name="name"]', "admin");
    await page.fill('input[name="pass"]', "admin");
    await page.click('input[type="submit"]');
    await page.waitForLoadState("networkidle");
  });

  test("1.1 - Main Configuration: Cloud Credentials", async ({ page }) => {
    await page.goto("/admin/config/media/cloudinary");
    await page.waitForLoadState("networkidle");

    // Highlight cloud name field
    const cloudNameField = 'input[name="cloud_name"]';
    if (await page.locator(cloudNameField).count() > 0) {
      await highlightElement(page, cloudNameField, "#2563eb");
      await takeHighQualityScreenshot(
        page,
        path.join(configDir, "step-01-cloud-name-field.png")
      );
      await removeHighlights(page);
    }

    // Highlight API key field
    const apiKeyField = 'input[name="api_key"]';
    if (await page.locator(apiKeyField).count() > 0) {
      await highlightElement(page, apiKeyField, "#16a34a");
      await takeHighQualityScreenshot(
        page,
        path.join(configDir, "step-02-api-key-field.png")
      );
      await removeHighlights(page);
    }

    // Highlight API secret field
    const apiSecretField = 'input[name="api_secret"]';
    if (await page.locator(apiSecretField).count() > 0) {
      await highlightElement(page, apiSecretField, "#dc2626");
      await takeHighQualityScreenshot(
        page,
        path.join(configDir, "step-03-api-secret-field.png")
      );
      await removeHighlights(page);
    }

    // Full form overview
    await highlightElement(page, "form", "#8b5cf6");
    await takeHighQualityScreenshot(
      page,
      path.join(configDir, "step-04-complete-form.png")
    );
    await removeHighlights(page);
  });

  test("1.2 - Main Configuration: Advanced Options", async ({ page }) => {
    await page.goto("/admin/config/media/cloudinary");
    await page.waitForLoadState("networkidle");

    // Look for advanced settings section
    const advancedSection = page.locator('details, .fieldset, [id*="advanced"]').first();
    if (await advancedSection.count() > 0) {
      await advancedSection.scrollIntoViewIfNeeded();
      
      // Expand if it's a details element
      if (await page.locator('details').count() > 0) {
        await page.locator('details').first().evaluate(el => {
          if (!(el as HTMLDetailsElement).open) {
            (el as HTMLDetailsElement).open = true;
          }
        });
        await page.waitForTimeout(300);
      }

      await highlightElement(page, 'details, .fieldset, [id*="advanced"]', "#f59e0b");
      await takeHighQualityScreenshot(
        page,
        path.join(configDir, "step-05-advanced-settings.png")
      );
      await removeHighlights(page);
    }

    // Full page overview
    await takeHighQualityScreenshot(
      page,
      path.join(configDir, "step-06-full-configuration-page.png")
    );
  });

  test("1.3 - Configuration: Save Actions", async ({ page }) => {
    await page.goto("/admin/config/media/cloudinary");
    await page.waitForLoadState("networkidle");

    // Highlight save button
    const saveButton = 'input[type="submit"], button[type="submit"]';
    if (await page.locator(saveButton).count() > 0) {
      await page.locator(saveButton).first().scrollIntoViewIfNeeded();
      await highlightElement(page, saveButton, "#10b981");
      await takeHighQualityScreenshot(
        page,
        path.join(configDir, "step-07-save-button.png")
      );
      await removeHighlights(page);
    }
  });
});

test.describe("Advanced Features: Admin Settings Deep Dive", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/user/login");
    await page.fill('input[name="name"]', "admin");
    await page.fill('input[name="pass"]', "admin");
    await page.click('input[type="submit"]');
    await page.waitForLoadState("networkidle");
  });

  test("2.1 - Admin Settings: Browser Preferences", async ({ page }) => {
    await page.goto("/admin/config/media/cloudinary/admin");
    await page.waitForLoadState("networkidle");

    // Highlight assets per page setting
    const assetsPerPage = 'input[name="assets_per_page"]';
    if (await page.locator(assetsPerPage).count() > 0) {
      await highlightElement(page, assetsPerPage, "#3b82f6");
      await takeHighQualityScreenshot(
        page,
        path.join(adminSettingsDir, "step-01-assets-per-page.png")
      );
      await removeHighlights(page);
    }

    // Highlight default resource type
    const resourceType = 'select[name="default_resource_type"]';
    if (await page.locator(resourceType).count() > 0) {
      await highlightElement(page, resourceType, "#8b5cf6");
      await takeHighQualityScreenshot(
        page,
        path.join(adminSettingsDir, "step-02-default-resource-type.png")
      );
      await removeHighlights(page);
    }

    // Full admin settings page
    await takeHighQualityScreenshot(
      page,
      path.join(adminSettingsDir, "step-03-full-admin-settings.png")
    );
  });

  test("2.2 - Admin Settings: Display Options", async ({ page }) => {
    await page.goto("/admin/config/media/cloudinary/admin");
    await page.waitForLoadState("networkidle");

    // Look for display/UI options
    const displayOptions = page.locator('[id*="display"], [id*="ui"], .form-item').first();
    if (await displayOptions.count() > 0) {
      await displayOptions.scrollIntoViewIfNeeded();
      await highlightElement(page, '[id*="display"], [id*="ui"], .form-item', "#ec4899");
      await takeHighQualityScreenshot(
        page,
        path.join(adminSettingsDir, "step-04-display-options.png")
      );
      await removeHighlights(page);
    }
  });

  test("2.3 - AI Settings: Complete Configuration", async ({ page }) => {
    await page.goto("/admin/config/media/cloudinary/ai");
    await page.waitForLoadState("networkidle");

    // Capture full AI settings page in sections
    await takeHighQualityScreenshot(
      page,
      path.join(adminSettingsDir, "step-05-ai-settings-full.png")
    );

    // Highlight each major section
    const sections = [
      { selector: '[id*="auto-tag"], [id*="tagging"]', color: "#3b82f6", name: "auto-tagging" },
      { selector: '[id*="background"], [id*="removal"]', color: "#10b981", name: "background-removal" },
      { selector: '[id*="moderation"]', color: "#ef4444", name: "moderation" },
      { selector: '[id*="ocr"]', color: "#f59e0b", name: "ocr" },
      { selector: '[id*="cache"], [id*="performance"]', color: "#8b5cf6", name: "performance" },
    ];

    for (const section of sections) {
      if (await page.locator(section.selector).count() > 0) {
        await page.locator(section.selector).first().scrollIntoViewIfNeeded();
        await page.waitForTimeout(300);
        await highlightElement(page, section.selector, section.color);
        await takeHighQualityScreenshot(
          page,
          path.join(adminSettingsDir, `step-06-ai-${section.name}-section.png`)
        );
        await removeHighlights(page);
      }
    }
  });
});

test.describe("Advanced Features: Integration Points", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/user/login");
    await page.fill('input[name="name"]', "admin");
    await page.fill('input[name="pass"]', "admin");
    await page.click('input[type="submit"]');
    await page.waitForLoadState("networkidle");
  });

  test("3.1 - Modules Integration: Cloudinary Ecosystem", async ({ page }) => {
    await page.goto("/admin/modules");
    await page.waitForLoadState("networkidle");

    // Search for Cloudinary in modules
    const searchBox = 'input[name="text"], input[type="search"]';
    if (await page.locator(searchBox).count() > 0) {
      await page.fill(searchBox, "cloudinary");
      await page.waitForTimeout(500);
    }

    // Scroll to Cloudinary modules
    const cloudinaryModule = page.locator('text=Cloudinary').first();
    if (await cloudinaryModule.isVisible()) {
      await cloudinaryModule.scrollIntoViewIfNeeded();
      await page.waitForTimeout(300);
    }

    await takeHighQualityScreenshot(
      page,
      path.join(integrationDir, "step-01-modules-overview.png")
    );

    // Highlight individual modules
    const modules = [
      "Cloudinary Admin",
      "Cloudinary SDK",
      "Cloudinary Stream Wrapper",
    ];

    for (let i = 0; i < modules.length; i++) {
      const moduleText = page.locator(`text=${modules[i]}`).first();
      if (await moduleText.isVisible()) {
        await moduleText.scrollIntoViewIfNeeded();
        
        // Highlight the module row
        await page.evaluate(
          ({ text, color }) => {
            const elements = Array.from(document.querySelectorAll("*"));
            const moduleElement = elements.find(el => 
              el.textContent?.includes(text)
            );
            if (moduleElement) {
              const row = moduleElement.closest("tr, .module-item, .form-item");
              if (row) {
                (row as HTMLElement).style.outline = `4px solid ${color}`;
                (row as HTMLElement).style.outlineOffset = "3px";
                (row as HTMLElement).style.boxShadow = `0 0 15px ${color}`;
              }
            }
          },
          { text: modules[i], color: ["#3b82f6", "#10b981", "#f59e0b"][i] }
        );

        await takeHighQualityScreenshot(
          page,
          path.join(integrationDir, `step-02-module-${i + 1}-${modules[i].toLowerCase().replace(/\s+/g, "-")}.png`)
        );

        await removeHighlights(page);
      }
    }
  });

  test("3.2 - Media Type Integration", async ({ page }) => {
    await page.goto("/admin/structure/media");
    await page.waitForLoadState("networkidle");

    await takeHighQualityScreenshot(
      page,
      path.join(integrationDir, "step-03-media-types-overview.png")
    );

    // Look for Cloudinary media type
    const cloudinaryMediaType = page.locator('text=Cloudinary').first();
    if (await cloudinaryMediaType.isVisible()) {
      await cloudinaryMediaType.scrollIntoViewIfNeeded();
      
      await page.evaluate(() => {
        const elements = Array.from(document.querySelectorAll("*"));
        const cloudinaryElement = elements.find(el => 
          el.textContent?.includes("Cloudinary")
        );
        if (cloudinaryElement) {
          const row = cloudinaryElement.closest("tr, .media-type-item");
          if (row) {
            (row as HTMLElement).style.outline = "4px solid #8b5cf6";
            (row as HTMLElement).style.outlineOffset = "3px";
            (row as HTMLElement).style.boxShadow = "0 0 15px #8b5cf6";
          }
        }
      });

      await takeHighQualityScreenshot(
        page,
        path.join(integrationDir, "step-04-cloudinary-media-type.png")
      );

      await removeHighlights(page);
    }
  });

  test("3.3 - Field Configuration", async ({ page }) => {
    // Check if Cloudinary media type exists and has fields
    await page.goto("/admin/structure/media");
    await page.waitForLoadState("networkidle");

    const manageFieldsLink = page.locator('a:has-text("Manage fields")').first();
    if (await manageFieldsLink.isVisible()) {
      await manageFieldsLink.click();
      await page.waitForLoadState("networkidle");

      await takeHighQualityScreenshot(
        page,
        path.join(integrationDir, "step-05-field-configuration.png")
      );
    }
  });
});

test.describe("Advanced Features: Complex Workflows", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/user/login");
    await page.fill('input[name="name"]', "admin");
    await page.fill('input[name="pass"]', "admin");
    await page.click('input[type="submit"]');
    await page.waitForLoadState("networkidle");
  });

  test("4.1 - Workflow: Asset Upload to Organization", async ({ page }) => {
    // Step 1: Asset Browser
    await page.goto("/admin/content/cloudinary/assets");
    await page.waitForLoadState("networkidle");
    
    await highlightElement(page, "h1.page-title", "#3b82f6");
    await takeHighQualityScreenshot(
      page,
      path.join(advancedWorkflowDir, "workflow-01-start-asset-browser.png")
    );
    await removeHighlights(page);

    // Step 2: Search Interface
    const searchForm = 'form.cloudinary-search-form';
    if (await page.locator(searchForm).count() > 0) {
      await highlightElement(page, searchForm, "#10b981");
      await takeHighQualityScreenshot(
        page,
        path.join(advancedWorkflowDir, "workflow-02-search-interface.png")
      );
      await removeHighlights(page);
    }

    // Step 3: Asset Grid
    await highlightElement(page, ".view-content, .cloudinary-assets-grid", "#f59e0b");
    await takeHighQualityScreenshot(
      page,
      path.join(advancedWorkflowDir, "workflow-03-asset-grid.png")
    );
    await removeHighlights(page);

    // Step 4: Navigate to folders
    await page.goto("/admin/content/cloudinary/folders");
    await page.waitForLoadState("networkidle");
    
    await highlightElement(page, "table, .folder-list", "#8b5cf6");
    await takeHighQualityScreenshot(
      page,
      path.join(advancedWorkflowDir, "workflow-04-folder-organization.png")
    );
    await removeHighlights(page);

    // Step 5: Bulk operations
    await page.goto("/admin/content/cloudinary/bulk");
    await page.waitForLoadState("networkidle");
    
    await highlightElement(page, "form", "#ec4899");
    await takeHighQualityScreenshot(
      page,
      path.join(advancedWorkflowDir, "workflow-05-bulk-operations.png")
    );
    await removeHighlights(page);
  });

  test("4.2 - Workflow: Permission Assignment to User Access", async ({ page }) => {
    // Step 1: Permissions page
    await page.goto("/admin/people/permissions");
    await page.waitForLoadState("networkidle");

    const cloudinaryPerm = page.locator('text=Administer Cloudinary').first();
    if (await cloudinaryPerm.isVisible()) {
      await cloudinaryPerm.scrollIntoViewIfNeeded();
    }

    await takeHighQualityScreenshot(
      page,
      path.join(advancedWorkflowDir, "workflow-06-permissions-setup.png")
    );

    // Step 2: Roles page
    await page.goto("/admin/people/roles");
    await page.waitForLoadState("networkidle");

    await highlightElement(page, "table", "#3b82f6");
    await takeHighQualityScreenshot(
      page,
      path.join(advancedWorkflowDir, "workflow-07-roles-configuration.png")
    );
    await removeHighlights(page);

    // Step 3: User management
    await page.goto("/admin/people");
    await page.waitForLoadState("networkidle");

    await takeHighQualityScreenshot(
      page,
      path.join(advancedWorkflowDir, "workflow-08-user-management.png")
    );
  });

  test("4.3 - Workflow: Configuration to Analytics", async ({ page }) => {
    // Complete configuration flow
    const steps = [
      { url: "/admin/config/media/cloudinary", name: "main-config", color: "#3b82f6" },
      { url: "/admin/config/media/cloudinary/admin", name: "admin-settings", color: "#10b981" },
      { url: "/admin/config/media/cloudinary/ai", name: "ai-config", color: "#f59e0b" },
      { url: "/admin/content/cloudinary/usage", name: "usage-analytics", color: "#8b5cf6" },
    ];

    for (let i = 0; i < steps.length; i++) {
      await page.goto(steps[i].url);
      await page.waitForLoadState("networkidle");

      await highlightElement(page, "h1.page-title, form, .usage-stats", steps[i].color);
      await takeHighQualityScreenshot(
        page,
        path.join(advancedWorkflowDir, `workflow-${9 + i}-${steps[i].name}.png`)
      );
      await removeHighlights(page);
    }
  });
});
