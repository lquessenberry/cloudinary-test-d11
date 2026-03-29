#!/bin/bash

# Review the complete narration sequence
BASE="screenshots/release-blog/narrated-interactive"

echo "📖 COMPLETE NARRATION SEQUENCE REVIEW"
echo "======================================"
echo ""

# Define the narration for each step
declare -A narrations=(
    # Overview (steps 1-2)
    [1]="Welcome to the Cloudinary Admin module for Drupal 11. This is the main configuration page where you set up your Cloudinary connection."
    [2]="The Cloudinary Admin module provides a powerful interface for managing your cloud-based media assets directly from your Drupal site. Configure your API credentials here."
    
    # Asset Browser (steps 4-7)
    [4]="From the Cloudinary settings, navigate to Content in the admin toolbar to access your assets."
    [5]="This is the main Asset Browser interface. Here you can view all your Cloudinary assets in a grid or list format."
    [6]="The page title clearly indicates you're in the Cloudinary Assets section."
    [7]="The asset list displays your media files with metadata and action buttons for managing your Cloudinary library."
    
    # Search (step 8)
    [8]="The asset browser includes powerful search and filter tools. Use these controls to find specific assets by name, type, tags, or other criteria."
    
    # Folder Management (steps 9-16)
    [9]="Folder management helps you organize your assets hierarchically. Navigate to Content, Cloudinary, Folders."
    [10]="This is the Folder Manager interface showing your existing folder structure."
    [11]="The folder list displays all your Cloudinary folders with their full paths."
    [12]="At the top of the page, you'll find the Create Folder form."
    [13]="Click in the folder name field to begin entering your new folder name."
    [14]="The input field highlights when active, ready for you to type."
    [15]="Enter a descriptive folder name using lowercase letters, hyphens, or underscores."
    [16]="The submit button is highlighted here. Click it to create your new folder."
    
    # Bulk Operations (steps 17-21)
    [17]="Bulk operations allow you to perform actions on multiple assets at once. Navigate to Content, Cloudinary, Bulk Operations."
    [18]="This is the Bulk Operations interface. Here you can execute batch actions efficiently."
    [19]="The bulk operations form is the main control panel for batch processing."
    [20]="First, select the type of operation you want to perform from the dropdown."
    [21]="These input fields let you specify details like tag names or target folder paths."
    
    # AI Features (steps 22-26)
    [22]="Cloudinary's AI features can automatically enhance and analyze your media. Navigate to Configuration, Media, Cloudinary, AI Settings."
    [23]="This is the AI Settings configuration page where you enable and configure AI-powered features."
    [24]="The page title confirms you're in the AI Settings section."
    [25]="Auto-tagging is the first major AI feature. It automatically tags your images based on detected content."
    [26]="After configuring all AI features, click the Save Configuration button."
    
    # Settings (steps 27-31)
    [27]="Let's configure the main Cloudinary connection settings. Navigate to Configuration, Media, Cloudinary."
    [28]="This is the main Cloudinary settings page where you configure your API credentials."
    [29]="The configuration form is highlighted, showing all available settings."
    [30]="Enter your Cloud Name, API Key, and API Secret. Keep your API Secret secure!"
    [31]="Click the Save Configuration button to apply your settings."
    
    # Admin Settings (steps 32-34)
    [32]="The Admin Settings page lets you customize module behavior. Navigate to Configuration, Media, Cloudinary, Admin Settings."
    [33]="This page contains preferences specific to the Cloudinary Admin module."
    [34]="Configure settings like assets per page, default view, and cache duration for optimal performance."
    
    # Permissions (steps 35-38)
    [35]="Proper permissions ensure secure access to Cloudinary features. Navigate to People, Permissions."
    [36]="This is the main permissions page showing all available permissions."
    [37]="Scroll down to find the Cloudinary-specific permissions section and configure access for different roles."
    [38]="Now let's look at roles. Navigate to People, Roles to manage user role assignments."
    
    # Usage Analytics (steps 39-41)
    [39]="Monitor your Cloudinary account usage to stay within plan limits. Navigate to Content, Cloudinary, Usage."
    [40]="This is the Usage Statistics dashboard showing your account metrics."
    [41]="The usage data table displays key metrics including storage, bandwidth, transformations, and API requests."
    
    # Workflows (steps 42-47)
    [42]="Let's walk through a complete workflow from start to finish. First, configure your Cloudinary connection in the main settings."
    [43]="Next, set up AI features to automatically enhance your uploads."
    [44]="Create a folder structure to organize your assets."
    [45]="Navigate to the Asset Browser to view your media library."
    [46]="Apply bulk operations to tag or organize multiple assets at once."
    [47]="Monitor usage statistics to track your account consumption. This completes the full Cloudinary Admin workflow. Thank you for following this complete interactive guide."
)

