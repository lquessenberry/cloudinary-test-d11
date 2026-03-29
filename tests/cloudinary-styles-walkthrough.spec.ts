import { expect, test } from "@playwright/test";

test.describe("Cloudinary Image Styles Walkthrough", () => {
  test.beforeEach(async ({ page }) => {
    // Login to Drupal
    await page.goto("/user/login");

    // Fill in login form
    await page.locator("#edit-name").fill("admin");
    await page.locator("#edit-pass").fill("admin");
    await page.locator("#edit-submit").click();

    // Wait for login to complete - check for either admin content or user page
    await page.waitForURL(/\/admin\/content|\/user\/\d+/, { timeout: 10000 });

    // If we're on the user page, navigate to admin content
    if (page.url().includes("/user/")) {
      await page.goto("/admin/content");
      await page.waitForLoadState("networkidle");
    }
  });

  test("Cloudinary styles preview and transformation showcase", async ({
    page,
  }) => {
    // Navigate to image styles
    await page.goto("/admin/config/media/image-styles");

    // Test key Cloudinary styles
    const cloudinaryStyles = [
      { name: "cld_fill", description: "Fill crop with auto gravity" },
      { name: "cld_thumb", description: "Thumbnail with face detection" },
      { name: "cld_fx_grayscale", description: "Grayscale effect" },
      { name: "cld_fx_sepia", description: "Sepia tone effect" },
      { name: "cld_fx_oil_paint", description: "Oil paint artistic effect" },
      { name: "cld_fx_blur", description: "Blur effect" },
      { name: "cld_fx_cartoonify", description: "Cartoonify effect" },
      { name: "cld_adj_sharpen", description: "Sharpen adjustment" },
      { name: "cld_adj_vibrance", description: "Vibrance adjustment" },
      {
        name: "cld_chain_fill_bw_vignette",
        description: "Chain: fill + grayscale + vignette",
      },
      {
        name: "cld_chain_circle_avatar",
        description: "Chain: circle avatar with outline",
      },
      {
        name: "cld_chain_duotone_warm",
        description: "Chain: warm duotone effect",
      },
    ];

    for (const style of cloudinaryStyles) {
      console.log(`Testing style: ${style.name} - ${style.description}`);

      // Navigate to the style edit page
      await page.goto(`/admin/config/media/image-styles/manage/${style.name}`);

      // Wait for page to load
      await page.waitForLoadState("networkidle");

      // Verify we're on the correct page - check for either machine name or label
      const pageTitle = page.locator("h1");
      await expect(pageTitle).toBeVisible();
      const titleText = await pageTitle.textContent();
      expect(titleText).toContain(
        style.name
          .replace("cld_", "Cloudinary: ")
          .replace("_", " ")
          .replace(/\b\w/g, (l) => l.toUpperCase()),
      );

      // Check for Cloudinary transformation effect
      const cloudinaryEffect = page.locator("text=Cloudinary transformation");
      await expect(cloudinaryEffect).toBeVisible();

      // Expand the Cloudinary transformation effect if collapsed
      const effectDetails = page.locator(
        'details:has-text("Cloudinary transformation")',
      );
      if ((await effectDetails.getAttribute("open")) === null) {
        await effectDetails.locator("summary").click();
      }

      // Take a screenshot for visual documentation
      await page.screenshot({
        path: `docs/screenshots/cloudinary-style-${style.name}.png`,
        fullPage: false,
      });

      // Check the preview section
      const previewSection = page.locator(".image-style-preview");
      if ((await previewSection.count()) > 0) {
        // Verify preview images are loaded
        const originalImage = previewSection.locator('img[alt*="Original"]');
        const derivativeImage = previewSection.locator(
          'img[alt*="Derivative"]',
        );

        if ((await originalImage.count()) > 0) {
          await expect(originalImage).toBeVisible();
          // Verify it's a Cloudinary URL
          const originalSrc = await originalImage.getAttribute("src");
          expect(originalSrc).toContain("res.cloudinary.com");
        }

        if ((await derivativeImage.count()) > 0) {
          await expect(derivativeImage).toBeVisible();
          // Verify it's a Cloudinary URL with transformations
          const derivativeSrc = await derivativeImage.getAttribute("src");
          expect(derivativeSrc).toContain("res.cloudinary.com");

          // Check for transformation parameters based on style type
          if (style.name.includes("fill")) {
            expect(derivativeSrc).toMatch(/c_fill/);
          }
          if (style.name.includes("thumb")) {
            expect(derivativeSrc).toMatch(/c_thumb/);
          }
          if (style.name.includes("grayscale")) {
            expect(derivativeSrc).toMatch(/e_grayscale/);
          }
          if (style.name.includes("sepia")) {
            expect(derivativeSrc).toMatch(/e_sepia/);
          }
          if (style.name.includes("oil_paint")) {
            expect(derivativeSrc).toMatch(/e_oil_paint/);
          }
          if (style.name.includes("blur")) {
            expect(derivativeSrc).toMatch(/e_blur/);
          }
          if (style.name.includes("cartoonify")) {
            expect(derivativeSrc).toMatch(/e_cartoonify/);
          }
        }

        // Check dimension labels
        const dimensionLabels = previewSection.locator(
          ".width span, .height span",
        );
        console.log(`Dimensions for ${style.name}:`);
        for (let i = 0; i < (await dimensionLabels.count()); i++) {
          const label = await dimensionLabels.nth(i).textContent();
          console.log(`  ${label}`);
        }
      }

      // Small delay between styles for better documentation
      await page.waitForTimeout(1000);
    }
  });

  test("Create and test a custom Cloudinary style", async ({ page }) => {
    // Navigate to add new image style
    await page.goto("/admin/config/media/image-styles/add");

    // Fill in the style details
    const styleName = "test_demo_style";
    const styleLabel = "Test Demo Style";

    await page.locator("#edit-label").fill(styleLabel);

    // The machine name field might be auto-generated or hidden, try to fill it if visible
    const nameField = page.locator("#edit-name");
    if (await nameField.isVisible()) {
      await nameField.fill(styleName);
    } else {
      // If machine name field is not visible, it's likely auto-generated from label
      console.log(
        "Machine name field not visible, using auto-generated from label",
      );
    }

    // Add a Cloudinary transformation effect
    await page.locator('button:has-text("Add effect")').click();
    await page
      .locator('select[name="new"]')
      .selectOption({ label: "Cloudinary transformation" });
    await page.locator('input[value*="Add"]').click();

    // Wait for the effect form to appear
    await page.waitForSelector('details:has-text("Cloudinary transformation")');

    // Configure the transformation
    await page
      .locator('details:has-text("Cloudinary transformation") summary')
      .click();

    // Set width and height
    await page.locator('input[name="individual[width]"]').fill("400");
    await page.locator('input[name="individual[height]"]').fill("300");

    // Set crop mode
    await page.locator('select[name="individual[crop]"]').selectOption("fill");

    // Add an effect
    await page
      .locator('select[name="individual[effect]"]')
      .selectOption("grayscale");

    // Save the style
    await page.locator('input[value*="Save"]').click();

    // Verify the style was created
    await expect(page.locator("text=has been created")).toBeVisible();

    // Test the new style
    await page.goto(`/admin/config/media/image-styles/manage/${styleName}`);

    // Take screenshot of the new style
    await page.screenshot({
      path: `docs/screenshots/cloudinary-custom-style-${styleName}.png`,
      fullPage: false,
    });

    // Verify the preview works
    const previewSection = page.locator(".image-style-preview");
    await expect(previewSection).toBeVisible();

    const derivativeImage = previewSection.locator('img[alt*="Derivative"]');
    await expect(derivativeImage).toBeVisible();

    // Verify the transformation URL
    const derivativeSrc = await derivativeImage.getAttribute("src");
    expect(derivativeSrc).toContain("res.cloudinary.com");
    expect(derivativeSrc).toMatch(/w_400,h_300,c_fill,e_grayscale/);

    console.log(`Created and tested custom style: ${styleName}`);
    console.log(`Transformation URL: ${derivativeSrc}`);
  });

  test("Visual regression test for Cloudinary previews", async ({ page }) => {
    // Test a few key styles for visual consistency
    const visualTestStyles = [
      "cld_fill",
      "cld_thumb",
      "cld_fx_grayscale",
      "cld_chain_circle_avatar",
    ];

    for (const styleName of visualTestStyles) {
      await page.goto(`/admin/config/media/image-styles/manage/${styleName}`);
      await page.waitForLoadState("networkidle");

      // Wait for images to load
      await page.waitForSelector('img[alt*="Derivative"]');
      await page.waitForFunction(() => {
        const img = document.querySelector(
          'img[alt*="Derivative"]',
        ) as HTMLImageElement;
        return img && img.complete;
      });

      // Take a screenshot for visual comparison
      await page.locator(".image-style-preview").screenshot({
        path: `tests/visual-regression/cloudinary-${styleName}-preview.png`,
      });

      console.log(`Visual test captured for: ${styleName}`);
    }
  });
});
