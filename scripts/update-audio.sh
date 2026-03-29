#!/bin/bash

# Update audio for the changed narrations
VOICE_MODEL="$HOME/.local/share/piper/voices/en_US-lessac-medium.onnx"
AUDIO_DIR="screenshots/release-blog/narrated-interactive/audio"

echo "🎙️  Updating audio narrations..."

# Step 01 - Updated
echo "Welcome to the Cloudinary Admin module for Drupal 11. This is the main configuration page where you set up your Cloudinary connection." | \
piper --model "$VOICE_MODEL" --output_file "$AUDIO_DIR/step-01.mp3" 2>/dev/null
echo "✓ step-01.mp3"

# Step 02 - Updated
echo "The Cloudinary Admin module provides a powerful interface for managing your cloud-based media assets directly from your Drupal site. Configure your API credentials here." | \
piper --model "$VOICE_MODEL" --output_file "$AUDIO_DIR/step-02.mp3" 2>/dev/null
echo "✓ step-02.mp3"

# Step 04 - Updated (was step-01 of asset browser)
echo "From the Cloudinary settings, navigate to Content in the admin toolbar to access your assets." | \
piper --model "$VOICE_MODEL" --output_file "$AUDIO_DIR/step-04.mp3" 2>/dev/null
echo "✓ step-04.mp3"

# Step 07 - Updated (was step-05 of asset browser)
echo "The asset list displays your media files with metadata and action buttons for managing your Cloudinary library." | \
piper --model "$VOICE_MODEL" --output_file "$AUDIO_DIR/step-07.mp3" 2>/dev/null
echo "✓ step-07.mp3"

# Step 08 - Updated (search)
echo "The asset browser includes powerful search and filter tools. Use these controls to find specific assets by name, type, tags, or other criteria." | \
piper --model "$VOICE_MODEL" --output_file "$AUDIO_DIR/step-08.mp3" 2>/dev/null
echo "✓ step-08.mp3"

echo ""
echo "✅ Audio files updated!"
