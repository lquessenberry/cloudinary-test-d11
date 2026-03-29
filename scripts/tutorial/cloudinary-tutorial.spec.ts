/**
 * @file cloudinary-tutorial.spec.ts
 *
 * End-to-end tutorial recording for the Cloudinary Drupal module family.
 * Records a 1920×1080 Playwright session that walks through every feature,
 * pausing at each step long enough for the matching Piper narration clip.
 *
 * Run via:  ./scripts/tutorial/run-tutorial.sh
 * Or:       npx playwright test scripts/tutorial/cloudinary-tutorial.spec.ts
 *
 * Output:  output/tutorial/recording-<timestamp>.webm  (assembled by build-video.sh)
 */

/// <reference types="node" />
import { chromium, Page } from "playwright";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const fs = require("fs") as typeof import("fs");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require("path") as typeof import("path");

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const BASE = "https://cloudinary-test-d11.ddev.site";
const NARRATION_FILE = path.join(__dirname as string, "narration.json");

const OUT_DIR = path.join(
  __dirname as string,
  "../../output/tutorial",
  `rec-${new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19)}`,
);

const HIGHLIGHT_COLOR = "#ff6b00";
const CHAPTER_BG = "rgba(0,0,0,0.72)";

// Buffer added on top of each narration pause_s
const PAUSE_BUFFER_S = 2;

// ---------------------------------------------------------------------------
// Load narration timings
// ---------------------------------------------------------------------------

interface NarrationSegment {
  id: string;
  pause_s: number;
  text: string;
}
const narration: { segments: NarrationSegment[] } = JSON.parse(
  fs.readFileSync(NARRATION_FILE, "utf-8"),
);
const timings = Object.fromEntries(
  narration.segments.map((s) => [s.id, (s.pause_s + PAUSE_BUFFER_S) * 1000]),
);

// ---------------------------------------------------------------------------
// Highlight / overlay helpers
// ---------------------------------------------------------------------------

async function injectStyles(page: Page): Promise<void> {
  await page.addStyleTag({
    content: `
      @keyframes cld-tut-pulse {
        0%, 100% {
          box-shadow: 0 0 0 4px rgba(255,107,0,.35),
                      0 0 24px rgba(255,107,0,.45);
        }
        50% {
          box-shadow: 0 0 0 10px rgba(255,107,0,.55),
                      0 0 48px rgba(255,107,0,.65);
        }
      }
      .cld-tut-highlight {
        position: fixed !important;
        border: 3px solid ${HIGHLIGHT_COLOR} !important;
        border-radius: 5px !important;
        pointer-events: none !important;
        z-index: 2147483646 !important;
        animation: cld-tut-pulse 1.8s ease-in-out infinite !important;
        transition: top .25s, left .25s, width .25s, height .25s;
      }
      .cld-tut-label {
        position: absolute;
        top: -30px;
        left: 0;
        background: ${HIGHLIGHT_COLOR};
        color: #fff;
        font: 700 12px/1 monospace;
        padding: 4px 10px;
        border-radius: 4px;
        white-space: nowrap;
        pointer-events: none;
      }
      .cld-tut-chapter {
        position: fixed !important;
        bottom: 24px !important;
        left: 32px !important;
        background: ${CHAPTER_BG} !important;
        color: #fff !important;
        font: 600 17px/1.4 system-ui, sans-serif !important;
        padding: 10px 20px !important;
        border-radius: 8px !important;
        border-left: 4px solid ${HIGHLIGHT_COLOR} !important;
        z-index: 2147483647 !important;
        pointer-events: none !important;
        max-width: 680px !important;
      }
      .cld-tut-chapter em {
        display: block;
        font-style: normal;
        font-size: 12px;
        font-weight: 400;
        color: rgba(255,255,255,.6);
        margin-top: 3px;
      }
    `,
  });
}

async function showChapter(
  page: Page,
  title: string,
  subtitle = "",
): Promise<void> {
  await page.evaluate(
    ({ title, subtitle, bg }) => {
      document
        .querySelectorAll(".cld-tut-chapter")
        .forEach((el) => el.remove());
      const div = document.createElement("div");
      div.className = "cld-tut-chapter";
      div.innerHTML = `${title}${subtitle ? `<em>${subtitle}</em>` : ""}`;
      document.body.appendChild(div);
    },
    { title, subtitle, bg: CHAPTER_BG },
  );
}

