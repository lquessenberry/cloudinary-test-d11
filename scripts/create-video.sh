#!/bin/bash

# Create a complete video from all screenshots and audio narrations
# Output: Full HD (1920x1080) MP4 video with synchronized audio

BASE_DIR="screenshots/release-blog/narrated-interactive"
AUDIO_DIR="$BASE_DIR/audio"
OUTPUT_DIR="$BASE_DIR/video"
OUTPUT_FILE="$OUTPUT_DIR/cloudinary-admin-complete-guide.mp4"

mkdir -p "$OUTPUT_DIR"

echo "🎬 Creating Cloudinary Admin Complete Video Guide"
echo "=================================================="
echo ""

# Create a temporary directory for processing
TEMP_DIR=$(mktemp -d)
echo "📁 Working directory: $TEMP_DIR"

# Step 1: Get audio durations and create file list
echo "📊 Analyzing audio files..."
FILELIST="$TEMP_DIR/filelist.txt"
CONCAT_FILTER="$TEMP_DIR/concat_filter.txt"

step_num=1
total_duration=0

# Map screenshots to audio files
declare -A screenshot_map=(
    # 01-overview
    ["$BASE_DIR/01-overview/step-01.png"]="$AUDIO_DIR/step-01.mp3"
    ["$BASE_DIR/01-overview/step-02.png"]="$AUDIO_DIR/step-02.mp3"
    
    # 02-asset-browser
    ["$BASE_DIR/02-asset-browser/step-01.png"]="$AUDIO_DIR/step-04.mp3"
    ["$BASE_DIR/02-asset-browser/step-02.png"]="$AUDIO_DIR/step-05.mp3"
    ["$BASE_DIR/02-asset-browser/step-03.png"]="$AUDIO_DIR/step-06.mp3"
    ["$BASE_DIR/02-asset-browser/step-05.png"]="$AUDIO_DIR/step-07.mp3"
    
    # 03-search-filter
    ["$BASE_DIR/03-search-filter/step-01.png"]="$AUDIO_DIR/step-08.mp3"
    
    # 04-folder-management
    ["$BASE_DIR/04-folder-management/step-01.png"]="$AUDIO_DIR/step-09.mp3"
    ["$BASE_DIR/04-folder-management/step-02.png"]="$AUDIO_DIR/step-10.mp3"
    ["$BASE_DIR/04-folder-management/step-03.png"]="$AUDIO_DIR/step-11.mp3"
    ["$BASE_DIR/04-folder-management/step-05.png"]="$AUDIO_DIR/step-12.mp3"
    ["$BASE_DIR/04-folder-management/step-06.png"]="$AUDIO_DIR/step-13.mp3"
    ["$BASE_DIR/04-folder-management/step-07.png"]="$AUDIO_DIR/step-14.mp3"
    ["$BASE_DIR/04-folder-management/step-08.png"]="$AUDIO_DIR/step-15.mp3"
    ["$BASE_DIR/04-folder-management/step-09.png"]="$AUDIO_DIR/step-16.mp3"
    
    # 05-bulk-operations
    ["$BASE_DIR/05-bulk-operations/step-01.png"]="$AUDIO_DIR/step-17.mp3"
    ["$BASE_DIR/05-bulk-operations/step-02.png"]="$AUDIO_DIR/step-18.mp3"
    ["$BASE_DIR/05-bulk-operations/step-03.png"]="$AUDIO_DIR/step-19.mp3"
    ["$BASE_DIR/05-bulk-operations/step-04.png"]="$AUDIO_DIR/step-20.mp3"
    ["$BASE_DIR/05-bulk-operations/step-05.png"]="$AUDIO_DIR/step-21.mp3"
    
    # 06-ai-features
    ["$BASE_DIR/06-ai-features/step-01.png"]="$AUDIO_DIR/step-22.mp3"
    ["$BASE_DIR/06-ai-features/step-02.png"]="$AUDIO_DIR/step-23.mp3"
    ["$BASE_DIR/06-ai-features/step-03.png"]="$AUDIO_DIR/step-24.mp3"
    ["$BASE_DIR/06-ai-features/step-04.png"]="$AUDIO_DIR/step-25.mp3"
    ["$BASE_DIR/06-ai-features/step-05.png"]="$AUDIO_DIR/step-26.mp3"
    
    # 07-settings-config
    ["$BASE_DIR/07-settings-config/step-01.png"]="$AUDIO_DIR/step-27.mp3"
    ["$BASE_DIR/07-settings-config/step-02.png"]="$AUDIO_DIR/step-28.mp3"
    ["$BASE_DIR/07-settings-config/step-03.png"]="$AUDIO_DIR/step-29.mp3"
    ["$BASE_DIR/07-settings-config/step-04.png"]="$AUDIO_DIR/step-30.mp3"
    ["$BASE_DIR/07-settings-config/step-05.png"]="$AUDIO_DIR/step-31.mp3"
    
    # 08-admin-settings
    ["$BASE_DIR/08-admin-settings/step-01.png"]="$AUDIO_DIR/step-32.mp3"
    ["$BASE_DIR/08-admin-settings/step-02.png"]="$AUDIO_DIR/step-33.mp3"
    ["$BASE_DIR/08-admin-settings/step-03.png"]="$AUDIO_DIR/step-34.mp3"
    
    # 09-permissions-roles
    ["$BASE_DIR/09-permissions-roles/step-01.png"]="$AUDIO_DIR/step-35.mp3"
    ["$BASE_DIR/09-permissions-roles/step-02.png"]="$AUDIO_DIR/step-36.mp3"
    ["$BASE_DIR/09-permissions-roles/step-03.png"]="$AUDIO_DIR/step-37.mp3"
    ["$BASE_DIR/09-permissions-roles/step-04.png"]="$AUDIO_DIR/step-38.mp3"
    
    # 10-usage-analytics
    ["$BASE_DIR/10-usage-analytics/step-01.png"]="$AUDIO_DIR/step-39.mp3"
    ["$BASE_DIR/10-usage-analytics/step-02.png"]="$AUDIO_DIR/step-40.mp3"
    ["$BASE_DIR/10-usage-analytics/step-03.png"]="$AUDIO_DIR/step-41.mp3"
    
    # 11-complete-workflows
    ["$BASE_DIR/11-complete-workflows/step-01.png"]="$AUDIO_DIR/step-42.mp3"
    ["$BASE_DIR/11-complete-workflows/step-02.png"]="$AUDIO_DIR/step-43.mp3"
    ["$BASE_DIR/11-complete-workflows/step-03.png"]="$AUDIO_DIR/step-44.mp3"
    ["$BASE_DIR/11-complete-workflows/step-04.png"]="$AUDIO_DIR/step-45.mp3"
    ["$BASE_DIR/11-complete-workflows/step-05.png"]="$AUDIO_DIR/step-46.mp3"
    ["$BASE_DIR/11-complete-workflows/step-06.png"]="$AUDIO_DIR/step-47.mp3"
)

