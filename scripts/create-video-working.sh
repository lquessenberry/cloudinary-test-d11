#!/bin/bash

# Working video creation using slideshow approach
BASE_DIR="screenshots/release-blog/narrated-interactive"
AUDIO_DIR="$BASE_DIR/audio"
OUTPUT_DIR="$BASE_DIR/video"
OUTPUT_FILE="$OUTPUT_DIR/cloudinary-admin-complete-guide.mp4"

mkdir -p "$OUTPUT_DIR"

echo "🎬 Creating Cloudinary Admin Complete Video"
echo "============================================"
echo ""

TEMP_DIR=$(mktemp -d)
echo "📁 Working directory: $TEMP_DIR"
echo ""

# Step 1: Normalize all audio to consistent format
echo "🎙️  Normalizing audio files..."
mkdir -p "$TEMP_DIR/audio"

for i in {1..47}; do
    src="$AUDIO_DIR/step-$(printf "%02d" $i).mp3"
    dst="$TEMP_DIR/audio/step-$(printf "%02d" $i).mp3"
    if [ -f "$src" ]; then
        ffmpeg -i "$src" -ar 44100 -ac 2 -b:a 192k "$dst" 2>&1 | grep -v "^frame="
    fi
done

# Step 2: Concatenate all audio files
echo ""
echo "🎵 Merging audio narrations..."
AUDIO_LIST="$TEMP_DIR/audio_list.txt"
> "$AUDIO_LIST"

# Add silence for intro (3 seconds)
ffmpeg -f lavfi -i anullsrc=r=44100:cl=stereo -t 3 -ar 44100 -ac 2 -b:a 192k \
    "$TEMP_DIR/audio/intro.mp3" 2>&1 | grep -v "^frame="
echo "file '$TEMP_DIR/audio/intro.mp3'" >> "$AUDIO_LIST"

# Add all narrations
for i in {1..47}; do
    audio="$TEMP_DIR/audio/step-$(printf "%02d" $i).mp3"
    if [ -f "$audio" ]; then
        echo "file '$audio'" >> "$AUDIO_LIST"
    fi
done

# Add silence for outro (3 seconds)
ffmpeg -f lavfi -i anullsrc=r=44100:cl=stereo -t 3 -ar 44100 -ac 2 -b:a 192k \
    "$TEMP_DIR/audio/outro.mp3" 2>&1 | grep -v "^frame="
echo "file '$TEMP_DIR/audio/outro.mp3'" >> "$AUDIO_LIST"

# Merge all audio
ffmpeg -f concat -safe 0 -i "$AUDIO_LIST" -c copy \
    "$TEMP_DIR/complete_audio.mp3" 2>&1 | grep -E "time=|size=" | tail -2

# Get total audio duration
AUDIO_DURATION=$(ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "$TEMP_DIR/complete_audio.mp3")
echo "Total audio duration: ${AUDIO_DURATION}s"

# Step 3: Copy and prepare all images in sequence
echo ""
echo "📸 Preparing image sequence..."
mkdir -p "$TEMP_DIR/images"

# Create intro slide
convert -size 1920x1080 xc:'#1e293b' \
    -gravity center \
    -pointsize 80 -fill white -font Arial-Bold \
    -annotate +0-200 'Cloudinary Admin' \
    -pointsize 50 -fill '#3b82f6' \
    -annotate +0-100 'Complete Feature Guide' \
    -pointsize 30 -fill '#94a3b8' \
    -annotate +0+50 'Drupal 11 Module' \
    "$TEMP_DIR/images/img_000.png" 2>/dev/null

# Copy all screenshots in order
img_num=1

# Overview (2 images)
for img in "$BASE_DIR/01-overview"/step-*.png; do
    [ -f "$img" ] && cp "$img" "$TEMP_DIR/images/img_$(printf "%03d" $img_num).png" && ((img_num++))
done

# Asset Browser (4 images)
for img in "$BASE_DIR/02-asset-browser"/step-*.png; do
    [ -f "$img" ] && cp "$img" "$TEMP_DIR/images/img_$(printf "%03d" $img_num).png" && ((img_num++))
done

# Search (1 image)
for img in "$BASE_DIR/03-search-filter"/step-*.png; do
    [ -f "$img" ] && cp "$img" "$TEMP_DIR/images/img_$(printf "%03d" $img_num).png" && ((img_num++))
done

# Folders (8 images)
for img in "$BASE_DIR/04-folder-management"/step-*.png; do
    [ -f "$img" ] && cp "$img" "$TEMP_DIR/images/img_$(printf "%03d" $img_num).png" && ((img_num++))
