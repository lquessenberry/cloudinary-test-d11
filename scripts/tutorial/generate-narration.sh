#!/usr/bin/env bash
# =============================================================================
# generate-narration.sh — Generate per-segment WAV files with Piper TTS
# =============================================================================
# Usage:  ./scripts/tutorial/generate-narration.sh [output-dir]
#
# Reads scripts/tutorial/narration.json, generates one WAV per segment using
# Piper, then writes a timings manifest (segment-id -> actual duration ms) and
# a single concatenated combined.wav with 0.8 s silence between segments.
# =============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
NARRATION_JSON="$SCRIPT_DIR/narration.json"
PIPER_MODEL="/home/lquessenberry/.local/share/piper/en_US-lessac-medium.onnx"
SILENCE_S="0.8"   # seconds of silence between segments

# Accept optional output dir (defaults to output/tutorial/audio-<timestamp>)
AUDIO_DIR="${1:-}"
if [[ -z "$AUDIO_DIR" ]]; then
  AUDIO_DIR="$SCRIPT_DIR/../../output/tutorial/audio-$(date +%Y%m%dT%H%M%S)"
fi
mkdir -p "$AUDIO_DIR"

echo ""
echo "🎙  Piper narration generator"
echo "    model : $PIPER_MODEL"
echo "    output: $AUDIO_DIR"
echo ""

# ---------------------------------------------------------------------------
# 1. Extract segment IDs and texts from narration.json
# ---------------------------------------------------------------------------
SEGMENT_COUNT=$(node -e "const d=require('$NARRATION_JSON'); console.log(d.segments.length);")
echo "    segments: $SEGMENT_COUNT"
echo ""

declare -A SEG_DURATION_MS

for i in $(seq 0 $((SEGMENT_COUNT - 1))); do
  SEG_ID=$(node -e "const d=require('$NARRATION_JSON'); console.log(d.segments[$i].id);")
  SEG_TEXT=$(node -e "const d=require('$NARRATION_JSON'); process.stdout.write(d.segments[$i].text);")
  WAV_FILE="$AUDIO_DIR/${SEG_ID}.wav"

  printf "  [%2d/%d] %-35s " "$((i+1))" "$SEGMENT_COUNT" "$SEG_ID"

  # Generate with Piper
  echo "$SEG_TEXT" | piper \
    --model "$PIPER_MODEL" \
    --output_file "$WAV_FILE" \
    2>/dev/null

  # Get actual duration via ffprobe
  DURATION_S=$(ffprobe -v error -show_entries format=duration \
    -of default=noprint_wrappers=1:nokey=1 "$WAV_FILE" 2>/dev/null)
  DURATION_MS=$(node -e "console.log(Math.ceil(parseFloat('$DURATION_S') * 1000))")
  SEG_DURATION_MS[$SEG_ID]=$DURATION_MS

  printf "→ %.2fs\n" "$DURATION_S"
done

# ---------------------------------------------------------------------------
# 2. Write timings.json (actual durations from Piper output)
# ---------------------------------------------------------------------------
TIMINGS_FILE="$AUDIO_DIR/timings.json"
node -e "
const d = require('$NARRATION_JSON');
const timings = {};
const fs = require('fs');
const { execSync } = require('child_process');

d.segments.forEach(s => {
  const wav = '$AUDIO_DIR/' + s.id + '.wav';
  try {
    const out = execSync(
      'ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 \"' + wav + '\"',
      { encoding: 'utf8' }
    ).trim();
    timings[s.id] = { duration_ms: Math.ceil(parseFloat(out) * 1000), text: s.text };
  } catch(e) {
    timings[s.id] = { duration_ms: s.pause_s * 1000, text: s.text };
  }
});
fs.writeFileSync('$TIMINGS_FILE', JSON.stringify(timings, null, 2));
console.log('Written: $TIMINGS_FILE');
"

# ---------------------------------------------------------------------------
# 3. Build a silent WAV (0.8 s) for gaps between segments
# ---------------------------------------------------------------------------
SILENCE_WAV="$AUDIO_DIR/silence.wav"
ffmpeg -y -f lavfi -i "anullsrc=r=22050:cl=mono" \
  -t "$SILENCE_S" -acodec pcm_s16le "$SILENCE_WAV" -loglevel error

# ---------------------------------------------------------------------------
# 4. Concatenate all segment WAVs into combined.wav
# ---------------------------------------------------------------------------
CONCAT_LIST="$AUDIO_DIR/concat.txt"
> "$CONCAT_LIST"

for i in $(seq 0 $((SEGMENT_COUNT - 1))); do
  SEG_ID=$(node -e "const d=require('$NARRATION_JSON'); console.log(d.segments[$i].id);")
  echo "file '${SEG_ID}.wav'" >> "$CONCAT_LIST"
  if [[ $i -lt $((SEGMENT_COUNT - 1)) ]]; then
    echo "file 'silence.wav'" >> "$CONCAT_LIST"
  fi
done

COMBINED_WAV="$AUDIO_DIR/combined.wav"
ffmpeg -y -f concat -safe 0 -i "$CONCAT_LIST" \
  -acodec pcm_s16le "$COMBINED_WAV" -loglevel error

echo ""
echo "✅  Audio files in: $AUDIO_DIR"
echo "    combined.wav    → $(ffprobe -v error -show_entries format=duration \
  -of default=noprint_wrappers=1:nokey=1 "$COMBINED_WAV" 2>/dev/null | \
  awk '{printf "%.1f s\n", $1}')"
echo ""

# Output the audio dir path so run-tutorial.sh can capture it
echo "AUDIO_DIR=$AUDIO_DIR"
