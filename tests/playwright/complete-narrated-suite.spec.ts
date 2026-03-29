import { test } from "@playwright/test";
import { execSync } from "child_process";
import * as fs from "fs";
import * as path from "path";

const baseDir = path.join(
  __dirname,
  "../../screenshots/release-blog/narrated-interactive",
);
const audioDir = path.join(baseDir, "audio");

const dirs = {
  overview: path.join(baseDir, "01-overview"),
  assetBrowser: path.join(baseDir, "02-asset-browser"),
  search: path.join(baseDir, "03-search-filter"),
  folders: path.join(baseDir, "04-folder-management"),
  bulkOps: path.join(baseDir, "05-bulk-operations"),
  aiFeatures: path.join(baseDir, "06-ai-features"),
  settings: path.join(baseDir, "07-settings-config"),
  adminSettings: path.join(baseDir, "08-admin-settings"),
  permissions: path.join(baseDir, "09-permissions-roles"),
  usage: path.join(baseDir, "10-usage-analytics"),
  workflows: path.join(baseDir, "11-complete-workflows"),
};

[baseDir, audioDir, ...Object.values(dirs)].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

const voiceModel = `${process.env.HOME}/.local/share/piper/voices/en_US-lessac-medium.onnx`;

async function generateAudio(text: string, outputPath: string): Promise<void> {
  try {
    const sanitized = text.replace(/"/g, '\\"').replace(/'/g, "\\'");
    const command = `echo "${sanitized}" | piper --model ${voiceModel} --output_file "${outputPath}" 2>/dev/null`;
    execSync(command, { stdio: "pipe" });
  } catch (error) {
    console.error(`Audio generation failed for ${path.basename(outputPath)}`);
  }
}

async function highlight(page: any, selector: string, color = "#3b82f6") {
  await page.evaluate(
    ({ sel, col }) => {
      document.querySelectorAll(sel).forEach((el: any) => {
        el.style.outline = `5px solid ${col}`;
        el.style.outlineOffset = "4px";
        el.style.boxShadow = `0 0 25px ${col}`;
      });
    },
    { sel: selector, col: color },
  );
}

async function clearHighlights(page: any) {
  await page.evaluate(() => {
    document.querySelectorAll("*").forEach((el: any) => {
      el.style.outline = "";
      el.style.outlineOffset = "";
      el.style.boxShadow = "";
    });
  });
}

async function capture(page: any, filepath: string, narration: string) {
  await page.screenshot({
    path: filepath,
    clip: { x: 0, y: 0, width: 1920, height: 1080 },
  });

  const audioPath = path.join(
    audioDir,
    path.basename(filepath).replace(".png", ".mp3"),
  );
  await generateAudio(narration, audioPath);
  console.log(`✓ ${path.basename(filepath)}`);
}

test.describe("01: Module Overview", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/user/login");
    await page.fill('input[name="name"]', "admin");
    await page.fill('input[name="pass"]', "admin");
    await page.click('input[type="submit"]');
    await page.waitForLoadState("networkidle");
  });

  test("Overview Steps", async ({ page }) => {
    // Start with Cloudinary main settings page
    await page.goto("/admin/config/media/cloudinary");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(500);

    await capture(
      page,
      path.join(dirs.overview, "step-01.png"),
      "Welcome to the Cloudinary Admin module for Drupal 11. This is the main configuration page where you set up your Cloudinary connection.",
    );

    await highlight(page, "h1", "#3b82f6");
    await highlight(page, "form", "#10b981");
    await capture(
      page,
      path.join(dirs.overview, "step-02.png"),
      "The Cloudinary Admin module provides a powerful interface for managing your cloud-based media assets directly from your Drupal site. Configure your API credentials here.",
    );
    await clearHighlights(page);
  });
});

