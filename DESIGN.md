---
name: Capy Onsen — Bathhouse Print
description: "$ONSEN on Robinhood Chain as a capybara bathhouse you walk down through: a noren over a Fuji mural, the top ten soaking, the boiler room under the bath, wooden tags and a counter ledger. Flat colour and ink outlines, like a sento sign."
colors:
  noren-indigo: "#1c2d5a"
  paper: "#f3ead8"
  paper-light: "#fffaf0"
  ink: "#1a1814"
  yuzu: "#f4c430"
  water: "#9fd3cc"
  wood: "#c58b52"
  wood-dark: "#8e5a2c"
  furnace: "#e4472b"
  coal: "#1b1917"
typography:
  sign:
    fontFamily: "Dela Gothic One, Arial Black, sans-serif"
    fontWeight: 400
  body:
    fontFamily: "Zen Kaku Gothic New, system-ui, sans-serif"
    fontWeight: 500
  data:
    fontFamily: "DM Mono, ui-monospace, monospace"
rounded: 0
---

# Capy Onsen — Bathhouse Print

The page is one building, top to bottom. Each room has its own ground colour, and the colour is
the room: sky and indigo at the doorway, water in the bath, coal in the boiler room, paper in the
changing room, indigo at the counter, yuzu at the way out.

## Colour meaning
- **Yuzu**: No. 1, the buy button, fees flowing in a pipe, every number worth reading on dark.
- **Furnace red**: the escrow thermometer, the hot pool, the valve that is turning now, and being out.
- **Water**: where the ten are. **Wood**: things you hold or hang (the beam, the tags). **Ink**: every outline.

## Rooms (src/onsen/)
- **Hero.tsx**: the doorway. Noren with the headline, Fuji mural behind it, the beam with the escrow thermometer, the pool with the live top ten as capybaras, the attendant (dev wallet) at the counter.
- **Pool.tsx**: the bath as a list. The yuzu row, hot pool and warm pool (the two reward tiers), the towel line (11-50).
- **Boiler.tsx**: the loop. Two stations on one pipe: the reward, then the treasury.
- **Rules.tsx**: four wooden tags on a rail.
- **Tag.tsx**: the wallet check and the changing room (name, capybara, X).
- **Ledger.tsx**: totals and every round with its transaction.
- **Exit.tsx**: the close.
- **Capy.tsx**: the one capybara head everything is drawn from, and the portrait traits.

## Motion
- Noren drops in on load; capybaras surface one by one, then bob.
- Scroll 1: the noren lifts off the mural and the water rises over the doorway into the bath.
- Scroll 2: fees run down the drain pipe and along the run past the two valves (a riser that fills on phones).
- Scroll 3: two paper doors slide apart on the house rules; the tags swing on their pegs.
- Rank changes: capybaras wade and rows glide to the new order; a wallet that sold bolts out of the water.
- All of it is off under prefers-reduced-motion.

## Rules
No gradients, no drop shadows, no rounded cards, no emoji, no badges or chips: say it in a sentence.
No em or en dashes in visible text. No yield or APY language. Lore names never replace the plain
ones for money (Reward, Treasury).
