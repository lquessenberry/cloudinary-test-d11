<?php

/**
 * @file
 * Demo script for Cloudinary Admin API features.
 *
 * Run with: ddev exec php examples/admin_api_demo.php
 */

use Drupal\cloudinary_admin\CloudinaryAdminService;

require_once __DIR__ . '/../web/core/includes/bootstrap.inc';

// Bootstrap Drupal
$autoloader = require_once __DIR__ . '/../web/autoload.php';
$kernel = \Drupal\Core\DrupalKernel::createFromRequest(
  \Symfony\Component\HttpFoundation\Request::createFromGlobals(),
  $autoloader,
  'prod'
);
$kernel->boot();
$container = $kernel->getContainer();

echo "=== Cloudinary Admin API Demo ===\n\n";

// Get the Admin service
$admin_service = $container->get('cloudinary_admin.service');

// Example 1: List assets
echo "1. List Assets\n";
echo "   \$assets = \$admin_service->listAssets([\n";
echo "     'resource_type' => 'image',\n";
echo "     'max_results' => 10,\n";
echo "   ]);\n\n";

// Example 2: Search assets
echo "2. Search Assets\n";
echo "   Search with expressions like:\n";
echo "   - 'resource_type:image AND tags:nature'\n";
echo "   - 'uploaded_at>1d AND format:jpg'\n";
echo "   - 'width>1000 AND height>1000'\n";
echo "   \$results = \$admin_service->searchAssets('resource_type:image AND tags:nature');\n\n";

// Example 3: Get asset details
echo "3. Get Asset Details\n";
echo "   \$asset = \$admin_service->getAsset('sample', [\n";
echo "     'colors' => true,\n";
echo "     'faces' => true,\n";
echo "   ]);\n\n";

// Example 4: Add tags
echo "4. Add Tags to Assets\n";
echo "   \$admin_service->addTags(\n";
echo "     ['public_id_1', 'public_id_2'],\n";
echo "     ['nature', 'landscape']\n";
echo "   );\n\n";

// Example 5: Remove tags
echo "5. Remove Tags from Assets\n";
echo "   \$admin_service->removeTags(\n";
echo "     ['public_id_1'],\n";
echo "     ['old_tag']\n";
echo "   );\n\n";

// Example 6: Update metadata
echo "6. Update Asset Metadata\n";
echo "   \$admin_service->updateContext(\n";
echo "     ['public_id_1'],\n";
echo "     ['alt' => 'Beautiful landscape', 'caption' => 'Sunset view']\n";
echo "   );\n\n";

// Example 7: Delete assets
echo "7. Delete Assets\n";
echo "   Single: \$admin_service->deleteAsset('public_id');\n";
echo "   By prefix: \$admin_service->deleteAssetsByPrefix('folder/');\n";
echo "   By tag: \$admin_service->deleteAssetsByTag('temp');\n\n";

// Example 8: Get usage
echo "8. Get Usage Statistics\n";
echo "   \$usage = \$admin_service->getUsage();\n";
echo "   // Returns bandwidth, storage, transformations, etc.\n\n";

// Example 9: List folders
echo "9. List Folders\n";
echo "   \$folders = \$admin_service->listFolders();\n";
echo "   \$subfolders = \$admin_service->listSubfolders('parent_folder');\n\n";

echo "=== Demo Complete ===\n";
echo "Note: To use these features, configure Cloudinary credentials in settings.php\n";