test.describe("02: Asset Browser", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/user/login");
    await page.fill('input[name="name"]', "admin");
    await page.fill('input[name="pass"]', "admin");
    await page.click('input[type="submit"]');
    await page.waitForLoadState("networkidle");
  });

  test("Asset Browser Steps", async ({ page }) => {
    // Show navigation from config page
    await page.goto("/admin/config/media/cloudinary");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(500);

    await highlight(page, "nav.toolbar", "#3b82f6");
    await capture(
      page,
      path.join(dirs.assetBrowser, "step-01.png"),
      "From the Cloudinary settings, navigate to Content in the admin toolbar to access your assets.",
    );
    await clearHighlights(page);

    // Navigate to assets page
    await page.goto("/admin/content/cloudinary/assets");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1000);

    await capture(
      page,
      path.join(dirs.assetBrowser, "step-02.png"),
      "This is the main Asset Browser interface. Here you can view all your Cloudinary assets in a grid or list format.",
    );

    await highlight(page, "h1", "#3b82f6");
    await capture(
      page,
      path.join(dirs.assetBrowser, "step-03.png"),
      "The page title clearly indicates you're in the Cloudinary Assets section.",
    );
    await clearHighlights(page);

    if (
      (await page.locator(".view-content, .cloudinary-assets, table").count()) >
      0
    ) {
      await highlight(
        page,
        ".view-content, .cloudinary-assets, table",
        "#10b981",
      );
      await capture(
        page,
        path.join(dirs.assetBrowser, "step-05.png"),
        "The asset list displays your media files with metadata and action buttons for managing your Cloudinary library.",
      );
      await clearHighlights(page);
    }

    if ((await page.locator(".views-row, .asset-item").first().count()) > 0) {
      await highlight(page, ".views-row, .asset-item", "#ec4899");
      await capture(
        page,
        path.join(dirs.assetBrowser, "step-06.png"),
        "You can click on any asset to view its details, download it, or perform actions like delete or edit.",
      );
      await clearHighlights(page);
    }

    if ((await page.locator(".pager, nav.pagination").count()) > 0) {
      await highlight(page, ".pager, nav.pagination", "#8b5cf6");
      await capture(
        page,
        path.join(dirs.assetBrowser, "step-07.png"),
        "Pagination controls at the bottom let you navigate through large collections of assets.",
      );
      await clearHighlights(page);
    }
  });
});

test.describe("03: Search and Filter", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/user/login");
    await page.fill('input[name="name"]', "admin");
    await page.fill('input[name="pass"]', "admin");
    await page.click('input[type="submit"]');
    await page.waitForLoadState("networkidle");
  });

  test("Search Steps", async ({ page }) => {
    await page.goto("/admin/content/cloudinary/assets");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1000);

    // Highlight the entire filter/search area
    if (
      (await page
        .locator(
          'form.views-exposed-form, .view-filters, input[type="search"], input[name*="search"]',
        )
        .count()) > 0
    ) {
      await highlight(
        page,
        "form.views-exposed-form, .view-filters",
        "#f59e0b",
      );
      await capture(
        page,
        path.join(dirs.search, "step-01.png"),
        "The asset browser includes powerful search and filter tools. Use these controls to find specific assets by name, type, tags, or other criteria.",
      );
      await clearHighlights(page);
    }

    const searchInput = page
      .locator('input[type="search"], input[name*="search"]')
      .first();
    if ((await searchInput.count()) > 0) {
      await highlight(
        page,
        'input[type="search"], input[name*="search"]',
        "#10b981",
      );
      await capture(
        page,
        path.join(dirs.search, "step-02.png"),
        "Click in the search field to begin typing your query. You can search by filename, public ID, or tags.",
      );

      await searchInput.click();
      await capture(
        page,
        path.join(dirs.search, "step-03.png"),
        "As you type, the search field highlights to show it's active and ready for input.",
      );

      await searchInput.fill("sample");
      await capture(
        page,
        path.join(dirs.search, "step-04.png"),
        "Enter your search term. For this example, we're searching for sample assets.",
      );
      await clearHighlights(page);

      await capture(
        page,
        path.join(dirs.search, "step-05.png"),
        "Press Enter or click the Search button to execute your query.",
      );
    }

    if ((await page.locator("select").count()) > 0) {
      await highlight(page, "select", "#8b5cf6");
      await capture(
        page,
        path.join(dirs.search, "step-06.png"),
        "You can refine your search further using the filter dropdowns below the search field.",
      );
      await clearHighlights(page);
    }
  });
});

