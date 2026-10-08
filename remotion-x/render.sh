#!/bin/sh
# Renders every X asset into ../konten-x. Run from remotion-x/.
set -e
OUT=../konten-x
mkdir -p "$OUT/post-1-video-demo" "$OUT/post-2-tongue-snap" "$OUT/post-3-the-loop" out
npx remotion bundle --out-dir=build
npx remotion still build Logo "$OUT/logo-x.png"
npx remotion still build Banner "$OUT/banner-x.png"
npx remotion render build Demo "$OUT/post-1-video-demo/pepads-demo.mp4" --codec=h264 --crf=18
# GIFs: render lossless video, then a palette pass at 15 fps for clean flat colours
for c in GifSnap:post-2-tongue-snap/tongue-snap GifBoard:post-3-the-loop/the-loop; do
  id=${c%%:*}; dst=${c#*:}
  npx remotion render build "$id" "out/$id.mp4" --codec=h264 --crf=1
  ffmpeg -loglevel error -y -i "out/$id.mp4" -vf "fps=15,split[a][b];[a]palettegen=max_colors=96:stats_mode=full[p];[b][p]paletteuse=dither=none" -loop 0 "$OUT/$dst.gif"
done
