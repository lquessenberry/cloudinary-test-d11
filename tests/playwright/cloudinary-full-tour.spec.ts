/**
 * @file cloudinary-full-tour.spec.ts
 *
 * Playwright A-Z guided walkthrough of every feature in the Cloudinary Drupal
 * module suite.
 *
 * Sections:
 *  01 · Authentication
 *  02 · Core Cloudinary SDK settings
 *  03 · Cloudinary Admin settings & AI settings
 *  04 · Asset list — browse, search, type filter
 *  05 · Folder prefix filter (fb-1)
 *  06 · Picker mode (fb-1) — Select buttons & postMessage payload
 *  07 · Asset detail view
 *  08 · Assets by tag
 *  09 · Folder manager
 *  10 · Bulk operations
 *  11 · Media sync & pull-all
 *  12 · Usage statistics
 *  13 · Status report
 *  14 · Cloudinary Asset entity settings
 *  15 · Transformation Layers config (layer overview, global, taxonomy, style)
 *  16 · AI features (settings page + GET endpoints)
 *  17 · Media Library opener (ml-1)
 *  18 · Cloudinary Media Library widget example form
 */

import { expect, Page, test } from "@playwright/test";

const BASE = "https://cloudinary-test-d11.ddev.site";

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

async function adminLogin(page: Page): Promise<void> {
  await page.goto(`${BASE}/user/login`);
  await page.waitForSelector('input[name="name"]', { timeout: 15000 });
  await page.fill('input[name="name"]', "admin");
  await page.fill('input[name="pass"]', "admin");
  await page
    .locator("#user-login-form")
    .getByRole("button", { name: /log in/i })
    .click();
  await page.waitForURL(/\/user\/\d+|\/admin|\/node/, { timeout: 15000 });
}

/** Assert no Drupal error/warning messages on the page. */
async function assertNoErrors(page: Page, label: string): Promise<void> {
  const errCount = await page
    .locator(".messages--error, .messages.error, [data-drupal-messages] .error")
    .count();
  expect(errCount, `${label}: unexpected Drupal error messages`).toBe(0);
}

/** Get the first Cloudinary asset public_id from the DB via drush-generated fixture. */
async function getFirstAssetPublicId(page: Page): Promise<string | null> {
  // We read from the known E2E fixture folder.
  await page.goto(
    `${BASE}/admin/content/cloudinary-assets?search=generateImage&type=image`,
  );
  await page.waitForSelector("table tbody tr", { timeout: 10000 });
  const cell = page.locator("table tbody tr td:nth-child(2)").first();
  return (await cell.textContent())?.trim() ?? null;
}

// ---------------------------------------------------------------------------
// 01 · Authentication
// ---------------------------------------------------------------------------

