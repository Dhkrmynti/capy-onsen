#!/bin/sh
# Renders the Robin Heist Gazette X kit into ../konten-x (flat, no folders). Run from remotion-x/.
set -e
OUT=../konten-x
mkdir -p "$OUT" out/gz
npx remotion bundle --out-dir=build-gz
npx remotion still build-gz GZLogo "$OUT/logo-x.png"
npx remotion still build-gz GZBanner "$OUT/banner-x.png"
npx remotion still build-gz GZPostPlan "$OUT/post-1-every-trade-is-a-heist.png"
npx remotion still build-gz GZPostWanted "$OUT/post-2-sell-once-snitch.png"
npx remotion still build-gz GZPostMugshots "$OUT/post-3-get-your-mugshot.png"
npx remotion render build-gz GZDemo "$OUT/video-demo.mp4" --codec=h264 --crf=18
npx remotion render build-gz GZTutorial "$OUT/video-tutorial.mp4" --codec=h264 --crf=18
# GIF: lossless video first, then a palette pass at 15 fps for clean flat newsprint colours
npx remotion render build-gz GZGif out/gz/gif.mp4 --codec=h264 --crf=1
ffmpeg -loglevel error -y -i out/gz/gif.mp4 -vf "fps=15,split[a][b];[a]palettegen=max_colors=64:stats_mode=full[p];[b][p]paletteuse=dither=none" -loop 0 "$OUT/gif-sell-once.gif"
