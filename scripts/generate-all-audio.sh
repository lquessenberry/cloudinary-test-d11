#!/bin/bash

VOICE_MODEL="$HOME/.local/share/piper/voices/en_US-lessac-medium.onnx"
BASE_DIR="screenshots/release-blog/narrated-interactive"
AUDIO_DIR="$BASE_DIR/audio"

mkdir -p "$AUDIO_DIR"

echo "🎙️  Generating audio for all 46 screenshots..."
echo ""

# Function to generate audio
generate_audio() {
    local step_num=$1
    local text=$2
    local output="$AUDIO_DIR/step-$(printf "%02d" $step_num).mp3"
    
    if [ -f "$output" ]; then
        echo "✓ Already exists: step-$(printf "%02d" $step_num).mp3"
        return
    fi
    
    echo "$text" | piper --model "$VOICE_MODEL" --output_file "$output" 2>/dev/null
    
    if [ $? -eq 0 ]; then
        echo "✓ Generated: step-$(printf "%02d" $step_num).mp3"
    else
        echo "✗ Failed: step-$(printf "%02d" $step_num).mp3"
    fi
}

# Generate all audio files with proper numbering
step=1

# 01-overview (3 files)
generate_audio $step "Welcome to the Cloudinary Admin module for Drupal 11. This comprehensive guide will walk you through every feature with detailed visual demonstrations."
((step++))
generate_audio $step "The Cloudinary Admin module provides a powerful interface for managing your cloud-based media assets directly from your Drupal site."
((step++))
generate_audio $step "You can access all Cloudinary features through the admin menu under Content and Configuration sections."
((step++))

# 02-asset-browser (4 files)
generate_audio $step "Let's start by navigating to the Asset Browser. Click on Content, then Cloudinary, then Assets."
((step++))
generate_audio $step "This is the main Asset Browser interface. Here you can view all your Cloudinary assets in a grid or list format."
((step++))
generate_audio $step "The page title clearly indicates you're in the Cloudinary Assets section."
((step++))
generate_audio $step "The asset grid displays thumbnails of your media files with metadata and action buttons."
((step++))

# 03-search-filter (1 file)
generate_audio $step "Now let's explore the search functionality. The search field is prominently displayed at the top."
((step++))

# 04-folder-management (8 files)
generate_audio $step "Folder management helps you organize your assets hierarchically. Navigate to Content, Cloudinary, Folders."
((step++))
generate_audio $step "This is the Folder Manager interface showing your existing folder structure."
((step++))
generate_audio $step "The folder list displays all your Cloudinary folders with their full paths."
((step++))
generate_audio $step "At the top of the page, you'll find the Create Folder form."
((step++))
generate_audio $step "Click in the folder name field to begin entering your new folder name."
((step++))
generate_audio $step "The input field highlights when active, ready for you to type."
((step++))
generate_audio $step "Enter a descriptive folder name using lowercase letters, hyphens, or underscores."
((step++))
generate_audio $step "The submit button is highlighted here. Click it to create your new folder."
((step++))

# 05-bulk-operations (5 files)
generate_audio $step "Bulk operations allow you to perform actions on multiple assets at once. Navigate to Content, Cloudinary, Bulk Operations."
((step++))
generate_audio $step "This is the Bulk Operations interface. Here you can execute batch actions efficiently."
((step++))
generate_audio $step "The bulk operations form is the main control panel for batch processing."
((step++))
generate_audio $step "First, select the type of operation you want to perform from the dropdown."
((step++))
generate_audio $step "These input fields let you specify details like tag names or target folder paths."
((step++))

# 06-ai-features (5 files)
generate_audio $step "Cloudinary's AI features can automatically enhance and analyze your media. Navigate to Configuration, Media, Cloudinary, AI Settings."
((step++))
generate_audio $step "This is the AI Settings configuration page where you enable and configure AI-powered features."
((step++))
generate_audio $step "The page title confirms you're in the AI Settings section."
((step++))
generate_audio $step "Auto-tagging is the first major AI feature. It automatically tags your images based on detected content."
((step++))
generate_audio $step "After configuring all AI features, click the Save Configuration button."
((step++))

# 07-settings-config (5 files)
generate_audio $step "Let's configure the main Cloudinary connection settings. Navigate to Configuration, Media, Cloudinary."
((step++))
generate_audio $step "This is the main Cloudinary settings page where you configure your API credentials."
((step++))
generate_audio $step "The configuration form is highlighted, showing all available settings."
((step++))
generate_audio $step "Enter your Cloud Name, API Key, and API Secret. Keep your API Secret secure!"
((step++))
generate_audio $step "Click the Save Configuration button to apply your settings."
((step++))

# 08-admin-settings (3 files)
generate_audio $step "The Admin Settings page lets you customize module behavior. Navigate to Configuration, Media, Cloudinary, Admin Settings."
((step++))
generate_audio $step "This page contains preferences specific to the Cloudinary Admin module."
((step++))
generate_audio $step "Configure settings like assets per page, default view, and cache duration for optimal performance."
((step++))

# 09-permissions-roles (4 files)
generate_audio $step "Proper permissions ensure secure access to Cloudinary features. Navigate to People, Permissions."
((step++))
generate_audio $step "This is the main permissions page showing all available permissions."
((step++))
generate_audio $step "Scroll down to find the Cloudinary-specific permissions section and configure access for different roles."
((step++))
generate_audio $step "Now let's look at roles. Navigate to People, Roles to manage user role assignments."
((step++))

# 10-usage-analytics (3 files)
generate_audio $step "Monitor your Cloudinary account usage to stay within plan limits. Navigate to Content, Cloudinary, Usage."
((step++))
generate_audio $step "This is the Usage Statistics dashboard showing your account metrics."
((step++))
generate_audio $step "The usage data table displays key metrics including storage, bandwidth, transformations, and API requests."
((step++))

# 11-complete-workflows (6 files)
generate_audio $step "Let's walk through a complete workflow from start to finish. First, configure your Cloudinary connection in the main settings."
((step++))
generate_audio $step "Next, set up AI features to automatically enhance your uploads."
((step++))
generate_audio $step "Create a folder structure to organize your assets."
((step++))
generate_audio $step "Navigate to the Asset Browser to view your media library."
((step++))
generate_audio $step "Apply bulk operations to tag or organize multiple assets at once."
((step++))
generate_audio $step "Monitor usage statistics to track your account consumption. This completes the full Cloudinary Admin workflow. Thank you for following this complete interactive guide."
((step++))

echo ""
echo "✅ Audio generation complete!"
echo "📊 Total audio files: $(ls $AUDIO_DIR/*.mp3 2>/dev/null | wc -l)"
echo "📸 Total screenshots: $(find $BASE_DIR -name 'step-*.png' | wc -l)"
