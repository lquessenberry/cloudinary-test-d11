#!/usr/bin/env bash
# =============================================================================
# run-tutorial.sh — Full pipeline: Piper narration → Playwright recording → MP4
# =============================================================================
# Usage:
#   ./scripts/tutorial/run-tutorial.sh          # run full pipeline
#   ./scripts/tutorial/run-tutorial.sh narrate  # Piper TTS only
#   ./scripts/tutorial/run-tutorial.sh record   # Playwright recording only
#   ./scripts/tutorial/run-tutorial.sh assemble # FFmpeg assembly only
#
# Prerequisites:
#   piper        — https://github.com/rhasspy/piper  (already at ~/.local/bin/piper)
#   ffmpeg       — apt/brew install ffmpeg
#   Node.js      — for ts-node
#   npx ts-node  — npm install -g ts-node typescript
#
# Output:  output/tutorial/cloudinary-tutorial.mp4
# =============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$SCRIPT_DIR/../.."
OUT_BASE="$PROJECT_DIR/output/tutorial"
STEP="${1:-all}"

# Colour helpers
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
CYAN='\033[0;36m'; BOLD='\033[1m'; RESET='\033[0m'

info()    { echo -e "${CYAN}${BOLD}  ℹ  ${RESET}$*"; }
success() { echo -e "${GREEN}${BOLD}  ✓  ${RESET}$*"; }
warn()    { echo -e "${YELLOW}${BOLD}  ⚠  ${RESET}$*"; }
die()     { echo -e "${RED}${BOLD}  ✗  ${RESET}$*" >&2; exit 1; }

# ---------------------------------------------------------------------------
# Pre-flight checks
# ---------------------------------------------------------------------------
preflight() {
  echo ""
  echo -e "${BOLD}╔══════════════════════════════════════════════════════════╗${RESET}"
  echo -e "${BOLD}║   Cloudinary Drupal Module — Tutorial Video Pipeline     ║${RESET}"
  echo -e "${BOLD}╚══════════════════════════════════════════════════════════╝${RESET}"
  echo ""

  command -v piper   >/dev/null 2>&1 || die "piper not found. Install from https://github.com/rhasspy/piper"
  command -v ffmpeg  >/dev/null 2>&1 || die "ffmpeg not found. sudo apt install ffmpeg"
  command -v ffprobe >/dev/null 2>&1 || die "ffprobe not found (usually bundled with ffmpeg)"
  command -v node    >/dev/null 2>&1 || die "node not found"
  command -v npx     >/dev/null 2>&1 || die "npx not found"

  PIPER_MODEL="/home/lquessenberry/.local/share/piper/en_US-lessac-medium.onnx"
  [[ -f "$PIPER_MODEL" ]] || die "Piper model not found: $PIPER_MODEL"

  mkdir -p "$OUT_BASE"

  success "Pre-flight checks passed"
  echo ""
}

# ---------------------------------------------------------------------------
# Step 1: Generate narration audio with Piper
# ---------------------------------------------------------------------------
do_narrate() {
  info "Step 1/3 — Generating narration audio (Piper TTS)"
  echo ""

  AUDIO_DIR="$OUT_BASE/audio-$(date +%Y%m%dT%H%M%S)"
  bash "$SCRIPT_DIR/generate-narration.sh" "$AUDIO_DIR"

  # Persist path for next steps
  echo "$AUDIO_DIR" > "$OUT_BASE/.latest-audio-dir"
  success "Narration audio complete → $AUDIO_DIR"
  echo ""
}

# ---------------------------------------------------------------------------
# Step 2: Record with Playwright (headed, 1920×1080, with element highlights)
# ---------------------------------------------------------------------------
do_record() {
  info "Step 2/3 — Recording with Playwright (1920×1080)"
  warn "The browser will open in headed mode. Do not interact with it."
  echo ""

  # Use ts-node to run the standalone recording script
  npx ts-node \
    --project "$SCRIPT_DIR/tsconfig.json" \
    "$SCRIPT_DIR/cloudinary-tutorial.spec.ts"

  # Find the output dir that was just created
  REC_DIR=$(ls -dt "$OUT_BASE"/rec-* 2>/dev/null | head -1)
  [[ -n "$REC_DIR" ]] || die "No rec-* directory found after recording"

  echo "$REC_DIR" > "$OUT_BASE/.latest-rec-dir"
  success "Recording complete → $REC_DIR"
  echo ""
}

# ---------------------------------------------------------------------------
# Step 3: Assemble video with FFmpeg
# ---------------------------------------------------------------------------
do_assemble() {
  info "Step 3/3 — Assembling video with FFmpeg"
  echo ""

  REC_DIR=""
  AUDIO_DIR=""

  # Use persisted paths or auto-detect latest
  [[ -f "$OUT_BASE/.latest-rec-dir"   ]] && REC_DIR=$(cat "$OUT_BASE/.latest-rec-dir")
  [[ -f "$OUT_BASE/.latest-audio-dir" ]] && AUDIO_DIR=$(cat "$OUT_BASE/.latest-audio-dir")

  bash "$SCRIPT_DIR/build-video.sh" "$REC_DIR" "$AUDIO_DIR"

  success "Assembly complete"
  echo ""
}

# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------
preflight

case "$STEP" in
  narrate)
    do_narrate
    ;;
  record)
    do_record
    ;;
  assemble)
    do_assemble
    ;;
  all)
    do_narrate
    do_record
    do_assemble

    FINAL="$OUT_BASE/cloudinary-tutorial.mp4"
    echo ""
    echo -e "${GREEN}${BOLD}╔══════════════════════════════════════════════════════════╗${RESET}"
    echo -e "${GREEN}${BOLD}║  🎬  Tutorial video ready!                               ║${RESET}"
    echo -e "${GREEN}${BOLD}╚══════════════════════════════════════════════════════════╝${RESET}"
    echo ""
    echo "    $FINAL"
    echo ""
    ;;
  *)
    echo "Usage: $0 [all|narrate|record|assemble]"
    exit 1
    ;;
esac
