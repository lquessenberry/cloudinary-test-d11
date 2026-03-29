# Cloudinary Test Environment - Quick Start

## What You Have

A complete DDEV-based testing environment for advanced Cloudinary features in Drupal 9/10/11, including:

- **Upload Widget** - Full Cloudinary JS widget integration
- **AI Features** - Auto-tagging, background removal, generative AI
- **Admin API** - Asset management, search, bulk operations
- **Transformation Builder** - Complex transformation chains

## Get Started in 3 Steps

### 1. Configure Cloudinary Credentials

Add to `web/sites/default/settings.php`:

```php
$config['cloudinary.settings']['cloud_name'] = 'your-cloud-name';
$config['cloudinary.settings']['api_key'] = 'your-api-key';
$config['cloudinary.settings']['api_secret'] = 'your-api-secret';
```

Get free credentials at: https://cloudinary.com/users/register/free

### 2. Install Drupal + Modules

```bash
make install
```

This will:
- Install Drupal 11 with Standard profile
- Enable all Cloudinary test modules
- Create admin user (admin/admin)

### 3. Test Features

```bash
# Run AI features demo
ddev exec php examples/ai_features_demo.php

# Run Admin API demo
ddev exec php examples/admin_api_demo.php

# Run transformation builder demo
ddev exec php examples/transformation_builder_demo.php
```

## Test Across Drupal Versions

```bash
# Test on Drupal 11 (current)
make test-d11

# Test on Drupal 10
make test-d10

# Test on Drupal 9
make test-d9
```

## Access Your Site

- **URL:** https://cloudinary-test.ddev.site
- **Username:** admin
- **Password:** admin

## What's Next?

1. **Upload Widget** - Visit `/admin/content/media/add` to see the widget in action
2. **AI Features** - Upload images and test auto-tagging, background removal
3. **Admin API** - Browse and manage your Cloudinary assets from Drupal
4. **Transformations** - Build complex image transformations programmatically

## Documentation

- `README.md` - Overview and feature list
- `TESTING.md` - Detailed testing guide
- `FEATURES.md` - Feature documentation and API examples
- `Makefile` - All available commands

## Need Help?

```bash
# See all available commands
make help

# Check DDEV status
ddev describe

# View Drupal logs
ddev drush watchdog:show

# SSH into container
ddev ssh
```

## Module Structure

```
cloudinary-test/
├── modules/
│   ├── cloudinary_upload_widget/  # Upload widget integration
│   ├── cloudinary_ai/              # AI features (tagging, generative AI)
│   ├── cloudinary_admin/           # Admin API (search, manage assets)
│   └── cloudinary_transformations/ # Transformation builder
├── examples/                       # Demo scripts
├── tests/                          # PHPUnit tests
└── Makefile                        # Automation commands
```

## Core Switching Commands

```bash
# Switch to different Drupal versions
make switch-d11  # Drupal 11 + PHP 8.3
make switch-d10  # Drupal 10 + PHP 8.1
make switch-d9   # Drupal 9 + PHP 8.1

# After switching, reinstall
make install
```

---

**Ready to go!** Your DDEV environment is running and configured for Drupal 11. Start testing Cloudinary features or switch to a different Drupal version.
