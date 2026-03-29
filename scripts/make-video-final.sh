#!/bin/bash

BASE="screenshots/release-blog/narrated-interactive"
OUT="$BASE/video/cloudinary-admin-guide.mp4"
mkdir -p "$BASE/video"

echo "🎬 Creating Video Guide"
echo ""

# Re-encode all audio to consistent format
echo "🎙️  Re-encoding audio files..."
TEMP=$(mktemp -d)
for i in {1..47}; do
    src="$BASE/audio/step-$(printf "%02d" $i).mp3"
    dst="$TEMP/step-$(printf "%02d" $i).mp3"
    [ -f "$src" ] && ffmpeg -i "$src" -ar 44100 -ac 2 -b:a 192k "$dst" -y -v quiet
done

# Concatenate audio
echo "🎵 Merging audio..."
ALIST="$TEMP/list.txt"
for i in {1..47}; do
    [ -f "$TEMP/step-$(printf "%02d" $i).mp3" ] && \
    echo "file '$TEMP/step-$(printf "%02d" $i).mp3'" >> "$ALIST"
done

ffmpeg -f concat -safe 0 -i "$ALIST" -c copy "$TEMP/audio.mp3" -y -v quiet
DUR=$(ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "$TEMP/audio.mp3")
echo "Duration: ${DUR}s"

# Copy images
echo "📸 Preparing images..."
IDIR="$TEMP/images"
mkdir -p "$IDIR"
n=0
for d in 01-overview 02-asset-browser 03-search-filter 04-folder-management 05-bulk-operations 06-ai-features 07-settings-config 08-admin-settings 09-permissions-roles 10-usage-analytics 11-complete-workflows; do
    for img in "$BASE/$d"/step-*.png; do
        [ -f "$img" ] && cp "$img" "$IDIR/$(printf "%04d" $n).png" && ((n++))
    done
done
echo "Images: $n"

# Create video
FPS=$(echo "scale=6; $n / $DUR" | bc)
echo "🎬 Rendering video..."

ffmpeg -framerate $FPS -i "$IDIR/%04d.png" -i "$TEMP/audio.mp3" \
    -c:v libx264 -preset ultrafast -crf 23 -pix_fmt yuv420p \
    -c:a aac -b:a 192k -shortest \
    "$OUT" -y -v error -stats

SIZE=$(du -h "$OUT" | cut -f1)
MIN=$(echo "$DUR / 60" | bc)
SEC=$(printf "%.0f" $(echo "$DUR % 60" | bc))

echo ""
echo "✅ Done!"
echo "📹 $OUT"
echo "📊 $SIZE | ${MIN}m ${SEC}s"

rm -rf "$TEMP"