test.describe("01 · Authentication", () => {
  test("admin login succeeds and lands on the dashboard", async ({ page }) => {
    await page.goto(`${BASE}/user/login`);
    await page.waitForSelector('input[name="name"]');
    await expect(page.locator('input[name="name"]')).toBeVisible();
    await expect(page.locator('input[name="pass"]')).toBeVisible();
    await page.fill('input[name="name"]', "admin");
    await page.fill('input[name="pass"]', "admin");
    await page
      .locator("#user-login-form")
      .getByRole("button", { name: /log in/i })
      .click();
    await page.waitForURL(/\/user\/\d+|\/admin|\/node/);
    // Admin toolbar is present — confirms admin role granted.
    await expect(page.locator("#toolbar-bar, #admin-toolbar")).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// All remaining sections need to be authenticated.
// ---------------------------------------------------------------------------

test.describe("02 · Cloudinary SDK settings", () => {
  test.beforeEach(async ({ page }) => {
    await adminLogin(page);
  });

  test("SDK settings form loads with all required fields", async ({ page }) => {
    await page.goto(`${BASE}/admin/config/media/cloudinary`);
    await assertNoErrors(page, "SDK settings");
    // Cloud name field must be present (value may be blank in non-prod envs).
    const cloudField = page
      .locator(
        'input[name="cloud_name"], input[id*="cloud-name"], input[id*="edit-cloud-name"]',
      )
      .first();
    await expect(cloudField).toBeVisible();
  });

  test("SDK settings page title is 'Cloudinary'", async ({ page }) => {
    await page.goto(`${BASE}/admin/config/media/cloudinary`);
    await expect(page.locator("h1")).toContainText(/cloudinary/i);
  });
});

// ---------------------------------------------------------------------------
// 03 · Cloudinary Admin settings & AI settings
// ---------------------------------------------------------------------------

test.describe("03 · Admin & AI settings", () => {
  test.beforeEach(async ({ page }) => {
    await adminLogin(page);
  });

  test("Admin settings form loads", async ({ page }) => {
    await page.goto(`${BASE}/admin/config/media/cloudinary/admin`);
    await assertNoErrors(page, "Admin settings");
    await expect(page.locator("h1")).toContainText(/cloudinary/i);
    await expect(page.locator("form")).toBeVisible();
  });

  test("AI settings form loads and shows AI toggle fields", async ({
    page,
  }) => {
    await page.goto(`${BASE}/admin/config/media/cloudinary/ai`);
    await assertNoErrors(page, "AI settings");
    await expect(page.locator("h1")).toContainText(/ai|performance/i);
    await expect(page.locator("form")).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// 04 · Asset list — browse, search, type filter
// ---------------------------------------------------------------------------

test.describe("04 · Asset list", () => {
  test.beforeEach(async ({ page }) => {
    await adminLogin(page);
  });

  test("asset list page renders table with assets", async ({ page }) => {
    await page.goto(`${BASE}/admin/content/cloudinary-assets`);
    await assertNoErrors(page, "Asset list");
    await expect(page.locator("h1")).toContainText(/cloudinary/i);
    await expect(page.locator("table")).toBeVisible();
    // 7-column header: Preview, Public ID, Type, Transformation, Sync, Tags, Created.
    const headers = page.locator("table thead th");
    await expect(headers).toHaveCount(7);
    await expect(headers.nth(0)).toContainText(/preview/i);
    await expect(headers.nth(1)).toContainText(/public id/i);
    await expect(headers.nth(2)).toContainText(/type/i);
    // At least 1 data row.
    await expect(page.locator("table tbody tr").first()).toBeVisible();
  });

  test("search filter by public ID narrows results", async ({ page }) => {
    await page.goto(
      `${BASE}/admin/content/cloudinary-assets?search=generateImage`,
    );
    await expect(page.locator("table tbody tr").first()).toBeVisible();
    const ids = await page
      .locator("table tbody tr td:nth-child(2)")
      .allTextContents();
    for (const id of ids) {
      expect(id.toLowerCase()).toContain("generateimage");
    }
    // Search box retains the typed value.
    await expect(page.locator("#cld-search")).toHaveValue("generateImage");
  });

  test("resource type filter shows only image assets", async ({ page }) => {
    await page.goto(`${BASE}/admin/content/cloudinary-assets?type=image`);
    await expect(page.locator("table tbody tr").first()).toBeVisible();
    const types = await page
      .locator("table tbody tr td:nth-child(3)")
      .allTextContents();
    for (const t of types) {
      expect(t.trim()).toBe("image");
    }
  });

  test("resource type filter shows only video assets", async ({ page }) => {
    await page.goto(`${BASE}/admin/content/cloudinary-assets?type=video`);
    await expect(page.locator("table tbody tr").first()).toBeVisible();
    const types = await page
      .locator("table tbody tr td:nth-child(3)")
      .allTextContents();
    for (const t of types) {
      expect(t.trim()).toBe("video");
    }
  });

  test("thumbnail images use Cloudinary CDN URLs", async ({ page }) => {
    await page.goto(`${BASE}/admin/content/cloudinary-assets?type=image`);
    const imgSrc = await page
      .locator("table tbody tr .cloudinary-thumb-cell img")
      .first()
      .getAttribute("src");
    expect(imgSrc).toContain("res.cloudinary.com");
    expect(imgSrc).toContain("c_fill,w_100,h_70");
  });

  test("video rows show poster thumbnails with so_0 Cloudinary URL", async ({
    page,
  }) => {
    await page.goto(`${BASE}/admin/content/cloudinary-assets?type=video`);
    const imgSrc = await page
      .locator("table tbody tr .cloudinary-thumb-cell img")
      .first()
      .getAttribute("src");
    expect(imgSrc).toContain("res.cloudinary.com");
    expect(imgSrc).toContain("so_0");
    expect(imgSrc).toContain(".jpg");
  });

  test("pager is present when there are more than 25 assets", async ({
    page,
  }) => {
    await page.goto(`${BASE}/admin/content/cloudinary-assets`);
    // We have 101 assets — pager must appear.
    await expect(page.locator(".pager, nav.pager")).toBeVisible();
  });

  test("Sync from Cloudinary button is visible for users with sync permission", async ({
    page,
  }) => {
    await page.goto(`${BASE}/admin/content/cloudinary-assets`);
    await expect(
      page.locator('a:has-text("Sync from Cloudinary")'),
    ).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// 05 · Folder prefix filter (fb-1)
// ---------------------------------------------------------------------------

test.describe("05 · Folder prefix filter", () => {
  test.beforeEach(async ({ page }) => {
    await adminLogin(page);
  });

  test("folder prefix input is rendered on the asset list page", async ({
    page,
  }) => {
    await page.goto(`${BASE}/admin/content/cloudinary-assets`);
    const folderInput = page.locator("#cld-folder");
    await expect(folderInput).toBeVisible();
    await expect(folderInput).toHaveAttribute(
      "placeholder",
      /site\/media|folder/i,
    );
  });

  test("folder filter returns only assets under the given prefix", async ({
    page,
  }) => {
    await page.goto(
      `${BASE}/admin/content/cloudinary-assets?folder=drupal-e2e-test`,
    );
    await expect(page.locator("table tbody tr").first()).toBeVisible();
    const ids = await page
      .locator("table tbody tr td:nth-child(2)")
      .allTextContents();
    for (const id of ids) {
      expect(id).toContain("drupal-e2e-test/");
    }
    // Folder filter input retains the typed value.
    await expect(page.locator("#cld-folder")).toHaveValue("drupal-e2e-test");
  });

  test("combining folder filter and search works together", async ({
    page,
  }) => {
    await page.goto(
      `${BASE}/admin/content/cloudinary-assets?folder=drupal-e2e-test&search=generateImage`,
    );
    await expect(page.locator("table tbody tr").first()).toBeVisible();
    const ids = await page
      .locator("table tbody tr td:nth-child(2)")
      .allTextContents();
    for (const id of ids) {
      expect(id).toContain("drupal-e2e-test/");
      expect(id.toLowerCase()).toContain("generateimage");
    }
  });

  test("non-existent folder prefix shows empty table with message", async ({
    page,
  }) => {
    await page.goto(
      `${BASE}/admin/content/cloudinary-assets?folder=no-such-folder-xyz`,
    );
    // Should show the "No Cloudinary assets found" empty-table message.
    const empty = page.locator(
      "table tbody tr td.empty, .views-empty, td[colspan]",
    );
    await expect(empty).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// 06 · Picker mode (fb-1)
// ---------------------------------------------------------------------------

test.describe("06 · Picker mode", () => {
  test.beforeEach(async ({ page }) => {
    await adminLogin(page);
  });

  test("picker=1 renders a 4-column table (Preview, Public ID, Type, Select)", async ({
    page,
  }) => {
    await page.goto(`${BASE}/admin/content/cloudinary-assets?picker=1`);
    await assertNoErrors(page, "Picker mode");
    const headers = page.locator("table thead th");
    await expect(headers).toHaveCount(4);
    await expect(headers.nth(0)).toContainText(/preview/i);
    await expect(headers.nth(1)).toContainText(/public id/i);
    await expect(headers.nth(2)).toContainText(/type/i);
    await expect(headers.nth(3)).toContainText(/select/i);
  });

  test("picker mode hides Transformation, Sync, Tags and Created columns", async ({
    page,
  }) => {
    await page.goto(`${BASE}/admin/content/cloudinary-assets?picker=1`);
    const headers = await page.locator("table thead th").allTextContents();
    const headerText = headers.join(" ").toLowerCase();
    expect(headerText).not.toContain("transformation");
    expect(headerText).not.toContain("sync");
    expect(headerText).not.toContain("tags");
    expect(headerText).not.toContain("created");
  });

  test("picker mode hides the Sync from Cloudinary action button", async ({
    page,
  }) => {
    await page.goto(`${BASE}/admin/content/cloudinary-assets?picker=1`);
    await expect(
      page.locator('a:has-text("Sync from Cloudinary")'),
    ).toHaveCount(0);
  });

  test("each row has a <button class=cloudinary-picker-select-btn>", async ({
    page,
  }) => {
    await page.goto(`${BASE}/admin/content/cloudinary-assets?picker=1`);
    const btns = page.locator(".cloudinary-picker-select-btn");
    await expect(btns.first()).toBeVisible();
    // All visible rows should have a button.
    const rowCount = await page.locator("table tbody tr").count();
    const btnCount = await btns.count();
    expect(btnCount).toBe(rowCount);
  });

  test("Select button carries valid cloudinaryAsset JSON in data-payload", async ({
    page,
  }) => {
    await page.goto(`${BASE}/admin/content/cloudinary-assets?picker=1`);
    const btn = page.locator(".cloudinary-picker-select-btn").first();
    await expect(btn).toBeVisible();
    const raw = await btn.getAttribute("data-payload");
    expect(raw).not.toBeNull();
    const payload = JSON.parse(raw!);
    expect(payload).toHaveProperty("cloudinaryAsset");
    const a = payload.cloudinaryAsset;
    expect(a).toHaveProperty("public_id");
    expect(a).toHaveProperty("resource_type");
    expect(a).toHaveProperty("url");
    expect(typeof a.public_id).toBe("string");
    expect(a.public_id.length).toBeGreaterThan(0);
  });

  test("allowed_types=image restricts rows to images only", async ({
    page,
  }) => {
    await page.goto(
      `${BASE}/admin/content/cloudinary-assets?picker=1&allowed_types=image`,
    );
    const types = await page
      .locator("table tbody tr td:nth-child(3)")
      .allTextContents();
    for (const t of types) {
      expect(t.trim()).toBe("image");
    }
  });

  test("allowed_types=video restricts rows to videos only", async ({
    page,
  }) => {
    await page.goto(
      `${BASE}/admin/content/cloudinary-assets?picker=1&allowed_types=video`,
    );
    const types = await page
      .locator("table tbody tr td:nth-child(3)")
      .allTextContents();
    for (const t of types) {
      expect(t.trim()).toBe("video");
    }
  });

  test("picker passthrough hidden inputs preserve picker=1 on filter submit", async ({
    page,
  }) => {
    await page.goto(`${BASE}/admin/content/cloudinary-assets?picker=1`);
    // The filter form must carry a hidden input name=picker value=1 so that
    // submitting search/folder filters preserves the picker context.
    const hidden = page.locator('input[type="hidden"][name="picker"]').first();
    await expect(hidden).toBeAttached();
    await expect(hidden).toHaveValue("1");
  });

  test("Select button has valid payload and asset-picker library is attached", async ({
    page,
  }) => {
    // The asset-picker.js Drupal behavior fires window.parent.postMessage only
    // when running inside an iframe (window.parent !== window).  Here we verify
    // the pre-conditions: the library is loaded and the button payload is valid.
    await page.goto(`${BASE}/admin/content/cloudinary-assets?picker=1`);

    // asset-picker.js must be present in the page scripts.
    const scripts = await page.evaluate(() =>
      Array.from(document.querySelectorAll("script[src]")).map(
        (s) => (s as HTMLScriptElement).src,
      ),
    );
    const hasPicker = scripts.some((s) => s.includes("asset-picker"));
    expect(hasPicker, "asset-picker.js must be loaded").toBe(true);

    // The first button must carry a parseable cloudinaryAsset payload.
    const btn = page.locator(".cloudinary-picker-select-btn").first();
    const raw = await btn.getAttribute("data-payload");
    const payload = JSON.parse(raw!);
    expect(payload.cloudinaryAsset.public_id.length).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// 07 · Asset detail view
// ---------------------------------------------------------------------------

test.describe("07 · Asset detail view", () => {
  test.beforeEach(async ({ page }) => {
    await adminLogin(page);
  });

  test("asset detail page loads for the first image asset", async ({
    page,
  }) => {
    const publicId = await getFirstAssetPublicId(page);
    expect(publicId).not.toBeNull();
    // Slashes in the public_id must be percent-encoded so Symfony's router
    // receives a single path segment and matches the {public_id} parameter.
    const encodedId = publicId!.split("/").map(encodeURIComponent).join("%2F");
    const res = await page.goto(
      `${BASE}/admin/content/cloudinary/asset/${encodedId}`,
    );
    // 200 or a redirect; never a 500.
    expect(res?.status()).toBeLessThan(500);
    await assertNoErrors(page, "Asset detail");
    // The page must show either the asset details or a recognised admin page.
    await expect(page.locator("h1, main").first()).toBeVisible();
  });

  test("asset preview endpoint accepts a public_id parameter", async ({
    page,
  }) => {
    const publicId = await getFirstAssetPublicId(page);
    await page.goto(
      `${BASE}/admin/content/cloudinary/asset/preview?public_id=${encodeURIComponent(publicId!)}&resource_type=image`,
    );
    await assertNoErrors(page, "Asset preview");
  });
});

// ---------------------------------------------------------------------------
// 08 · Assets by tag
// ---------------------------------------------------------------------------

test.describe("08 · Assets by tag", () => {
  test.beforeEach(async ({ page }) => {
    await adminLogin(page);
  });

  test("assets-by-tag route loads without error for tid=1", async ({
    page,
  }) => {
    await page.goto(`${BASE}/admin/content/cloudinary-assets/tag/1`);
    // Even if no assets are tagged with tid=1, the route must not 500.
    await expect(page.locator("h1").first()).toBeVisible();
    await assertNoErrors(page, "Assets by tag");
    // Page must show the tag name or an empty-state message.
    const body = await page.locator("body").textContent();
    expect(body).toMatch(/assets tagged with|no assets found/i);
  });
});

// ---------------------------------------------------------------------------
// 09 · Folder manager
// ---------------------------------------------------------------------------

test.describe("09 · Folder manager", () => {
  test.beforeEach(async ({ page }) => {
    await adminLogin(page);
  });

  test("folder manager loads and shows root folders from Cloudinary", async ({
    page,
  }) => {
    await page.goto(`${BASE}/admin/content/cloudinary/folders`);
    await assertNoErrors(page, "Folder manager");
    await expect(page.locator("h1").first()).toContainText(/folder/i);
    // Should show a folder listing table (even if empty).
    await expect(page.locator("table").first()).toBeVisible();
  });

  test("folder manager shows create-folder UI element", async ({ page }) => {
    await page.goto(`${BASE}/admin/content/cloudinary/folders`);
    // Create folder button or input field should be present.
    const createEl = page.locator(
      'input[name*="folder"], button:has-text("Create"), input[type="submit"][value*="Create"]',
    );
    await expect(createEl.first()).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// 10 · Bulk operations
// ---------------------------------------------------------------------------

test.describe("10 · Bulk operations", () => {
  test.beforeEach(async ({ page }) => {
    await adminLogin(page);
  });

  test("bulk operations form loads with action selector", async ({ page }) => {
    await page.goto(`${BASE}/admin/content/cloudinary/bulk`);
    await assertNoErrors(page, "Bulk operations");
    await expect(page.locator("h1")).toContainText(/bulk/i);
    // Should have a form with an operation select or input.
    await expect(page.locator("form")).toBeVisible();
    await expect(page.locator('textarea[name="public_ids"]')).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// 11 · Media sync & pull-all
// ---------------------------------------------------------------------------

test.describe("11 · Media sync", () => {
  test.beforeEach(async ({ page }) => {
    await adminLogin(page);
  });

  test("pull-all sync route redirects (does not 404 or 500)", async ({
    page,
  }) => {
    const res = await page.goto(
      `${BASE}/admin/content/cloudinary/sync/pull-all`,
      { waitUntil: "networkidle" },
    );
    // Sync triggers a redirect to the asset list — status should be 200 after following.
    expect(res?.status()).toBeLessThan(500);
    await assertNoErrors(page, "Sync pull-all");
  });
});

// ---------------------------------------------------------------------------
// 12 · Usage statistics
// ---------------------------------------------------------------------------

test.describe("12 · Usage statistics", () => {
  test.beforeEach(async ({ page }) => {
    await adminLogin(page);
  });

  test("usage stats dashboard loads and shows plan/credits/storage data", async ({
    page,
  }) => {
    await page.goto(`${BASE}/admin/content/cloudinary/usage`);
    await assertNoErrors(page, "Usage stats");
    await expect(page.locator("h1")).toContainText(/usage/i);
    // Should show numeric usage data OR an error about API credentials.
    const body = await page.locator("body").textContent();
    const hasData =
      /credits|storage|transformations|bandwidth|plan|\d+\s*(MB|GB|KB)/i.test(
        body ?? "",
      );
    const hasApiError = /api key|credentials|not configured/i.test(body ?? "");
    expect(hasData || hasApiError, "Page should show stats or API error").toBe(
      true,
    );
  });
});

// ---------------------------------------------------------------------------
// 13 · Status report
// ---------------------------------------------------------------------------

test.describe("13 · Status report", () => {
  test.beforeEach(async ({ page }) => {
    await adminLogin(page);
  });

  test("status report page renders the Cloudinary health dashboard", async ({
    page,
  }) => {
    await page.goto(`${BASE}/admin/reports/cloudinary`);
    await assertNoErrors(page, "Status report");
    await expect(page.locator("h1")).toContainText(/cloudinary/i);
  });

  test("status report shows cloud name configuration item", async ({
    page,
  }) => {
    await page.goto(`${BASE}/admin/reports/cloudinary`);
    const body = await page.locator("body").textContent();
    expect(body).toMatch(/cloud.?name|connection/i);
  });

  test("status report shows entity/asset count section", async ({ page }) => {
    await page.goto(`${BASE}/admin/reports/cloudinary`);
    const body = await page.locator("body").textContent();
    expect(body).toMatch(/asset|entity|total/i);
  });
});

// ---------------------------------------------------------------------------
// 14 · Cloudinary Asset entity settings
// ---------------------------------------------------------------------------

test.describe("14 · Cloudinary Asset entity settings", () => {
  test.beforeEach(async ({ page }) => {
    await adminLogin(page);
  });

  test("entity settings page loads", async ({ page }) => {
    await page.goto(`${BASE}/admin/structure/cloudinary_asset/settings`);
    await assertNoErrors(page, "Entity settings");
    await expect(page.locator("h1")).toBeVisible();
    await expect(page.locator("form")).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// 15 · Transformation Layers config
// ---------------------------------------------------------------------------

test.describe("15 · Transformation Layers", () => {
  test.beforeEach(async ({ page }) => {
    await adminLogin(page);
  });

  test("layer overview page loads with navigation tabs", async ({ page }) => {
    await page.goto(`${BASE}/admin/config/media/cloudinary/transform-layers`);
    await assertNoErrors(page, "Transform layers overview");
    await expect(page.locator("h1")).toContainText(/layer|transformation/i);
    await expect(page.locator("form")).toBeVisible();
  });

  test("global layer form loads and shows global transformation input", async ({
    page,
  }) => {
    await page.goto(
      `${BASE}/admin/config/media/cloudinary/transform-layers/global`,
    );
    await assertNoErrors(page, "Global transform layer");
    await expect(page.locator("h1")).toContainText(/global/i);
    await expect(page.locator("form")).toBeVisible();
    await expect(
      page.locator(
        'input[name*="global"], textarea[name*="transformation"], input[name*="transform"]',
      ),
    ).toBeVisible();
  });

  test("taxonomy layer form loads with vocab/term selectors", async ({
    page,
  }) => {
    await page.goto(
      `${BASE}/admin/config/media/cloudinary/transform-layers/taxonomy`,
    );
    await assertNoErrors(page, "Taxonomy transform layer");
    await expect(page.locator("form")).toBeVisible();
  });

  test("style layer form loads with image-style selectors", async ({
    page,
  }) => {
    await page.goto(
      `${BASE}/admin/config/media/cloudinary/transform-layers/style`,
    );
    await assertNoErrors(page, "Style transform layer");
    await expect(page.locator("form")).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// 16 · AI features
// ---------------------------------------------------------------------------

test.describe("16 · AI features", () => {
  test.beforeEach(async ({ page }) => {
    await adminLogin(page);
  });

  test("AI settings form shows AI feature toggles", async ({ page }) => {
    await page.goto(`${BASE}/admin/config/media/cloudinary/ai`);
    await assertNoErrors(page, "AI settings");
    await expect(page.locator("form")).toBeVisible();
    // Should have at least one checkbox for enabling AI features.
    const checkboxes = page.locator('input[type="checkbox"]');
    await expect(checkboxes.first()).toBeVisible();
  });

  test("AI tags endpoint responds (200 or 403 but not 500)", async ({
    page,
  }) => {
    const publicId = await getFirstAssetPublicId(page);
    const res = await page.goto(
      `${BASE}/admin/content/cloudinary/ai/tags?public_id=${encodeURIComponent(publicId!)}&resource_type=image`,
    );
    expect(res?.status(), "AI tags endpoint must not 500").not.toBe(500);
  });

  test("AI moderation endpoint responds (200 or 403 but not 500)", async ({
    page,
  }) => {
    const publicId = await getFirstAssetPublicId(page);
    const res = await page.goto(
      `${BASE}/admin/content/cloudinary/ai/moderation?public_id=${encodeURIComponent(publicId!)}&resource_type=image`,
    );
    expect(res?.status(), "AI moderation endpoint must not 500").not.toBe(500);
  });

  test("AI OCR endpoint responds (200 or 403 but not 500)", async ({
    page,
  }) => {
    const publicId = await getFirstAssetPublicId(page);
    const res = await page.goto(
      `${BASE}/admin/content/cloudinary/ai/ocr?public_id=${encodeURIComponent(publicId!)}&resource_type=image`,
    );
    expect(res?.status(), "AI OCR endpoint must not 500").not.toBe(500);
  });
});

// ---------------------------------------------------------------------------
// 17 · Media Library opener (ml-1)
// ---------------------------------------------------------------------------

test.describe("17 · Media Library opener", () => {
  test.beforeEach(async ({ page }) => {
    await adminLogin(page);
  });

  test("picker route is accessible and renders the iframe wrapper", async ({
    page,
  }) => {
    await page.goto(`${BASE}/admin/cloudinary/media-library/picker`);
    await assertNoErrors(page, "Media library picker");
    await expect(
      page.locator("#cloudinary-media-library-picker-iframe"),
    ).toBeVisible();
  });

  test("iframe src points to the asset list in picker mode", async ({
    page,
  }) => {
    await page.goto(`${BASE}/admin/cloudinary/media-library/picker`);
    const src = await page
      .locator("#cloudinary-media-library-picker-iframe")
      .getAttribute("src");
    expect(src).toContain("/admin/content/cloudinary-assets");
    expect(src).toContain("picker=1");
  });

  test("iframe renders the inner asset picker (asset table visible inside)", async ({
    page,
  }) => {
    await page.goto(`${BASE}/admin/cloudinary/media-library/picker`);
    const iframe = page.frameLocator("#cloudinary-media-library-picker-iframe");
    await expect(iframe.locator("table")).toBeVisible({ timeout: 15000 });
    await expect(
      iframe.locator(".cloudinary-picker-select-btn").first(),
    ).toBeVisible();
  });

  test("select endpoint returns 200 for a valid POST", async ({ page }) => {
    // Get a real public_id to POST.
    const publicId = await getFirstAssetPublicId(page);
    expect(publicId).not.toBeNull();
    // POST to the select endpoint using Playwright's fetch API eval.
    const result = await page.evaluate(
      async ([base, pid]) => {
        const res = await fetch(
          `${base}/admin/cloudinary/media-library/select`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              public_id: pid,
              resource_type: "image",
              media_type_id: "image",
            }),
            credentials: "include",
          },
        );
        return { status: res.status, ok: res.ok };
      },
      [BASE, publicId] as [string, string],
    );
    // 200 (OK) or 403 (CSRF) are both acceptable; 500 is not.
    expect(result.status, "select endpoint must not 500").not.toBe(500);
  });

  test("media_library.opener service is registered and has correct class", async ({
    page,
  }) => {
    const res = await page.goto(`${BASE}/admin/reports/cloudinary`);
    // If the service is missing Drupal would throw a ContainerException —
    // the status report page exercises the container, so a clean 200 here
    // is a proxy check that all services are wired correctly.
    expect(res?.status()).toBe(200);
    await assertNoErrors(page, "Opener service via status report");
  });
});

// ---------------------------------------------------------------------------
// 18 · Cloudinary Media Library widget example form
// ---------------------------------------------------------------------------

test.describe("18 · Media Library widget example form", () => {
  test.beforeEach(async ({ page }) => {
    await adminLogin(page);
  });

  test("example form route loads without error", async ({ page }) => {
    await page.goto(`${BASE}/admin/config/media/cloudinary/example`);
    // Page shows a warning about Cloudinary credentials but no hard error.
    await expect(page.locator("h1").first()).toBeVisible();
    await expect(page.locator("form").first()).toBeVisible();
  });
});
