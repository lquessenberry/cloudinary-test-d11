# Playwright Testing for Cloudinary Admin

## Overview

Automated end-to-end testing for the Cloudinary Admin module using Playwright.

## Setup Complete ✅

- **Playwright installed**: v1.58.2
- **Admin user created**: `admin` / `admin`
- **Test suite created**: 8 comprehensive tests
- **All tests passing**: 8/8 (100%)

## Test Results

```bash
Running 8 tests using 1 worker
  ✓ should access Cloudinary settings page
  ✓ should access asset browser
  ✓ should access usage statistics
  ✓ should access folder manager
  ✓ should access bulk operations
  ✓ should access admin settings
  ✓ should access modules page
  ✓ should access content page

  8 passed (17.0s)
```

## Running Tests

```bash
# Run all tests
npm test

# Run with UI (interactive mode)
npm run test:ui

# Run in headed mode (see browser)
npm run test:headed

# Debug tests
npm run test:debug

# View last report
npm run test:report

# Run specific test
npx playwright test cloudinary-admin-simple.spec.ts --grep "asset browser"
```

## Test Files

- **Config**: `playwright.config.ts`
- **Tests**: `tests/playwright/cloudinary-admin-simple.spec.ts`
- **Auth Setup**: `tests/playwright/auth.setup.ts` (not currently used)

## What's Tested

### Cloudinary Admin UI Routes
- `/admin/config/media/cloudinary` - Main settings
- `/admin/content/cloudinary/assets` - Asset browser
- `/admin/content/cloudinary/usage` - Usage statistics
- `/admin/content/cloudinary/folders` - Folder management
- `/admin/content/cloudinary/bulk` - Bulk operations
- `/admin/config/media/cloudinary/admin` - Admin settings

### Core Drupal Pages
- `/admin/modules` - Module management
- `/admin/content` - Content overview

## Authentication

Tests use a persistent admin account:
- **Username**: `admin`
- **Password**: `admin`
- **Created via**: `ddev drush user:create admin --mail="admin@example.com" --password="admin"`
- **Role**: Administrator

## Key Fixes Applied

1. **Admin user creation** - Tests require consistent credentials
2. **Routing fix** - Asset detail route now accepts public_ids with slashes (`public_id: '.+'`)
3. **CloudinaryAdminService** - Fixed API response handling with `getArrayCopy()`
4. **Search API integration** - Properly integrated Cloudinary Search API
5. **Error handling** - All controllers have try/catch blocks

## Browser Configuration

- **Browser**: Chromium (Desktop Chrome)
- **Base URL**: `https://cloudinary-test-d11.ddev.site`
- **Screenshots**: On failure only
- **Videos**: Retained on failure
- **Trace**: On first retry

## CI/CD Ready

The test suite is configured for CI/CD:
- Retries on failure (2 retries in CI)
- HTML reports generated
- Screenshots and videos captured
- Single worker for consistency

## Next Steps

To add more tests:

1. Create new test files in `tests/playwright/`
2. Follow the pattern in `cloudinary-admin-simple.spec.ts`
3. Use the `beforeEach` hook for authentication
4. Test user interactions, form submissions, API responses

## Troubleshooting

### Tests failing with "not logged in"
```bash
# Verify admin user exists
ddev drush user:information admin

# Reset password if needed
ddev drush user:password admin admin
```

### Tests timing out
- Increase timeout in `playwright.config.ts`
- Check DDEV is running: `ddev status`
- Verify site is accessible: `ddev launch`

### Cloudinary API errors
- Check credentials in `/admin/config/media/cloudinary`
- Verify API keys are valid
- Check Cloudinary account status

## Files Modified

- `package.json` - Added Playwright scripts
- `.gitignore` - Added Playwright artifacts
- `playwright.config.ts` - Test configuration
- `modules/cloudinary_admin/cloudinary_admin.routing.yml` - Fixed routing
- `modules/cloudinary_admin/src/CloudinaryAdminService.php` - Fixed API handling
- `modules/cloudinary_admin/src/Controller/AssetBrowserController.php` - Fixed search params
