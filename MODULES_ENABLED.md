# Cloudinary Modules (Drupal 11)

All modules are **already enabled** via drush:

✅ **Enabled Modules:**
- Cloudinary (base module)
- Cloudinary Widget
- Cloudinary AI
- Cloudinary Admin
- Cloudinary Transformations

## Access

- **URL:** https://cloudinary-test-d11.ddev.site
- **Admin:** `admin` / `MFnHPmUoWLFg2wBB`

## Configure Cloudinary

Configure your credentials at:
https://cloudinary-test-d11.ddev.site/admin/config/media/cloudinary

Or add to `web/sites/default/settings.php`:

```php
$config['cloudinary.settings']['cloud_name'] = 'your-cloud-name';
$config['cloudinary.settings']['api_key'] = 'your-api-key';
$config['cloudinary.settings']['api_secret'] = 'your-api-secret';
```

## Verify Modules

```bash
cd ~/Custom\ Apps/cloudinary-test-d11
ddev drush pm:list --type=module --status=enabled --filter=cloudinary
```
