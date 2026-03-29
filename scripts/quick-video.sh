#!/bin/bash
set -e

BASE="screenshots/release-blog/narrated-interactive"
OUT="$BASE/video/cloudinary-admin-guide.mp4"
mkdir -p "$BASE/video"

echo "🎬 Quick Video Creation"
echo "======================="

# Concatenate audio directly (no normalization)
echo "🎙️  Merging audio..."
AUDIO_LIST=$(mktemp)
for i in {1..47}; do
    [ -f "$BASE/audio/step-$(printf "%02d" $i).mp3" ] && \
    echo "file '$(pwd)/$BASE/audio/step-$(printf "%02d" $i).mp3'" >> "$AUDIO_LIST"
done

ffmpeg -f concat -safe 0 -i "$AUDIO_LIST" -c copy -y /tmp/audio.mp3 -v quiet -stats

# Get audio duration
DUR=$(ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 /tmp/audio.mp3)
echo "Audio: ${DUR}s"

# Copy images in order
echo "📸 Preparing images..."
IMG_DIR=$(mktemp -d)
n=0
for dir in 01-overview 02-asset-browser 03-search-filter 04-folder-management 05-bulk-operations 06-ai-features 07-settings-config 08-admin-settings 09-permissions-roles 10-usage-analytics 11-complete-workflows; do
    for img in "$BASE/$dir"/step-*.png; do
        [ -f "$img" ] && cp "$img" "$IMG_DIR/$(printf "%04d" $n).png" && ((n++))
    done
done
echo "Images: $n"

# Calculate framerate
FPS=$(echo "scale=6; $n / $DUR" | bc)
echo "FPS: $FPS"

# Create video
echo "🎬 Creating video..."
ffmpeg -framerate $FPS -i "$IMG_DIR/%04d.png" -i /tmp/audio.mp3 \
    -c:v libx264 -preset ultrafast -crf 23 -pix_fmt yuv420p \
    -c:a aac -b:a 192k -shortest \
    -y "$OUT" -v quiet -stats

SIZE=$(du -h "$OUT" | cut -f1)
echo ""
echo "✅ Done: $OUT ($SIZE)"

rm -rf "$IMG_DIR" "$AUDIO_LIST" /tmp/audio.mp3
