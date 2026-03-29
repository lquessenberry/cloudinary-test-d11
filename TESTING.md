# Testing Guide for Cloudinary Module

## Quick Start

```bash
# 1. Start DDEV (already done)
ddev start

# 2. Install Drupal 11 + modules
make install

# 3. Configure Cloudinary credentials
# Add to web/sites/default/settings.php:
$config['cloudinary.settings']['cloud_name'] = 'your-cloud-name';
$config['cloudinary.settings']['api_key'] = 'your-api-key';
$config['cloudinary.settings']['api_secret'] = 'your-api-secret';
```

## Testing Across Drupal Versions

### Test on Drupal 11 (Current)
```bash
make test-d11
```

### Test on Drupal 10
```bash
make test-d10
```

### Test on Drupal 9
```bash
make test-d9
```

## Manual Core Switching

```bash
# Switch to Drupal 10
make switch-d10
make install

# Switch back to Drupal 11
make switch-d11
make install
```

## Running Individual Tests

```bash
# PHPUnit
ddev phpunit

# PHP CodeSniffer
ddev phpcs

# PHPStan
ddev phpstan
```

## Testing Individual Features

### 1. Upload Widget
```bash
# Enable the module
ddev drush en cloudinary_upload_widget -y

# Test in browser at:
# https://cloudinary-test.ddev.site/admin/content/media/add
```

### 2. AI Features
```bash
# Enable the module
ddev drush en cloudinary_ai -y

# Run the demo script
ddev exec php examples/ai_features_demo.php
```

### 3. Admin API
```bash
# Enable the module
ddev drush en cloudinary_admin -y

# Run the demo script
ddev exec php examples/admin_api_demo.php
```

### 4. Transformation Builder
```bash
# Enable the module
ddev drush en cloudinary_transformations -y

# Run the demo script
ddev exec php examples/transformation_builder_demo.php
```

## Testing with Real Cloudinary Account

1. Sign up for a free Cloudinary account at https://cloudinary.com
2. Get your credentials from the dashboard
3. Add them to `settings.php` as shown above
4. Upload test images via the Cloudinary dashboard
5. Use the demo scripts to test transformations

## Common Test Scenarios

### Upload with AI Auto-Tagging
```php
$ai_service = \Drupal::service('cloudinary_ai.service');
$result = $ai_service->uploadWithAutoTagging('/path/to/image.jpg');
print_r($result['info']['tags']);
```

### Search Assets
```php
$admin_service = \Drupal::service('cloudinary_admin.service');
$results = $admin_service->searchAssets('resource_type:image AND tags:nature');
print_r($results);
```

### Build Complex Transformation
```php
$builder = \Drupal::service('cloudinary_transformations.builder');
$config = [
  ['type' => 'resize', 'method' => 'fill', 'width' => 800, 'height' => 600],
  ['type' => 'effect', 'effect' => 'generative_fill'],
];
$transformation = $builder->buildFromConfig($config);
$url = $builder->getUrl('sample', $transformation);
echo $url;
```

## Debugging

### Check Service Availability
```bash
ddev drush eval "print_r(\Drupal::service('cloudinary_ai.service'));"
```

### Check Cloudinary Connection
```bash
ddev drush eval "print_r(\Drupal::config('cloudinary.settings')->get());"
```

### View Logs
```bash
ddev drush watchdog:show --count=50
```

## CI/CD Testing

The project includes a Makefile for automated testing across all Drupal versions:

```bash
# Test all versions sequentially
make test-d11 && make test-d10 && make test-d9
```

For GitLab CI, add to `.gitlab-ci.yml`:

```yaml
test:d11:
  script:
    - make test-d11

test:d10:
  script:
    - make test-d10

test:d9:
  script:
    - make test-d9
```
