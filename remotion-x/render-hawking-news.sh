#!/bin/sh
# Hawking news video: reads the top ten and the last emission from hawkings.fun now and renders
# ../konten-x/now/news-briefing.mp4. Run from remotion-x/, right before posting.
set -e
OUT=../konten-x/now
mkdir -p "$OUT"
for p in status pond rounds; do curl -fsS "https://hawkings.fun/api/$p" > "out-news-$p.json"; done
PROPS=$(python3 -c '
import json, datetime
get = lambda p: json.load(open("out-news-" + p + ".json"))["data"]
s, pond, rounds = get("status"), get("pond"), get("rounds")
feeds = [r for r in rounds if r["kind"] == "feeding" and r.get("doneAt")]
last = feeds[0] if feeds else {"n": 0, "fedETH": "0", "recipients": 0}
rows = [{"rank": r["rank"], "addr": r["addr"], "balance": float(r["balance"]), "received": float(r.get("received") or 0),
  "name": r.get("nickname") or ("@" + r["x"]["username"] if r.get("x") else "")} for r in pond["rows"][:10]]
at = datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(hours=7)
print(json.dumps({"ca": s["tokenAddress"], "rows": rows, "emissionN": last["n"], "emissionETH": float(last["fedETH"]), "recipients": last["recipients"],
  "holders": s["counts"]["sitters"] + s["counts"]["waiting"], "out": s["counts"]["hopped"],
  "treasuryETH": float(s["totals"]["keeperETH"]),
  "next": {"feeding": "The Emission", "keeper": "Containment Fund", "sink": "Evaporation (buyback + burn)"}[s["cycle"]["kind"]] + " " + s["cycle"]["thresholdETH"] + " ETH", "at": at.strftime("%d %b %Y, %H:%M WIB").upper()}))')
echo "$PROPS" > out-news-props.json
echo "$PROPS" | head -c 300; echo
npx remotion bundle --out-dir=build-hk >/dev/null
npx remotion render build-hk HKNews "$OUT/news-briefing.mp4" --props=out-news-props.json --codec=h264 --crf=18 --concurrency=2 --timeout=120000
