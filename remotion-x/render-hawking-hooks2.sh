#!/bin/sh
# Three more X posts for Hawking: the latest reward as news (numbers from hawkings.fun now) and
# two gimmicks. Renders into ../konten-x/now. Run from remotion-x/, right before posting.
set -e
OUT=../konten-x/now
mkdir -p "$OUT"
for p in status rounds pond; do curl -fsS "https://hawkings.fun/api/$p" > "out-news-$p.json"; done
python3 -c '
import json, datetime
s = json.load(open("out-news-status.json"))["data"]; r = json.load(open("out-news-rounds.json"))["data"]; p = json.load(open("out-news-pond.json"))["data"]
feeds = [x for x in r if x["kind"] == "feeding" and x.get("doneAt")]
last = feeds[0]
top = max(p["rows"], key=lambda x: float(x.get("received") or 0))
names = {"feeding": "Reward", "keeper": "Treasury", "sink": "Buyback & burn"}
at = datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(hours=7)
json.dump({"n": len(feeds), "paidETH": float(last["fedETH"]), "wallets": last["recipients"], "totalETH": float(s["totals"]["fedETH"]),
  "rounds": len([x for x in r if x.get("doneAt")]), "burned": float(s["totals"]["tokensBurned"]), "topAddr": top["addr"], "topETH": float(top.get("received") or 0),
  "onSite": s["counts"]["sitters"] + s["counts"]["waiting"], "next": names[s["cycle"]["kind"]], "escrow": float(s["escrowETH"]), "nextETH": s["cycle"]["thresholdETH"],
  "at": at.strftime("%d %b %Y, %H:%M WIB").upper()}, open("out-news-reward.json", "w"))'
cat out-news-reward.json; echo
npx remotion bundle --out-dir=build-hk >/dev/null
npx remotion still build-hk HKRewardNews "$OUT/news-reward-landed.png" --props=out-news-reward.json --timeout=120000 >/dev/null
npx remotion still build-hk HKBoardingPass "$OUT/hook-boarding-pass.png" --timeout=120000 >/dev/null
npx remotion still build-hk HKForecast "$OUT/hook-forecast-from-the-core.png" --timeout=120000 >/dev/null
