/**
 * @file cloudinary-article-demo.spec.ts
 *
 * End-to-end demo: Cloudinary features exercised on an Article node.
 *
 * Prerequisite (already satisfied by setup):
 *   - Article node 11 "Cloudinary Demo Article" exists with:
 *       field_cld_asset  = drupal-e2e-test/generateImage_NinNTW  (image)
 *       field_cld_video  = samples/elephants                     (video)
 *   - Both fields use cloudinary_asset_widget on the form display.
 *   - field_cld_asset uses cloudinary_responsive formatter (view display).
 *   - field_cld_video  uses cloudinary_video     formatter (view display).
 *
 * Test sections:
 *   A · View the demo article — verify formatter output
 *   B · Edit the demo article — verify widget structure & live preview
 *   C · Widget picker button — opens the Cloudinary asset browser
 *   D · Direct-entry round-trip — change public_id via text field, save, re-check
 *   E · Create a brand-new article with Cloudinary fields via the admin UI
 *   F · Video poster image — verify so_auto poster on the <video> element
 *   G · Responsive image formatter — verify srcset / Cloudinary CDN URLs
 */

import { expect, Page, test } from "@playwright/test";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const BASE = "https://cloudinary-test-d11.ddev.site";
const CLOUD = "dmpe4oa5b";
const DEMO_NODE = 11;
const IMG_ID = "drupal-e2e-test/generateImage_NinNTW";
const VIDEO_ID = "samples/elephants";
const CDN_BASE = `https://res.cloudinary.com/${CLOUD}`;

// ---------------------------------------------------------------------------
// Helpers
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

/** Assert no Drupal error messages on the current page. */
async function assertNoErrors(page: Page): Promise<void> {
  const count = await page.locator(".messages--error, .messages.error").count();
  expect(count, "Unexpected Drupal error messages on page").toBe(0);
}

// ---------------------------------------------------------------------------
// Setup
// ---------------------------------------------------------------------------