async function highlight(
  page: Page,
  selectors: string | string[],
  label = "",
): Promise<void> {
  const sels = Array.isArray(selectors) ? selectors : [selectors];
  await page.evaluate(
    ({ sels, label, color }) => {
      document
        .querySelectorAll(".cld-tut-highlight")
        .forEach((el) => el.remove());
      sels.forEach((sel, idx) => {
        const target = document.querySelector(sel);
        if (!target) return;
        if (idx === 0) {
          target.scrollIntoView({ behavior: "instant", block: "center" });
          // Account for Drupal sticky admin toolbar (~80 px)
          const toolbar = document.querySelector("#toolbar-bar") as HTMLElement;
          const tray = document.querySelector(
            ".toolbar-tray-horizontal.is-active",
          ) as HTMLElement;
          const offset =
            (toolbar?.offsetHeight ?? 0) + (tray?.offsetHeight ?? 0);
          if (offset > 0) window.scrollBy(0, -offset);
        }
        const rect = target.getBoundingClientRect();
        const box = document.createElement("div");
        box.className = "cld-tut-highlight";
        box.style.cssText = `top:${rect.top - 4}px;left:${rect.left - 4}px;width:${rect.width + 8}px;height:${rect.height + 8}px;`;
        if (label && idx === 0) {
          const tag = document.createElement("div");
          tag.className = "cld-tut-label";
          tag.textContent = label;
          box.appendChild(tag);
        }
        document.body.appendChild(box);
      });
    },
    { sels, label, color: HIGHLIGHT_COLOR },
  );
  await page.waitForTimeout(600);
}

async function clearHighlights(page: Page): Promise<void> {
  await page.evaluate(() => {
    document
      .querySelectorAll(".cld-tut-highlight, .cld-tut-chapter")
      .forEach((el) => el.remove());
  });
}

async function wait(page: Page, segmentId: string): Promise<void> {
  const ms = timings[segmentId] ?? 8000;
  await page.waitForTimeout(ms);
}

async function safeHighlight(
  page: Page,
  selector: string | string[],
  label = "",
): Promise<void> {
  const first = Array.isArray(selector) ? selector[0] : selector;
  try {
    await page.waitForSelector(first, { timeout: 5000 });
    await highlight(page, selector, label);
  } catch {
    // Element not found — skip highlight gracefully
  }
}

// ---------------------------------------------------------------------------
// Login helper
// ---------------------------------------------------------------------------

async function login(page: Page): Promise<void> {
  await page.goto(`${BASE}/user/login`);
  await page.waitForSelector('input[name="name"]', { timeout: 15000 });
  await page.fill('input[name="name"]', "admin");
  await page.fill('input[name="pass"]', "admin");
  await page
    .locator("#user-login-form")
    .getByRole("button", { name: /log in/i })
    .click();
  await page.waitForURL(/\/user\/\d+|\/admin|\/node/, { timeout: 20000 });
}

// ---------------------------------------------------------------------------
// Main recording entry point
// ---------------------------------------------------------------------------

