#!/bin/bash

# Simple video creation: screenshots with audio narration
BASE_DIR="screenshots/release-blog/narrated-interactive"
AUDIO_DIR="$BASE_DIR/audio"
OUTPUT_DIR="$BASE_DIR/video"
OUTPUT_FILE="$OUTPUT_DIR/cloudinary-admin-complete-guide.mp4"

mkdir -p "$OUTPUT_DIR"

echo "🎬 Creating Cloudinary Admin Video Guide"
echo "=========================================="
echo ""

# Create temporary directory
TEMP_DIR=$(mktemp -d)
echo "📁 Temp: $TEMP_DIR"

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
    "$TEMP_DIR/intro.png" 2>/dev/null

# Create outro slide
echo "🎨 Creating outro slide..."
convert -size 1920x1080 xc:'#1e293b' \
    -gravity center \
    -pointsize 60 -fill white -font Arial-Bold \
    -annotate +0-100 'Thank You!' \
    -pointsize 40 -fill '#3b82f6' \
    -annotate +0 'Cloudinary Admin for Drupal 11' \
    "$TEMP_DIR/outro.png" 2>/dev/null

# Build concat demuxer file for images
CONCAT_FILE="$TEMP_DIR/concat.txt"
> "$CONCAT_FILE"

# Intro (3 seconds)
echo "file '$TEMP_DIR/intro.png'" >> "$CONCAT_FILE"
echo "duration 3" >> "$CONCAT_FILE"

# Map screenshots to audio and get durations
echo "📊 Processing screenshots..."

# Overview
for img in "$BASE_DIR/01-overview"/step-*.png; do
    [ -f "$img" ] || continue
    step=$(basename "$img" .png | sed 's/step-//')
    audio="$AUDIO_DIR/step-0${step}.mp3"
    [ -f "$audio" ] || continue
    dur=$(ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "$audio" 2>/dev/null)
    dur=$(echo "$dur + 0.5" | bc)
    echo "file '$img'" >> "$CONCAT_FILE"
    echo "duration $dur" >> "$CONCAT_FILE"
    echo "  ✓ $(basename $img) → $(basename $audio) (${dur}s)"
done

# Asset Browser (starts at step 04)
step_num=4
for img in "$BASE_DIR/02-asset-browser"/step-*.png; do
    [ -f "$img" ] || continue
    audio="$AUDIO_DIR/step-$(printf "%02d" $step_num).mp3"
    [ -f "$audio" ] || continue
    dur=$(ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "$audio" 2>/dev/null)
    dur=$(echo "$dur + 0.5" | bc)
    echo "file '$img'" >> "$CONCAT_FILE"
    echo "duration $dur" >> "$CONCAT_FILE"
    echo "  ✓ $(basename $img) → $(basename $audio) (${dur}s)"
    ((step_num++))
done

# Search (step 08)
for img in "$BASE_DIR/03-search-filter"/step-*.png; do
    [ -f "$img" ] || continue
    audio="$AUDIO_DIR/step-08.mp3"
    [ -f "$audio" ] || continue
    dur=$(ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "$audio" 2>/dev/null)
    dur=$(echo "$dur + 0.5" | bc)
    echo "file '$img'" >> "$CONCAT_FILE"
    echo "duration $dur" >> "$CONCAT_FILE"
    echo "  ✓ $(basename $img) → $(basename $audio) (${dur}s)"
done

# Folders (steps 09-16)
step_num=9
for img in "$BASE_DIR/04-folder-management"/step-*.png; do
    [ -f "$img" ] || continue
    audio="$AUDIO_DIR/step-$(printf "%02d" $step_num).mp3"
    [ -f "$audio" ] || continue
    dur=$(ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "$audio" 2>/dev/null)
    dur=$(echo "$dur + 0.5" | bc)
    echo "file '$img'" >> "$CONCAT_FILE"
    echo "duration $dur" >> "$CONCAT_FILE"
    echo "  ✓ $(basename $img) → $(basename $audio) (${dur}s)"
    ((step_num++))
done

# Bulk Operations (steps 17-21)
step_num=17
for img in "$BASE_DIR/05-bulk-operations"/step-*.png; do
    [ -f "$img" ] || continue
    audio="$AUDIO_DIR/step-$(printf "%02d" $step_num).mp3"
    [ -f "$audio" ] || continue
    dur=$(ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "$audio" 2>/dev/null)
    dur=$(echo "$dur + 0.5" | bc)
    echo "file '$img'" >> "$CONCAT_FILE"
    echo "duration $dur" >> "$CONCAT_FILE"
    echo "  ✓ $(basename $img) → $(basename $audio) (${dur}s)"
    ((step_num++))
done

# AI Features (steps 22-26)
step_num=22
for img in "$BASE_DIR/06-ai-features"/step-*.png; do
    [ -f "$img" ] || continue
    audio="$AUDIO_DIR/step-$(printf "%02d" $step_num).mp3"
    [ -f "$audio" ] || continue
    dur=$(ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "$audio" 2>/dev/null)
    dur=$(echo "$dur + 0.5" | bc)
    echo "file '$img'" >> "$CONCAT_FILE"
    echo "duration $dur" >> "$CONCAT_FILE"
    echo "  ✓ $(basename $img) → $(basename $audio) (${dur}s)"
    ((step_num++))