test.describe("04: Folder Management", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/user/login");
    await page.fill('input[name="name"]', "admin");
    await page.fill('input[name="pass"]', "admin");
    await page.click('input[type="submit"]');
    await page.waitForLoadState("networkidle");
  });

  test("Folder Steps", async ({ page }) => {
    await page.goto("/admin/content/cloudinary/folders");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(500);

    await capture(
      page,
      path.join(dirs.folders, "step-01.png"),
      "Folder management helps you organize your assets hierarchically. Navigate to Content, Cloudinary, Folders.",
    );

    await capture(
      page,
      path.join(dirs.folders, "step-02.png"),
      "This is the Folder Manager interface showing your existing folder structure.",
    );

    if ((await page.locator("table, .folder-list").count()) > 0) {
      await highlight(page, "table, .folder-list", "#10b981");
      await capture(
        page,
        path.join(dirs.folders, "step-03.png"),
        "The folder list displays all your Cloudinary folders with their full paths.",
      );
      await clearHighlights(page);
    }

    if ((await page.locator('a:has-text("Browse")').count()) > 0) {
      await highlight(page, 'a:has-text("Browse")', "#ec4899");
      await capture(
        page,
        path.join(dirs.folders, "step-04.png"),
        "Each folder has a Browse link that takes you to its contents in the Asset Browser.",
      );
      await clearHighlights(page);
    }

    if ((await page.locator("form").count()) > 0) {
      await highlight(page, "form", "#f59e0b");
      await capture(
        page,
        path.join(dirs.folders, "step-05.png"),
        "At the top of the page, you'll find the Create Folder form.",
      );
      await clearHighlights(page);
    }

    const folderInput = page
      .locator('input[name*="folder"], input[name*="name"]')
      .first();
    if ((await folderInput.count()) > 0) {
      await highlight(
        page,
        'input[name*="folder"], input[name*="name"]',
        "#10b981",
      );
      await capture(
        page,
        path.join(dirs.folders, "step-06.png"),
        "Click in the folder name field to begin entering your new folder name.",
      );

      await folderInput.click();
      await capture(
        page,
        path.join(dirs.folders, "step-07.png"),
        "The input field highlights when active, ready for you to type.",
      );

      await folderInput.fill("documentation-assets");
      await capture(
        page,
        path.join(dirs.folders, "step-08.png"),
        "Enter a descriptive folder name using lowercase letters, hyphens, or underscores.",
      );
      await clearHighlights(page);
    }

    if (
      (await page
        .locator('button[type="submit"], input[type="submit"]')
        .count()) > 0
    ) {
      await highlight(
        page,
        'button[type="submit"], input[type="submit"]',
        "#3b82f6",
      );
      await capture(
        page,
        path.join(dirs.folders, "step-09.png"),
        "The submit button is highlighted here. Click it to create your new folder.",
      );
      await clearHighlights(page);
    }
  });
});

test.describe("05: Bulk Operations", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/user/login");
    await page.fill('input[name="name"]', "admin");
    await page.fill('input[name="pass"]', "admin");
    await page.click('input[type="submit"]');
    await page.waitForLoadState("networkidle");
  });

  test("Bulk Operations Steps", async ({ page }) => {
    await page.goto("/admin/content/cloudinary/bulk");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(500);

    await capture(
      page,
      path.join(dirs.bulkOps, "step-01.png"),
      "Bulk operations allow you to perform actions on multiple assets at once. Navigate to Content, Cloudinary, Bulk Operations.",
    );

    await capture(
      page,
      path.join(dirs.bulkOps, "step-02.png"),
      "This is the Bulk Operations interface. Here you can execute batch actions efficiently.",
    );

    if ((await page.locator("form").count()) > 0) {
      await highlight(page, "form", "#ec4899");
      await capture(
        page,
        path.join(dirs.bulkOps, "step-03.png"),
        "The bulk operations form is the main control panel for batch processing.",
      );
      await clearHighlights(page);
    }

    if (
      (await page
        .locator('select[name*="operation"], select[name*="action"]')
        .count()) > 0
    ) {
      await highlight(
        page,
        'select[name*="operation"], select[name*="action"]',
        "#8b5cf6",
      );
      await capture(
        page,
        path.join(dirs.bulkOps, "step-04.png"),
        "First, select the type of operation you want to perform from the dropdown.",
      );
      await clearHighlights(page);
    }

    if ((await page.locator('input[type="text"], textarea').count()) > 0) {
      await highlight(page, 'input[type="text"], textarea', "#10b981");
      await capture(
        page,
        path.join(dirs.bulkOps, "step-05.png"),
        "These input fields let you specify details like tag names or target folder paths.",
      );
      await clearHighlights(page);
    }
  });
});

