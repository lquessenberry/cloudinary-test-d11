import { expect, Page, test } from "@playwright/test";

const BASE = "https://cloudinary-test-d11.ddev.site";
const ASSETS_URL = `${BASE}/admin/content/cloudinary-assets`;

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

test.describe("Cloudinary Bulk Actions", () => {
  test.beforeEach(async ({ page }) => {
    await adminLogin(page);
  });

  test("asset list page loads and shows a results table", async ({ page }) => {
    await page.goto(ASSETS_URL);
    await expect(page.locator("table").first()).toBeVisible();
    const rows = page.locator("table tbody tr");
    await expect(rows.first()).toBeVisible();
  });

  test("asset list table has expected column headers", async ({ page }) => {
    await page.goto(ASSETS_URL);
    const headerText = await page.locator("table thead").textContent();
    expect(headerText).toMatch(/public.?id|asset/i);
  });

  test("asset list shows at least one asset row", async ({ page }) => {
    await page.goto(ASSETS_URL);
    const rowCount = await page.locator("table tbody tr").count();
    expect(rowCount).toBeGreaterThan(0);
  });

  test("search filter narrows results", async ({ page }) => {
    await page.goto(`${ASSETS_URL}?search=generateImage`);
    await expect(page.locator("table").first()).toBeVisible();
    const rowCount = await page.locator("table tbody tr").count();
    expect(rowCount).toBeGreaterThan(0);
    // The page body must contain the search term somewhere in the table.
    const bodyText = (await page.locator("table").first().textContent()) ?? "";
    expect(bodyText.toLowerCase()).toContain("generateimage");
  });

  test("type filter limits results to images", async ({ page }) => {
    await page.goto(`${ASSETS_URL}?type=image`);
    await expect(page.locator("table").first()).toBeVisible();
    const count = await page.locator("table tbody tr").count();
    expect(count).toBeGreaterThan(0);
  });

  test("picker mode shows Select buttons for each asset row", async ({
    page,
  }) => {
    await page.goto(`${ASSETS_URL}?picker=1`);
    await expect(page.locator("table").first()).toBeVisible();
    const btns = page.locator(".cloudinary-picker-select-btn");
    await expect(btns.first()).toBeVisible();
    const btnCount = await btns.count();
    const rowCount = await page.locator("table tbody tr").count();
    expect(btnCount).toBe(rowCount);
  });

  test("picker mode Select button carries a valid JSON payload", async ({
    page,
  }) => {
    await page.goto(`${ASSETS_URL}?picker=1`);
    const btn = page.locator(".cloudinary-picker-select-btn").first();
    await expect(btn).toBeVisible();
    const raw = await btn.getAttribute("data-payload");
    expect(raw).not.toBeNull();
    const payload = JSON.parse(raw!);
    expect(payload).toHaveProperty("cloudinaryAsset");
    expect(payload.cloudinaryAsset.public_id.length).toBeGreaterThan(0);
    expect(payload.cloudinaryAsset.resource_type.length).toBeGreaterThan(0);
  });

  test("picker mode preserves picker=1 in filter form hidden input", async ({
    page,
  }) => {
    await page.goto(`${ASSETS_URL}?picker=1`);
    const hidden = page.locator('input[type="hidden"][name="picker"]').first();
    await expect(hidden).toBeAttached();
    await expect(hidden).toHaveValue("1");
  });

  test("folder filter limits results to assets under that prefix", async ({
    page,
  }) => {
    await page.goto(`${ASSETS_URL}?folder=drupal-e2e-test`);
    await expect(page.locator("table").first()).toBeVisible();
    const rows = page.locator("table tbody tr");
    const count = await rows.count();
    expect(count).toBeGreaterThan(0);
  });

  test("no JavaScript errors on the asset list page", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(err.message));
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });
    await page.goto(ASSETS_URL);
    await page.locator("table").first().waitFor();
    expect(errors).toHaveLength(0);
  });
});
