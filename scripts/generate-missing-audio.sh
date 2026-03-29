#!/bin/bash

# Generate audio for all screenshots that are missing MP3 files
VOICE_MODEL="$HOME/.local/share/piper/voices/en_US-lessac-medium.onnx"
SCREENSHOT_DIR="screenshots/release-blog/narrated-interactive"
AUDIO_DIR="$SCREENSHOT_DIR/audio"

# Ensure audio directory exists
mkdir -p "$AUDIO_DIR"

# Narration texts for each step
declare -A narrations=(
    # Overview
    ["01-overview/step-01"]="Welcome to the Cloudinary Admin module for Drupal 11. This comprehensive guide will walk you through every feature with detailed visual demonstrations."
    ["01-overview/step-02"]="The Cloudinary Admin module provides a powerful interface for managing your cloud-based media assets directly from your Drupal site."
    ["01-overview/step-03"]="You can access all Cloudinary features through the admin menu under Content and Configuration sections."
    
    # Asset Browser
    ["02-asset-browser/step-01"]="Let's start by navigating to the Asset Browser. Click on Content, then Cloudinary, then Assets."
    ["02-asset-browser/step-02"]="This is the main Asset Browser interface. Here you can view all your Cloudinary assets in a grid or list format."
    ["02-asset-browser/step-03"]="The page title clearly indicates you're in the Cloudinary Assets section."
    ["02-asset-browser/step-04"]="Notice the search and filter controls at the top of the page. These allow you to find specific assets quickly."
    ["02-asset-browser/step-05"]="The asset grid displays thumbnails of your media files with metadata and action buttons."
    ["02-asset-browser/step-06"]="You can click on any asset to view its details, download it, or perform actions like delete or edit."
    ["02-asset-browser/step-07"]="Pagination controls at the bottom let you navigate through large collections of assets."
    
    # Search and Filter
    ["03-search-filter/step-01"]="Now let's explore the search functionality. The search field is prominently displayed at the top."
    ["03-search-filter/step-02"]="Click in the search field to begin typing your query. You can search by filename, public ID, or tags."
    ["03-search-filter/step-03"]="As you type, the search field highlights to show it's active and ready for input."
    ["03-search-filter/step-04"]="Enter your search term. For this example, we're searching for sample assets."
    ["03-search-filter/step-05"]="Press Enter or click the Search button to execute your query."
    ["03-search-filter/step-06"]="You can refine your search further using the filter dropdowns below the search field."
    
    # Folder Management
    ["04-folder-management/step-01"]="Folder management helps you organize your assets hierarchically. Navigate to Content, Cloudinary, Folders."
    ["04-folder-management/step-02"]="This is the Folder Manager interface showing your existing folder structure."
    ["04-folder-management/step-03"]="The folder list displays all your Cloudinary folders with their full paths."
    ["04-folder-management/step-04"]="Each folder has a Browse link that takes you to its contents in the Asset Browser."
    ["04-folder-management/step-05"]="At the top of the page, you'll find the Create Folder form."
    ["04-folder-management/step-06"]="Click in the folder name field to begin entering your new folder name."
    ["04-folder-management/step-07"]="The input field highlights when active, ready for you to type."
    ["04-folder-management/step-08"]="Enter a descriptive folder name using lowercase letters, hyphens, or underscores."
    ["04-folder-management/step-09"]="The submit button is highlighted here. Click it to create your new folder."
    
    # Bulk Operations
    ["05-bulk-operations/step-01"]="Bulk operations allow you to perform actions on multiple assets at once. Navigate to Content, Cloudinary, Bulk Operations."
    ["05-bulk-operations/step-02"]="This is the Bulk Operations interface. Here you can execute batch actions efficiently."
    ["05-bulk-operations/step-03"]="The bulk operations form is the main control panel for batch processing."
    ["05-bulk-operations/step-04"]="First, select the type of operation you want to perform from the dropdown."
    ["05-bulk-operations/step-05"]="These input fields let you specify details like tag names or target folder paths."
    
    # AI Features
    ["06-ai-features/step-01"]="Cloudinary's AI features can automatically enhance and analyze your media. Navigate to Configuration, Media, Cloudinary, AI Settings."
    ["06-ai-features/step-02"]="This is the AI Settings configuration page where you enable and configure AI-powered features."
    ["06-ai-features/step-03"]="The page title confirms you're in the AI Settings section."
    ["06-ai-features/step-04"]="Auto-tagging is the first major AI feature. It automatically tags your images based on detected content."
    ["06-ai-features/step-05"]="After configuring all AI features, click the Save Configuration button."
    
    # Settings
    ["07-settings-config/step-01"]="Let's configure the main Cloudinary connection settings. Navigate to Configuration, Media, Cloudinary."
    ["07-settings-config/step-02"]="This is the main Cloudinary settings page where you configure your API credentials."
    ["07-settings-config/step-03"]="The configuration form is highlighted, showing all available settings."
    ["07-settings-config/step-04"]="Enter your Cloud Name, API Key, and API Secret. Keep your API Secret secure!"
    ["07-settings-config/step-05"]="Click the Save Configuration button to apply your settings."
    
    # Admin Settings
    ["08-admin-settings/step-01"]="The Admin Settings page lets you customize module behavior. Navigate to Configuration, Media, Cloudinary, Admin Settings."
    ["08-admin-settings/step-02"]="This page contains preferences specific to the Cloudinary Admin module."
    ["08-admin-settings/step-03"]="Configure settings like assets per page, default view, and cache duration for optimal performance."
    
    # Permissions
    ["09-permissions-roles/step-01"]="Proper permissions ensure secure access to Cloudinary features. Navigate to People, Permissions."
    ["09-permissions-roles/step-02"]="This is the main permissions page showing all available permissions."
    ["09-permissions-roles/step-03"]="Scroll down to find the Cloudinary-specific permissions section and configure access for different roles."
    ["09-permissions-roles/step-04"]="Now let's look at roles. Navigate to People, Roles to manage user role assignments."
    
    # Usage Analytics
    ["10-usage-analytics/step-01"]="Monitor your Cloudinary account usage to stay within plan limits. Navigate to Content, Cloudinary, Usage."
    ["10-usage-analytics/step-02"]="This is the Usage Statistics dashboard showing your account metrics."
    ["10-usage-analytics/step-03"]="The usage data table displays key metrics including storage, bandwidth, transformations, and API requests."
    
    # Workflows
    ["11-complete-workflows/step-01"]="Let's walk through a complete workflow from start to finish. First, configure your Cloudinary connection in the main settings."
    ["11-complete-workflows/step-02"]="Next, set up AI features to automatically enhance your uploads."
    ["11-complete-workflows/step-03"]="Create a folder structure to organize your assets."
    ["11-complete-workflows/step-04"]="Navigate to the Asset Browser to view your media library."
    ["11-complete-workflows/step-05"]="Apply bulk operations to tag or organize multiple assets at once."
    ["11-complete-workflows/step-06"]="Monitor usage statistics to track your account consumption. This completes the full Cloudinary Admin workflow. Thank you for following this complete interactive guide."
)

