#!/bin/sh
# Four X posts for Hawking: the Connect X update, the latest burn as news (numbers from
# hawkings.fun now), a name-tag gimmick and a hook. Renders into ../konten-x/now.
set -e
OUT=../konten-x/now
mkdir -p "$OUT"
for p in status rounds; do curl -fsS "https://hawkings.fun/api/$p" > "out-news-$p.json"; done
python3 -c '
import json, datetime
s = json.load(open("out-news-status.json"))["data"]; r = json.load(open("out-news-rounds.json"))["data"]
burns = [x for x in r if x["kind"] == "sink" and x.get("doneAt")]
t = s["totals"]; names = {"feeding": "Reward", "keeper": "Treasury", "sink": "Buyback & burn"}
at = datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(hours=7)
json.dump({"n": len(burns), "burnedNow": float(burns[0]["tokensBurned"]), "burnedTotal": float(t["tokensBurned"]), "fedETH": float(t["fedETH"]),
  "treasuryETH": float(t["keeperETH"]), "rounds": len([x for x in r if x.get("doneAt")]), "next": names[s["cycle"]["kind"]], "escrow": float(s["escrowETH"]),
  "nextETH": s["cycle"]["thresholdETH"], "at": at.strftime("%d %b %Y, %H:%M WIB").upper()}, open("out-news-burn.json", "w"))'
cat out-news-burn.json; echo
npx remotion bundle --out-dir=build-hk >/dev/null
npx remotion still build-hk HKXFeature "$OUT/feature-connect-x.png" --timeout=120000 >/dev/null
npx remotion still build-hk HKBurnNews "$OUT/news-burn-2.png" --props=out-news-burn.json --timeout=120000 >/dev/null
npx remotion still build-hk HKNameTag "$OUT/gimmick-hello-my-name-is.png" --timeout=120000 >/dev/null
npx remotion still build-hk HKHookHandle "$OUT/hook-nobody-remembers-0x.png" --timeout=120000 >/dev/null
