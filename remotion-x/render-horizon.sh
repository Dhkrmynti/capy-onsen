#!/bin/sh
# Renders every Horizon ($VOID) X asset into ../konten-x. Run from remotion-x/.
set -e
OUT=../konten-x
mkdir -p "$OUT" out
npx remotion bundle --out-dir=build-hz >/dev/null
npx remotion still build-hz HZLogo "$OUT/logo-x.png"
npx remotion still build-hz HZBanner "$OUT/banner-x.png"
npx remotion still build-hz HZPostEmpty "$OUT/post-0-the-singularity-is-unclaimed.png"
npx remotion still build-hz HZPostWho "$OUT/post-0b-who-falls-in-first.png"
npx remotion still build-hz HZPostOrbit "$OUT/post-3-the-orbit.png"
npx remotion still build-hz HZPostLaws "$OUT/post-4-the-laws.png"
npx remotion still build-hz HZHookPaper "$OUT/hook-1-paper-hands-get-spaghettified.png"
npx remotion still build-hz HZHookOutmass "$OUT/hook-2-out-mass-the-singularity.png"
npx remotion still build-hz HZHookTen "$OUT/hook-3-ten-orbits.png"
npx remotion render build-hz HZGif out/HZGif.mp4 --codec=h264 --crf=1 --concurrency=1 --gl=swangle --timeout=120000
ffmpeg -loglevel error -y -i out/HZGif.mp4 -vf "fps=20,split[a][b];[a]palettegen=max_colors=96:stats_mode=full[p];[b][p]paletteuse=dither=sierra2_4a" -loop 0 "$OUT/gif-new-singularity.gif"
npx remotion render build-hz HZExplainer "$OUT/post-1-how-horizon-works.mp4" --codec=h264 --crf=18 --concurrency=1 --gl=swangle --timeout=120000
npx remotion render build-hz HZTutorial "$OUT/post-2-tutorial-name-portrait-x.mp4" --codec=h264 --crf=18 --concurrency=1 --gl=swangle --timeout=120000
npx remotion render build-hz HZSimulation "$OUT/post-5-fee-simulation.mp4" --codec=h264 --crf=18 --concurrency=1 --gl=swangle --timeout=120000
ls -la "$OUT"
