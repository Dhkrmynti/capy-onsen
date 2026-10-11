#!/bin/sh
# Live-state posters for Hawking ($HAWK): reads hawkings.fun now and renders into ../konten-x/now.
# Run from remotion-x/. Numbers change with every trade, so render right before posting.
set -e
OUT=../konten-x/now
mkdir -p "$OUT"
PROPS=$(curl -fsS https://hawkings.fun/api/status | python3 -c '
import json, sys, datetime
d = json.load(sys.stdin)["data"]
feed = next((s for s in d["cycle"]["steps"] if s["kind"] == "feeding"), {"thresholdETH": "0.02"})
at = datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(hours=7)
print(json.dumps({"ca": d["tokenAddress"], "heirs": d["counts"]["sitters"] + d["counts"]["waiting"], "out": d["counts"]["hopped"],
  "escrow": float(d["escrowETH"]), "target": float(feed["thresholdETH"]), "at": at.strftime("%d %b %Y, %H:%M WIB").upper()}))')
echo "$PROPS"
npx remotion bundle --out-dir=build-hk >/dev/null
npx remotion still build-hk HKNowLive "$OUT/now-1-hawk-is-live.png" --props="$PROPS" --timeout=120000 >/dev/null
npx remotion still build-hk HKNowZones "$OUT/now-2-zones-open.png" --props="$PROPS" --timeout=120000 >/dev/null
npx remotion still build-hk HKNowLevel "$OUT/now-3-radiation-level.png" --props="$PROPS" --timeout=120000 >/dev/null
npx remotion still build-hk HKNowOut "$OUT/now-4-spaghettified.png" --props="$PROPS" --timeout=120000 >/dev/null
