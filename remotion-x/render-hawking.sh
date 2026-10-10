#!/bin/sh
# Renders every Hawking ($HAWK) X asset into ../konten-x. Run from remotion-x/.
set -e
OUT=../konten-x
mkdir -p "$OUT" out
npx remotion bundle --out-dir=build-hk >/dev/null
npx remotion still build-hk HKLogo "$OUT/logo-x.png"
npx remotion still build-hk HKBanner "$OUT/banner-x.png"
npx remotion still build-hk HKPostEmpty "$OUT/post-0-the-core-is-unclaimed.png"
npx remotion still build-hk HKPostWho "$OUT/post-0b-who-reaches-the-core-first.png"
npx remotion still build-hk HKPostBoard "$OUT/post-3-the-exposure-board.png"
npx remotion still build-hk HKPostRules "$OUT/post-4-safety-rules.png"
npx remotion still build-hk HKHookPaper "$OUT/hook-1-paper-hands-get-spaghettified.png"
npx remotion still build-hk HKHookCore "$OUT/hook-2-out-hold-no-1-take-the-core.png"
npx remotion still build-hk HKHookTen "$OUT/hook-3-ten-doses-every-emission.png"
npx remotion render build-hk HKGif out/HKGif.mp4 --codec=h264 --crf=1 --concurrency=1 --gl=swangle --timeout=120000
ffmpeg -loglevel error -y -i out/HKGif.mp4 -vf "fps=20,split[a][b];[a]palettegen=max_colors=96:stats_mode=full[p];[b][p]paletteuse=dither=sierra2_4a" -loop 0 "$OUT/gif-new-core.gif"
npx remotion render build-hk HKExplainer "$OUT/post-1-how-hawking-works.mp4" --codec=h264 --crf=18 --concurrency=1 --gl=swangle --timeout=120000
npx remotion render build-hk HKTutorial "$OUT/post-2-tutorial-name-astronaut.mp4" --codec=h264 --crf=18 --concurrency=1 --gl=swangle --timeout=120000
npx remotion render build-hk HKSimulation "$OUT/post-5-fee-simulation.mp4" --codec=h264 --crf=18 --concurrency=1 --gl=swangle --timeout=120000
ls -la "$OUT"
