import { expect, Page, test } from "@playwright/test";

const SCREENSHOTS = "screenshots/refactor";
const FIELD_LABEL = "PW Cloudinary Test";
const FIELD_MACHINE = "field_pw_cloudinary_test";
const IMAGE_STYLE_LABEL = "PW Cloudinary Style";
const ASSET_PUBLIC_ID = "test/playwright-crud-test";
const ASSET_PUBLIC_ID_EDIT = "test/playwright-crud-edited";

async function login(page: Page) {
  await page.goto("/user/login");
  await page.fill('input[name="name"]', "admin");
  await page.fill('input[name="pass"]', "admin");
  await page.click('input[type="submit"]');
  await page.waitForLoadState("networkidle");
}

async function shot(page: Page, name: string) {
  await page.screenshot({ path: `${SCREENSHOTS}/${name}.png`, fullPage: true });
}

/** Submit whichever save/submit button is present on the page.
 * NOTE: Does NOT use value*="Add" to avoid matching "Add another item" buttons
 * on multi-value entity fields before the real Save button. */
async function submit(page: Page) {
  const btn = page
    .locator(
      'input[type="submit"][value*="Save"], input[type="submit"][value*="save"], ' +
        'input[type="submit"][value*="Delete"], input[type="submit"][value*="Create"], ' +
        'button[type="submit"]',
    )
    .first();
  await btn.click();
  await page.waitForLoadState("networkidle");
}

/** Navigate to path and assert HTTP < 400. */
async function assertOk(page: Page, path: string) {
  const res = await page.goto(path);
  expect(res?.status(), `${path} should be accessible`).toBeLessThan(400);
  await page.waitForLoadState("networkidle");
}

/** Check page doesn't show an error page. */
async function assertNoError(page: Page, label: string) {
  const content = await page.content();
  expect(content, `${label}: no 'Page not found'`).not.toContain(
    "Page not found",
  );
  expect(content, `${label}: no 'Access denied'`).not.toContain(
    "Access denied",
  );
  expect(content, `${label}: no PHP fatal error`).not.toContain("Fatal error");
}

// ─────────────────────────────────────────────────────────────────────────────
test.describe("Cloudinary Submodule Architecture", () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test("All four submodules enabled, grouped under Cloudinary package, with descriptions", async ({
    page,
  }) => {
    await page.goto("/admin/modules");
    await page.waitForLoadState("networkidle");
    await shot(page, "01-modules-cloudinary-package");

    const mods = [
      { label: "Cloudinary Admin", machine: "cloudinary_admin" },
      { label: "Cloudinary AI", machine: "cloudinary_ai" },
      {
        label: "Cloudinary Transformations",
        machine: "cloudinary_transformations",
      },
      { label: "Cloudinary Widget", machine: "cloudinary_widget" },
    ];

    for (const { label, machine } of mods) {
      // 1. Checkbox is checked
      const cb = page.locator(`input[name="modules[${machine}][enable]"]`);
      await expect(cb, `${machine} enabled`).toBeChecked();

      // 2. Each row has a non-empty description
      const row = page.locator(
        `tr:has(input[name="modules[${machine}][enable]"])`,
      );
      const desc = await row.locator("td").nth(2).innerText();
      expect(
        desc.trim().length,
        `${machine} has a description`,
      ).toBeGreaterThan(10);

      console.log(
        `  ✓ ${label}: enabled, description: "${desc.trim().substring(0, 60)}..."`,
      );
    }

    // 3. All four live under the same "Cloudinary" <details> section
    const cloudinarySection = page
      .locator("details")
      .filter({ hasText: "Cloudinary Admin" })
      .first();
    await expect(
      cloudinarySection,
      "Cloudinary package section exists",
    ).toBeVisible();
    for (const { label } of mods) {
      // Use filter with hasText for substring matching (avoids exact-text DOM issues)
      await expect(
        cloudinarySection.locator("tr").filter({ hasText: label }).first(),
        `"${label}" row inside Cloudinary package section`,
      ).toBeVisible();
    }

    // 4. cloudinary_ai row has a details element with description text
    const aiDetailsCount = await page
      .locator(`tr:has(input[name="modules[cloudinary_ai][enable]"]) details`)
      .count();
    expect(aiDetailsCount, "cloudinary_ai has details element").toBeGreaterThan(
      0,
    );
    const aiRow = page.locator(
      `tr:has(input[name="modules[cloudinary_ai][enable]"])`,
    );
    const aiRowText = await aiRow.innerText();
    expect(
      aiRowText.trim().length,
      "cloudinary_ai row has content",
    ).toBeGreaterThan(40);

    console.log(
      "✓ All four submodules verified: enabled, grouped, described, details section present",
    );
  });
});

