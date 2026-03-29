import { expect, test } from "@playwright/test";
import * as fs from "fs";
import * as path from "path";

// Landscape cropped screenshot directory (1600x900 fixed)
const baseDir = path.join(__dirname, "../../screenshots/release-blog");
const croppedDir = path.join(baseDir, "landscape-cropped");

// Ensure directory exists
if (!fs.existsSync(croppedDir)) {
  fs.mkdirSync(croppedDir, { recursive: true });
}

// Helper to add visual highlight
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

// Helper to take landscape-cropped screenshot (1600x900 fixed)
async function captureLandscapeCrop(page: any, filename: string, scrollToElement?: string) {
  // Scroll to element if specified
  if (scrollToElement) {
    const element = page.locator(scrollToElement).first();
    if (await element.count() > 0) {
      await element.scrollIntoViewIfNeeded();
      await page.waitForTimeout(300);
    }
  }

  // Take screenshot with fixed clip size (landscape 1600x900)
  await page.screenshot({
    path: path.join(croppedDir, filename),
    clip: {
      x: 0,
      y: 0,
      width: 1600,
      height: 900,
    },
  });
}

// Helper to capture specific element area in landscape format
async function captureElementLandscape(page: any, filename: string, selector: string) {
  const element = page.locator(selector).first();
  
  if (await element.count() > 0) {
    await element.scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    
    // Get element bounding box
    const box = await element.boundingBox();
    
    if (box) {
      // Center the element in a 1600x900 frame
      const centerX = box.x + (box.width / 2);
      const centerY = box.y + (box.height / 2);
      
      const clipX = Math.max(0, centerX - 800); // 1600/2 = 800
      const clipY = Math.max(0, centerY - 450); // 900/2 = 450
      
      await page.screenshot({
        path: path.join(croppedDir, filename),
        clip: {
          x: clipX,
          y: clipY,
          width: 1600,
          height: 900,
        },
      });
    }
  }
}

