#!/bin/sh
# Two red-day videos for Hawking: the "scoop scoop scoop" hook and the paper hands vs scooper
# gimmick. Drawn, no live data. Renders into ../konten-x/now. Run from remotion-x/.
set -e
OUT=../konten-x/now
mkdir -p "$OUT"
npx remotion bundle --out-dir=build-hk >/dev/null
FLAGS="--codec=h264 --crf=18 --concurrency=1 --gl=swangle --timeout=120000"
npx remotion render build-hk HKScoop "$OUT/video-red-day-scoop.mp4" $FLAGS
npx remotion render build-hk HKTwoHands "$OUT/video-paper-hands-vs-scooper.mp4" $FLAGS