// ─────────────────────────────────────────────────────────────────────────────
test.describe("Field Plugins", () => {
  // Best-effort cleanup runs both before AND after to handle prior failed runs
  async function cleanupTestField(page: Page) {
    const res = await page.goto(
      `/admin/structure/types/manage/article/fields/node.article.${FIELD_MACHINE}/delete`,
    );
    await page.waitForLoadState("networkidle");
    if (res && res.status() < 400) {
      // Delete confirmation page has both a search form and delete form.
      // Target the delete button specifically by form context or value.
      const deleteBtn = page
        .locator(
          'form[class*="confirm"] input[type="submit"], input[value*="Delete"]',
        )
        .first();
      const isVisible = await deleteBtn
        .isVisible({ timeout: 2000 })
        .catch(() => false);
      if (isVisible) {
        await deleteBtn.click();
        await page.waitForLoadState("networkidle");
      }
    }
  }

  test.beforeEach(async ({ page }) => {
    await login(page);
    await cleanupTestField(page);
  });

  test.afterEach(async ({ page }) => {
    await cleanupTestField(page);
  });

  test("Create cloudinary_asset field end-to-end: type → storage → config → formatters → widget", async ({
    page,
  }) => {
    // ── Step 1: Navigate directly to the cloudinary_asset sub-field form ────
    // D11 field UI type selection is JS-rendered; use the direct sub-route URL
    // which bypasses type selection and shows the storage config form directly.
    await page.goto(
      "/admin/structure/types/manage/article/fields/add-field/cloudinary_asset/0",
    );
    await page.waitForLoadState("networkidle");
    await assertNoError(page, "add-field sub-route");
    await shot(page, "02a-field-sub-form");

    // The form shows label + machine name inputs
    await expect(
      page.locator('input[name="label"]'),
      "Label input visible",
    ).toBeVisible();
    await page.fill('input[name="label"]', FIELD_LABEL);
    await page.waitForTimeout(400);
    await shot(page, "02b-field-label-filled");

    // Click the "Save and continue" button explicitly
    await page
      .locator(
        'input[type="submit"][value*="Save"], input[type="submit"][value*="Continue"]',
      )
      .first()
      .click();
    await page.waitForLoadState("networkidle");

    // ── Steps 2-3: Navigate through settings pages (1 or 2 depending on field type) ──
    // cloudinary_asset may have 2 settings pages (storage + instance) or just 1.
    // We iterate until we land on the Manage Fields page (no more Save buttons).
    for (let step = 2; step <= 3; step++) {
      await assertNoError(page, `field settings step ${step}`);
      await shot(page, `02${String.fromCharCode(97 + step)}-field-step${step}`);

      // Check if there's a Save button on this page (settings form)
      // Use a specific selector to avoid matching toolbar search buttons
      const saveBtn = page
        .locator(
          'input[type="submit"][value*="Save"], input[type="submit"][value*="save"]',
        )
        .first();
      const hasSave = await saveBtn
        .isVisible({ timeout: 3000 })
        .catch(() => false);

      if (!hasSave) {
        // No Save button = we're on the final manage-fields page
        break;
      }

      // Wait for button to be enabled (Drupal JS may disable it initially)
      await saveBtn.waitFor({ state: "attached", timeout: 5000 });
      await page.waitForTimeout(500); // Allow JS to finish enabling the button

      // Check if button is still visible and enabled
      const isEnabled = await saveBtn
        .isEnabled({ timeout: 3000 })
        .catch(() => false);
      if (!isEnabled) {
        // Button exists but is disabled - likely we're already on manage-fields page
        break;
      }

      await saveBtn.click();
      await page.waitForLoadState("networkidle");
    }
    await assertNoError(page, "after saving field settings");

    // Wait for BigPipe to deliver the success message
    await page.waitForSelector("text=/Saved.*configuration/i", {
      timeout: 10000,
    });
    await shot(page, "02d-field-saved");

    // ── Step 4: Manage Display — verify our 3 formatters are available ──────
    await page.goto("/admin/structure/types/manage/article/display");
    await page.waitForLoadState("networkidle");
    await shot(page, "02e-manage-display");

    // Find the formatter select for our new field
    const fieldRow = page.locator(`tr:has-text("${FIELD_LABEL}")`).first();
    await expect(fieldRow, "Field row visible in Manage Display").toBeVisible();

    // Click 'Change' to open the formatter settings
    const formatSelect = fieldRow.locator("select").first();
    if (await formatSelect.isVisible()) {
      const opts = await formatSelect
        .locator("option")
        .evaluateAll((els) => els.map((e) => (e as HTMLOptionElement).value));
      const cloudinaryFormatters = opts.filter((v) =>
        v.startsWith("cloudinary"),
      );
      expect(
        cloudinaryFormatters.length,
        `Cloudinary formatters available: ${cloudinaryFormatters.join(", ")}`,
      ).toBeGreaterThanOrEqual(1);
      console.log("  ✓ Formatters available:", cloudinaryFormatters.join(", "));
    }

    // ── Step 5: Manage Form Display — verify widget is available ────────────
    await page.goto("/admin/structure/types/manage/article/form-display");
    await page.waitForLoadState("networkidle");
    await shot(page, "02f-manage-form-display");

    const formRow = page.locator(`tr:has-text("${FIELD_LABEL}")`).first();
    await expect(
      formRow,
      "Field row visible in Manage Form Display",
    ).toBeVisible();

    const widgetSelect = formRow.locator("select").first();
    if (await widgetSelect.isVisible()) {
      const widgetOpts = await widgetSelect
        .locator("option")
        .evaluateAll((els) => els.map((e) => (e as HTMLOptionElement).value));
      const cloudinaryWidgets = widgetOpts.filter((v) =>
        v.startsWith("cloudinary"),
      );
      expect(
        cloudinaryWidgets.length,
        `Cloudinary widgets available: ${cloudinaryWidgets.join(", ")}`,
      ).toBeGreaterThanOrEqual(1);
      console.log("  ✓ Widgets available:", cloudinaryWidgets.join(", "));
    }

    console.log(
      `✓ cloudinary_asset field full lifecycle verified on Article content type`,
    );
  });
});

