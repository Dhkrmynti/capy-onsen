# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Delegated (chosen to match the owner's other token sites so the VPS deploy flow stays identical): Vite + React + TypeScript static site, GSAP + ScrollTrigger for scroll motion, served by nginx from `/var/www/pepads.fun/dist`. Bot: Node + `tsx` + ethers v6 under pm2, HTTP API on its own port, proxied at `/api/`.

## Users

- **Primary:** memecoin traders on Robinhood Chain arriving from X/Telegram, mostly on phones. Their job: understand in seconds what holding $PADS does for them, copy the CA, buy on Pons.
- **Secondary:** holders ("sitters") checking their own wallet: still sitting or hopped off, pad days, how many $PADS they've received, what tonight's feeding might bring.
- **Operator:** the creator, using the hidden `/memex` route to configure the engine.

## Product Purpose

$PADS is a memecoin on Robinhood Chain (chain ID 4663, launched on Pons Family v2) whose creator fees run a loop. A 24/7 bot claims the creator fees (ETH) from the Pons fee escrow whenever it reaches the next step's size and spends it on that step: a **feeding** (ETH straight to the 10 biggest wallets that have **never sold**), the **keeper's cut** (treasury), then the **sink** (buy $PADS back and burn it). Selling (sending $PADS to the Pons curve or the DEX pool) permanently disqualifies a wallet. The website is a read-only tracker and wallet checker plus landing page. Success: a visitor understands "hold big and never snitch → Robin pays you in ETH", checks their crew card, and buys.

Full concept: `CONCEPT.md`.

## Positioning

Every other fee-engine token on the owner's VPS burns. $PADS rewards patience directly and visibly: the leaderboard, the per-wallet checker and the daily feeding log (with tx hashes) prove it, on-chain, every day.

## Operating Context

- Traders compare tokens on Pons launchpad and DexScreener; they live on X.
- Ritual: every feeding → X post with the ETH sent and the tx.
- Infra: shared VPS `72.61.210.75` (nginx + Certbot + pm2) hosting ~15 other token sites; never touch their configs or processes.

## Capabilities and Constraints

- Engine pieces reused from the existing burn bots: escrow polling/claim, curve buy (pre-graduation) and Uniswap v4 buy (post-graduation), `/api/status`, `/memex` config.
- New pieces: Transfer-log indexer, sell detection, fee split, daily snapshot + pro-rata distribution (idempotent, resumable), `/api/pond`, `/api/wallet/:addr`, `/api/feedings`.
- Eligibility (proposed defaults, owner may change): balance ≥ 100,000 $PADS; never sent $PADS to curve/pool; first buy ≥ 24 h before snapshot. Excluded: curve, pool, bot wallet, 0x…dEaD, creator, treasury.
- Fee cycle (owner decision, 8 Oct 2026): feeding 0.01 ETH → ETH to the 10 biggest sitters by balance, split by balance; keeper 0.02 ETH → treasury; sink 0.01 ETH → buyback and burn; repeat. Over a full cycle that is 25% / 50% / 25%, shown openly.
- Sitters: never sold, ≥ 100,000 $PADS, first $PADS ≥ 1 hour old. Wallet-to-wallet transfers are not sells; the receiving wallet starts at 0 pad days.
- The token must be launched from the same wallet whose private key goes into the bot.
- X: **@pepadsrh** (x.com/pepadsrh).
- Open decisions: minimum balance, hold time.

## Brand Commitments

- Name **Robin Heist**, ticker **$RBANK** (rebrand from Pepads/$PADS, 8 Oct 2026; site domain planned: robinheist.fun). Mascot **Robin**: an original raccoon in a bowler-hat disguise; natural bandit mask, bowler hat with brass band, red bow tie, gold monocle, ringed tail, sits on a coin pile next to a $ sack. Tagline **"never snitch."**, sub-line "robbing the paper hands since block one."
- **Parody, not finance.** Never call the split a dividend, holders shareholders, or $RBANK an investment. Keep "memecoin, no promise of value" and "not a security, not a dividend" visible.
- **No borrowed IP.** Not a fox Robin Hood (Disney), no Pepe, no other project's art.
- Lore terms: fees → **loot**; claim → **the heist**; step 1 (ETH to top 10) → **the split**; step 2 (treasury) → **hideout fund** (always shown openly); step 3 (buyback + burn) → **burn the ledger**; eligible holders → **the crew**; sold → **snitched**; under minimum → **lookout**; leaderboard → **the vault**; wallet check → **crew card**; history → **the ledger**.
- Voice: degen CT, calm gang-boss swagger, lowercase ("the heist ran. the crew got paid.").

## Evidence on Hand

- None yet: no token, CA, holders, feedings, domain, or X account. Pre-launch the site must show empty/standby states honestly; any demo numbers must be labelled as illustration.
- Do not invent holders, testimonials, partners, yields, APY, or price claims. Never use the words yield, APY, passive income, dividend.

## Product Principles

1. Prove, don't promise: every number on the site comes from the bot API / chain, with tx links.
2. Patience is the hero: the design rewards and celebrates holding, never trading.
3. Honest about the keeper's cut and about empty days.
4. Lore makes the mechanism instantly legible, never obscures it.
