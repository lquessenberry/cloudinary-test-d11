#!/bin/bash

# Complete rebuild: proper screenshot-to-narration mapping
VOICE_MODEL="$HOME/.local/share/piper/voices/en_US-lessac-medium.onnx"
BASE="screenshots/release-blog/narrated-interactive"
AUDIO_DIR="$BASE/audio"

mkdir -p "$AUDIO_DIR"

echo "🎙️  Generating Complete Narration Sequence"
echo "=========================================="
echo ""

# Function to generate audio
gen_audio() {
    local num=$1
    local text=$2
    local file="$AUDIO_DIR/step-$(printf "%02d" $num).mp3"
    echo "$text" | piper --model "$VOICE_MODEL" --output_file "$file" 2>/dev/null
    echo "✓ Step $(printf "%02d" $num): ${text:0:60}..."
}

# SEQUENCE 1: CONFIGURATION (2 screenshots)
echo "Section 1: Configuration Setup"
gen_audio 1 "Welcome to the Cloudinary Admin module for Drupal 11. This is the main configuration page where you connect your Cloudinary account by entering your API credentials."

gen_audio 2 "The API Settings section shows where to enter your Cloud Name, API Key, and API Secret. These credentials link your Drupal site to your Cloudinary account for seamless media management."

# SEQUENCE 2: ASSET BROWSER (4 screenshots)
echo ""
echo "Section 2: Asset Browser"
gen_audio 3 "Once configured, navigate to the Cloudinary Assets page from the Content menu. This is your central hub for viewing and managing all media stored in Cloudinary."

gen_audio 4 "The Asset Browser displays your media library in a grid format. Each card shows a thumbnail, filename, format, dimensions, file size, and the asset's unique public ID."

gen_audio 5 "The page header shows you're viewing 50 of 80 total assets. You can browse through your entire media collection and perform quick actions on any file."

gen_audio 6 "Each asset card provides essential metadata at a glance. Click on any asset to view full details, download the file, or access additional management options."

# SEQUENCE 3: SEARCH & FILTER (1 screenshot)
echo ""
echo "Section 3: Search & Filter"
gen_audio 7 "The asset browser includes powerful search and filtering capabilities. Use these tools to quickly locate specific files in large media libraries by name, type, tags, or other criteria."

# SEQUENCE 4: FOLDER MANAGEMENT (8 screenshots)
echo ""
echo "Section 4: Folder Management"
gen_audio 8 "Folder Management helps you organize assets hierarchically. The Folder Path field lets you create nested folder structures using forward slashes, like products slash featured."

gen_audio 9 "Enter your desired folder path in the text field. Use lowercase letters, numbers, hyphens, and forward slashes to create organized folder hierarchies."

gen_audio 10 "The folder path input supports nested structures. For example, products slash featured creates a featured subfolder inside the products folder."

gen_audio 11 "After entering your folder path, click the Create Folder button to add the new folder structure to your Cloudinary account."

gen_audio 12 "The folder list below shows all existing folders in your Cloudinary account. Each folder displays its full path for easy reference."

gen_audio 13 "Existing folders appear in the table with their complete paths. You can browse to any folder to view its contents or perform management operations."

gen_audio 14 "The Operations column provides action buttons for each folder. Use these to browse folder contents, rename folders, or perform other folder-specific tasks."

gen_audio 15 "Folder management keeps your media library organized and makes it easier to find assets. Well-structured folders improve workflow efficiency for large media collections."

# SEQUENCE 5: BULK OPERATIONS (5 screenshots)
echo ""
echo "Section 5: Bulk Operations"
gen_audio 16 "Bulk Operations allow you to perform actions on multiple assets simultaneously. This powerful feature saves time when managing large numbers of files."

gen_audio 17 "The Bulk Operations interface provides a form where you select the operation type and specify the assets to process. Choose from actions like adding tags, moving files, or updating metadata."

gen_audio 18 "Select the type of bulk operation from the dropdown menu. Options include tagging multiple assets, moving files to different folders, or applying transformations."

gen_audio 19 "After selecting your operation type, specify the target assets using public IDs, tags, or folder paths. The form guides you through the required parameters."

gen_audio 20 "Review your bulk operation settings carefully before executing. Bulk actions affect multiple files at once, so double-check your selections to avoid unintended changes."

# SEQUENCE 6: AI FEATURES (5 screenshots)
echo ""
echo "Section 6: AI Features"
gen_audio 21 "Cloudinary's AI features can automatically enhance and analyze your media. Navigate to the AI Settings page to enable and configure these powerful capabilities."