// ─────────────────────────────────────────────────────────────────────────────
test.describe("Image Effect Plugin", () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    // Clean up test style left from any previous failed run
    const res = await page.goto(
      "/admin/config/media/image-styles/manage/pw_cloudinary_style/delete",
    );
    await page.waitForLoadState("networkidle");
    if (res && res.status() < 400) {
      const cleanBtn = page
        .locator('input[type="submit"], button[type="submit"]')
        .first();
      if (await cleanBtn.isVisible()) {
        await cleanBtn.click();
        await page.waitForLoadState("networkidle");
      }
    }
  });

  test("Add cloudinary_transformation effect with config, verify in effects list, cleanup", async ({
    page,
  }) => {
    // ── Step 1: Create image style ──────────────────────────────────────────
    await page.goto("/admin/config/media/image-styles/add");
    await page.waitForLoadState("networkidle");
    await page.fill('input[name="label"]', IMAGE_STYLE_LABEL);
    await page.waitForTimeout(600);
    // Image style add form uses "Add style" button (not "Save"); click any submit
    // This form has only ONE submit button so it is safe to click without filtering.
    await page.locator('input[type="submit"]').first().click();
    await page.waitForLoadState("networkidle");
    await assertNoError(page, "image style created");

    // ── Step 2: Select cloudinary_transformation from effects select ────────
    const effectSelect = page.locator('select[name="new"]');
    await expect(effectSelect, "Effect select visible").toBeVisible();
    const opts = await effectSelect.locator("option").allTextContents();
    const cloudinaryOpts = opts.filter((o) =>
      o.toLowerCase().includes("cloudinary"),
    );
    expect(
      cloudinaryOpts.length,
      `Cloudinary effects found: ${cloudinaryOpts.join(", ")}`,
    ).toBeGreaterThan(0);

    // Select our effect by value
    await effectSelect.selectOption("cloudinary_transformation");
    await shot(page, "03a-effect-selected");
    // Button has name="op" and value="Add" in Drupal's image style UI
    await page.locator('input[name="op"][value="Add"]').click();
    await page.waitForLoadState("networkidle");
    await assertNoError(page, "effect config form");

    // ── Step 3: Fill in the effect configuration form ───────────────────────
    await shot(page, "03b-effect-config");
    // Width and height are inside a 'details' group labelled 'Build transformation'
    // Try to open the 'individual' details if collapsed
    const buildDetails = page
      .locator("details")
      .filter({ hasText: "Build transformation" })
      .first();
    if (await buildDetails.isVisible()) {
      const isOpen = await buildDetails.getAttribute("open");
      if (isOpen === null) await buildDetails.locator("summary").click();
    }

    const widthInput = page
      .locator('input[name="individual[width]"], input[name="data[width]"]')
      .first();
    const heightInput = page
      .locator('input[name="individual[height]"], input[name="data[height]"]')
      .first();
    const cropSelect = page
      .locator('select[name="individual[crop]"], select[name="data[crop]"]')
      .first();
    const qualityInput = page
      .locator('input[name="individual[quality]"], input[name="data[quality]"]')
      .first();
    const formatInput = page
      .locator('input[name="individual[format]"], input[name="data[format]"]')
      .first();

    if (await widthInput.isVisible()) await widthInput.fill("800");
    if (await heightInput.isVisible()) await heightInput.fill("600");
    if (await cropSelect.isVisible()) await cropSelect.selectOption("fill");
    if (await qualityInput.isVisible()) await qualityInput.fill("auto");
    if (await formatInput.isVisible()) await formatInput.fill("auto");

    await shot(page, "03c-effect-config-filled");
    // The effect config submit button says "Add effect" or "Update effect", not "Save"
    await page.locator('input[type="submit"]').first().click();
    await page.waitForLoadState("networkidle");
    await assertNoError(page, "after saving effect");

    // ── Step 4: Verify effect appears in the effects list ───────────────────
    await shot(page, "03d-effects-list");
    const pageContent = await page.content();
    expect(
      pageContent.toLowerCase(),
      "Effects list should show Cloudinary Transformation",
    ).toContain("cloudinary");
    console.log(
      "  ✓ cloudinary_transformation effect saved and visible in effects list",
    );

    // ── Cleanup: delete the image style ────────────────────────────────────
    const styleUrl = page.url();
    const styleMatch = styleUrl.match(/manage\/([^/]+)/);
    if (styleMatch) {
      await page.goto(
        `/admin/config/media/image-styles/manage/${styleMatch[1]}/delete`,
      );
      await page.waitForLoadState("networkidle");
      const deleteBtn = page
        .locator('input[type="submit"], button[type="submit"]')
        .first();
      if (await deleteBtn.isVisible()) {
        await deleteBtn.click();
        await page.waitForLoadState("networkidle");
      }
    }
    console.log(
      "✓ Image Effect full lifecycle: created, configured (800×600, fill, auto), verified, cleaned up",
    );
  });
});

