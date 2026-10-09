# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Delegated (chosen to match the owner's other token sites so the VPS deploy flow stays identical): Vite + React + TypeScript static site, GSAP + ScrollTrigger for scroll motion, served by nginx from `/var/www/pepads.fun/dist`. Bot: Node + `tsx` + ethers v6 under pm2, HTTP API on its own port, proxied at `/api/`.

## Users

- **Primary:** memecoin traders on Robinhood Chain arriving from X/Telegram, mostly on phones. Their job: understand in seconds what holding $PADS does for them, copy the CA, buy on Pons.
- **Secondary:** holders ("sitters") checking their own wallet: still sitting or hopped off, pad days, how many $PADS they've received, what tonight's feeding might bring.
- **Operator:** the creator, using the hidden `/lotnok` route to configure the engine.

## Product Purpose

$PADS is a memecoin on Robinhood Chain (chain ID 4663, launched on Pons Family v2) whose creator fees run a loop. A 24/7 bot claims the creator fees (ETH) from the Pons fee escrow whenever it reaches the next step's size and spends it on that step: a **feeding** (ETH straight to the 10 biggest wallets that have **never sold**), the **keeper's cut** (treasury), then the **sink** (buy $PADS back and burn it). Selling (sending $PADS to the Pons curve or the DEX pool) permanently disqualifies a wallet. The website is a read-only tracker and wallet checker plus landing page. Success: a visitor understands "hold big and never snitch → Robin pays you in ETH", checks their crew card, and buys.

Full concept: `CONCEPT.md`.

## Positioning

Every other fee-engine token on the owner's VPS burns. $PADS rewards patience directly and visibly: the leaderboard, the per-wallet checker and the daily feeding log (with tx hashes) prove it, on-chain, every day.

## Operating Context

- Traders compare tokens on Pons launchpad and DexScreener; they live on X.
- Ritual: every feeding → X post with the ETH sent and the tx.
- Infra: shared VPS `76.13.20.64` (nginx + Certbot + pm2) hosting ~15 other token sites; never touch their configs or processes.

## Capabilities and Constraints

- Engine pieces reused from the existing burn bots: escrow polling/claim, curve buy (pre-graduation) and Uniswap v4 buy (post-graduation), `/api/status`, `/lotnok` config.
- New pieces: Transfer-log indexer, sell detection, fee split, daily snapshot + pro-rata distribution (idempotent, resumable), `/api/pond`, `/api/wallet/:addr`, `/api/feedings`.
- Eligibility (proposed defaults, owner may change): balance ≥ 100,000 $PADS; never sent $PADS to curve/pool; first buy ≥ 24 h before snapshot. Excluded: curve, pool, bot wallet, 0x…dEaD, creator, treasury.
- Fee cycle (owner decision, 8 Oct 2026): feeding 0.01 ETH → ETH to the 10 biggest sitters by balance, split by balance; keeper 0.02 ETH → treasury; sink 0.01 ETH → buyback and burn; repeat. Over a full cycle that is 25% / 50% / 25%, shown openly.
- Sitters: never sold, ≥ 100,000 $PADS, first $PADS ≥ 1 hour old. Wallet-to-wallet transfers are not sells; the receiving wallet starts at 0 pad days.
- The token must be launched from the same wallet whose private key goes into the bot.
- X: **@pepadsrh** (x.com/pepadsrh).
- Open decisions: minimum balance, hold time.

## Brand Commitments

- Name **Heirloom**, ticker **$HEIR** (variant branch `lore-banker`; the main branch ships Trapeza/$TRPZ). No word "bank" in the name or domain. No mascot: the house is represented by its OM monogram and the gold OM coin.
- **Lore, not finance.** The lore names the top-10 payout "the Dividend" by the owner's explicit choice; every page that uses the word also says plainly that it is only this site's name for trading fees, that $HEIR is a memecoin with no promise of value, not a security, deposit or investment, and that Heirloom is not a bank and holds no one's funds.
- Lore terms: step 1 (ETH to top 10) → **the Dividend**, paid to **the Ten Heirs**; step 2 (treasury) → **the Reserve** (always shown openly); step 3 (buyback + burn) → **Retired Notes**; holders → **accounts**; sold → **account closed**; under minimum → **savings**; leaderboard → **the ledger of holders**; wallet check → **your account**; history → **the statement**; avatar → **account seal**.
- Palette: midnight navy, gold leaf, ivory paper (owner's choice).
- Voice: an old private office, dry and brief; few words.

## Evidence on Hand

- None yet: no token, CA, holders, feedings, domain, or X account. Pre-launch the site must show empty/standby states honestly; any demo numbers must be labelled as illustration.
- Do not invent holders, testimonials, partners, yields, APY, or price claims. Never use yield, APY or passive income; "dividend" only as the lore name with the disclaimer above.

## Product Principles

1. Prove, don't promise: every number on the site comes from the bot API / chain, with tx links.
2. Patience is the hero: the design rewards and celebrates holding, never trading.
3. Honest about the keeper's cut and about empty days.
4. Lore makes the mechanism instantly legible, never obscures it.
