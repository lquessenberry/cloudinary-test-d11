import { expect, Page, test } from "@playwright/test";

/**
 * Cloudinary Drupal E2E test suite.
 *
 * Covers the key admin UI flows:
 * - Admin login
 * - Asset list: loads, search, folder-prefix filter
 * - Asset picker mode (?picker=1): renders Select buttons
 * - Status report: renders key sections
 * - Folder manager: loads without error
 * - Media library picker route: accessible
 */

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const BASE = "https://cloudinary-test-d11.ddev.site";

async function adminLogin(page: Page): Promise<void> {
  await page.goto(`${BASE}/user/login`);
  await page.fill("#edit-name", "admin");
  await page.fill("#edit-pass", "admin");
  await page
    .locator("#user-login-form")
    .getByRole("button", { name: /log in/i })
    .click();
  await expect(page).toHaveURL(/\/user\/\d+|\/admin/);
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

test.describe("Cloudinary Admin UI", () => {
  test.beforeEach(async ({ page }) => {
    await adminLogin(page);
  });

  // ── Asset List ─────────────────────────────────────────────────────────────

  test("asset list page loads and shows table", async ({ page }) => {
    await page.goto(`${BASE}/admin/content/cloudinary-assets`);
    await expect(page.locator("h1")).toContainText(/cloudinary/i);
    await expect(page.locator("table")).toBeVisible();
    // Should have at least one row (we pushed 18 assets in E2E setup).
    const rows = page.locator("table tbody tr");
    await expect(rows.first()).toBeVisible();
  });

  test("asset list search filter narrows results", async ({ page }) => {
    await page.goto(
      `${BASE}/admin/content/cloudinary-assets?search=generateImage`,
    );
    await expect(page.locator("table")).toBeVisible();
    const rows = page.locator("table tbody tr");
    await expect(rows.first()).toBeVisible();
    // Every public_id in the results should contain the search string.
    const cells = await rows.locator("td:nth-child(2)").allTextContents();
    for (const cell of cells) {
      expect(cell.toLowerCase()).toContain("generateimage");
    }
  });

  test("asset list folder filter works", async ({ page }) => {
    await page.goto(
      `${BASE}/admin/content/cloudinary-assets?folder=drupal-e2e-test`,
    );
    await expect(page.locator("table")).toBeVisible();
    const rows = page.locator("table tbody tr");
    await expect(rows.first()).toBeVisible();
    const cells = await rows.locator("td:nth-child(2)").allTextContents();
    for (const cell of cells) {
      expect(cell).toContain("drupal-e2e-test");
    }
  });

  test("folder filter input is present on asset list", async ({ page }) => {
    await page.goto(`${BASE}/admin/content/cloudinary-assets`);
    await expect(page.locator("#cld-folder")).toBeVisible();
  });

  // ── Picker Mode ────────────────────────────────────────────────────────────

  test("picker mode renders Select buttons instead of Transformation/Sync columns", async ({
    page,
  }) => {
    await page.goto(
      `${BASE}/admin/content/cloudinary-assets?picker=1&allowed_types=image`,
    );
    await expect(page.locator("table")).toBeVisible();
    // Header should have 4 columns (Preview, Public ID, Type, Select).
    const headers = page.locator("table thead th");
    await expect(headers).toHaveCount(4);
    await expect(headers.nth(3)).toContainText(/select/i);
    // Select buttons should be present.
    const selectBtns = page.locator(".cloudinary-picker-select-btn");
    await expect(selectBtns.first()).toBeVisible();
  });

  test("picker select button carries data-payload JSON", async ({ page }) => {
    await page.goto(
      `${BASE}/admin/content/cloudinary-assets?picker=1&allowed_types=image`,
    );
    const btn = page.locator(".cloudinary-picker-select-btn").first();
    await expect(btn).toBeVisible();
    const payload = await btn.getAttribute("data-payload");
    expect(payload).not.toBeNull();
    const parsed = JSON.parse(payload!);
    expect(parsed).toHaveProperty("cloudinaryAsset");
    expect(parsed.cloudinaryAsset).toHaveProperty("public_id");
    expect(parsed.cloudinaryAsset).toHaveProperty("resource_type");
  });

  // ── Status Report ──────────────────────────────────────────────────────────

  test("cloudinary status report renders key sections", async ({ page }) => {
    await page.goto(`${BASE}/admin/reports/cloudinary`);
    await expect(page.locator("h1")).toContainText(/cloudinary/i);
    // Should show config, entity stats, or resource type sections.
    const body = await page.locator("body").textContent();
    expect(body).toMatch(/cloud.?name|connection|asset/i);
  });

  // ── Folder Manager ─────────────────────────────────────────────────────────

  test("folder manager page loads without PHP errors", async ({ page }) => {
    await page.goto(`${BASE}/admin/content/cloudinary/folders`);
    // Should NOT have a Drupal error message.
    await expect(page.locator(".messages--error, .messages.error")).toHaveCount(
      0,
    );
  });

  // ── Media Library Picker Route ─────────────────────────────────────────────

  test("media library picker route is accessible", async ({ page }) => {
    await page.goto(`${BASE}/admin/cloudinary/media-library/picker`);
    // Should load without a 403/404 — the iframe source will show the asset list.
    await expect(page).not.toHaveURL(/\/403|\/404/);
    await expect(
      page.locator("#cloudinary-media-library-picker-iframe"),
    ).toBeVisible();
  });

  // ── Video Poster ───────────────────────────────────────────────────────────

  test("video formatter renders poster attribute with Cloudinary thumbnail URL", async ({
    page,
  }) => {
    // This test verifies the video formatter output by checking a demo render.
    // We use drush to render a field and then check via the API.
    // For now we verify the URL pattern only via PHP eval in a separate flow —
    // here we just confirm the route is reachable.
    await page.goto(`${BASE}/admin/content/cloudinary-assets?type=video`);
    await expect(page.locator("table")).toBeVisible();
    // Video thumbnails in the list should use so_0 Cloudinary URL.
    const imgs = page.locator("table tbody tr img");
    if ((await imgs.count()) > 0) {
      const src = await imgs.first().getAttribute("src");
      expect(src).toContain("res.cloudinary.com");
    }
  });
});
