<?php

namespace Drupal\Tests\cloudinary_test\Functional;

use Drupal\Tests\BrowserTestBase;

/**
 * Tests Cloudinary Admin API features.
 *
 * @group cloudinary_test
 */
class CloudinaryAdminTest extends BrowserTestBase {

  /**
   * {@inheritdoc}
   */
  protected $defaultTheme = 'stark';

  /**
   * {@inheritdoc}
   */
  protected static $modules = [
    'cloudinary_test',
    'cloudinary_admin',
    'media',
  ];

  /**
   * Test Admin service is available.
   */
  public function testAdminServiceExists() {
    $service = \Drupal::service('cloudinary_admin.service');
    $this->assertNotNull($service, 'Cloudinary Admin service should be available');
  }

  /**
   * Test admin methods exist.
   */
  public function testAdminMethods() {
    $service = \Drupal::service('cloudinary_admin.service');
    
    $this->assertTrue(
      method_exists($service, 'listAssets'),
      'Service should have listAssets method'
    );
    
    $this->assertTrue(
      method_exists($service, 'searchAssets'),
      'Service should have searchAssets method'
    );
    
    $this->assertTrue(
      method_exists($service, 'deleteAsset'),
      'Service should have deleteAsset method'
    );
    
    $this->assertTrue(
      method_exists($service, 'addTags'),
      'Service should have addTags method'
    );
  }

}
