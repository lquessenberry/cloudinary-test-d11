#!/bin/bash

# Final video creation with proper audio handling
BASE_DIR="screenshots/release-blog/narrated-interactive"
AUDIO_DIR="$BASE_DIR/audio"
OUTPUT_DIR="$BASE_DIR/video"
OUTPUT_FILE="$OUTPUT_DIR/cloudinary-admin-complete-guide.mp4"

mkdir -p "$OUTPUT_DIR"

echo "🎬 Creating Cloudinary Admin Complete Video"
echo "============================================"
echo ""

TEMP_DIR=$(mktemp -d)
echo "📁 Working in: $TEMP_DIR"
echo ""

# Create intro/outro slides
echo "🎨 Creating title slides..."
convert -size 1920x1080 xc:'#1e293b' \
    -gravity center \
    -pointsize 80 -fill white -font Arial-Bold \
    -annotate +0-200 'Cloudinary Admin' \
    -pointsize 50 -fill '#3b82f6' \
    -annotate +0-100 'Complete Feature Guide' \
    -pointsize 30 -fill '#94a3b8' \
    -annotate +0+50 'Drupal 11 Module' \
    "$TEMP_DIR/intro.png" 2>/dev/null

convert -size 1920x1080 xc:'#1e293b' \
    -gravity center \
    -pointsize 60 -fill white -font Arial-Bold \
    -annotate +0-100 'Thank You!' \
    -pointsize 40 -fill '#3b82f6' \
    -annotate +0 'Cloudinary Admin for Drupal 11' \
    "$TEMP_DIR/outro.png" 2>/dev/null

# Step 1: Normalize all audio files to consistent format
echo "🎙️  Normalizing audio files..."
mkdir -p "$TEMP_DIR/normalized"

for i in {1..47}; do
    audio="$AUDIO_DIR/step-$(printf "%02d" $i).mp3"
    if [ -f "$audio" ]; then
        ffmpeg -i "$audio" -ar 44100 -ac 2 -b:a 192k \
            "$TEMP_DIR/normalized/step-$(printf "%02d" $i).mp3" 2>&1 | grep -v "^frame="
        echo "  ✓ Normalized step-$(printf "%02d" $i).mp3"
    fi
done

# Step 2: Create concat file for images with durations
echo ""
echo "📊 Building video sequence..."
CONCAT_FILE="$TEMP_DIR/concat.txt"
AUDIO_LIST="$TEMP_DIR/audio_list.txt"
> "$CONCAT_FILE"
> "$AUDIO_LIST"

# Intro (3 seconds)
echo "file '$TEMP_DIR/intro.png'" >> "$CONCAT_FILE"
echo "duration 3" >> "$CONCAT_FILE"

# Add 3 seconds of silence for intro
ffmpeg -f lavfi -i anullsrc=r=44100:cl=stereo -t 3 -ar 44100 -ac 2 -b:a 192k \
    "$TEMP_DIR/normalized/intro_silence.mp3" 2>&1 | grep -v "^frame="
echo "file '$TEMP_DIR/normalized/intro_silence.mp3'" >> "$AUDIO_LIST"

# Process all screenshots with their audio
step_map=(
    "01-overview/step-01.png:01"
    "01-overview/step-02.png:02"
    "02-asset-browser/step-01.png:04"
    "02-asset-browser/step-02.png:05"
    "02-asset-browser/step-03.png:06"
    "02-asset-browser/step-05.png:07"
    "03-search-filter/step-01.png:08"
    "04-folder-management/step-01.png:09"
    "04-folder-management/step-02.png:10"
    "04-folder-management/step-03.png:11"
    "04-folder-management/step-05.png:12"
    "04-folder-management/step-06.png:13"
    "04-folder-management/step-07.png:14"
    "04-folder-management/step-08.png:15"
    "04-folder-management/step-09.png:16"
    "05-bulk-operations/step-01.png:17"
    "05-bulk-operations/step-02.png:18"
    "05-bulk-operations/step-03.png:19"
    "05-bulk-operations/step-04.png:20"
    "05-bulk-operations/step-05.png:21"
    "06-ai-features/step-01.png:22"
    "06-ai-features/step-02.png:23"
    "06-ai-features/step-03.png:24"
    "06-ai-features/step-04.png:25"
    "06-ai-features/step-05.png:26"
    "07-settings-config/step-01.png:27"
    "07-settings-config/step-02.png:28"
    "07-settings-config/step-03.png:29"
    "07-settings-config/step-04.png:30"
    "07-settings-config/step-05.png:31"
    "08-admin-settings/step-01.png:32"
    "08-admin-settings/step-02.png:33"
    "08-admin-settings/step-03.png:34"
    "09-permissions-roles/step-01.png:35"
    "09-permissions-roles/step-02.png:36"
    "09-permissions-roles/step-03.png:37"
    "09-permissions-roles/step-04.png:38"
    "10-usage-analytics/step-01.png:39"
    "10-usage-analytics/step-02.png:40"
    "10-usage-analytics/step-03.png:41"
    "11-complete-workflows/step-01.png:42"
    "11-complete-workflows/step-02.png:43"
    "11-complete-workflows/step-03.png:44"
    "11-complete-workflows/step-04.png:45"
    "11-complete-workflows/step-05.png:46"
    "11-complete-workflows/step-06.png:47"
)