done

# Settings (steps 27-31)
step_num=27
for img in "$BASE_DIR/07-settings-config"/step-*.png; do
    [ -f "$img" ] || continue
    audio="$AUDIO_DIR/step-$(printf "%02d" $step_num).mp3"
    [ -f "$audio" ] || continue
    dur=$(ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "$audio" 2>/dev/null)
    dur=$(echo "$dur + 0.5" | bc)
    echo "file '$img'" >> "$CONCAT_FILE"
    echo "duration $dur" >> "$CONCAT_FILE"
    echo "  ✓ $(basename $img) → $(basename $audio) (${dur}s)"
    ((step_num++))
done

# Admin Settings (steps 32-34)
step_num=32
for img in "$BASE_DIR/08-admin-settings"/step-*.png; do
    [ -f "$img" ] || continue
    audio="$AUDIO_DIR/step-$(printf "%02d" $step_num).mp3"
    [ -f "$audio" ] || continue
    dur=$(ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "$audio" 2>/dev/null)
    dur=$(echo "$dur + 0.5" | bc)
    echo "file '$img'" >> "$CONCAT_FILE"
    echo "duration $dur" >> "$CONCAT_FILE"
    echo "  ✓ $(basename $img) → $(basename $audio) (${dur}s)"
    ((step_num++))
done

# Permissions (steps 35-38)
step_num=35
for img in "$BASE_DIR/09-permissions-roles"/step-*.png; do
    [ -f "$img" ] || continue
    audio="$AUDIO_DIR/step-$(printf "%02d" $step_num).mp3"
    [ -f "$audio" ] || continue
    dur=$(ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "$audio" 2>/dev/null)
    dur=$(echo "$dur + 0.5" | bc)
    echo "file '$img'" >> "$CONCAT_FILE"
    echo "duration $dur" >> "$CONCAT_FILE"
    echo "  ✓ $(basename $img) → $(basename $audio) (${dur}s)"
    ((step_num++))
done

# Usage (steps 39-41)
step_num=39
for img in "$BASE_DIR/10-usage-analytics"/step-*.png; do
    [ -f "$img" ] || continue
    audio="$AUDIO_DIR/step-$(printf "%02d" $step_num).mp3"
    [ -f "$audio" ] || continue
    dur=$(ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "$audio" 2>/dev/null)
    dur=$(echo "$dur + 0.5" | bc)
    echo "file '$img'" >> "$CONCAT_FILE"
    echo "duration $dur" >> "$CONCAT_FILE"
    echo "  ✓ $(basename $img) → $(basename $audio) (${dur}s)"
    ((step_num++))
done

# Workflows (steps 42-47)
step_num=42
for img in "$BASE_DIR/11-complete-workflows"/step-*.png; do
    [ -f "$img" ] || continue
    audio="$AUDIO_DIR/step-$(printf "%02d" $step_num).mp3"
    [ -f "$audio" ] || continue
    dur=$(ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "$audio" 2>/dev/null)
    dur=$(echo "$dur + 0.5" | bc)
    echo "file '$img'" >> "$CONCAT_FILE"
    echo "duration $dur" >> "$CONCAT_FILE"
    echo "  ✓ $(basename $img) → $(basename $audio) (${dur}s)"
    ((step_num++))
done

# Outro (3 seconds)
echo "file '$TEMP_DIR/outro.png'" >> "$CONCAT_FILE"
echo "duration 3" >> "$CONCAT_FILE"
echo "file '$TEMP_DIR/outro.png'" >> "$CONCAT_FILE"

echo ""
echo "🎬 Creating video from images..."
ffmpeg -f concat -safe 0 -i "$CONCAT_FILE" \
    -vf "fps=30,format=yuv420p" \
    -c:v libx264 -preset medium -crf 23 \
    -y "$TEMP_DIR/video.mp4" 2>&1 | grep -E "frame=|time=" | tail -3

echo ""
echo "🎙️  Concatenating all audio files..."
AUDIO_LIST="$TEMP_DIR/audio.txt"
> "$AUDIO_LIST"

# Add all audio in order with absolute paths
for i in {1..47}; do
    audio="$AUDIO_DIR/step-$(printf "%02d" $i).mp3"
    if [ -f "$audio" ]; then
        abs_path=$(realpath "$audio")
        echo "file '$abs_path'" >> "$AUDIO_LIST"
    fi
done

ffmpeg -f concat -safe 0 -i "$AUDIO_LIST" \
    -c copy -y "$TEMP_DIR/audio.mp3" 2>&1 | grep -v "^frame="

echo ""
echo "🎞️  Combining video and audio..."
ffmpeg -i "$TEMP_DIR/video.mp4" -i "$TEMP_DIR/audio.mp3" \
    -c:v copy -c:a aac -b:a 192k -shortest \
    -metadata title="Cloudinary Admin Complete Guide" \
    -y "$OUTPUT_FILE" 2>&1 | grep -E "frame=|time=" | tail -3

filesize=$(du -h "$OUTPUT_FILE" | cut -f1)

echo ""
echo "✅ Video complete!"
echo ""
echo "📹 File: $OUTPUT_FILE"
echo "📊 Size: $filesize"
echo "🎬 Resolution: 1920x1080"
echo ""

rm -rf "$TEMP_DIR"
echo "✨ Done!"
