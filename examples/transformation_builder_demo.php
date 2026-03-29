<?php

/**
 * @file
 * Demo script for Cloudinary Transformation Builder.
 *
 * Run with: ddev exec php examples/transformation_builder_demo.php
 */

use Drupal\cloudinary_transformations\CloudinaryTransformationBuilder;

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

echo "=== Cloudinary Transformation Builder Demo ===\n\n";

// Get the transformation builder
$builder = $container->get('cloudinary_transformations.builder');

// Example 1: Simple resize + effect
echo "1. Simple Resize + Grayscale\n";
$config = [
  ['type' => 'resize', 'method' => 'fill', 'width' => 800, 'height' => 600],
  ['type' => 'effect', 'effect' => 'grayscale'],
  ['type' => 'delivery', 'format' => 'auto', 'quality' => 'auto'],
];
$transformation = $builder->buildFromConfig($config);
$url = $builder->getUrl('sample', $transformation);
echo "   URL: $url\n\n";

// Example 2: Thumbnail with rounded corners
echo "2. Thumbnail with Rounded Corners\n";
$config = [
  ['type' => 'resize', 'method' => 'thumb', 'width' => 300, 'height' => 300, 'gravity' => 'face'],
  ['type' => 'border', 'width' => 5, 'color' => 'white', 'round_corners' => 20],
];
$transformation = $builder->buildFromConfig($config);
$url = $builder->getUrl('sample', $transformation);
echo "   URL: $url\n\n";

// Example 3: Artistic effects
echo "3. Artistic Effects (Oil Paint + Vignette)\n";
$config = [
  ['type' => 'resize', 'method' => 'fit', 'width' => 1200, 'height' => 800],
  ['type' => 'effect', 'effect' => 'oil_paint', 'strength' => 40],
  ['type' => 'effect', 'effect' => 'vignette', 'strength' => 30],
  ['type' => 'adjust', 'saturation' => 20, 'contrast' => 10],
];
$transformation = $builder->buildFromConfig($config);
$url = $builder->getUrl('sample', $transformation);
echo "   URL: $url\n\n";

// Example 4: AI-powered transformations
echo "4. AI Background Removal + Generative Fill\n";
$config = [
  ['type' => 'effect', 'effect' => 'background_removal'],
  ['type' => 'resize', 'method' => 'fill', 'width' => 1920, 'height' => 1080],
  ['type' => 'effect', 'effect' => 'generative_fill'],
];
$transformation = $builder->buildFromConfig($config);
$url = $builder->getUrl('sample', $transformation);
echo "   URL: $url\n\n";

// Example 5: Generative replace
echo "5. Generative Replace (Change Objects)\n";
$config = [
  ['type' => 'effect', 'effect' => 'generative_replace', 'from' => 'sky', 'to' => 'sunset sky'],
];
$transformation = $builder->buildFromConfig($config);
$url = $builder->getUrl('sample', $transformation);
echo "   URL: $url\n\n";

// Example 6: Complex adjustment chain
echo "6. Complex Color Adjustments\n";
$config = [
  ['type' => 'resize', 'method' => 'scale', 'width' => 1000],
  ['type' => 'adjust', 'brightness' => 10, 'contrast' => 15, 'saturation' => -10, 'hue' => 5],
  ['type' => 'effect', 'effect' => 'sepia', 'level' => 50],
  ['type' => 'delivery', 'format' => 'webp', 'quality' => 85],
];
$transformation = $builder->buildFromConfig($config);
$url = $builder->getUrl('sample', $transformation);
echo "   URL: $url\n\n";

// Example 7: Responsive image with DPR
echo "7. Responsive Image (2x DPR)\n";
$config = [
  ['type' => 'resize', 'method' => 'fill', 'width' => 400, 'height' => 300],
  ['type' => 'delivery', 'format' => 'auto', 'quality' => 'auto', 'dpr' => 2.0],
];
$transformation = $builder->buildFromConfig($config);
$url = $builder->getUrl('sample', $transformation);
echo "   URL: $url\n\n";

echo "=== Demo Complete ===\n";
echo "All transformations are built using the Cloudinary PHP SDK\n";
echo "and can be applied to any public_id in your Cloudinary account.\n";
