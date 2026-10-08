#!/bin/sh
# Flip robinheist.fun between the illustration edition and the real paper, without a rebuild.
#   scripts/site-mode.sh demo   → everyone sees made-up numbers; the booth saves on the page only
#   scripts/site-mode.sh live   → the real paper (launch-ready); ?demo still previews
set -e
MODE="$1"
case "$MODE" in demo | live) ;; *) echo "usage: $0 demo|live" >&2; exit 1 ;; esac
ssh -o BatchMode=yes root@72.61.210.75 "sed -i -E 's/name=\"rh-mode\" content=\"[a-z]+\"/name=\"rh-mode\" content=\"$MODE\"/' /var/www/robinheist.fun/dist/index.html"
curl -s -m 15 https://robinheist.fun/ | grep -o 'rh-mode" content="[a-z]*"'
