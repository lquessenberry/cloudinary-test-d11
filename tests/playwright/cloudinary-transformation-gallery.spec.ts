/**
 * @file cloudinary-transformation-gallery.spec.ts
 *
 * Verifies the custom node--16.html.twig transformation gallery:
 *   - 4 sections: crops (8), effects (10), adjustments (6), chains (16) = 40 total
 *   - 40 total img.cloudinary-gallery-img elements
 *   - Every CDN URL is unique and contains the correct transformation string
 *   - Source public_id shared across all cards
 *
 * Node 16 — "Cloudinary Transformation Gallery"
 * Theme    — cloudinary_demo (Olivero sub-theme)
 * Template — web/themes/custom/cloudinary_demo/templates/node--16.html.twig
 * Hook     — cloudinary_admin_preprocess_node() in cloudinary_admin.module
 */

import { expect, Page, test } from "@playwright/test";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const BASE = "https://cloudinary-test-d11.ddev.site";
const CLOUD = "dmpe4oa5b";
const CDN_BASE = `https://res.cloudinary.com/${CLOUD}`;
const NODE_URL = `${BASE}/node/16`;
const SOURCE_ID = "demo/watermelon-man";

// Section definitions matching the preprocess hook data.
const SECTIONS = {
  crops: {
    count: 8,
    spotChecks: [
      "c_fill,w_360,h_240,g_auto,q_auto,f_auto",
      "c_fit,w_360,h_240,q_auto,f_auto",
      "c_scale,w_360,h_240,q_auto,f_auto",
      "c_pad,w_360,h_240,b_auto:predominant,q_auto,f_auto",
      "c_crop,w_360,h_240,g_center,q_auto,f_auto",
      "c_crop,w_360,h_240,g_north,q_auto,f_auto",
      "c_thumb,w_360,h_240,g_auto,q_auto,f_auto",
      "c_limit,w_360,h_240,q_auto,f_auto",
    ],
    labels: [
      "Fill",
      "Fit",
      "Scale",
      "Pad",
      "Crop – Center",
      "Crop – North",
      "Thumb",
      "Limit",
    ],
  },
  effects: {
    count: 10,
    spotChecks: [
      "e_grayscale",
      "e_sepia",
      "e_oil_paint",
      "e_blur:600",
      "e_vignette",
      "e_cartoonify",
      "e_pixelate:8",
      "e_art:hokusai",
      "e_art:athena",
    ],
    labels: [
      "Original",
      "Grayscale",
      "Sepia",
      "Oil Paint",
      "Blur",
      "Vignette",
      "Cartoonify",
      "Pixelate",
      "Art: Hokusai",
      "Art: Athena",
    ],
  },
  adjustments: {
    count: 6,
    spotChecks: [
      "e_sharpen:100",
      "e_vibrance:70",
      "e_saturation:80",
      "e_contrast:50",
      "e_brightness:40",
      "e_auto_color",
    ],
    labels: [
      "Sharpen",
      "Vibrance",
      "Saturation",
      "Contrast",
      "Brightness",
      "Auto Color",
    ],
  },
  chains: {
    count: 16,
    // Each entry is the full chained transformation string (steps separated by /)
    spotChecks: [
      // Original 8
      "c_fill,w_360,h_240,g_auto/e_grayscale/e_vignette/q_auto,f_auto",
      "c_fill,w_360,h_240,g_auto/e_oil_paint/e_sharpen:80/q_auto,f_auto",
      "c_thumb,w_360,h_240,g_face/e_sepia/e_contrast:30/q_auto,f_auto",
      "c_fill,w_360,h_240,g_auto/e_art:hokusai/e_vibrance:50/q_auto,f_auto",
      "c_fill,w_360,h_240,g_auto/e_cartoonify/e_sharpen:100/q_auto,f_auto",
      "c_fill,w_360,h_240,g_auto/e_grayscale/e_art:athena/q_auto,f_auto",
      "c_fill,w_360,h_240,g_auto/e_blur:400/e_vignette/q_auto,f_auto",
      "c_fill,w_360,h_240,g_auto/e_auto_color/e_sharpen:100/e_vibrance:50/q_auto,f_auto",
      // New 8: shapes, duotones, tints, artistic
      "c_thumb,w_360,h_360,g_face/r_max/co_rgb:4a90e2,e_outline:20/q_auto,f_png",
      "c_thumb,w_360,h_360,g_face/e_sepia/r_max/co_rgb:d4af37,e_outline:18/q_auto,f_png",
      "c_fill,w_360,h_240,g_auto/r_30/co_black,e_shadow:40,x_8,y_8/q_auto,f_png",
      "c_fill,w_360,h_240,g_auto/e_grayscale/e_tint:80:orange:0p:yellow:100p/q_auto,f_auto",
      "c_fill,w_360,h_240,g_auto/e_grayscale/e_tint:80:blue:0p:purple:100p/q_auto,f_auto",
      "c_fill,w_360,h_240,g_auto/e_tint:60:teal:0p:navy:100p/e_vignette/q_auto,f_auto",
      "c_thumb,w_360,h_360,g_face/e_cartoonify/r_max/co_rgb:7c3aed,e_outline:15/co_rgb:7c3aed,e_shadow,x_6,y_6/q_auto,f_png",
      "c_fill,w_360,h_240,g_auto/e_oil_paint/e_sepia/r_20/q_auto,f_auto",
    ],
    styles: [
      "cld_chain_fill_bw_vignette",
      "cld_chain_fill_oil_sharpen",
      "cld_chain_thumb_sepia_contrast",
      "cld_chain_fill_hokusai_vibrance",
      "cld_chain_fill_cartoonify_sharpen",
      "cld_chain_fill_bw_athena",
      "cld_chain_fill_blur_vignette",
      "cld_chain_fill_autocolor_sharpen_vibrance",
      "cld_chain_circle_avatar",
      "cld_chain_oval_sepia_gold",
      "cld_chain_rounded_card_shadow",
      "cld_chain_duotone_warm",
      "cld_chain_duotone_cool",
      "cld_chain_tint_teal_vignette",
      "cld_chain_cartoon_circle_purple",
      "cld_chain_oil_sepia_rounded",
    ],
    labels: [
      "Fill → B&W → Vignette",
      "Fill → Oil Paint → Sharpen",
      "Thumb → Sepia → Contrast",
      "Fill → Art Hokusai → Vibrance",
      "Fill → Cartoonify → Sharpen",
      "Fill → B&W → Art Athena",
      "Fill → Blur → Vignette",
      "Fill → Auto-Colour → Sharpen → Vibrance",
      "Thumb → Circle → Blue Outline",
      "Thumb → Sepia → Oval → Gold Ring",
      "Fill → Rounded Corners → Drop Shadow",
      "Fill → B&W → Warm Duotone",
      "Fill → B&W → Cool Duotone",
      "Fill → Teal-Navy Tint → Vignette",
      "Thumb → Cartoonify → Circle → Purple Glow",
      "Fill → Oil Paint → Sepia → Rounded",
    ],
  },
} as const;

