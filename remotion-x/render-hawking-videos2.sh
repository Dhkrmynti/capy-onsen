#!/bin/sh
# Two X videos for Hawking: the Connect X feature, and the "good afternoon" red-market briefing
# (totals from hawkings.fun now). Renders into ../konten-x/now. Run from remotion-x/.
set -e
OUT=../konten-x/now
mkdir -p "$OUT"
for p in status rounds; do curl -fsS "https://hawkings.fun/api/$p" > "out-news-$p.json"; done
python3 -c '
import json, datetime
s = json.load(open("out-news-status.json"))["data"]; r = json.load(open("out-news-rounds.json"))["data"]
t = s["totals"]; at = datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(hours=7)
json.dump({"fedETH": float(t["fedETH"]), "burned": float(t["tokensBurned"]), "treasuryETH": float(t["keeperETH"]),
  "rounds": len([x for x in r if x.get("doneAt")]), "out": s["counts"]["hopped"], "onSite": s["counts"]["sitters"] + s["counts"]["waiting"],
  "at": at.strftime("%d %b %Y, %H:%M WIB").upper()}, open("out-news-bear.json", "w"))'
cat out-news-bear.json; echo
npx remotion bundle --out-dir=build-hk >/dev/null
FLAGS="--codec=h264 --crf=18 --concurrency=1 --gl=swangle --timeout=120000"
npx remotion render build-hk HKXVideo "$OUT/video-connect-x.mp4" $FLAGS
npx remotion render build-hk HKBearNews "$OUT/video-good-afternoon-red-day.mp4" --props=out-news-bear.json $FLAGS
