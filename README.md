# Capy Onsen · $ONSEN

Memecoin site + engine for **$ONSEN · Capy Onsen** (Robinhood Chain 4663, launched on Pons). Creator fees run a four-step loop: ETH straight to the **10 biggest wallets that never sold**, the treasury, a buyback that is burned, the treasury again. Concept and the earlier lores: `CONCEPT.md`. Design: `DESIGN.md`.

## Run locally

```bash
npm install
npm run bot          # engine + API on 127.0.0.1:5023 (standby until /lotnok is filled)
npm run dev          # site on http://localhost:5183 (proxies /api to 5023)
```

- The local dev server always shows labelled demo data; `http://localhost:5183/?live` shows the real state (empty until the engine has a token). Never share demo screenshots as real numbers.
- `http://localhost:5183/lotnok` is the engine room.

## Engine (`bot/pads-engine.ts`)

| Step | What happens |
|---|---|
| Indexer | Follows every `$ONSEN` Transfer from the mint block. Tracks balance, first-buy time, hopped-off flag. Contracts that relay tokens within one tx (routers) are recognised and never counted as holders. |
| Hopped off | A wallet that sends `$ONSEN` to the Pons curve, a DEX, or any other contract is marked hopped off forever. Wallet-to-wallet is fine. |
| The cycle | Each time the Pons fee escrow reaches the current step's size, the engine claims it (tongue snap) and spends all of it on that step, then moves on: **feeding** `FEEDING_ETH` (0.02) → ETH to the top `FEEDING_TOP_N` (10) holders by balance, split by tier (`FEEDING_TIERS`) and balance · **keeper** `KEEPER_ETH` (0.025) → treasury · **sink** `SINK_ETH` (0.01) → buy $ONSEN (curve, or Uniswap v4 after graduation) and send exactly what was bought to 0x…dEaD (the operator wallet's own bag is never touched) · **keeper** again · back to feeding. |
| Sitters | Never hopped off, balance ≥ `MIN_BALANCE`, first $ONSEN at least `MIN_HOLD_HOURS` old (live engine: 0, set 8 Oct 2026 so a full escrow pays out at once). |
| Restarts | Every tx hash is saved before it is awaited; a restart checks the chain and resumes the round, so nothing is sent or counted twice. A recipient that refuses ETH is skipped and its share stays with the engine. |

Settings come from env or `bot-config.json` (see `.env.example`). Token, operator key and treasury are **set once** in `/lotnok`; changing them later needs `ADMIN_SECRET` in the header.

API: `GET /api/status`, `/api/pond?limit=` (sitters by balance), `/api/wallet/:addr`, `/api/rounds`, `/api/rounds/:n`; `POST /api/admin/save`.

Tested read-only on 8 Oct 2026 against live Pons tokens (no key, no transactions): indexing, mint-block detection, router and sell detection, and the top-10 ranking matched the chain. Claiming and sending are not yet exercised on mainnet: watch the first full cycle.

## Deploy (same VPS pattern as the other sites)

Port **5023** is free (5015–5022 are taken). Domain: **pepads.fun**.

```bash
# site
npm run build
rsync -az --delete -e "ssh -o BatchMode=yes" dist/ root@76.13.20.64:/var/www/pepads.fun/dist/

# engine
rsync -az -e "ssh -o BatchMode=yes" bot package.json package-lock.json root@76.13.20.64:/var/www/pads-engine/
ssh root@76.13.20.64 "cd /var/www/pads-engine && npm ci --omit=dev && PORT=5023 pm2 start node_modules/.bin/tsx --name pads-engine -- bot/pads-engine.ts && pm2 save"
```

nginx: new `/etc/nginx/sites-available/pepads.fun` serving `dist/` with `try_files $uri /index.html;` and `location /api/ { proxy_pass http://127.0.0.1:5023; }`, then Certbot. Don't touch other sites' configs.

## Launch checklist

1. Launch $ONSEN on Pons **from the wallet whose key goes into the engine** (creator fees only reach the launching wallet).
2. Put ~0.002 ETH gas in it.
3. `/lotnok` → CA, key, treasury → Save. Check `/api/status` shows the token and an indexed block.
4. The first feeding snaps once the escrow reaches 0.01 ETH and at least one wallet has held for an hour.