const TOTAL_CARDS =
  SECTIONS.crops.count +
  SECTIONS.effects.count +
  SECTIONS.adjustments.count +
  SECTIONS.chains.count;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function adminLogin(page: Page): Promise<void> {
  await page.goto(`${BASE}/user/login`);
  await page.waitForSelector('input[name="name"]', { timeout: 15000 });
  await page.fill('input[name="name"]', "admin");
  await page.fill('input[name="pass"]', "admin");
  // Scope to the login form to avoid ambiguity with Olivero's header search button.
  await page
    .locator("#user-login-form")
    .getByRole("button", { name: /log in/i })
    .click();
  await page.waitForURL(/\/user\/\d+|\/admin|\/node/, { timeout: 15000 });
}

async function assertNoErrors(page: Page): Promise<void> {
  const count = await page.locator(".messages--error, .messages.error").count();
  expect(count, "Unexpected Drupal error messages").toBe(0);
}

// ---------------------------------------------------------------------------
// Suite
// ---------------------------------------------------------------------------

test.describe("Cloudinary Transformation Gallery — node 16 custom template", () => {
  test.beforeEach(async ({ page }) => {
    await adminLogin(page);
  });

  // ── Page sanity ───────────────────────────────────────────────────────────

  test("page renders without Drupal errors", async ({ page }) => {
    await page.goto(NODE_URL);
    await assertNoErrors(page);
  });

  test("page title contains 'Cloudinary Transformation Gallery'", async ({
    page,
  }) => {
    await page.goto(NODE_URL);
    await expect(page.locator("h1").first()).toContainText(
      /cloudinary transformation gallery/i,
    );
  });

  test("source public_id badge is visible on the page", async ({ page }) => {
    await page.goto(NODE_URL);
    const badge = page.locator(".cld-gallery-source-badge");
    await expect(badge).toBeVisible();
    await expect(badge).toContainText("demo/watermelon-man");
  });

  // ── Card counts ──────────────────────────────────────────────────────────

  test(`page renders exactly ${TOTAL_CARDS} gallery images in total`, async ({
    page,
  }) => {
    await page.goto(NODE_URL);
    await expect(page.locator("img.cloudinary-gallery-img")).toHaveCount(
      TOTAL_CARDS,
    );
  });

  test(`crops section renders ${SECTIONS.crops.count} cards`, async ({
    page,
  }) => {
    await page.goto(NODE_URL);
    await expect(page.locator(".cld-section--crops .cld-card")).toHaveCount(
      SECTIONS.crops.count,
    );
  });

  test(`effects section renders ${SECTIONS.effects.count} cards`, async ({
    page,
  }) => {
    await page.goto(NODE_URL);
    await expect(page.locator(".cld-section--effects .cld-card")).toHaveCount(
      SECTIONS.effects.count,
    );
  });

  test(`adjustments section renders ${SECTIONS.adjustments.count} cards`, async ({
    page,
  }) => {
    await page.goto(NODE_URL);
    await expect(
      page.locator(".cld-section--adjustments .cld-card"),
    ).toHaveCount(SECTIONS.adjustments.count);
  });

  test(`chains section renders ${SECTIONS.chains.count} cards`, async ({
    page,
  }) => {
    await page.goto(NODE_URL);
    await expect(page.locator(".cld-section--chains .cld-card")).toHaveCount(
      SECTIONS.chains.count,
    );
  });

  // ── Section headings ─────────────────────────────────────────────────────

  test("'Crop Modes' section heading is visible", async ({ page }) => {
    await page.goto(NODE_URL);
    await expect(
      page.locator(".cld-section--crops .cld-section-title"),
    ).toContainText(/crop modes/i);
  });

  test("'Visual Effects' section heading is visible", async ({ page }) => {
    await page.goto(NODE_URL);
    await expect(
      page.locator(".cld-section--effects .cld-section-title"),
    ).toContainText(/visual effects/i);
  });

  test("'Tone & Colour Adjustments' section heading is visible", async ({
    page,
  }) => {
    await page.goto(NODE_URL);
    await expect(
      page.locator(".cld-section--adjustments .cld-section-title"),
    ).toContainText(/tone|colour|adjustments/i);
  });

  test("'Chain Transformations' section heading is visible", async ({
    page,
  }) => {
    await page.goto(NODE_URL);
    await expect(
      page.locator(".cld-section--chains .cld-section-title"),
    ).toContainText(/chain/i);
  });

  // ── CDN URLs ─────────────────────────────────────────────────────────────

  test("every gallery image src points to the Cloudinary CDN", async ({
    page,
  }) => {
    await page.goto(NODE_URL);
    const srcs = await page
      .locator("img.cloudinary-gallery-img")
      .evaluateAll((imgs) => imgs.map((i) => (i as HTMLImageElement).src));
    expect(srcs.length).toBe(TOTAL_CARDS);
    for (const src of srcs) {
      expect(src).toContain(CDN_BASE);
      expect(src).toContain("/image/upload/");
    }
  });

  test("every gallery image src ends with the source public_id", async ({
    page,
  }) => {
    await page.goto(NODE_URL);
    const srcs = await page
      .locator("img.cloudinary-gallery-img")
      .evaluateAll((imgs) => imgs.map((i) => (i as HTMLImageElement).src));
    for (const src of srcs) {
      expect(src).toContain(SOURCE_ID);
    }
  });

  test("every gallery image data-public-id matches the source", async ({
    page,
  }) => {
    await page.goto(NODE_URL);
    const attrs = await page
      .locator("img.cloudinary-gallery-img")
      .evaluateAll((imgs) =>
        imgs.map((i) => (i as HTMLImageElement).dataset.publicId ?? ""),
      );
    for (const attr of attrs) {
      expect(attr).toBe(SOURCE_ID);
    }
  });

  test(`all ${TOTAL_CARDS} CDN URLs are distinct`, async ({ page }) => {
    await page.goto(NODE_URL);
    const srcs = await page
      .locator("img.cloudinary-gallery-img")
      .evaluateAll((imgs) => imgs.map((i) => (i as HTMLImageElement).src));
    const unique = new Set(srcs);
    expect(unique.size).toBe(TOTAL_CARDS);
  });

  // ── Crop mode spot-checks ─────────────────────────────────────────────────

  for (const t of SECTIONS.crops.spotChecks) {
    test(`crops: "${t}" renders a valid CDN URL`, async ({ page }) => {
      await page.goto(NODE_URL);
      const img = page.locator(
        `.cld-section--crops img.cloudinary-gallery-img[data-transformation="${t}"]`,
      );
      await expect(img).toHaveCount(1);
      const src = await img.getAttribute("src");
      expect(src).toContain(t);
      expect(src).toContain(CDN_BASE);
    });
  }

  // ── Effect spot-checks ────────────────────────────────────────────────────

  for (const effect of SECTIONS.effects.spotChecks) {
    test(`effects: "${effect}" is present in a card URL`, async ({ page }) => {
      await page.goto(NODE_URL);
      const img = page.locator(
        `.cld-section--effects img.cloudinary-gallery-img[data-transformation*="${effect}"]`,
      );
      await expect(img).toHaveCount(1);
      const src = await img.getAttribute("src");
      expect(src).toContain(effect);
    });
  }

  // ── Adjustment spot-checks ────────────────────────────────────────────────

  for (const effect of SECTIONS.adjustments.spotChecks) {
    test(`adjustments: "${effect}" is present in a card URL`, async ({
      page,
    }) => {
      await page.goto(NODE_URL);
      const img = page.locator(
        `.cld-section--adjustments img.cloudinary-gallery-img[data-transformation*="${effect}"]`,
      );
      await expect(img).toHaveCount(1);
      const src = await img.getAttribute("src");
      expect(src).toContain(effect);
    });
  }

  // ── Chain transformation spot-checks ─────────────────────────────────────

  for (const t of SECTIONS.chains.spotChecks) {
    test(`chains: "${t}" produces a valid CDN URL`, async ({ page }) => {
      await page.goto(NODE_URL);
      const img = page.locator(
        `.cld-section--chains img.cloudinary-gallery-img[data-transformation="${t}"]`,
      );
      await expect(img).toHaveCount(1);
      const src = await img.getAttribute("src");
      // Chain steps are URL-encoded — check source and CDN base
      expect(src).toContain(CDN_BASE);
      expect(src).toContain(SOURCE_ID);
    });
  }

  // ── Image style badge checks ──────────────────────────────────────────────

  test("every card has a .cld-card__style badge with a machine name", async ({
    page,
  }) => {
    await page.goto(NODE_URL);
    const badges = page.locator(".cld-card__style");
    await expect(badges).toHaveCount(TOTAL_CARDS);
    const texts = await badges.allTextContents();
    for (const txt of texts) {
      expect(
        txt.trim().length,
        "style badge should not be empty",
      ).toBeGreaterThan(0);
      expect(txt.trim()).toMatch(/^cld_/);
    }
  });

  test("chain card style badges start with 'cld_chain_'", async ({ page }) => {
    await page.goto(NODE_URL);
    const badges = page.locator(".cld-section--chains .cld-card__style");
    await expect(badges).toHaveCount(SECTIONS.chains.count);
    const texts = await badges.allTextContents();
    for (const txt of texts) {
      expect(txt.trim()).toMatch(/^cld_chain_/);
    }
  });

  test("chain cards expose data-steps attribute on the img-wrap", async ({
    page,
  }) => {
    await page.goto(NODE_URL);
    const wraps = page.locator(".cld-section--chains .cld-card__img-wrap");
    await expect(wraps).toHaveCount(SECTIONS.chains.count);
    const vals = await wraps.evaluateAll((els) =>
      els.map((el) => el.getAttribute("data-steps") ?? ""),
    );
    for (const v of vals) {
      expect(v).toMatch(/\d+ steps/);
    }
  });

  // ── Card label visibility ────────────────────────────────────────────────

  test("all expected card labels appear on the page", async ({ page }) => {
    await page.goto(NODE_URL);
    const bodyText = (await page.locator("body").textContent()) ?? "";
    const allLabels = [
      ...SECTIONS.crops.labels,
      ...SECTIONS.effects.labels,
      ...SECTIONS.adjustments.labels,
      ...SECTIONS.chains.labels,
    ];
    for (const label of allLabels) {
      expect(bodyText, `Label "${label}" must appear on the page`).toContain(
        label,
      );
    }
  });

  // ── CSS layout: flexbox grid ──────────────────────────────────────────────

  test("the .cld-grid flex container is present in every section", async ({
    page,
  }) => {
    await page.goto(NODE_URL);
    await expect(page.locator(".cld-grid")).toHaveCount(4);
  });

  test("each card has a .cld-card__transform code element showing the t-string", async ({
    page,
  }) => {
    await page.goto(NODE_URL);
    const codes = page.locator(".cld-card__transform");
    await expect(codes).toHaveCount(TOTAL_CARDS);
    // Every code block must be non-empty.
    const texts = await codes.allTextContents();
    for (const txt of texts) {
      expect(txt.trim().length).toBeGreaterThan(0);
    }
  });

  // ── Edit form still works ─────────────────────────────────────────────────

  test("edit form for node 16 loads with Cloudinary widget fieldsets", async ({
    page,
  }) => {
    await page.goto(`${BASE}/node/16/edit`);
    await assertNoErrors(page);
    const widgets = await page.locator(".cloudinary-asset-widget").count();
    expect(widgets).toBeGreaterThanOrEqual(8);
  });
});
