# Cloudinary Extensions

Extension submodules for `drupal/cloudinary` (3.0.x) that add advanced features using the full Cloudinary PHP SDK.

## Architecture

These modules live as **submodules of the contrib `cloudinary` module**:

```text
web/modules/contrib/cloudinary/
  cloudinary.module           ← parent contrib module
  modules/
    cloudinary_admin/         ← Asset browser, AI, bulk ops, taxonomy, entity
    cloudinary_ai/            ← Alias to cloudinary_admin AI service
    cloudinary_transformations/ ← Transformation builder + Image Effect plugin
    cloudinary_widget/        ← JS Upload Widget form element
```

## Submodules

### `cloudinary_admin` (main)

- **Field plugins**: `cloudinary_asset` FieldType, 3 formatters (image/video/transformed), asset picker widget
- **Media source plugin**: `cloudinary` media source with full metadata
- **Admin API**: list, search, get, delete, rename, bulk ops, tag management
- **Upload Presets**: CRUD via Admin API
- **Named Transformations**: CRUD via Admin API
- **Folder management**: create/delete/list
- **Asset restore**: restore deleted assets
- **Signed uploads**: server-side signature generation
- **AI features**: auto-tagging, background removal, OCR, moderation, generative transforms
- **Taxonomy integration**: Cloudinary tags ↔ Drupal taxonomy terms
- **Media sync**: Cloudinary assets → Drupal Media entities
- **SQL entity**: `CloudinaryAsset` content entity with Views support
- **Caching**: API response cache with tag invalidation

### `cloudinary_ai`

- Service alias to `cloudinary_admin.ai` — no duplicate code
- Dependency: `cloudinary:cloudinary_admin`

### `cloudinary_transformations`

- Config-driven transformation chain builder
- **Image Effect plugin**: `cloudinary_transformation` — use Cloudinary transforms inside Drupal image styles
- Supports: resize (12 crop modes), gravity, effects (AI + classic), quality, format, radius

### `cloudinary_widget`

- `CloudinaryUploadWidget` Form Element (`#type = 'cloudinary_upload_widget'`)
- Signed upload support, multi-source, configurable presets

## DDEV Testing Workflow

### Switch Drupal Core Versions

```bash
# Test against Drupal 11
ddev core-version ^11
ddev poser
ddev restart

# Test against Drupal 10
ddev core-version ^10
ddev config --php-version=8.1
ddev restart
ddev poser

# Test against Drupal 9
ddev core-version ^9
ddev config --php-version=8.1
ddev restart
ddev poser
```

### Run Tests

```bash
ddev phpunit
ddev phpcs
ddev phpstan
```

### Install Drupal

```bash
ddev drush site:install standard --account-name=admin --account-pass=admin -y
ddev drush en cloudinary cloudinary_widget cloudinary_ai cloudinary_admin cloudinary_transformations -y
```

## Configuration

Set your Cloudinary credentials in `settings.php` or via environment variables:

```php
$config['cloudinary.settings']['cloud_name'] = 'your-cloud-name';
$config['cloudinary.settings']['api_key'] = 'your-api-key';
$config['cloudinary.settings']['api_secret'] = 'your-api-secret';
```