test.describe("06: AI Features", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/user/login");
    await page.fill('input[name="name"]', "admin");
    await page.fill('input[name="pass"]', "admin");
    await page.click('input[type="submit"]');
    await page.waitForLoadState("networkidle");
  });

  test("AI Features Steps", async ({ page }) => {
    await page.goto("/admin/config/media/cloudinary/ai");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(500);

    await capture(
      page,
      path.join(dirs.aiFeatures, "step-01.png"),
      "Cloudinary's AI features can automatically enhance and analyze your media. Navigate to Configuration, Media, Cloudinary, AI Settings.",
    );

    await capture(
      page,
      path.join(dirs.aiFeatures, "step-02.png"),
      "This is the AI Settings configuration page where you enable and configure AI-powered features.",
    );

    await highlight(page, "h1", "#3b82f6");
    await capture(
      page,
      path.join(dirs.aiFeatures, "step-03.png"),
      "The page title confirms you're in the AI Settings section.",
    );
    await clearHighlights(page);

    const checkboxes = await page.locator('input[type="checkbox"]').all();
    if (checkboxes.length > 0) {
      await highlight(page, 'input[type="checkbox"]', "#10b981");
      await capture(
        page,
        path.join(dirs.aiFeatures, "step-04.png"),
        "Auto-tagging is the first major AI feature. It automatically tags your images based on detected content.",
      );
      await clearHighlights(page);
    }

    if (
      (await page
        .locator('button[type="submit"], input[type="submit"]')
        .count()) > 0
    ) {
      await highlight(
        page,
        'button[type="submit"], input[type="submit"]',
        "#10b981",
      );
      await capture(
        page,
        path.join(dirs.aiFeatures, "step-05.png"),
        "After configuring all AI features, click the Save Configuration button.",
      );
      await clearHighlights(page);
    }
  });
});

test.describe("07: Settings Configuration", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/user/login");
    await page.fill('input[name="name"]', "admin");
    await page.fill('input[name="pass"]', "admin");
    await page.click('input[type="submit"]');
    await page.waitForLoadState("networkidle");
  });

  test("Settings Steps", async ({ page }) => {
    await page.goto("/admin/config/media/cloudinary");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(500);

    await capture(
      page,
      path.join(dirs.settings, "step-01.png"),
      "Let's configure the main Cloudinary connection settings. Navigate to Configuration, Media, Cloudinary.",
    );

    await capture(
      page,
      path.join(dirs.settings, "step-02.png"),
      "This is the main Cloudinary settings page where you configure your API credentials.",
    );

    if ((await page.locator("form").count()) > 0) {
      await highlight(page, "form", "#3b82f6");
      await capture(
        page,
        path.join(dirs.settings, "step-03.png"),
        "The configuration form is highlighted, showing all available settings.",
      );
      await clearHighlights(page);
    }

    if (
      (await page
        .locator('input[type="text"], input[type="password"]')
        .count()) > 0
    ) {
      await highlight(
        page,
        'input[type="text"], input[type="password"]',
        "#10b981",
      );
      await capture(
        page,
        path.join(dirs.settings, "step-04.png"),
        "Enter your Cloud Name, API Key, and API Secret. Keep your API Secret secure!",
      );
      await clearHighlights(page);
    }

    if (
      (await page
        .locator('button[type="submit"], input[type="submit"]')
        .count()) > 0
    ) {
      await highlight(
        page,
        'button[type="submit"], input[type="submit"]',
        "#10b981",
      );
      await capture(
        page,
        path.join(dirs.settings, "step-05.png"),
        "Click the Save Configuration button to apply your settings.",
      );
      await clearHighlights(page);
    }
  });
});

test.describe("08: Admin Settings", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/user/login");
    await page.fill('input[name="name"]', "admin");
    await page.fill('input[name="pass"]', "admin");
    await page.click('input[type="submit"]');
    await page.waitForLoadState("networkidle");
  });

  test("Admin Settings Steps", async ({ page }) => {
    await page.goto("/admin/config/media/cloudinary/admin");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(500);

    await capture(
      page,
      path.join(dirs.adminSettings, "step-01.png"),
      "The Admin Settings page lets you customize module behavior. Navigate to Configuration, Media, Cloudinary, Admin Settings.",
    );

    await capture(
      page,
      path.join(dirs.adminSettings, "step-02.png"),
      "This page contains preferences specific to the Cloudinary Admin module.",
    );

    if ((await page.locator("input, select, textarea").count()) > 0) {
      await highlight(page, "input, select, textarea", "#10b981");
      await capture(
        page,
        path.join(dirs.adminSettings, "step-03.png"),
        "Configure settings like assets per page, default view, and cache duration for optimal performance.",
      );
      await clearHighlights(page);
    }
  });
});