(async () => {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  console.log(`\n📹  Recording to: ${OUT_DIR}\n`);

  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    recordVideo: {
      dir: OUT_DIR,
      size: { width: 1920, height: 1080 },
    },
  });
  const page = await context.newPage();

  // Inject highlight styles on every navigation
  page.on("framenavigated", async () => {
    try {
      await injectStyles(page);
    } catch {}
  });

  // ── LOGIN ──────────────────────────────────────────────────────────────────
  await login(page);
  await injectStyles(page);

  // ── S01 INTRO ─────────────────────────────────────────────────────────────
  await page.goto(`${BASE}/node/16`, { waitUntil: "networkidle" });
  await injectStyles(page);
  await showChapter(
    page,
    "01 · Introduction",
    "Cloudinary Transformation Gallery",
  );
  await safeHighlight(page, ".cld-hero__title", "Gallery title");
  await wait(page, "s01_intro");
  await clearHighlights(page);

  // ── S02 SDK SETTINGS ──────────────────────────────────────────────────────
  await page.goto(`${BASE}/admin/config/media/cloudinary`, {
    waitUntil: "networkidle",
  });
  await injectStyles(page);
  await showChapter(
    page,
    "02 · SDK Settings",
    "/admin/config/media/cloudinary",
  );
  await safeHighlight(page, "h1", "Cloudinary settings page");
  await wait(page, "s02_settings");

  // ── S03 SETTINGS FIELDS ───────────────────────────────────────────────────
  await showChapter(
    page,
    "03 · Cloud Credentials",
    "Cloud Name · API Key · API Secret",
  );
  await safeHighlight(
    page,
    [
      'input[name*="cloud_name"], input[id*="cloud_name"]',
      'input[name*="api_key"], input[id*="api_key"]',
    ].join(", "),
    "Cloud Name",
  );
  await wait(page, "s03_settings_fields");
  await clearHighlights(page);

  // ── S04 AI SETTINGS ───────────────────────────────────────────────────────
  await page.goto(`${BASE}/admin/config/media/cloudinary/ai`, {
    waitUntil: "networkidle",
  });
  await injectStyles(page);
  await showChapter(
    page,
    "04 · AI / Automation Settings",
    "Auto-tagging · Background Removal · OCR",
  );
  await safeHighlight(page, "h1", "AI settings");
  await wait(page, "s04_ai_settings");
  await clearHighlights(page);

  // ── S05 TRANSFORM LAYERS ──────────────────────────────────────────────────
  await page.goto(`${BASE}/admin/config/media/cloudinary/transform-layers`, {
    waitUntil: "networkidle",
  });
  await injectStyles(page);
  await showChapter(
    page,
    "05 · Transform Layers",
    "Global & per-taxonomy breakpoints",
  );
  await safeHighlight(page, "h1", "Transform Layers");
  await wait(page, "s05_transform_layers");
  await clearHighlights(page);

  // ── S06 ASSET LIBRARY ─────────────────────────────────────────────────────
  await page.goto(`${BASE}/admin/content/cloudinary/assets`, {
    waitUntil: "networkidle",
  });
  await injectStyles(page);
  await showChapter(
    page,
    "06 · Asset Library",
    "/admin/content/cloudinary/assets",
  );
  await safeHighlight(
    page,
    "table, .cloudinary-assets-table, h1",
    "Asset library",
  );
  await wait(page, "s06_asset_library");

  // ── S07 ASSET SEARCH ──────────────────────────────────────────────────────
  await showChapter(
    page,
    "07 · Search & Filter",
    "Live search by filename or tag",
  );
  await safeHighlight(
    page,
    'input[name="search"], input[type="search"], .form-search',
    "Search input",
  );
  await wait(page, "s07_asset_search");

  // ── S08 FOLDER BROWSER ────────────────────────────────────────────────────
  await showChapter(page, "08 · Folder Browser", "Navigate by folder prefix");
  await safeHighlight(
    page,
    'select[name="folder"], #edit-folder, .form-select',
    "Folder dropdown",
  );
  await wait(page, "s08_asset_folder");
  await clearHighlights(page);

  // ── S09 ASSET DETAIL ──────────────────────────────────────────────────────
  // Navigate to watermelon-man detail
  const detailUrl = `${BASE}/admin/content/cloudinary/asset/demo%2Fwatermelon-man`;
  await page.goto(detailUrl, { waitUntil: "networkidle" });
  await injectStyles(page);
  await showChapter(page, "09 · Asset Detail", "demo/watermelon-man");
  await safeHighlight(
    page,
    "h1, .cloudinary-asset-detail, img",
    "Asset detail",
  );
  await wait(page, "s09_asset_detail");
  await clearHighlights(page);

  // ── S10 BULK OPERATIONS ───────────────────────────────────────────────────
  await page.goto(`${BASE}/admin/content/cloudinary/bulk`, {
    waitUntil: "networkidle",
  });
  await injectStyles(page);
  await showChapter(
    page,
    "10 · Bulk Operations",
    "Batch metadata sync & media import",
  );
  await safeHighlight(page, "h1, form", "Bulk operations");
  await wait(page, "s10_bulk_ops");
  await clearHighlights(page);

  // ── S11 USAGE STATS ───────────────────────────────────────────────────────
  await page.goto(`${BASE}/admin/content/cloudinary/usage`, {
    waitUntil: "networkidle",
  });
  await injectStyles(page);
  await showChapter(
    page,
    "11 · Usage Statistics",
    "Storage · Transformations · Bandwidth",
  );
  await safeHighlight(page, "h1, .cloudinary-usage", "Usage stats");
  await wait(page, "s11_usage_stats");
  await clearHighlights(page);

  // ── S12 MEDIA PICKER ──────────────────────────────────────────────────────
  await page.goto(`${BASE}/admin/cloudinary/media-library/picker?picker=1`, {
    waitUntil: "networkidle",
  });
  await injectStyles(page);
  await showChapter(
    page,
    "12 · Media Library Picker",
    "Embedded asset selector for field widgets",
  );
  await safeHighlight(page, "table, .cloudinary-asset-list, h1", "Picker mode");
  await wait(page, "s12_media_picker");

  // ── S13 PICKER SELECT BUTTONS ─────────────────────────────────────────────
  await showChapter(
    page,
    "13 · Select Asset",
    "postMessage → field widget receives asset",
  );
  await safeHighlight(
    page,
    ".cloudinary-picker-select-btn, button",
    "Select button",
  );
  await wait(page, "s13_media_picker_select");
  await clearHighlights(page);

  // ── S14 CONTENT AUTHORING ─────────────────────────────────────────────────
  await page.goto(`${BASE}/node/16/edit`, { waitUntil: "networkidle" });
  await injectStyles(page);
  await showChapter(
    page,
    "14 · Content Authoring",
    "Cloudinary Asset widgets on node edit form",
  );
  await safeHighlight(
    page,
    ".cloudinary-asset-widget, .field--type-cloudinary-asset, h1",
    "Cloudinary asset widget",
  );
  await wait(page, "s14_content_edit");
  await clearHighlights(page);

  // ── S15 IMAGE STYLES LIST ─────────────────────────────────────────────────
  await page.goto(`${BASE}/admin/config/media/image-styles`, {
    waitUntil: "networkidle",
  });
  await injectStyles(page);
  await showChapter(
    page,
    "15 · Image Styles",
    "40 cld_* preset styles (crops · effects · chains)",
  );
  // Highlight all cld_ rows
  try {
    const rows = await page
      .locator('tr:has(td a[href*="cld_"])')
      .elementHandles();
    if (rows.length) {
      await safeHighlight(
        page,
        'tr:has(td a[href*="cld_"])',
        "cld_* image styles",
      );
    } else {
      await safeHighlight(page, "table", "Image styles table");
    }
  } catch {
    await safeHighlight(page, "table", "Image styles table");
  }
  await wait(page, "s15_image_styles");

  // ── S16 STYLE DETAIL ──────────────────────────────────────────────────────
  await page.goto(`${BASE}/admin/config/media/image-styles/manage/cld_fill`, {
    waitUntil: "networkidle",
  });
  await injectStyles(page);
  await showChapter(
    page,
    "16 · Image Style Effect",
    "cld_fill — Cloudinary Transformation effect",
  );
  await safeHighlight(
    page,
    '.image-effect-list, .effect-list, [data-drupal-selector*="effect"], h1',
    "Effect configuration",
  );
  await wait(page, "s16_style_detail");

  // Drill into the effect edit form
  try {
    const editLink = page.locator(
      'a:has-text("Edit"), a[href*="effects"][href*="edit"]',
    );
    if (await editLink.count()) {
      await editLink.first().click();
      await page.waitForLoadState("networkidle");
      await injectStyles(page);
      await safeHighlight(
        page,
        'input[name*="raw_transformation"], textarea[name*="raw_transformation"], #edit-data-raw-transformation',
        "raw_transformation field",
      );
      await page.waitForTimeout(3000);
    }
  } catch {}
  await clearHighlights(page);

  // ── S17 FIELD FORMATTERS ──────────────────────────────────────────────────
  await page.goto(`${BASE}/admin/structure/types/manage/article/display`, {
    waitUntil: "networkidle",
  });
  await injectStyles(page);
  await showChapter(
    page,
    "17 · Field Formatters",
    "cloudinary_image · cloudinary_video · cloudinary_transformed",
  );
  await safeHighlight(
    page,
    'tr:has(select option[value*="cloudinary"]), .field-plugin-summary:has-text("Cloudinary"), h1',
    "Cloudinary formatters",
  );
  await wait(page, "s17_formatters");
  await clearHighlights(page);

  // ── S18 GALLERY INTRO ─────────────────────────────────────────────────────
  await page.goto(`${BASE}/node/16`, { waitUntil: "networkidle" });
  await injectStyles(page);
  await showChapter(
    page,
    "18 · Transformation Gallery",
    "40 transformations — one source image",
  );
  await safeHighlight(page, ".cld-hero", "Hero banner");
  await wait(page, "s18_gallery_intro");

  // ── S19 HERO BANNER ───────────────────────────────────────────────────────
  await showChapter(
    page,
    "19 · Hero Banner",
    "c_fill,w_1400,h_380,g_auto — auto gravity",
  );
  await safeHighlight(page, ".cld-hero__img", "Hero image (1400×380 fill)");
  await wait(page, "s19_gallery_hero");
  await clearHighlights(page);

  // ── S20 CROP MODES ────────────────────────────────────────────────────────
  await page.evaluate(() =>
    document
      .querySelector(".cld-section--crops")
      ?.scrollIntoView({ behavior: "instant", block: "start" }),
  );
  await page.waitForTimeout(400);
  await injectStyles(page);
  await showChapter(
    page,
    "20 · Crop Modes",
    "fill · fit · scale · pad · crop · thumb · limit",
  );
  await safeHighlight(
    page,
    ".cld-section--crops .cld-grid",
    "8 crop mode cards",
  );
  await wait(page, "s20_gallery_crops");

  // Walk through individual crop cards using data-style attribute (unique per card)
  for (const style of ["cld_fill", "cld_thumb", "cld_pad"]) {
    await safeHighlight(page, `.cld-card[data-style="${style}"]`);
    await page.waitForTimeout(1200);
  }
  await clearHighlights(page);

  // ── S21 VISUAL EFFECTS ────────────────────────────────────────────────────
  await page.evaluate(() =>
    document
      .querySelector(".cld-section--effects")
      ?.scrollIntoView({ behavior: "instant", block: "start" }),
  );
  await page.waitForTimeout(400);
  await injectStyles(page);
  await showChapter(
    page,
    "21 · Visual Effects",
    "grayscale · sepia · oil paint · cartoonify · neural art",
  );
  await safeHighlight(
    page,
    ".cld-section--effects .cld-grid",
    "10 effect cards",
  );
  await wait(page, "s21_gallery_effects");

  for (const style of [
    "cld_fx_cartoonify",
    "cld_fx_art_hokusai",
    "cld_fx_art_athena",
  ]) {
    await safeHighlight(page, `.cld-card[data-style="${style}"]`);
    await page.waitForTimeout(1000);
  }
  await clearHighlights(page);

  // ── S22 TONE & COLOUR ADJUSTMENTS ────────────────────────────────────────
  await page.evaluate(() =>
    document
      .querySelector(".cld-section--adjustments")
      ?.scrollIntoView({ behavior: "instant", block: "start" }),
  );
  await page.waitForTimeout(400);
  await injectStyles(page);
  await showChapter(
    page,
    "22 · Tone & Colour Adjustments",
    "sharpen · vibrance · saturation · contrast · brightness · auto_color",
  );
  await safeHighlight(
    page,
    ".cld-section--adjustments .cld-grid",
    "6 adjustment cards",
  );
  await wait(page, "s22_gallery_adjust");
  await clearHighlights(page);

  // ── S23 CHAINS INTRO ──────────────────────────────────────────────────────
  await page.evaluate(() =>
    document
      .querySelector(".cld-section--chains")
      ?.scrollIntoView({ behavior: "instant", block: "start" }),
  );
  await page.waitForTimeout(400);
  await injectStyles(page);
  await showChapter(
    page,
    "23 · Chain Transformations",
    "Multi-step pipelines — each '/' is a separate processing stage",
  );
  await safeHighlight(
    page,
    ".cld-section--chains .cld-section-title",
    "Chain Transformations section",
  );
  await wait(page, "s23_chains_intro");

  // ── S24 BASIC CHAINS ──────────────────────────────────────────────────────
  await showChapter(
    page,
    "24 · Basic Chain Pipelines",
    "fill → effect → effect — step counter badge",
  );
  await safeHighlight(
    page,
    ".cld-section--chains .cld-card:nth-child(1)",
    "Fill → B&W → Vignette",
  );
  await page.waitForTimeout(1000);
  await safeHighlight(
    page,
    ".cld-section--chains .cld-card:nth-child(1) .cld-card__img-wrap",
    "step counter (data-steps)",
  );
  await wait(page, "s24_chains_basic");

  // ── S25 SHAPE CHAINS ──────────────────────────────────────────────────────
  await showChapter(
    page,
    "25 · Shape Chains",
    "r_max → circle/oval · face gravity · coloured outlines · f_png transparency",
  );
  // Highlight each shape card individually so each is scrolled+centered before rect is captured
  for (const style of [
    "cld_chain_circle_avatar",
    "cld_chain_oval_sepia_gold",
    "cld_chain_rounded_card_shadow",
  ]) {
    await safeHighlight(
      page,
      `.cld-card[data-style="${style}"]`,
      style.replace("cld_chain_", ""),
    );
    await page.waitForTimeout(1400);
  }
  await wait(page, "s25_chains_shapes");
  await clearHighlights(page);

  // ── S26 DUOTONE CHAINS ────────────────────────────────────────────────────
  await showChapter(
    page,
    "26 · Duotone & Tint Chains",
    "e_grayscale → e_tint:[amount]:[color1]:[pos1]:[color2]:[pos2]",
  );
  for (const style of [
    "cld_chain_duotone_warm",
    "cld_chain_duotone_cool",
    "cld_chain_tint_teal_vignette",
  ]) {
    await safeHighlight(
      page,
      `.cld-card[data-style="${style}"]`,
      style.replace("cld_chain_", ""),
    );
    await page.waitForTimeout(1400);
  }
  await wait(page, "s26_chains_duotone");
  await clearHighlights(page);

  // ── S27 ARTISTIC CHAINS ───────────────────────────────────────────────────
  await showChapter(
    page,
    "27 · Artistic 5-Step Chains",
    "Cartoonify → Circle → Outline → Shadow — 5 chained stages",
  );
  await safeHighlight(
    page,
    ".cld-section--chains .cld-card:nth-child(15)",
    "Cartoon + Circle + Purple Glow (5 steps)",
  );
  await wait(page, "s27_chains_artistic");
  await clearHighlights(page);

  // ── S28 IMAGE STYLE BADGE ─────────────────────────────────────────────────
  await showChapter(
    page,
    "28 · Image Style Badges",
    "Each card's cld_chain_* machine name → 40 reusable Drupal image styles",
  );
  await safeHighlight(
    page,
    ".cld-section--chains .cld-card:nth-child(1) .cld-card__style",
    "Drupal image style machine name",
  );
  await page.waitForTimeout(1500);
  // Also show stat bar
  await safeHighlight(page, ".cld-stat-bar", "Stat bar — counts per section");
  await wait(page, "s28_style_badge");
  await clearHighlights(page);

  // ── S29 OUTRO ─────────────────────────────────────────────────────────────
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await page.waitForTimeout(600);
  await injectStyles(page);
  await showChapter(
    page,
    "Thank you! · Complete Cloudinary Drupal Module Tutorial",
    "Configuration · Asset Library · Media · Content · Image Styles · Chain Transformations",
  );
  await safeHighlight(page, ".cld-hero", "Full gallery");
  await wait(page, "s29_outro");
  await clearHighlights(page);

  // ── FINISH ────────────────────────────────────────────────────────────────
  await page.waitForTimeout(2000);
  await context.close();
  await browser.close();

  // Write segment timing manifest for build-video.sh
  const manifest = narration.segments.map((s, i) => ({
    index: i + 1,
    id: s.id,
    pause_ms: timings[s.id],
    text: s.text,
  }));
  fs.writeFileSync(
    path.join(OUT_DIR, "manifest.json"),
    JSON.stringify(manifest, null, 2),
  );

  console.log(`\n✅  Recording complete. Files in: ${OUT_DIR}\n`);
})();