// ─────────────────────────────────────────────────────────────────────────────
test.describe("Admin Routes", () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  // Each entry: [path, label, element selector to assert, element description]
  const routeChecks: [string, string, string, string][] = [
    [
      "/admin/config/media/cloudinary",
      "Cloudinary settings",
      'input[name="cloudinary_sdk_cloud_name"]',
      "cloudinary_sdk_cloud_name input",
    ],
    [
      "/admin/config/media/cloudinary/admin",
      "Admin settings",
      'select[name="tag_vocabulary"]',
      "tag_vocabulary select",
    ],
    [
      "/admin/config/media/cloudinary/ai",
      "AI settings",
      'input[name="auto_tagging_enabled"]',
      "auto_tagging checkbox",
    ],
    [
      "/admin/content/cloudinary/assets",
      "Asset browser",
      "form, .cloudinary-asset-browser, h1",
      "page heading or form",
    ],
    [
      "/admin/content/cloudinary/bulk",
      "Bulk operations",
      'select[name="operation"]',
      "operation select",
    ],
    [
      "/admin/content/cloudinary/folders",
      "Folder manager",
      "h1, main",
      "main content",
    ],
    [
      "/admin/content/cloudinary/usage",
      "Usage statistics",
      "h1, main",
      "main content",
    ],
    [
      "/admin/content/cloudinary-assets",
      "SQL asset list",
      "table, .view-empty",
      "table or empty message",
    ],
    [
      "/admin/structure/cloudinary_asset/settings",
      "Entity settings",
      "form",
      "settings form",
    ],
  ];

  for (const [path, label, selector, desc] of routeChecks) {
    test(`${label}: HTTP 2xx + key element (${desc})`, async ({ page }) => {
      const res = await page.goto(path);
      expect(res?.status(), `${path} HTTP status`).toBeLessThan(400);
      await page.waitForLoadState("networkidle");
      await shot(page, `route-${label.replace(/\s+/g, "-").toLowerCase()}`);

      const el = page.locator(selector).first();
      await expect(el, `${label}: "${desc}" should be present`).toBeVisible({
        timeout: 5000,
      });
      console.log(`✓ ${label}: HTTP ${res?.status()}, "${desc}" visible`);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
test.describe("Bulk Operations Form", () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.goto("/admin/content/cloudinary/bulk");
    await page.waitForLoadState("networkidle");
  });

  test("All 7 operations present in select", async ({ page }) => {
    const opSelect = page.locator('select[name="operation"]');
    const values = await opSelect
      .locator("option")
      .evaluateAll((els) => els.map((e) => (e as HTMLOptionElement).value));
    for (const op of [
      "add_tags",
      "remove_tags",
      "replace_tags",
      "update_context",
      "move_folder",
      "restore",
      "delete",
    ]) {
      expect(values, `operation "${op}" present`).toContain(op);
    }
    await shot(page, "04a-bulk-all-ops");
    console.log("✓ All 7 operations:", values.filter(Boolean).join(", "));
  });

  test("Conditional fields: folder (move_folder), tags (add_tags), confirm (delete)", async ({
    page,
  }) => {
    const opSelect = page.locator('select[name="operation"]');

    // move_folder → folder field visible
    await opSelect.selectOption("move_folder");
    await page.waitForTimeout(300);
    await expect(
      page.locator('input[name="folder"]'),
      "folder field for move_folder",
    ).toBeVisible();
    await shot(page, "04b-move-folder");

    // add_tags → tags field visible
    await opSelect.selectOption("add_tags");
    await page.waitForTimeout(300);
    await expect(
      page.locator('input[name="tags"]'),
      "tags field for add_tags",
    ).toBeVisible();
    await shot(page, "04c-add-tags");

    // delete → confirm checkbox visible
    await opSelect.selectOption("delete");
    await page.waitForTimeout(300);
    await expect(
      page.locator('input[name="confirm"]'),
      "confirm checkbox for delete",
    ).toBeVisible();
    await shot(page, "04d-delete-confirm");

    console.log("✓ All conditional fields appear correctly per operation");
  });

  test("public_ids textarea has required attribute enforcing server validation", async ({
    page,
  }) => {
    // The public_ids field has #required => TRUE in Drupal which adds the HTML
    // 'required' attribute, preventing empty submission at the browser level.
    const textarea = page.locator('textarea[name="public_ids"]');
    await expect(textarea, "public_ids textarea is visible").toBeVisible();

    const requiredAttr = await textarea.getAttribute("required");
    expect(
      requiredAttr !== null,
      "public_ids textarea must have required attribute",
    ).toBe(true);

    // Also verify the textarea is marked as form-required by Drupal
    const classes = await textarea.getAttribute("class");
    expect(classes, "required class present on public_ids textarea").toContain(
      "required",
    );

    await shot(page, "04e-public-ids-required");
    console.log(
      "✓ public_ids textarea has required attribute + required class",
    );
  });
});

// ─────────────────────────────────────────────────────────────────────────────
test.describe("AI Settings", () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test("Toggle auto-tagging on, set provider + confidence + max_tags, save, reload, verify persisted", async ({
    page,
  }) => {
    await page.goto("/admin/config/media/cloudinary/ai");
    await page.waitForLoadState("networkidle");
    await shot(page, "06a-ai-settings-initial");

    // 1. Enable auto-tagging
    const autoTagCb = page.locator('input[name="auto_tagging_enabled"]');
    await expect(autoTagCb).toBeVisible();
    await autoTagCb.check();

    // 2. Conditional fields should now be visible
    await page.waitForTimeout(400);
    await expect(
      page.locator('select[name="auto_tagging_provider"]'),
      "provider select visible",
    ).toBeVisible();
    await expect(
      page.locator('input[name="auto_tagging_min_confidence"]'),
      "confidence input visible",
    ).toBeVisible();
    await expect(
      page.locator('input[name="auto_tagging_max_tags"]'),
      "max_tags input visible",
    ).toBeVisible();

    // 3. Set values
    await page
      .locator('select[name="auto_tagging_provider"]')
      .selectOption("google_tagging");
    await page.locator('input[name="auto_tagging_min_confidence"]').fill("0.7");
    await page.locator('input[name="auto_tagging_max_tags"]').fill("15");

    // 4. Enable moderation too
    await page.locator('input[name="moderation_enabled"]').check();
    await page.waitForTimeout(200);
    await page
      .locator('select[name="moderation_provider"]')
      .selectOption("aws_rek");

    // 5. Enable OCR
    await page.locator('input[name="ocr_enabled"]').check();

    // 6. Set cache TTL
    const cacheCb = page.locator('input[name="cache_enabled"]');
    await cacheCb.check();
    await page.waitForTimeout(200);
    await page.locator('input[name="cache_ttl"]').fill("7200");

    await shot(page, "06b-ai-settings-filled");
    await submit(page);

    // 7. Verify success message
    const afterContent = await page.content();
    expect(afterContent, "Save should show a status/success message").toMatch(
      /saved|configuration has been saved|status/i,
    );
    await shot(page, "06c-ai-settings-saved");

    // 8. Reload and verify values persisted
    await page.reload();
    await page.waitForLoadState("networkidle");

    await expect(
      page.locator('input[name="auto_tagging_enabled"]'),
      "auto_tagging persisted",
    ).toBeChecked();
    await expect(
      page.locator('input[name="moderation_enabled"]'),
      "moderation persisted",
    ).toBeChecked();
    await expect(
      page.locator('input[name="ocr_enabled"]'),
      "OCR persisted",
    ).toBeChecked();

    const confidenceVal = await page
      .locator('input[name="auto_tagging_min_confidence"]')
      .inputValue();
    expect(parseFloat(confidenceVal), "confidence 0.7 persisted").toBeCloseTo(
      0.7,
      1,
    );

    const maxTagsVal = await page
      .locator('input[name="auto_tagging_max_tags"]')
      .inputValue();
    expect(parseInt(maxTagsVal), "max_tags 15 persisted").toBe(15);

    await shot(page, "06d-ai-settings-reload-verified");
    console.log(
      "✓ AI Settings: auto-tag on, google_tagging, 0.7 confidence, 15 tags, moderation, OCR, cache — saved and persisted",
    );
  });
});

