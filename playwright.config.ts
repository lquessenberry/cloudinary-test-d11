import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright configuration for Cloudinary Drupal testing.
 */
export default defineConfig({
  testDir: "./tests/playwright",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : 1,
  reporter: "html",

  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: "https://cloudinary-test-d11.ddev.site",

    /* Full HD viewport for screenshots with audio narration */
    viewport: { width: 1920, height: 1080 },

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: "on-first-retry",

    /* Capture screenshot on failure */
    screenshot: "only-on-failure",

    /* Capture video on failure */
    video: "retain-on-failure",
  },

  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        channel: "chrome",
      },
    },
  ],

  // Use specific Chromium version
  webServer: undefined,
});