echo "🎙️  Generating missing audio files..."
echo ""

count=0
for screenshot in $SCREENSHOT_DIR/*/step-*.png; do
    # Extract the relative path (e.g., "01-overview/step-01")
    relative_path=$(echo "$screenshot" | sed "s|$SCREENSHOT_DIR/||" | sed 's|\.png$||')
    
    # Get the step filename (e.g., "step-01")
    step_file=$(basename "$screenshot" .png)
    
    # Audio file path
    audio_file="$AUDIO_DIR/${step_file}.mp3"
    
    # Check if audio file already exists
    if [ -f "$audio_file" ]; then
        continue
    fi
    
    # Get narration text
    narration="${narrations[$relative_path]}"
    
    if [ -z "$narration" ]; then
        echo "⚠️  No narration found for: $relative_path"
        continue
    fi
    
    # Generate audio
    echo "Generating: ${step_file}.mp3"
    echo "$narration" | piper --model "$VOICE_MODEL" --output_file "$audio_file" 2>/dev/null
    
    if [ $? -eq 0 ]; then
        ((count++))
        echo "✓ ${step_file}.mp3"
    else
        echo "✗ Failed: ${step_file}.mp3"
    fi
done

echo ""
echo "✅ Generated $count new audio files"
echo "📊 Total audio files: $(ls $AUDIO_DIR/*.mp3 2>/dev/null | wc -l)"
echo "📸 Total screenshots: $(ls $SCREENSHOT_DIR/*/step-*.png 2>/dev/null | wc -l)"