# Create intro slide
echo "🎨 Creating intro slide..."
convert -size 1920x1080 xc:'#1e293b' \
    -gravity center \
    -pointsize 80 -fill white -font Arial-Bold \
    -annotate +0-200 'Cloudinary Admin' \
    -pointsize 50 -fill '#3b82f6' \
    -annotate +0-100 'Complete Feature Guide' \
    -pointsize 30 -fill '#94a3b8' \
    -annotate +0+50 'Drupal 11 Module' \
    -pointsize 24 -fill '#64748b' \
    -annotate +0+150 'Full HD Interactive Documentation' \
    "$TEMP_DIR/intro.png"

# Create outro slide
echo "🎨 Creating outro slide..."
convert -size 1920x1080 xc:'#1e293b' \
    -gravity center \
    -pointsize 60 -fill white -font Arial-Bold \
    -annotate +0-150 'Thank You!' \
    -pointsize 40 -fill '#3b82f6' \
    -annotate +0-50 'Cloudinary Admin Module' \
    -pointsize 30 -fill '#94a3b8' \
    -annotate +0+50 'For Drupal 11' \
    -pointsize 24 -fill '#64748b' \
    -annotate +0+150 'Visit drupal.org/project/cloudinary' \
    "$TEMP_DIR/outro.png"

# Build ffmpeg concat file
echo "📝 Building video sequence..."
> "$CONCAT_FILTER"

# Add intro (3 seconds)
echo "file '$TEMP_DIR/intro.png'" >> "$CONCAT_FILTER"
echo "duration 3" >> "$CONCAT_FILTER"

# Process each screenshot with its audio
for screenshot in "${!screenshot_map[@]}"; do
    audio="${screenshot_map[$screenshot]}"
    
    if [ ! -f "$screenshot" ]; then
        echo "⚠️  Screenshot not found: $screenshot"
        continue
    fi
    
    if [ ! -f "$audio" ]; then
        echo "⚠️  Audio not found: $audio"
        continue
    fi
    
    # Get audio duration
    duration=$(ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "$audio")
    
    # Add 0.5 seconds for reading time
    duration=$(echo "$duration + 0.5" | bc)
    
    echo "file '$screenshot'" >> "$CONCAT_FILTER"
    echo "duration $duration" >> "$CONCAT_FILTER"
    
    total_duration=$(echo "$total_duration + $duration" | bc)
    
    echo "  ✓ $(basename $screenshot) → $(basename $audio) (${duration}s)"