test.describe("09: Permissions and Roles", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/user/login");
    await page.fill('input[name="name"]', "admin");
    await page.fill('input[name="pass"]', "admin");
    await page.click('input[type="submit"]');
    await page.waitForLoadState("networkidle");
  });

  test("Permissions Steps", async ({ page }) => {
    await page.goto("/admin/people/permissions");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(500);

    await capture(
      page,
      path.join(dirs.permissions, "step-01.png"),
      "Proper permissions ensure secure access to Cloudinary features. Navigate to People, Permissions.",
    );

    await capture(
      page,
      path.join(dirs.permissions, "step-02.png"),
      "This is the main permissions page showing all available permissions.",
    );

    if ((await page.locator('input[type="checkbox"]').count()) > 0) {
      await highlight(page, 'input[type="checkbox"]', "#8b5cf6");
      await capture(
        page,
        path.join(dirs.permissions, "step-03.png"),
        "Scroll down to find the Cloudinary-specific permissions section and configure access for different roles.",
      );
      await clearHighlights(page);
    }

    await page.goto("/admin/people/roles");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(500);

    await capture(
      page,
      path.join(dirs.permissions, "step-04.png"),
      "Now let's look at roles. Navigate to People, Roles to manage user role assignments.",
    );
  });
});

test.describe("10: Usage Analytics", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/user/login");
    await page.fill('input[name="name"]', "admin");
    await page.fill('input[name="pass"]', "admin");
    await page.click('input[type="submit"]');
    await page.waitForLoadState("networkidle");
  });

  test("Usage Steps", async ({ page }) => {
    await page.goto("/admin/content/cloudinary/usage");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(500);

    await capture(
      page,
      path.join(dirs.usage, "step-01.png"),
      "Monitor your Cloudinary account usage to stay within plan limits. Navigate to Content, Cloudinary, Usage.",
    );

    await capture(
      page,
      path.join(dirs.usage, "step-02.png"),
      "This is the Usage Statistics dashboard showing your account metrics.",
    );

    if ((await page.locator("table, .statistics, .usage-data").count()) > 0) {
      await highlight(page, "table, .statistics, .usage-data", "#8b5cf6");
      await capture(
        page,
        path.join(dirs.usage, "step-03.png"),
        "The usage data table displays key metrics including storage, bandwidth, transformations, and API requests.",
      );
      await clearHighlights(page);
    }
  });
});

test.describe("11: Complete Workflows", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/user/login");
    await page.fill('input[name="name"]', "admin");
    await page.fill('input[name="pass"]', "admin");
    await page.click('input[type="submit"]');
    await page.waitForLoadState("networkidle");
  });

  test("Workflow Steps", async ({ page }) => {
    await page.goto("/admin/config/media/cloudinary");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(500);

    await capture(
      page,
      path.join(dirs.workflows, "step-01.png"),
      "Let's walk through a complete workflow from start to finish. First, configure your Cloudinary connection in the main settings.",
    );

    await page.goto("/admin/config/media/cloudinary/ai");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(500);

    await capture(
      page,
      path.join(dirs.workflows, "step-02.png"),
      "Next, set up AI features to automatically enhance your uploads.",
    );

    await page.goto("/admin/content/cloudinary/folders");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(500);

    await capture(
      page,
      path.join(dirs.workflows, "step-03.png"),
      "Create a folder structure to organize your assets.",
    );

    await page.goto("/admin/content/cloudinary/assets");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(500);

    await capture(
      page,
      path.join(dirs.workflows, "step-04.png"),
      "Navigate to the Asset Browser to view your media library.",
    );

    await page.goto("/admin/content/cloudinary/bulk");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(500);

    await capture(
      page,
      path.join(dirs.workflows, "step-05.png"),
      "Apply bulk operations to tag or organize multiple assets at once.",
    );

    await page.goto("/admin/content/cloudinary/usage");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(500);

    await capture(
      page,
      path.join(dirs.workflows, "step-06.png"),
      "Monitor usage statistics to track your account consumption. This completes the full Cloudinary Admin workflow. Thank you for following this complete interactive guide.",
    );
  });
});

console.log("\n🎬 Complete Narrated Interactive Test Suite");
console.log("📸 Screenshots: 1920x1080 Full HD");
console.log("🎙️  Audio: Piper TTS narration");
console.log("✨ Interactive highlights with color coding\n");
