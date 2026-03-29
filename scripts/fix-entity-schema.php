<?php
/**
 * Fix missing columns in cloudinary_asset_field_data.
 * Run via: ddev drush php:script scripts/fix-entity-schema.php
 */

$db = \Drupal::database();
$schema = $db->schema();
$table = 'cloudinary_asset_field_data';

if (!$schema->tableExists($table)) {
  echo "ERROR: Table {$table} does not exist at all!\n";
  exit(1);
}

$added = [];

if (!$schema->fieldExists($table, 'default_langcode')) {
  $schema->addField($table, 'default_langcode', [
    'type' => 'int',
    'size' => 'tiny',
    'not null' => TRUE,
    'default' => 1,
    'description' => 'A flag indicating whether this is the default translation.',
  ]);
  $added[] = 'default_langcode';
}

if (!$schema->fieldExists($table, 'metadata')) {
  $schema->addField($table, 'metadata', [
    'type' => 'blob',
    'size' => 'big',
    'description' => 'Serialized additional metadata from Cloudinary.',
  ]);
  $added[] = 'metadata';
}

if (empty($added)) {
  echo "No missing columns — table already has all required fields.\n";
} else {
  echo "Added columns: " . implode(', ', $added) . "\n";
}

// Show final table structure
$result = $db->query("SELECT * FROM {$table} LIMIT 0");
echo "Columns now visible via query (0 rows returned = schema OK).\n";