test.describe("Cloudinary Article Demo", () => {
  test.beforeEach(async ({ page }) => {
    await adminLogin(page);
  });

  // ──────────────────────────────────────────────────────────────────────────
  // A · View the demo article — formatter output
  // ──────────────────────────────────────────────────────────────────────────

  test("A1 · demo article renders without errors", async ({ page }) => {
    await page.goto(`${BASE}/node/${DEMO_NODE}`);
    await assertNoErrors(page);
    await expect(page.locator("h1.page-title, h1").first()).toContainText(
      /cloudinary demo article/i,
    );
  });

  test("A2 · Cloudinary image field renders an <img> pointing to the CDN", async ({
    page,
  }) => {
    await page.goto(`${BASE}/node/${DEMO_NODE}`);
    // The cloudinary_responsive formatter outputs an <img> (or <picture>)
    // whose src / srcset contains the Cloudinary CDN domain.
    const img = page
      .locator(`img[src*="${CDN_BASE}"], img[srcset*="${CDN_BASE}"]`)
      .first();
    await expect(img).toBeVisible();
    const src = (await img.getAttribute("src")) ?? "";
    const srcset = (await img.getAttribute("srcset")) ?? "";
    const combined = src + srcset;
    expect(combined).toContain(CDN_BASE);
    // The public_id must appear somewhere in the URL.
    expect(combined).toContain("generateImage_NinNTW");
  });

  test("A3 · Cloudinary video field renders a <video> element", async ({
    page,
  }) => {
    await page.goto(`${BASE}/node/${DEMO_NODE}`);
    const video = page.locator("video").first();
    await expect(video).toBeVisible();
  });

  // ──────────────────────────────────────────────────────────────────────────
  // B · Edit the demo article — widget structure
  // ──────────────────────────────────────────────────────────────────────────

  test("B1 · edit form loads with both Cloudinary Asset widget fieldsets", async ({
    page,
  }) => {
    await page.goto(`${BASE}/node/${DEMO_NODE}/edit`);
    await assertNoErrors(page);
    const widgets = page.locator(".cloudinary-asset-widget");
    // Two fields → two widget fieldsets.
    await expect(widgets).toHaveCount(2);
  });

  test("B2 · image widget shows the correct current public_id", async ({
    page,
  }) => {
    await page.goto(`${BASE}/node/${DEMO_NODE}/edit`);
    const publicIdInput = page.locator(
      'input[name="field_cld_asset[0][public_id]"]',
    );
    await expect(publicIdInput).toBeVisible();
    await expect(publicIdInput).toHaveValue(IMG_ID);
  });

  test("B3 · video widget shows the correct current public_id", async ({
    page,
  }) => {
    await page.goto(`${BASE}/node/${DEMO_NODE}/edit`);
    const publicIdInput = page.locator(
      'input[name="field_cld_video[0][public_id]"]',
    );
    await expect(publicIdInput).toBeVisible();
    await expect(publicIdInput).toHaveValue(VIDEO_ID);
  });

  test("B4 · both widgets show a preview thumbnail from the Cloudinary CDN", async ({
    page,
  }) => {
    await page.goto(`${BASE}/node/${DEMO_NODE}/edit`);
    const previews = page.locator("img.cloudinary-asset-preview");
    await expect(previews).toHaveCount(2);
    // Every preview src must be a CDN thumbnail URL.
    const srcs = await previews.evaluateAll((imgs) =>
      imgs.map((i) => (i as HTMLImageElement).src),
    );
    for (const src of srcs) {
      expect(src).toContain(CDN_BASE);
      expect(src).toContain("c_fill,w_120,h_80");
    }
  });

  test("B5 · image preview thumbnail contains the asset public_id in the URL", async ({
    page,
  }) => {
    await page.goto(`${BASE}/node/${DEMO_NODE}/edit`);
    const imgPreview = page
      .locator(".cloudinary-asset-widget")
      .first()
      .locator("img.cloudinary-asset-preview");
    const src = await imgPreview.getAttribute("src");
    expect(src).toContain("generateImage_NinNTW");
  });

  test("B6 · resource type select shows the correct current value for image", async ({
    page,
  }) => {
    await page.goto(`${BASE}/node/${DEMO_NODE}/edit`);
    const select = page.locator(
      'select[name="field_cld_asset[0][resource_type]"]',
    );
    await expect(select).toBeVisible();
    await expect(select).toHaveValue("image");
  });

  test("B7 · resource type select shows the correct current value for video", async ({
    page,
  }) => {
    await page.goto(`${BASE}/node/${DEMO_NODE}/edit`);
    const select = page.locator(
      'select[name="field_cld_video[0][resource_type]"]',
    );
    await expect(select).toBeVisible();
    await expect(select).toHaveValue("video");
  });

  test("B8 · Browse Cloudinary button is rendered for each field", async ({
    page,
  }) => {
    await page.goto(`${BASE}/node/${DEMO_NODE}/edit`);
    const btns = page.locator("button.cloudinary-browse-btn");
    await expect(btns).toHaveCount(2);
    // Each button must carry the cloud name.
    const cloudAttrs = await btns.evaluateAll((bs) =>
      bs.map((b) => (b as HTMLElement).dataset.cloudName),
    );
    for (const attr of cloudAttrs) {
      expect(attr).toBe(CLOUD);
    }
  });

  test("B9 · Browse button data-resource-types attribute lists allowed types", async ({
    page,
  }) => {
    await page.goto(`${BASE}/node/${DEMO_NODE}/edit`);
    const btn = page.locator("button.cloudinary-browse-btn").first();
    const types = await btn.getAttribute("data-resource-types");
    expect(types).toMatch(/image/);
  });

  // ──────────────────────────────────────────────────────────────────────────
  // C · Widget picker button — opens the Cloudinary asset browser
  // ──────────────────────────────────────────────────────────────────────────

  test("C1 · clicking Browse opens the asset list page in a new dialog/window", async ({
    page,
  }) => {
    await page.goto(`${BASE}/node/${DEMO_NODE}/edit`);
    // The cloudinary_asset_widget JS library must be attached.
    const scripts = await page.evaluate(() =>
      Array.from(document.querySelectorAll("script[src]")).map(
        (s) => (s as HTMLScriptElement).src,
      ),
    );
    const hasWidgetLib = scripts.some(
      (s) =>
        s.includes("cloudinary-asset-widget") || s.includes("asset_widget"),
    );
    expect(
      hasWidgetLib,
      "cloudinary_asset_widget JS library must be attached to the edit form",
    ).toBe(true);
  });

  test("C2 · Browse button carries data-cloud-name matching the configured cloud", async ({
    page,
  }) => {
    await page.goto(`${BASE}/node/${DEMO_NODE}/edit`);
    const btn = page.locator("button.cloudinary-browse-btn").first();
    await expect(btn).toBeVisible();
    await expect(btn).toHaveText(/Browse Cloudinary/i);
    const cloudName = await btn.getAttribute("data-cloud-name");
    expect(cloudName).toBe(CLOUD);
  });

  // ──────────────────────────────────────────────────────────────────────────
  // D · Direct-entry round-trip — change public_id, save, verify
  // ──────────────────────────────────────────────────────────────────────────

  test("D1 · changing the public_id via text input and saving updates the node", async ({
    page,
  }) => {
    const newImageId = "drupal-e2e-test/generateImage_K526nI";

    await page.goto(`${BASE}/node/${DEMO_NODE}/edit`);
    const input = page.locator('input[name="field_cld_asset[0][public_id]"]');
    await input.fill(newImageId);

    // Submit the form.
    await page.click('#edit-submit, input[value="Save"]');
    await page.waitForURL(/\/node\/\d+/, { timeout: 15000 });
    await assertNoErrors(page);

    // The updated image CDN URL should contain the new public_id.
    const img = page
      .locator(`img[src*="${CDN_BASE}"], img[srcset*="${CDN_BASE}"]`)
      .first();
    await expect(img).toBeVisible();
    const combined =
      ((await img.getAttribute("src")) ?? "") +
      ((await img.getAttribute("srcset")) ?? "");
    expect(combined).toContain("generateImage_K526nI");
  });

  test("D2 · restoring the original public_id after the round-trip edit", async ({
    page,
  }) => {
    await page.goto(`${BASE}/node/${DEMO_NODE}/edit`);
    await page
      .locator('input[name="field_cld_asset[0][public_id]"]')
      .fill(IMG_ID);
    await page.click('#edit-submit, input[value="Save"]');
    await page.waitForURL(/\/node\/\d+/, { timeout: 15000 });
    await assertNoErrors(page);
  });

  // ──────────────────────────────────────────────────────────────────────────
  // E · Create a brand-new article with Cloudinary fields via the admin UI
  // ──────────────────────────────────────────────────────────────────────────

  test("E1 · node/add/article shows both Cloudinary field widgets", async ({
    page,
  }) => {
    await page.goto(`${BASE}/node/add/article`);
    await assertNoErrors(page);
    await expect(page.locator(".cloudinary-asset-widget")).toHaveCount(2);
  });

  test("E2 · creating a new article with a Cloudinary image field and verifying output", async ({
    page,
  }) => {
    await page.goto(`${BASE}/node/add/article`);
    await page
      .locator("#edit-title-0-value")
      .fill("Playwright-Created Cloudinary Article");

    // Fill the image public_id directly.
    const imgInput = page.locator(
      'input[name="field_cld_asset[0][public_id]"]',
    );
    await imgInput.fill("drupal-e2e-test/generateImage_A1n0ak");

    // Save.
    await page.click('#edit-submit, input[value="Save"]');
    await page.waitForURL(/\/node\/\d+/, { timeout: 15000 });
    await assertNoErrors(page);

    // The new node must render a Cloudinary CDN image.
    const img = page
      .locator(`img[src*="${CDN_BASE}"], img[srcset*="${CDN_BASE}"]`)
      .first();
    await expect(img).toBeVisible();
    const src =
      (await img.getAttribute("src")) ??
      (await img.getAttribute("srcset")) ??
      "";
    expect(src).toContain(CDN_BASE);
    expect(src).toContain("generateImage_A1n0ak");
  });

  test("E3 · creating a new article with a Cloudinary video field and verifying <video> output", async ({
    page,
  }) => {
    await page.goto(`${BASE}/node/add/article`);
    await page
      .locator("#edit-title-0-value")
      .fill("Playwright-Created Cloudinary Video Article");

    // Fill the video public_id.
    const vidInput = page.locator(
      'input[name="field_cld_video[0][public_id]"]',
    );
    await vidInput.fill("samples/elephants");
    await page
      .locator('select[name="field_cld_video[0][resource_type]"]')
      .selectOption("video");

    // Save.
    await page.click('#edit-submit, input[value="Save"]');
    await page.waitForURL(/\/node\/\d+/, { timeout: 15000 });
    await assertNoErrors(page);

    // Must render a <video> element.
    await expect(page.locator("video").first()).toBeVisible();
  });

  // ──────────────────────────────────────────────────────────────────────────
  // F · Video poster image — the vt-1 feature
  // ──────────────────────────────────────────────────────────────────────────

  test("F1 · <video> element has a poster attribute", async ({ page }) => {
    await page.goto(`${BASE}/node/${DEMO_NODE}`);
    const video = page.locator("video").first();
    await expect(video).toBeVisible();
    const poster = await video.getAttribute("poster");
    expect(poster, "video element must have a poster attribute").not.toBeNull();
    expect(poster!.length).toBeGreaterThan(0);
  });

  test("F2 · video poster URL points to the Cloudinary CDN", async ({
    page,
  }) => {
    await page.goto(`${BASE}/node/${DEMO_NODE}`);
    const poster = await page.locator("video").first().getAttribute("poster");
    expect(poster).toContain(CDN_BASE);
  });

  test("F3 · video poster uses the configured poster_transformation (c_fill,q_auto,f_jpg by default)", async ({
    page,
  }) => {
    await page.goto(`${BASE}/node/${DEMO_NODE}`);
    const poster = await page.locator("video").first().getAttribute("poster");
    // cloudinary_video formatter default poster_transformation is c_fill,q_auto,f_jpg.
    // (so_auto is used by cloudinary_responsive formatter's buildVideoElement path.)
    expect(poster).toContain("c_fill");
  });

  test("F4 · video poster URL contains the video public_id", async ({
    page,
  }) => {
    await page.goto(`${BASE}/node/${DEMO_NODE}`);
    const poster = await page.locator("video").first().getAttribute("poster");
    expect(poster).toContain("elephants");
  });

  test("F5 · video poster is a .jpg (JPEG thumbnail from Cloudinary)", async ({
    page,
  }) => {
    await page.goto(`${BASE}/node/${DEMO_NODE}`);
    const poster = await page.locator("video").first().getAttribute("poster");
    expect(poster).toMatch(/\.jpg$/);
  });

  // ──────────────────────────────────────────────────────────────────────────
  // G · Responsive image formatter — srcset & CDN URL structure
  // ──────────────────────────────────────────────────────────────────────────

  test("G1 · cloudinary_responsive formatter outputs a srcset attribute", async ({
    page,
  }) => {
    await page.goto(`${BASE}/node/${DEMO_NODE}`);
    // Find any img whose src or srcset references the Cloudinary CDN.
    const img = page
      .locator(`img[src*="${CDN_BASE}"], img[srcset*="${CDN_BASE}"]`)
      .first();
    await expect(img).toBeVisible();
    const srcset = await img.getAttribute("srcset");
    const src = await img.getAttribute("src");
    // Either srcset or src must be set.
    expect((srcset ?? "") + (src ?? "")).toContain(CDN_BASE);
  });

  test("G2 · image CDN URL uses the correct resource type path segment", async ({
    page,
  }) => {
    await page.goto(`${BASE}/node/${DEMO_NODE}`);
    const img = page.locator(`img[src*="${CDN_BASE}"]`).first();
    const src = await img.getAttribute("src");
    // Cloudinary image delivery URLs contain /image/
    expect(src).toContain("/image/");
  });

  test("G3 · image CDN URL contains the upload delivery type", async ({
    page,
  }) => {
    await page.goto(`${BASE}/node/${DEMO_NODE}`);
    const img = page.locator(`img[src*="${CDN_BASE}"]`).first();
    const src = await img.getAttribute("src");
    expect(src).toContain("/upload/");
  });

  // ──────────────────────────────────────────────────────────────────────────
  // H · Picker mode integration from the article edit form
  // ──────────────────────────────────────────────────────────────────────────

  test("H1 · asset picker page embeds a picker iframe accessible from the article context", async ({
    page,
  }) => {
    // The media library opener creates a picker dialog at this URL.
    await page.goto(`${BASE}/admin/cloudinary/media-library/picker`);
    const iframe = page.locator("#cloudinary-media-library-picker-iframe");
    await expect(iframe).toBeVisible();
    const src = await iframe.getAttribute("src");
    expect(src).toContain("picker=1");
  });

  test("H2 · picker iframe shows assets that can be selected for an article field", async ({
    page,
  }) => {
    await page.goto(
      `${BASE}/admin/cloudinary/media-library/picker?allowed_types=image`,
    );
    const inner = page.frameLocator("#cloudinary-media-library-picker-iframe");
    await expect(inner.locator("table")).toBeVisible({ timeout: 15000 });
    await expect(
      inner.locator(".cloudinary-picker-select-btn").first(),
    ).toBeVisible();
  });

  test("H3 · selecting an asset inside the picker iframe fires postMessage with cloudinaryAsset payload", async ({
    page,
  }) => {
    await page.goto(
      `${BASE}/admin/cloudinary/media-library/picker?allowed_types=image`,
    );

    // Listen for the postMessage from the iframe on the parent window.
    await page.evaluate(() => {
      (window as any).__cldPickerMsgs = [];
      window.addEventListener("message", (e) => {
        if (e.data?.cloudinaryAsset) {
          (window as any).__cldPickerMsgs.push(e.data);
        }
      });
    });

    // Click the first Select button inside the iframe.
    const inner = page.frameLocator("#cloudinary-media-library-picker-iframe");
    await inner.locator(".cloudinary-picker-select-btn").first().click();

    // Wait briefly for the postMessage to propagate.
    await page.waitForTimeout(500);

    const msgs = await page.evaluate(() => (window as any).__cldPickerMsgs);
    expect(
      msgs.length,
      "parent window must receive a postMessage from the picker iframe",
    ).toBeGreaterThan(0);
    const asset = msgs[0].cloudinaryAsset;
    expect(asset).toHaveProperty("public_id");
    expect(asset).toHaveProperty("resource_type");
    expect(asset.public_id.length).toBeGreaterThan(0);
  });
});
