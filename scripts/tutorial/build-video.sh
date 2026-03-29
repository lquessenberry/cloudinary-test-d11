#!/usr/bin/env bash
# =============================================================================
# build-video.sh — Assemble Playwright recording + Piper audio into final MP4
# =============================================================================
# Usage:  ./scripts/tutorial/build-video.sh <rec-dir> <audio-dir>
#
# <rec-dir>   — output/tutorial/rec-<timestamp>/   (contains *.webm from Playwright)
# <audio-dir> — output/tutorial/audio-<timestamp>/ (contains combined.wav + timings.json)
#
# Output:  output/tutorial/cloudinary-tutorial.mp4
#          output/tutorial/cloudinary-tutorial-chapters.mp4  (with chapter metadata)
# =============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$SCRIPT_DIR/../.."
OUT_BASE="$PROJECT_DIR/output/tutorial"
NARRATION_JSON="$SCRIPT_DIR/narration.json"

REC_DIR="${1:-}"
AUDIO_DIR="${2:-}"

# ---------------------------------------------------------------------------
# Auto-detect latest rec-* and audio-* dirs if not provided
# ---------------------------------------------------------------------------
if [[ -z "$REC_DIR" ]]; then
  REC_DIR=$(ls -dt "$OUT_BASE"/rec-* 2>/dev/null | head -1)
  if [[ -z "$REC_DIR" ]]; then
    echo "❌  No rec-* directory found in $OUT_BASE"
    echo "    Run the Playwright recording first."
    exit 1
  fi
fi

if [[ -z "$AUDIO_DIR" ]]; then
  AUDIO_DIR=$(ls -dt "$OUT_BASE"/audio-* 2>/dev/null | head -1)
  if [[ -z "$AUDIO_DIR" ]]; then
    echo "❌  No audio-* directory found in $OUT_BASE"
    echo "    Run generate-narration.sh first."
    exit 1
  fi
fi

echo ""
echo "🎬  Building tutorial video"
echo "    rec   : $REC_DIR"
echo "    audio : $AUDIO_DIR"
echo ""

# ---------------------------------------------------------------------------
# 1. Find the recorded webm file
# ---------------------------------------------------------------------------
WEBM_FILE=$(ls "$REC_DIR"/*.webm 2>/dev/null | head -1)
if [[ -z "$WEBM_FILE" ]]; then
  echo "❌  No .webm file found in $REC_DIR"
  exit 1
fi
echo "    source video : $WEBM_FILE"

COMBINED_WAV="$AUDIO_DIR/combined.wav"
if [[ ! -f "$COMBINED_WAV" ]]; then
  echo "❌  combined.wav not found in $AUDIO_DIR"
  exit 1
fi
echo "    source audio : $COMBINED_WAV"
echo ""

# ---------------------------------------------------------------------------
# 2. Get durations
# ---------------------------------------------------------------------------
VIDEO_DUR=$(ffprobe -v error -show_entries format=duration \
  -of default=noprint_wrappers=1:nokey=1 "$WEBM_FILE")
AUDIO_DUR=$(ffprobe -v error -show_entries format=duration \
  -of default=noprint_wrappers=1:nokey=1 "$COMBINED_WAV")
echo "    video duration : ${VIDEO_DUR}s"
echo "    audio duration : ${AUDIO_DUR}s"
echo ""

# ---------------------------------------------------------------------------
# 3. Build chapter metadata file from narration.json
# ---------------------------------------------------------------------------
CHAPTERS_FILE="$OUT_BASE/chapters.txt"
node -e "
const d = require('$NARRATION_JSON');
const fs = require('fs');
const timings = JSON.parse(fs.readFileSync('$AUDIO_DIR/timings.json', 'utf8'));

let lines = [';FFMETADATA1', ''];
let offset_ms = 0;

d.segments.forEach((s, i) => {
  const dur = timings[s.id]?.duration_ms ?? s.pause_s * 1000;
  const silence = 800; // ms between segments
  lines.push('[CHAPTER]');
  lines.push('TIMEBASE=1/1000');
  lines.push('START=' + offset_ms);
  lines.push('END=' + (offset_ms + dur));
  lines.push('title=' + s.id.replace(/^s\d+_/, '').replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()));
  lines.push('');
  offset_ms += dur + silence;
});

fs.writeFileSync('$CHAPTERS_FILE', lines.join('\n'));
console.log('Written chapter file: $CHAPTERS_FILE');
"

# ---------------------------------------------------------------------------
# 4. Merge video + audio (use shortest, pad audio if video is longer)
# ---------------------------------------------------------------------------
RAW_MP4="$OUT_BASE/cloudinary-tutorial-raw.mp4"
echo "    [1/3] Merging video + audio..."
ffmpeg -y \
  -i "$WEBM_FILE" \
  -i "$COMBINED_WAV" \
  -c:v libx264 \
  -preset slow \
  -crf 18 \
  -vf "scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2" \
  -c:a aac \
  -b:a 192k \
  -ar 44100 \
  -shortest \
  -movflags +faststart \
  "$RAW_MP4" \
  -loglevel warning
echo "    ✓  Raw MP4: $RAW_MP4"

# ---------------------------------------------------------------------------
# 5. Embed chapter metadata
# ---------------------------------------------------------------------------
FINAL_MP4="$OUT_BASE/cloudinary-tutorial.mp4"
echo "    [2/3] Embedding chapter markers..."
ffmpeg -y \
  -i "$RAW_MP4" \
  -i "$CHAPTERS_FILE" \
  -map_metadata 1 \
  -codec copy \
  "$FINAL_MP4" \
  -loglevel warning
echo "    ✓  Final MP4: $FINAL_MP4"

# ---------------------------------------------------------------------------
# 6. Generate a thumbnail at the 5-second mark
# ---------------------------------------------------------------------------
THUMB="$OUT_BASE/thumbnail.jpg"
echo "    [3/3] Extracting thumbnail..."
ffmpeg -y \
  -ss 5 \
  -i "$FINAL_MP4" \
  -vframes 1 \
  -q:v 2 \
  "$THUMB" \
  -loglevel error
echo "    ✓  Thumbnail: $THUMB"

# ---------------------------------------------------------------------------
# 7. Print summary
# ---------------------------------------------------------------------------
FINAL_SIZE=$(du -sh "$FINAL_MP4" | cut -f1)
FINAL_DUR=$(ffprobe -v error -show_entries format=duration \
  -of default=noprint_wrappers=1:nokey=1 "$FINAL_MP4" | \
  awk '{m=int($1/60); s=int($1%60); printf "%d:%02d\n", m, s}')

echo ""
echo "╔══════════════════════════════════════════════════════════╗"
echo "║  ✅  Tutorial video complete!                            ║"
echo "╠══════════════════════════════════════════════════════════╣"
printf "║  File      : %-44s ║\n" "$(basename "$FINAL_MP4")"
printf "║  Duration  : %-44s ║\n" "$FINAL_DUR"
printf "║  Size      : %-44s ║\n" "$FINAL_SIZE"
printf "║  Thumbnail : %-44s ║\n" "$(basename "$THUMB")"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""
echo "    Path: $FINAL_MP4"
echo ""

# Clean up intermediate file
rm -f "$RAW_MP4"