test.describe("Landscape Cropped Screenshots (1600x900)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/user/login");
    await page.fill('input[name="name"]', "admin");
    await page.fill('input[name="pass"]', "admin");
    await page.click('input[type="submit"]');
    await page.waitForLoadState("networkidle");
  });

  test("LC-01: Cloudinary Settings - Top Section", async ({ page }) => {
    await page.goto("/admin/config/media/cloudinary");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(500);

    // Capture top of page (title + form start)
    await captureLandscapeCrop(page, "01-settings-top-section.png");

    // Highlight and capture form area
    if (await page.locator("form").count() > 0) {
      await highlightElement(page, "form", "#10b981");
      await captureElementLandscape(page, "02-settings-form-highlighted.png", "form");
      await removeHighlights(page);
    }

    await expect(page.locator("h1, .page-title")).toBeVisible();
  });

  test("LC-02: Asset Browser - Main Interface", async ({ page }) => {
    await page.goto("/admin/content/cloudinary/assets");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(500);

    // Capture top section with title and filters
    await captureLandscapeCrop(page, "03-asset-browser-header.png");

    // Capture content area if it exists
    if (await page.locator(".view-content, main").count() > 0) {
      await highlightElement(page, ".view-content, main", "#f59e0b");
      await captureElementLandscape(page, "04-asset-browser-content.png", ".view-content, main");
      await removeHighlights(page);
    }

    // Capture search/filter area
    if (await page.locator("form, .views-exposed-form").count() > 0) {
      await highlightElement(page, "form, .views-exposed-form", "#10b981");
      await captureElementLandscape(page, "05-asset-browser-filters.png", "form, .views-exposed-form");
      await removeHighlights(page);
    }

    await expect(page.locator("h1, .page-title")).toBeVisible();
  });

  test("LC-03: Usage Statistics - Dashboard View", async ({ page }) => {
    await page.goto("/admin/content/cloudinary/usage");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(500);

    // Capture top section
    await captureLandscapeCrop(page, "06-usage-stats-header.png");

    // Capture stats area if exists
    if (await page.locator("table, .statistics, .usage-data").count() > 0) {
      await highlightElement(page, "table, .statistics, .usage-data", "#8b5cf6");
      await captureElementLandscape(page, "07-usage-stats-data.png", "table, .statistics, .usage-data");
      await removeHighlights(page);
    }

    await expect(page.locator("h1.page-title")).toBeVisible();
  });

  test("LC-04: Folder Manager - Interface View", async ({ page }) => {
    await page.goto("/admin/content/cloudinary/folders");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(500);

    // Capture top section
    await captureLandscapeCrop(page, "08-folder-manager-header.png");

    // Capture folder list
    if (await page.locator("table, .folder-list").count() > 0) {
      await highlightElement(page, "table, .folder-list", "#10b981");
      await captureElementLandscape(page, "09-folder-manager-list.png", "table, .folder-list");
      await removeHighlights(page);
    }

    // Capture create form if visible
    if (await page.locator("form").count() > 0) {
      await highlightElement(page, "form", "#f59e0b");
      await captureElementLandscape(page, "10-folder-manager-form.png", "form");
      await removeHighlights(page);
    }

    await expect(page.locator("h1, .page-title")).toBeVisible();
  });

  test("LC-05: Bulk Operations - Form View", async ({ page }) => {
    await page.goto("/admin/content/cloudinary/bulk");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(500);

    // Capture top section
    await captureLandscapeCrop(page, "11-bulk-ops-header.png");

    // Capture form
    if (await page.locator("form").count() > 0) {
      await highlightElement(page, "form", "#ec4899");
      await captureElementLandscape(page, "12-bulk-ops-form.png", "form");
      await removeHighlights(page);
    }

    await expect(page.locator("h1, .page-title")).toBeVisible();
  });

  test("LC-06: Admin Settings - Configuration View", async ({ page }) => {
    await page.goto("/admin/config/media/cloudinary/admin");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(500);

    // Capture top section
    await captureLandscapeCrop(page, "13-admin-settings-header.png");

    // Capture form
    if (await page.locator("form").count() > 0) {
      await highlightElement(page, "form", "#10b981");
      await captureElementLandscape(page, "14-admin-settings-form.png", "form");
      await removeHighlights(page);
    }

    await expect(page.locator("h1, .page-title")).toBeVisible();
  });

  test("LC-07: AI Settings - Configuration Sections", async ({ page }) => {
    await page.goto("/admin/config/media/cloudinary/ai");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(500);

    // Capture top section
    await captureLandscapeCrop(page, "15-ai-settings-header.png");

    // Capture form
    if (await page.locator("form").count() > 0) {
      await highlightElement(page, "form", "#8b5cf6");
      await captureElementLandscape(page, "16-ai-settings-form.png", "form");
      await removeHighlights(page);
    }

    // Try to capture specific AI sections if they exist
    const aiSections = [
      { selector: '[id*="auto-tag"], [id*="tagging"]', filename: "17-ai-auto-tagging.png", color: "#3b82f6" },
      { selector: '[id*="background"], [id*="removal"]', filename: "18-ai-background-removal.png", color: "#10b981" },
      { selector: '[id*="moderation"]', filename: "19-ai-moderation.png", color: "#ef4444" },
    ];

    for (const section of aiSections) {
      if (await page.locator(section.selector).count() > 0) {
        await highlightElement(page, section.selector, section.color);
        await captureElementLandscape(page, section.filename, section.selector);
        await removeHighlights(page);
      }
    }

    await expect(page.locator("h1, .page-title")).toBeVisible();
  });

  test("LC-08: Permissions - Cloudinary Section", async ({ page }) => {
    await page.goto("/admin/people/permissions");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(500);

    // Scroll to Cloudinary permissions
    const cloudinaryText = page.locator('text=Administer Cloudinary').first();
    if (await cloudinaryText.isVisible()) {
      await cloudinaryText.scrollIntoViewIfNeeded();
      await page.waitForTimeout(300);
    }

    // Capture the Cloudinary permissions section
    await captureLandscapeCrop(page, "20-permissions-cloudinary-section.png", "text=Administer Cloudinary");

    // Highlight and capture
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

    await captureLandscapeCrop(page, "21-permissions-cloudinary-highlighted.png", "text=Administer Cloudinary");
    await removeHighlights(page);

    await expect(page.locator("h1, .page-title")).toBeVisible();
  });

  test("LC-09: Roles - Management Interface", async ({ page }) => {
    await page.goto("/admin/people/roles");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(500);

    // Capture top section
    await captureLandscapeCrop(page, "22-roles-header.png");

    // Capture roles table
    if (await page.locator("table").count() > 0) {
      await highlightElement(page, "table", "#10b981");
      await captureElementLandscape(page, "23-roles-table.png", "table");
      await removeHighlights(page);
    }

    await expect(page.locator("h1, .page-title")).toBeVisible();
  });

  test("LC-10: Modules - Cloudinary Ecosystem", async ({ page }) => {
    await page.goto("/admin/modules");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(500);

    // Scroll to Cloudinary modules
    const cloudinaryModule = page.locator('text=Cloudinary').first();
    if (await cloudinaryModule.isVisible()) {
      await cloudinaryModule.scrollIntoViewIfNeeded();
      await page.waitForTimeout(300);
    }

    // Capture Cloudinary modules section
    await captureLandscapeCrop(page, "24-modules-cloudinary-section.png", "text=Cloudinary");

    // Highlight and capture
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

    await captureLandscapeCrop(page, "25-modules-cloudinary-highlighted.png", "text=Cloudinary");
    await removeHighlights(page);

    await expect(page.locator("h1, .page-title")).toBeVisible();
  });

  test("LC-11: Workflow Sequence - Key Screens", async ({ page }) => {
    // Capture a sequence of key screens in landscape format for workflow documentation
    
    const screens = [
      { url: "/admin/config/media/cloudinary", filename: "26-workflow-01-settings.png" },
      { url: "/admin/config/media/cloudinary/ai", filename: "27-workflow-02-ai-config.png" },
      { url: "/admin/content/cloudinary/assets", filename: "28-workflow-03-assets.png" },
      { url: "/admin/content/cloudinary/folders", filename: "29-workflow-04-folders.png" },
      { url: "/admin/content/cloudinary/bulk", filename: "30-workflow-05-bulk-ops.png" },
      { url: "/admin/content/cloudinary/usage", filename: "31-workflow-06-usage.png" },
    ];

    for (const screen of screens) {
      await page.goto(screen.url);
      await page.waitForLoadState("networkidle");
      await page.waitForTimeout(500);
      
      await captureLandscapeCrop(page, screen.filename);
    }

    await expect(page.locator("h1, .page-title")).toBeVisible();
  });
});
