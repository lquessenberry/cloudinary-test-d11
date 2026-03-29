#!/bin/bash

BASE="screenshots/release-blog/narrated-interactive"
OUT="$BASE/video/guide.mp4"
mkdir -p "$BASE/video"

echo "🎬 Fast Video Creation"
echo ""

# Step 1: Merge audio
echo "🎙️  Merging audio..."
ALIST=$(mktemp)
for i in {1..47}; do
    f="$BASE/audio/step-$(printf "%02d" $i).mp3"
    [ -f "$f" ] && echo "file '$(realpath $f)'" >> "$ALIST"
done

ffmpeg -f concat -safe 0 -i "$ALIST" -c copy /tmp/complete.mp3 2>&1 | tail -5
DUR=$(ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 /tmp/complete.mp3)
echo "Audio: ${DUR}s"

# Step 2: Copy images
echo "📸 Copying images..."
IDIR=$(mktemp -d)
n=0
for d in 01-overview 02-asset-browser 03-search-filter 04-folder-management 05-bulk-operations 06-ai-features 07-settings-config 08-admin-settings 09-permissions-roles 10-usage-analytics 11-complete-workflows; do
    for img in "$BASE/$d"/step-*.png; do
        [ -f "$img" ] && cp "$img" "$IDIR/$(printf "%04d" $n).png" && ((n++))
    done
done
echo "Total: $n images"

# Step 3: Create video
FPS=$(echo "scale=6; $n / $DUR" | bc)
echo "🎬 Rendering at ${FPS} fps..."

ffmpeg -framerate $FPS -i "$IDIR/%04d.png" -i /tmp/complete.mp3 \
    -c:v libx264 -preset ultrafast -crf 23 -pix_fmt yuv420p \
    -c:a aac -b:a 192k -shortest \
    "$OUT" 2>&1 | grep -E "time=|size=" | tail -3

SIZE=$(du -h "$OUT" | cut -f1)
MIN=$(echo "$DUR / 60" | bc)
SEC=$(printf "%.0f" $(echo "$DUR % 60" | bc))

echo ""
echo "✅ Complete!"
echo "📹 $OUT"
echo "📊 Size: $SIZE"
echo "⏱️  Duration: ${MIN}m ${SEC}s"

rm -rf "$IDIR" "$ALIST" /tmp/complete.mp3