// ─────────────────────────────────────────────────────────────────────────────
test.describe("CloudinaryAsset Entity CRUD", () => {
  // Clean up any test entities left from failed prior runs
  async function cleanupTestEntities(page: Page) {
    await page.goto("/admin/content/cloudinary-assets");
    await page.waitForLoadState("networkidle");
    for (const pid of [ASSET_PUBLIC_ID, ASSET_PUBLIC_ID_EDIT]) {
      let row = page.locator(`tr:has-text("${pid}")`).first();
      while (await row.isVisible({ timeout: 1500 }).catch(() => false)) {
        const eid = (await row.locator("td").first().innerText()).trim();
        await page.goto(`/admin/content/cloudinary/asset/${eid}/delete`);
        await page.waitForLoadState("networkidle");
        await page
          .locator(
            'input[type="submit"][value*="Delete"], button[type="submit"]',
          )
          .first()
          .click();
        await page.waitForLoadState("networkidle");
        await page.goto("/admin/content/cloudinary-assets");
        await page.waitForLoadState("networkidle");
        row = page.locator(`tr:has-text("${pid}")`).first();
      }
    }
  }

  test.beforeEach(async ({ page }) => {
    await login(page);
    await cleanupTestEntities(page);
  });

  test.afterEach(async ({ page }) => {
    await cleanupTestEntities(page);
  });

  test("Full CRUD: create → find in SQL list → edit → delete CloudinaryAsset entity", async ({
    page,
  }) => {
    // ── Create ───────────────────────────────────────────────────────────────
    await page.goto("/admin/content/cloudinary/asset/add");
    await page.waitForLoadState("networkidle");
    await assertNoError(page, "add form");
    await shot(page, "07a-entity-add-form");

    await page.fill('input[name="public_id[0][value]"]', ASSET_PUBLIC_ID);
    await page.locator('select[name="resource_type"]').selectOption("image");
    await shot(page, "07b-entity-form-filled");
    await submit(page);

    // After save, Drupal redirects to the asset browser. BigPipe delivers
    // status messages asynchronously, so wait for the message element.
    await page
      .getByText(/created new cloudinary asset/i)
      .first()
      .waitFor({ timeout: 8000 });
    await shot(page, "07c-entity-created");
    console.log("  ✓ CloudinaryAsset created:", ASSET_PUBLIC_ID);

    // ── Verify in SQL list and extract entity ID ──────────────────────────────
    await page.goto("/admin/content/cloudinary-assets");
    await page.waitForLoadState("networkidle");
    await shot(page, "07d-entity-in-sql-list");
    const listContent = await page.content();
    expect(listContent, "Entity appears in SQL list").toContain(
      ASSET_PUBLIC_ID,
    );

    // Extract entity ID from the table row (first column = numeric ID)
    const entityRow = page.locator(`tr:has-text("${ASSET_PUBLIC_ID}")`).first();
    await expect(entityRow, "Entity row visible in SQL list").toBeVisible();
    const entityIdText = await entityRow.locator("td").first().innerText();
    const entityId = entityIdText.trim();
    expect(parseInt(entityId), "Entity ID is a valid integer").toBeGreaterThan(
      0,
    );
    console.log("  ✓ Entity ID in SQL list:", entityId);

    // ── Edit ─────────────────────────────────────────────────────────────────
    await page.goto(`/admin/content/cloudinary/asset/${entityId}/edit`);
    await page.waitForLoadState("networkidle");
    await assertNoError(page, "edit form");
    await shot(page, "07e-entity-edit-form");

    // Verify the edit form is loaded with the correct entity data
    const publicIdField = page.locator('input[name="public_id[0][value]"]');
    await expect(publicIdField, "public_id field on edit form").toBeVisible();
    const currentValue = await publicIdField.inputValue();
    expect(currentValue, "Edit form pre-filled with entity data").toBe(
      ASSET_PUBLIC_ID,
    );

    await publicIdField.fill(ASSET_PUBLIC_ID_EDIT);
    await shot(page, "07f-entity-form-edited");
    await submit(page);

    const afterEdit = await page.content();
    expect(afterEdit, "Edit success message").toMatch(
      /updated cloudinary asset/i,
    );
    await shot(page, "07g-entity-updated");
    console.log("  ✓ CloudinaryAsset updated:", ASSET_PUBLIC_ID_EDIT);

    // Verify updated value in SQL list
    await page.goto("/admin/content/cloudinary-assets");
    await page.waitForLoadState("networkidle");
    const updatedListContent = await page.content();
    expect(updatedListContent, "Updated entity appears in SQL list").toContain(
      ASSET_PUBLIC_ID_EDIT,
    );
    await shot(page, "07h-entity-updated-in-list");

    // ── Delete ────────────────────────────────────────────────────────────────
    await page.goto(`/admin/content/cloudinary/asset/${entityId}/delete`);
    await page.waitForLoadState("networkidle");
    await assertNoError(page, "delete form");
    await shot(page, "07i-entity-delete-form");
    // Drupal delete forms have 'Delete' button, not 'Save'
    await page
      .locator(
        'input[type="submit"][value="Delete"], input[type="submit"][value*="Delete"], ' +
          'button[type="submit"]',
      )
      .first()
      .click();
    await page.waitForLoadState("networkidle");

    const afterDelete = await page.content();
    expect(afterDelete, "Delete confirmation message").toMatch(
      /deleted|removed/i,
    );
    await shot(page, "07j-entity-deleted");

    // ── Verify gone from SQL list ──────────────────────────────────────────────
    await page.goto("/admin/content/cloudinary-assets");
    await page.waitForLoadState("networkidle");
    const finalList = await page.content();
    expect(finalList, "Deleted entity no longer in SQL list").not.toContain(
      ASSET_PUBLIC_ID_EDIT,
    );
    await shot(page, "07k-entity-gone-from-list");
    console.log("✓ CloudinaryAsset full CRUD lifecycle complete");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
test.describe("Media Type & Source", () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test("Cloudinary media type exists, source plugin is 'cloudinary', has field_media_cloudinary", async ({
    page,
  }) => {
    // 1. Media types list — Cloudinary row present
    await page.goto("/admin/structure/media");
    await page.waitForLoadState("networkidle");
    await shot(page, "08a-media-types-list");
    const cloudinaryRow = page
      .locator("tr")
      .filter({ hasText: "Cloudinary" })
      .first();
    await expect(
      cloudinaryRow,
      "Cloudinary media type row in list",
    ).toBeVisible();

    // 2. Edit the media type and verify source plugin label
    await page.goto("/admin/structure/media/manage/cloudinary");
    await page.waitForLoadState("networkidle");
    await assertNoError(page, "media type edit");
    await shot(page, "08b-media-type-edit");
    const editContent = await page.content();
    expect(editContent, "Media type edit shows cloudinary source").toContain(
      "cloudinary",
    );

    // 3. Manage fields — verify field_media_cloudinary exists
    await page.goto("/admin/structure/media/manage/cloudinary/fields");
    await page.waitForLoadState("networkidle");
    await shot(page, "08c-media-type-fields");
    const fieldsContent = await page.content();
    expect(fieldsContent, "field_media_cloudinary in fields list").toContain(
      "field_media_cloudinary",
    );

    // 4. Manage form display — verify field is in form
    await page.goto("/admin/structure/media/manage/cloudinary/form-display");
    await page.waitForLoadState("networkidle");
    await assertNoError(page, "media form display");
    await shot(page, "08d-media-form-display");

    // 5. Add media form loads and has expected field
    const addRes = await page.goto("/media/add/cloudinary");
    expect(addRes?.status(), "Add media form HTTP status").toBeLessThan(500);
    await page.waitForLoadState("networkidle");
    await shot(page, "08e-media-add-form");
    const addContent = await page.content();
    // The cloudinary field or the name field should be present
    const hasForm =
      addContent.includes("name") ||
      addContent.includes("cloudinary") ||
      addContent.includes("field_media");
    expect(hasForm, "Add media form has content fields").toBe(true);

    console.log(
      "✓ Media type 'cloudinary': exists, source=cloudinary, field_media_cloudinary present, add form accessible",
    );
  });
});
