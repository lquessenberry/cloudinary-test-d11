<?php

namespace Drupal\Tests\cloudinary_test\Functional;

use Drupal\Tests\BrowserTestBase;

/**
 * Tests Cloudinary AI features.
 *
 * @group cloudinary_test
 */
class CloudinaryAiTest extends BrowserTestBase {

  /**
   * {@inheritdoc}
   */
  protected $defaultTheme = 'stark';

  /**
   * {@inheritdoc}
   */
  protected static $modules = [
    'cloudinary_test',
    'cloudinary_ai',
    'media',
  ];

  /**
   * Test AI service is available.
   */
  public function testAiServiceExists() {
    $service = \Drupal::service('cloudinary_ai.service');
    $this->assertNotNull($service, 'Cloudinary AI service should be available');
  }

  /**
   * Test transformation methods exist.
   */
  public function testTransformationMethods() {
    $service = \Drupal::service('cloudinary_ai.service');
    
    $this->assertTrue(
      method_exists($service, 'applyGenerativeFill'),
      'Service should have applyGenerativeFill method'
    );
    
    $this->assertTrue(
      method_exists($service, 'applyGenerativeReplace'),
      'Service should have applyGenerativeReplace method'
    );
    
    $this->assertTrue(
      method_exists($service, 'applyGenerativeRemove'),
      'Service should have applyGenerativeRemove method'
    );
  }

}
