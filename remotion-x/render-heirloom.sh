#!/bin/sh
# Renders every Heirloom ($HEIR) X asset into ../konten-x. Run from remotion-x/.
# Needs the stills in public/hl (3D plates and tutorial screens captured from the site).
set -e
OUT=../konten-x
mkdir -p "$OUT" out
npx remotion bundle --out-dir=build-hl >/dev/null
npx remotion still build-hl HLLogo "$OUT/logo-x.png"
npx remotion still build-hl HLBanner "$OUT/banner-x.png"
npx remotion render build-hl HLExplainer "$OUT/post-1-how-heirloom-works.mp4" --codec=h264 --crf=18 --concurrency=1 --gl=swangle --timeout=120000
npx remotion render build-hl HLTutorial "$OUT/post-2-tutorial-name-seal-x.mp4" --codec=h264 --crf=18 --concurrency=1 --gl=swangle --timeout=120000
npx remotion still build-hl HLPostHeirs "$OUT/post-3-the-ten-heirs.png"
npx remotion still build-hl HLPostWill "$OUT/post-4-the-will.png"
# GIF: a lossless pass, then a palette pass at 20 fps
npx remotion render build-hl HLGif out/HLGif.mp4 --codec=h264 --crf=1 --timeout=120000
ffmpeg -loglevel error -y -i out/HLGif.mp4 -vf "fps=20,split[a][b];[a]palettegen=max_colors=128:stats_mode=full[p];[b][p]paletteuse=dither=sierra2_4a" -loop 0 "$OUT/gif-written-out.gif"
ls -la "$OUT"
