#!/bin/sh
# Renders every Kingpins ($KING) X asset into ../konten-x. Run from remotion-x/.
set -e
OUT=../konten-x
mkdir -p "$OUT" out
npx remotion bundle --out-dir=build-kp >/dev/null
npx remotion still build-kp KPLogo "$OUT/logo-x.png"
npx remotion still build-kp KPBanner "$OUT/banner-x.png"
npx remotion still build-kp KPPostLadder "$OUT/post-3-the-ladder.png"
npx remotion still build-kp KPPostRules "$OUT/post-4-rules-of-the-board.png"
npx remotion render build-kp KPGif out/KPGif.mp4 --codec=h264 --crf=1 --concurrency=1 --gl=swangle --timeout=120000
ffmpeg -loglevel error -y -i out/KPGif.mp4 -vf "fps=20,split[a][b];[a]palettegen=max_colors=96:stats_mode=full[p];[b][p]paletteuse=dither=sierra2_4a" -loop 0 "$OUT/gif-new-king.gif"
npx remotion render build-kp KPExplainer "$OUT/post-1-how-kingpins-works.mp4" --codec=h264 --crf=18 --concurrency=1 --gl=swangle --timeout=120000
npx remotion render build-kp KPTutorial "$OUT/post-2-tutorial-name-portrait-x.mp4" --codec=h264 --crf=18 --concurrency=1 --gl=swangle --timeout=120000
npx remotion render build-kp KPSimulation "$OUT/post-5-fee-simulation.mp4" --codec=h264 --crf=18 --concurrency=1 --gl=swangle --timeout=120000
ls -la "$OUT"
