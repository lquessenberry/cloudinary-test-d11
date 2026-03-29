<?php

/**
 * @file
 * Demo script for Cloudinary AI features.
 *
 * Run with: ddev exec php examples/ai_features_demo.php
 */

use Drupal\cloudinary_ai\CloudinaryAiService;

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

echo "=== Cloudinary AI Features Demo ===\n\n";

// Get the AI service
$ai_service = $container->get('cloudinary_ai.service');

// Example 1: Upload with auto-tagging
echo "1. Upload with Auto-Tagging\n";
echo "   This would upload an image and get AI-generated tags\n";
echo "   Example: \$ai_service->uploadWithAutoTagging('/path/to/image.jpg');\n\n";

// Example 2: Background removal
echo "2. Background Removal\n";
echo "   Remove background using Cloudinary AI\n";
echo "   Example: \$ai_service->uploadWithBackgroundRemoval('/path/to/image.jpg', 'cloudinary_ai');\n\n";

// Example 3: Generative fill
echo "3. Generative Fill\n";
echo "   Expand image with AI-generated content\n";
$url = $ai_service->applyGenerativeFill('sample', 1200, 800);
echo "   URL: $url\n\n";

// Example 4: Generative replace
echo "4. Generative Replace\n";
echo "   Replace objects in image with AI\n";
$url = $ai_service->applyGenerativeReplace('sample', 'sky', 'sunset');
echo "   URL: $url\n\n";

// Example 5: Generative remove
echo "5. Generative Remove\n";
echo "   Remove objects from image with AI\n";
$url = $ai_service->applyGenerativeRemove('sample', 'person');
echo "   URL: $url\n\n";

// Example 6: Generative restore
echo "6. Generative Restore\n";
echo "   Restore old/damaged photos with AI\n";
$url = $ai_service->applyGenerativeRestore('sample');
echo "   URL: $url\n\n";

// Example 7: Generative recolor
echo "7. Generative Recolor\n";
echo "   Recolor specific objects with AI\n";
$url = $ai_service->applyGenerativeRecolor('sample', 'shirt', 'blue');
echo "   URL: $url\n\n";

echo "=== Demo Complete ===\n";
echo "Note: To actually upload files, you need to:\n";
echo "1. Configure Cloudinary credentials in settings.php\n";
echo "2. Provide real image file paths\n";
echo "3. Have appropriate Cloudinary plan for AI features\n";
