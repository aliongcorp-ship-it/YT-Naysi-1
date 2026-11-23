#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
python3 -m venv .venv
.venv/bin/pip install -q -r requirements.txt
FFMPEG="$(.venv/bin/python -c 'import imageio_ffmpeg; print(imageio_ffmpeg.get_ffmpeg_exe())')"
# Synthesis WAV is 24 kHz mono; normalize format before the 48 kHz score bus.
for f in audio/vo_fx/s*.wav; do
  "$FFMPEG" -y -v error -i "$f" -ar 48000 -ac 1 -c:a pcm_s16le "${f%.wav}.resampled.wav"
  mv "${f%.wav}.resampled.wav" "$f"
done
node scripts/build-timeline.mjs
.venv/bin/python scripts/score.py
"$FFMPEG" -y -v error -i audio/mix/raw.wav -af loudnorm=I=-14:TP=-1.5:LRA=11 -ar 48000 -ac 2 public/audio/master.wav
npx remotion render src/index.ts Naysi out/naysi_master.mp4 \
  --browser-executable="$(pwd)/.bin/chrome-wrapper" \
  --codec=h264 --crf=20 --concurrency=2 --jpeg-quality=90 --pixel-format=yuv420p \
  --audio-codec=aac --audio-bitrate=320k --overwrite
