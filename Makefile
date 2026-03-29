.PHONY: help install test-d11 test-d10 test-d9 switch-d11 switch-d10 switch-d9 phpunit phpcs phpstan clean tutorial tutorial-narrate tutorial-record tutorial-assemble

help:
	@echo "Cloudinary Test Module - DDEV Commands"
	@echo ""
	@echo "Core Switching:"
	@echo "  make switch-d11    - Switch to Drupal 11 (PHP 8.3)"
	@echo "  make switch-d10    - Switch to Drupal 10 (PHP 8.1)"
	@echo "  make switch-d9     - Switch to Drupal 9 (PHP 8.1)"
	@echo ""
	@echo "Testing:"
	@echo "  make test-d11      - Full test suite on Drupal 11"
	@echo "  make test-d10      - Full test suite on Drupal 10"
	@echo "  make test-d9       - Full test suite on Drupal 9"
	@echo "  make phpunit       - Run PHPUnit tests"
	@echo "  make phpcs         - Run PHP CodeSniffer"
	@echo "  make phpstan       - Run PHPStan"
	@echo ""
	@echo "Installation:"
	@echo "  make install       - Install Drupal + enable modules"
	@echo "  make clean         - Clean database and start fresh"
	@echo ""
	@echo "Tutorial Video:"
	@echo "  make tutorial          - Full pipeline: Piper → Playwright → MP4"
	@echo "  make tutorial-narrate  - Generate Piper TTS audio only"
	@echo "  make tutorial-record   - Run Playwright recording only"
	@echo "  make tutorial-assemble - FFmpeg assembly only"

switch-d11:
	@echo "Switching to Drupal 11..."
	ddev core-version ^11
	ddev config --php-version=8.3
	ddev restart
	ddev poser
	@echo "✓ Switched to Drupal 11 with PHP 8.3"

switch-d10:
	@echo "Switching to Drupal 10..."
	ddev core-version ^10
	ddev config --php-version=8.1
	ddev restart
	ddev poser
	@echo "✓ Switched to Drupal 10 with PHP 8.1"

switch-d9:
	@echo "Switching to Drupal 9..."
	ddev core-version ^9
	ddev config --php-version=8.1
	ddev restart
	ddev poser
	@echo "✓ Switched to Drupal 9 with PHP 8.1"

install:
	@echo "Installing Drupal and enabling Cloudinary modules..."
	ddev drush site:install standard --account-name=admin --account-pass=admin -y
	ddev drush en cloudinary cloudinary_stream_wrapper cloudinary_sdk -y
	ddev drush en cloudinary_admin cloudinary_ai cloudinary_transformations cloudinary_widget -y
	@echo "✓ Installation complete"
	@echo "  URL: https://cloudinary-test-d11.ddev.site"
	@echo "  User: admin"
	@echo "  Pass: admin"
	@echo ""
	@echo "  Submodules path: web/modules/contrib/cloudinary/modules/"

module-paths:
	@ddev drush php:eval "foreach (['cloudinary_admin','cloudinary_ai','cloudinary_transformations','cloudinary_widget'] as \$$m) { echo \$$m . ': ' . \Drupal::service('extension.list.module')->getPath(\$$m) . PHP_EOL; }"

test-d11: switch-d11 install phpunit phpcs phpstan
	@echo "✓ Drupal 11 testing complete"

test-d10: switch-d10 install phpunit phpcs phpstan
	@echo "✓ Drupal 10 testing complete"

test-d9: switch-d9 install phpunit phpcs phpstan
	@echo "✓ Drupal 9 testing complete"

phpunit:
	@echo "Running PHPUnit tests..."
	ddev phpunit

phpcs:
	@echo "Running PHP CodeSniffer..."
	ddev phpcs

phpstan:
	@echo "Running PHPStan..."
	ddev phpstan

clean:
	@echo "Cleaning database..."
	ddev drush sql:drop -y
	@echo "✓ Database cleaned"

tutorial:
	@echo "Starting full tutorial video pipeline..."
	bash scripts/tutorial/run-tutorial.sh all

tutorial-narrate:
	@echo "Generating Piper narration audio..."
	bash scripts/tutorial/run-tutorial.sh narrate

tutorial-record:
	@echo "Running Playwright tutorial recording..."
	bash scripts/tutorial/run-tutorial.sh record

tutorial-assemble:
	@echo "Assembling tutorial video with FFmpeg..."
	bash scripts/tutorial/run-tutorial.sh assemble