for mapping in "${step_map[@]}"; do
    img_path="${mapping%:*}"
    audio_num="${mapping#*:}"
    
    screenshot="$BASE_DIR/$img_path"
    audio="$TEMP_DIR/normalized/step-${audio_num}.mp3"
    
    if [ ! -f "$screenshot" ]; then
        echo "⚠️  Missing: $screenshot"
        continue
    fi
    
    if [ ! -f "$audio" ]; then
        echo "⚠️  Missing: $audio"
        continue
    fi
    
    # Get audio duration
    dur=$(ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "$audio" 2>/dev/null)
    dur=$(echo "$dur + 0.5" | bc)
    
    echo "file '$screenshot'" >> "$CONCAT_FILE"
    echo "duration $dur" >> "$CONCAT_FILE"
    echo "file '$audio'" >> "$AUDIO_LIST"
    
    echo "  ✓ $(basename $screenshot) → step-${audio_num}.mp3 (${dur}s)"
done

# Outro (3 seconds)
echo "file '$TEMP_DIR/outro.png'" >> "$CONCAT_FILE"
echo "duration 3" >> "$CONCAT_FILE"
echo "file '$TEMP_DIR/outro.png'" >> "$CONCAT_FILE"

ffmpeg -f lavfi -i anullsrc=r=44100:cl=stereo -t 3 -ar 44100 -ac 2 -b:a 192k \
    "$TEMP_DIR/normalized/outro_silence.mp3" 2>&1 | grep -v "^frame="
echo "file '$TEMP_DIR/normalized/outro_silence.mp3'" >> "$AUDIO_LIST"

# Step 3: Create video from images
echo ""
echo "🎬 Generating video from screenshots..."
ffmpeg -f concat -safe 0 -i "$CONCAT_FILE" \
    -vf "fps=30,format=yuv420p" \
    -c:v libx264 -preset medium -crf 23 \
    -y "$TEMP_DIR/video_silent.mp4" 2>&1 | grep -E "time=|size=" | tail -3

# Step 4: Concatenate all audio
echo ""
echo "🎙️  Merging audio narrations..."
ffmpeg -f concat -safe 0 -i "$AUDIO_LIST" \
    -c copy -y "$TEMP_DIR/audio_complete.mp3" 2>&1 | grep -E "time=|size=" | tail -3

# Step 5: Combine video and audio
echo ""
echo "🎞️  Combining video with audio..."
ffmpeg -i "$TEMP_DIR/video_silent.mp4" -i "$TEMP_DIR/audio_complete.mp3" \
    -c:v copy -c:a aac -b:a 192k -shortest \
    -metadata title="Cloudinary Admin Complete Guide" \
    -metadata artist="Cloudinary Admin Module" \
    -metadata comment="Drupal 11 Module Documentation" \
    -y "$OUTPUT_FILE" 2>&1 | grep -E "time=|size=" | tail -3

# Get stats
filesize=$(du -h "$OUTPUT_FILE" | cut -f1)
duration=$(ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "$OUTPUT_FILE" 2>/dev/null)
minutes=$(echo "$duration / 60" | bc)
seconds=$(echo "$duration % 60" | bc)

echo ""
echo "✅ Video creation complete!"
echo ""
echo "📹 Output: $OUTPUT_FILE"
echo "📊 Size: $filesize"
echo "⏱️  Duration: ${minutes}m ${seconds}s"
echo "🎬 Resolution: 1920x1080 (Full HD)"
echo "🎙️  Audio: AAC 192kbps Stereo"
echo "📦 Format: MP4 (H.264)"
echo ""

# Cleanup
rm -rf "$TEMP_DIR"
echo "✨ Done! Your complete video guide is ready!"