echo "SECTION 1: OVERVIEW & INITIAL SETUP (Steps 1-2)"
echo "------------------------------------------------"
for i in 1 2; do
    echo "Step $i: ${narrations[$i]}"
    echo ""
done

echo ""
echo "SECTION 2: ASSET BROWSER (Steps 4-7)"
echo "-------------------------------------"
echo "⚠️  NOTE: Step 3 is missing - gap in sequence"
echo ""
for i in 4 5 6 7; do
    echo "Step $i: ${narrations[$i]}"
    echo ""
done

echo ""
echo "SECTION 3: SEARCH & FILTER (Step 8)"
echo "------------------------------------"
echo "Step 8: ${narrations[8]}"
echo ""

echo ""
echo "SECTION 4: FOLDER MANAGEMENT (Steps 9-16)"
echo "------------------------------------------"
for i in {9..16}; do
    echo "Step $i: ${narrations[$i]}"
    echo ""
done

echo ""
echo "SECTION 5: BULK OPERATIONS (Steps 17-21)"
echo "-----------------------------------------"
for i in {17..21}; do
    echo "Step $i: ${narrations[$i]}"
    echo ""
done

echo ""
echo "SECTION 6: AI FEATURES (Steps 22-26)"
echo "-------------------------------------"
for i in {22..26}; do
    echo "Step $i: ${narrations[$i]}"
    echo ""
done

echo ""
echo "SECTION 7: MAIN SETTINGS (Steps 27-31)"
echo "---------------------------------------"
echo "⚠️  FLOW ISSUE: Settings come AFTER AI features, but should come first"
echo ""
for i in {27..31}; do
    echo "Step $i: ${narrations[$i]}"
    echo ""
done

echo ""
echo "SECTION 8: ADMIN SETTINGS (Steps 32-34)"
echo "----------------------------------------"
for i in {32..34}; do
    echo "Step $i: ${narrations[$i]}"
    echo ""
done

echo ""
echo "SECTION 9: PERMISSIONS (Steps 35-38)"
echo "-------------------------------------"
for i in {35..38}; do
    echo "Step $i: ${narrations[$i]}"
    echo ""
done

echo ""
echo "SECTION 10: USAGE ANALYTICS (Steps 39-41)"
echo "------------------------------------------"
for i in {39..41}; do
    echo "Step $i: ${narrations[$i]}"
    echo ""
done

echo ""
echo "SECTION 11: COMPLETE WORKFLOWS (Steps 42-47)"
echo "---------------------------------------------"
for i in {42..47}; do
    echo "Step $i: ${narrations[$i]}"
    echo ""
done

echo ""
echo "=========================================="
echo "IDENTIFIED ISSUES:"
echo "=========================================="
echo ""
echo "1. ❌ MISSING STEP 3 - Gap between overview and asset browser"
echo ""
echo "2. ❌ LOGICAL FLOW PROBLEM:"
echo "   - Steps 1-2: Show main settings page"
echo "   - Steps 4-8: Jump to asset browser"
echo "   - Steps 27-31: Return to main settings configuration"
echo "   This creates a confusing back-and-forth"
echo ""
echo "3. ❌ RECOMMENDED FLOW:"
echo "   1. Overview introduction"
echo "   2. Main settings configuration (steps 27-31)"
echo "   3. Admin settings (steps 32-34)"
echo "   4. AI features (steps 22-26)"
echo "   5. Asset browser (steps 4-8)"
echo "   6. Folder management (steps 9-16)"
echo "   7. Bulk operations (steps 17-21)"
echo "   8. Permissions (steps 35-38)"
echo "   9. Usage analytics (steps 39-41)"
echo "   10. Complete workflow (steps 42-47)"
echo ""
