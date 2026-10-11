#!/bin/sh
# Three X posts for Hawking: a live bulletin (numbers from hawkings.fun now) and two gimmicks.
# Renders into ../konten-x/now. Run from remotion-x/, right before posting.
set -e
OUT=../konten-x/now
mkdir -p "$OUT"
for p in status rounds; do curl -fsS "https://hawkings.fun/api/$p" > "out-news-$p.json"; done
python3 -c '
import json, datetime
s = json.load(open("out-news-status.json"))["data"]; r = json.load(open("out-news-rounds.json"))["data"]
done = [x for x in r if x.get("doneAt")]
t = s["totals"]; c = s["cycle"]
names = {"feeding": "The Emission", "keeper": "Containment Fund", "sink": "Buyback & burn"}
at = datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(hours=7)
json.dump({"ca": s["tokenAddress"], "cycles": max(1, len(done) // len(c["steps"])), "fedETH": float(t["fedETH"]), "treasuryETH": float(t["keeperETH"]),
  "burned": float(t["tokensBurned"]), "onSite": s["counts"]["sitters"] + s["counts"]["waiting"], "out": s["counts"]["hopped"],
  "next": names[c["kind"]], "nextETH": c["thresholdETH"], "escrow": float(s["escrowETH"]), "at": at.strftime("%d %b %Y, %H:%M WIB").upper()}, open("out-news-bulletin.json", "w"))'
cat out-news-bulletin.json; echo
npx remotion bundle --out-dir=build-hk >/dev/null
npx remotion still build-hk HKBulletin "$OUT/news-cycle-complete.png" --props=out-news-bulletin.json --timeout=120000 >/dev/null
npx remotion still build-hk HKJobAd "$OUT/hook-astronauts-wanted.png" --timeout=120000 >/dev/null
npx remotion still build-hk HKBoldChoice "$OUT/hook-bold-choice.png" --timeout=120000 >/dev/null