done

# Add outro (3 seconds)
echo "file '$TEMP_DIR/outro.png'" >> "$CONCAT_FILTER"
echo "duration 3" >> "$CONCAT_FILTER"
echo "file '$TEMP_DIR/outro.png'" >> "$CONCAT_FILTER"

total_duration=$(echo "$total_duration + 6" | bc)

echo ""
echo "📊 Video Statistics:"
echo "   Screenshots: $(echo "${#screenshot_map[@]}" | bc)"
echo "   Total Duration: ${total_duration}s ($(echo "$total_duration / 60" | bc)m $(echo "$total_duration % 60" | bc)s)"
echo ""

# Create silent video from images
echo "🎬 Creating video from screenshots..."
ffmpeg -f concat -safe 0 -i "$CONCAT_FILTER" \
    -vf "fps=30,format=yuv420p,scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2" \
    -c:v libx264 -preset slow -crf 18 \
    -y "$TEMP_DIR/video_silent.mp4" 2>&1 | grep -E "(frame=|size=|time=)" | tail -5

# Concatenate all audio files
echo ""
echo "🎙️  Merging audio narrations..."
AUDIO_LIST="$TEMP_DIR/audio_list.txt"
> "$AUDIO_LIST"

# 3 seconds silence for intro
ffmpeg -f lavfi -i anullsrc=r=22050:cl=mono -t 3 -y "$TEMP_DIR/silence_intro.mp3" 2>&1 | grep -v "^frame="

echo "file '$TEMP_DIR/silence_intro.mp3'" >> "$AUDIO_LIST"

# Add all audio files in order
for i in {1..47}; do
    audio_file="$AUDIO_DIR/step-$(printf "%02d" $i).mp3"
    if [ -f "$audio_file" ]; then
        # Use absolute path
        abs_audio=$(realpath "$audio_file")
        echo "file '$abs_audio'" >> "$AUDIO_LIST"
        # Add 0.5s silence between narrations
        ffmpeg -f lavfi -i anullsrc=r=22050:cl=mono -t 0.5 -y "$TEMP_DIR/silence_${i}.mp3" 2>&1 | grep -v "^frame="
        echo "file '$TEMP_DIR/silence_${i}.mp3'" >> "$AUDIO_LIST"
    fi
done

# 3 seconds silence for outro
ffmpeg -f lavfi -i anullsrc=r=22050:cl=mono -t 3 -y "$TEMP_DIR/silence_outro.mp3" 2>&1 | grep -v "^frame="
echo "file '$TEMP_DIR/silence_outro.mp3'" >> "$AUDIO_LIST"

# Concatenate audio
ffmpeg -f concat -safe 0 -i "$AUDIO_LIST" -c copy -y "$TEMP_DIR/audio_complete.mp3" 2>&1 | grep -v "^frame="

# Combine video and audio
echo ""
echo "🎞️  Combining video and audio..."
ffmpeg -i "$TEMP_DIR/video_silent.mp4" -i "$TEMP_DIR/audio_complete.mp3" \
    -c:v copy -c:a aac -b:a 192k -shortest \
    -metadata title="Cloudinary Admin Complete Guide" \
    -metadata artist="Cloudinary Admin Module" \
    -metadata comment="Full HD Interactive Documentation for Drupal 11" \
    -y "$OUTPUT_FILE" 2>&1 | grep -E "(frame=|size=|time=)" | tail -5

# Get final file size
filesize=$(du -h "$OUTPUT_FILE" | cut -f1)

echo ""
echo "✅ Video creation complete!"
echo ""
echo "📹 Output File: $OUTPUT_FILE"
echo "📊 File Size: $filesize"
echo "⏱️  Duration: ${total_duration}s ($(echo "$total_duration / 60" | bc)m)"
echo "🎬 Resolution: 1920x1080 (Full HD)"
echo "🎙️  Audio: AAC 192kbps"
echo "📦 Format: MP4 (H.264)"
echo ""

# Cleanup
echo "🧹 Cleaning up temporary files..."
rm -rf "$TEMP_DIR"

echo "✨ Done! Your video is ready to share!"