done

# Bulk Ops (5 images)
for img in "$BASE_DIR/05-bulk-operations"/step-*.png; do
    [ -f "$img" ] && cp "$img" "$TEMP_DIR/images/img_$(printf "%03d" $img_num).png" && ((img_num++))
done

# AI Features (5 images)
for img in "$BASE_DIR/06-ai-features"/step-*.png; do
    [ -f "$img" ] && cp "$img" "$TEMP_DIR/images/img_$(printf "%03d" $img_num).png" && ((img_num++))
done

# Settings (5 images)
for img in "$BASE_DIR/07-settings-config"/step-*.png; do
    [ -f "$img" ] && cp "$img" "$TEMP_DIR/images/img_$(printf "%03d" $img_num).png" && ((img_num++))
done

# Admin Settings (3 images)
for img in "$BASE_DIR/08-admin-settings"/step-*.png; do
    [ -f "$img" ] && cp "$img" "$TEMP_DIR/images/img_$(printf "%03d" $img_num).png" && ((img_num++))
done

# Permissions (4 images)
for img in "$BASE_DIR/09-permissions-roles"/step-*.png; do
    [ -f "$img" ] && cp "$img" "$TEMP_DIR/images/img_$(printf "%03d" $img_num).png" && ((img_num++))
done

# Usage (3 images)
for img in "$BASE_DIR/10-usage-analytics"/step-*.png; do
    [ -f "$img" ] && cp "$img" "$TEMP_DIR/images/img_$(printf "%03d" $img_num).png" && ((img_num++))
done

# Workflows (6 images)
for img in "$BASE_DIR/11-complete-workflows"/step-*.png; do
    [ -f "$img" ] && cp "$img" "$TEMP_DIR/images/img_$(printf "%03d" $img_num).png" && ((img_num++))
done

# Create outro slide
convert -size 1920x1080 xc:'#1e293b' \
    -gravity center \
    -pointsize 60 -fill white -font Arial-Bold \
    -annotate +0-100 'Thank You!' \
    -pointsize 40 -fill '#3b82f6' \
    -annotate +0 'Cloudinary Admin for Drupal 11' \
    "$TEMP_DIR/images/img_$(printf "%03d" $img_num).png" 2>/dev/null

TOTAL_IMAGES=$((img_num + 1))
echo "Total images: $TOTAL_IMAGES"

# Calculate framerate to match audio duration
# We want the slideshow to last exactly as long as the audio
FRAMERATE=$(echo "scale=6; $TOTAL_IMAGES / $AUDIO_DURATION" | bc)
echo "Calculated framerate: $FRAMERATE fps"

# Step 4: Create video from images
echo ""
echo "🎬 Creating video slideshow..."
ffmpeg -framerate $FRAMERATE -pattern_type glob -i "$TEMP_DIR/images/img_*.png" \
    -vf "scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2,format=yuv420p" \
    -c:v libx264 -preset medium -crf 23 -r 30 \
    "$TEMP_DIR/video_silent.mp4" 2>&1 | grep -E "time=|size=" | tail -3

# Step 5: Combine video and audio
echo ""
echo "🎞️  Adding audio to video..."
ffmpeg -i "$TEMP_DIR/video_silent.mp4" -i "$TEMP_DIR/complete_audio.mp3" \
    -c:v copy -c:a aac -b:a 192k -shortest \
    -metadata title="Cloudinary Admin Complete Guide" \
    -metadata artist="Cloudinary Admin Module" \
    -metadata comment="Drupal 11 - Full Feature Documentation" \
    "$OUTPUT_FILE" 2>&1 | grep -E "time=|size=" | tail -3

# Get final stats
filesize=$(du -h "$OUTPUT_FILE" | cut -f1)
duration=$(ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "$OUTPUT_FILE" 2>/dev/null)
minutes=$(echo "$duration / 60" | bc)
seconds=$(printf "%.0f" $(echo "$duration % 60" | bc))

echo ""
echo "✅ Video creation complete!"
echo ""
echo "📹 Output: $OUTPUT_FILE"
echo "📊 Size: $filesize"
echo "⏱️  Duration: ${minutes}m ${seconds}s"
echo "🎬 Resolution: 1920x1080 (Full HD)"
echo "🎙️  Audio: AAC 192kbps Stereo"
echo "📦 Format: MP4 (H.264)"
echo "📸 Total Slides: $TOTAL_IMAGES"
echo ""

# Cleanup
rm -rf "$TEMP_DIR"
echo "✨ Your complete narrated video guide is ready!"