gen_audio 22 "The AI Settings configuration page lets you enable features like auto-tagging, background removal, and content-aware cropping. These tools use machine learning to improve your media."

gen_audio 23 "Auto-tagging automatically analyzes image content and applies relevant tags. This feature uses computer vision to identify objects, scenes, and concepts in your images."

gen_audio 24 "Enable the AI features that match your workflow needs. Each feature can be toggled independently, allowing you to use only the capabilities you require."

gen_audio 25 "After configuring your AI settings, click Save Configuration to apply the changes. Your enabled AI features will then process new uploads automatically."

# SEQUENCE 7: SETTINGS CONFIG (5 screenshots)
echo ""
echo "Section 7: Main Settings"
gen_audio 26 "The main Cloudinary settings page is where you configure your account connection. Navigate here from Configuration, Media, Cloudinary."

gen_audio 27 "This settings form contains all the core configuration options for the Cloudinary module. Enter your API credentials and adjust connection settings as needed."

gen_audio 28 "The configuration form includes fields for Cloud Name, API Key, API Secret, and additional options. Keep your API Secret secure and never share it publicly."

gen_audio 29 "Advanced settings let you customize upload behavior, transformation defaults, and caching options. These settings fine-tune how Drupal interacts with Cloudinary."

gen_audio 30 "Always click Save Configuration after making changes. Your settings take effect immediately and apply to all future Cloudinary operations."

# SEQUENCE 8: ADMIN SETTINGS (3 screenshots)
echo ""
echo "Section 8: Admin Settings"
gen_audio 31 "The Admin Settings page provides module-specific preferences. These settings control how the Cloudinary Admin interface behaves and displays information."

gen_audio 32 "Configure display preferences like assets per page, default view mode, and interface options. These settings customize the admin experience for your team."

gen_audio 33 "Set cache duration, thumbnail sizes, and other performance-related options. Proper admin settings optimize the module's performance for your specific needs."

# SEQUENCE 9: PERMISSIONS (4 screenshots)
echo ""
echo "Section 9: Permissions & Roles"
gen_audio 34 "Proper permissions ensure secure access to Cloudinary features. Navigate to People, Permissions to configure which roles can access different capabilities."

gen_audio 35 "The permissions page shows all available Cloudinary permissions. Scroll down to find the Cloudinary-specific section and assign permissions to appropriate roles."

gen_audio 36 "Assign permissions carefully based on user responsibilities. For example, editors might view assets while administrators can configure settings and manage folders."

gen_audio 37 "Role management works hand-in-hand with permissions. Navigate to People, Roles to create custom roles and assign users to roles with appropriate Cloudinary access."

# SEQUENCE 10: USAGE ANALYTICS (3 screenshots)
echo ""
echo "Section 10: Usage Analytics"
gen_audio 38 "Monitor your Cloudinary account usage to stay within plan limits. The Usage Statistics page shows current consumption across all resource types."

gen_audio 39 "The usage dashboard displays key metrics including storage space, bandwidth consumption, transformation credits, and API request counts."

gen_audio 40 "Review usage statistics regularly to understand your consumption patterns. This data helps you optimize media usage and plan for account upgrades if needed."

# SEQUENCE 11: COMPLETE WORKFLOWS (6 screenshots)
echo ""
echo "Section 11: Complete Workflow"
gen_audio 41 "Let's review a complete workflow from initial setup to daily use. Start by configuring your API credentials in the main Cloudinary settings page."

gen_audio 42 "Next, enable AI features to automatically enhance your uploads. Configure auto-tagging and other AI capabilities based on your content needs."

gen_audio 43 "Create a folder structure to organize your media library. Well-organized folders make it easier to find and manage assets as your library grows."

gen_audio 44 "Use the Asset Browser to view and manage your media files. Browse through assets, view details, and perform actions like downloading or deleting files."

gen_audio 45 "Apply bulk operations when you need to update multiple assets at once. Bulk tagging, moving, or transforming files saves significant time on large operations."

gen_audio 46 "Finally, monitor your usage statistics to track account consumption. Regular monitoring helps you stay within plan limits and optimize your media strategy. This completes your comprehensive guide to the Cloudinary Admin module for Drupal 11. Thank you for following along."

echo ""
echo "✅ Complete! Generated 46 audio files"
echo "📊 Total: $(ls $AUDIO_DIR/*.mp3 2>/dev/null | wc -l) MP3 files"
