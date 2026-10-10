# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Delegated (chosen to match the owner's other token sites so the VPS deploy flow stays identical): Vite + React + TypeScript static site, GSAP + ScrollTrigger for scroll motion, served by nginx from `/var/www/orbiters.fun/dist`. Bot: Node + `tsx` + ethers v6 under pm2, HTTP API on its own port, proxied at `/api/`.

## Users

- **Primary:** memecoin traders on Robinhood Chain arriving from X/Telegram, mostly on phones. Their job: understand in seconds what holding $ORBIT does for them, copy the CA, buy on Pons.
- **Secondary:** holders ("sitters") checking their own wallet: still sitting or hopped off, pad days, how many $ORBIT they've received, what tonight's feeding might bring.
- **Operator:** the creator, using the hidden `/lotnok` route to configure the engine.

## Product Purpose

$ORBIT is a memecoin on Robinhood Chain (chain ID 4663, launched on Pons Family v2) whose creator fees run a loop. A 24/7 bot claims the creator fees (ETH) from the Pons fee escrow whenever it reaches the next step's size and spends it on that step: a **Supply Drop** (feeding) (ETH straight to the 10 biggest wallets that have **never sold**), the **Mission Fund** (treasury), then **The Burn** (sink) (buy $ORBIT back and burn it). Selling (sending $ORBIT to the Pons curve or the DEX pool) permanently disqualifies a wallet. The website is a read-only tracker and wallet checker plus landing page. Success: a visitor understands "hold big and never snitch → Robin pays you in ETH", checks their crew card, and buys.

Full concept: `CONCEPT.md`.

## Positioning

Every other fee-engine token on the owner's VPS burns. $ORBIT rewards patience directly and visibly: the leaderboard, the per-wallet checker and the daily feeding log (with tx hashes) prove it, on-chain, every day.

## Operating Context

- Traders compare tokens on Pons launchpad and DexScreener; they live on X.
- Ritual: every feeding → X post with the ETH sent and the tx.
- Infra: shared VPS `76.13.20.64` (nginx + Certbot + pm2) hosting ~15 other token sites; never touch their configs or processes.

## Capabilities and Constraints

- Engine pieces reused from the existing burn bots: escrow polling/claim, curve buy (pre-graduation) and Uniswap v4 buy (post-graduation), `/api/status`, `/lotnok` config.
- New pieces: Transfer-log indexer, sell detection, fee split, daily snapshot + pro-rata distribution (idempotent, resumable), `/api/pond`, `/api/wallet/:addr`, `/api/feedings`.
- Eligibility (proposed defaults, owner may change): balance ≥ 100,000 $ORBIT; never sent $ORBIT to curve/pool; first buy ≥ 24 h before snapshot. Excluded: curve, pool, bot wallet, 0x…dEaD, creator, treasury.
- Fee cycle (owner decision, 8 Oct 2026): feeding 0.01 ETH → ETH to the 10 biggest sitters by balance, split by balance; keeper 0.02 ETH → treasury; sink 0.01 ETH → buyback and burn; repeat. Over a full cycle that is 25% / 50% / 25%, shown openly.
- Sitters: never sold, ≥ 100,000 $ORBIT, first $ORBIT ≥ 1 hour old. Wallet-to-wallet transfers are not sells; the receiving wallet starts at 0 pad days.
- The token must be launched from the same wallet whose private key goes into the bot.
- X: **@pepadsrh** (x.com/pepadsrh).
- Open decisions: minimum balance, hold time.

## Brand Commitments

- Name **Orbiters**, ticker **$ORBIT** (branch `lore-space`, domain orbiters.fun suggested, not yet confirmed). Supersedes the Plunders, Hoard and Kingpins lore for this build. No word "bank" in the name or domain.
- **Only the UI and the lore change.** Backend, engine, API, features and tokenomics are exactly the Heirloom build: 0.02 ETH to the top 10 (No. 1-5 share 0.014, No. 6-10 share 0.006, by balance) → treasury 0.025 → buyback & burn 0.01 → treasury 0.025, repeat; min 100,000 tokens; no hold time; one sale disqualifies forever; dev wallet shown but never ranked or paid; X connect, names, portraits, waiting/sold strips, /lotnok, statement.
- Lore: a space mission. **No. 1 is the Commander** and anyone can take command by out-holding them. Step 1 → **Supply Drop**, paid to **the crew** (flight crew No. 1-5, backup crew No. 6-10); steps 2/4 → **Mission Fund** (treasury, shown openly); step 3 → **The Burn** (buyback + burn); sold → **Ejected** (out the airlock, forever); leaderboard → **the crew**; rules → **flight rules**; wallet check → **your seat**; history → **mission log**; dev wallet → **Ground control**.
- Owner's taste for this world: full 3D light-cartoon space (tiny planet, rocket, pods, liftoff) with scroll-driven camera and GSAP scroll transitions; UI must be fresh and not identical to Kingpins, The Hoard or Plunders; never heavy on phones; not serious or corporate: it is a memecoin.
- Voice: short, cocky, playful. Never yield, APY, passive income, or promises of value.

## Evidence on Hand

- None yet: no token, CA, holders, feedings, domain, or X account. Pre-launch the site must show empty/standby states honestly; any demo numbers must be labelled as illustration.
- Do not invent holders, testimonials, partners, yields, APY, or price claims. Never use yield, APY or passive income; "dividend" only as the lore name with the disclaimer above.

## Product Principles

1. Prove, don't promise: every number on the site comes from the bot API / chain, with tx links.
2. Patience is the hero: the design rewards and celebrates holding, never trading.
3. Honest about the keeper's cut and about empty days.
4. Lore makes the mechanism instantly legible, never obscures it.
