---
name: Plunders — Dressed Overall
description: "$LOOT as a pirate ship dressed overall in signal flags: every rank flies its numeral pennant, every section is hauled in as its own letter flag, over a light-cartoon 3D cove."
colors:
  signal-red: "#d7263d"
  signal-yellow: "#f9c80e"
  signal-blue: "#1b4dbf"
  flag-black: "#16181d"
  bunting-white: "#f8f4ea"
  bunting-shade: "#ece4d0"
  ink-soft: "#464b57"
  sky-horizon: "#ffd9a8"
typography:
  display:
    fontFamily: "Big Shoulders Stencil Display, Archivo, sans-serif"
    fontSize: "clamp(66px, 9vw, 96px)"
    fontWeight: 900
    lineHeight: 0.84
    letterSpacing: "-0.01em"
  headline:
    fontFamily: "Big Shoulders Stencil Display, Archivo, sans-serif"
    fontSize: "clamp(46px, 6.4vw, 88px)"
    fontWeight: 900
    lineHeight: 0.86
  title:
    fontFamily: "Big Shoulders Stencil Display, Archivo, sans-serif"
    fontSize: "clamp(24px, 2.4vw, 34px)"
    fontWeight: 900
    lineHeight: 0.95
  body:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 500
    lineHeight: 1.45
  label:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "13px"
    fontWeight: 800
    letterSpacing: "0.06em"
  data:
    fontFamily: "Martian Mono, ui-monospace, monospace"
    fontSize: "12px"
    fontWeight: 600
    lineHeight: 1.3
rounded:
  none: "0px"
spacing:
  gutter: "clamp(16px, 4vw, 48px)"
  sheet: "clamp(22px, 3vw, 36px)"
  head: "64px"
components:
  button-primary:
    backgroundColor: "{colors.signal-red}"
    textColor: "{colors.bunting-white}"
    rounded: "{rounded.none}"
    height: "54px"
    padding: "0 40px 0 24px"
  button-primary-waiting:
    backgroundColor: "{colors.bunting-shade}"
    textColor: "{colors.ink-soft}"
  button-flag-white:
    backgroundColor: "{colors.bunting-white}"
    textColor: "{colors.flag-black}"
    rounded: "{rounded.none}"
    height: "54px"
    padding: "0 24px"
  sheet:
    backgroundColor: "{colors.bunting-white}"
    textColor: "{colors.flag-black}"
    rounded: "{rounded.none}"
    padding: "{spacing.sheet}"
  next-pill:
    backgroundColor: "{colors.signal-yellow}"
    textColor: "{colors.flag-black}"
    typography: "{typography.data}"
    padding: "4px 6px"
---

# Design System: Plunders

## Overview

**Creative North Star: "Dressed Overall"**

On a feast day a ship runs every signal flag it owns from bow to masthead to stern. Plunders is that ship. The page speaks the International Code of Signals: five flag colours at full strength, rectangles, swallowtails and tapered pennants, and one black halyard line that everything hangs from. The 3D cove (`src/kp/PirateWalk.tsx`) is the stage, a light-cartoon ship and island under a warm sky, and the UI is laid over it like flags, not like glass.

The flags are functional. Each section flies its own letter flag (C Crew, P Plunder, K Code, S Your share, L Log), and the header halyard hoists the flag of the section you are in. Each rank flies its real numeral pennant (1 to 9, and 0 for No. 10); No. 1 flies the black swallowtail with skull and crossbones. Overboard (sold) uses the O flag, the real signal for man overboard. Cannonfire (buyback and burn) uses B, the explosives flag. One geometry file (`src/lib/flags.ts`) draws every flag as SVG on the page and on canvas for the 3D bunting, so the two never drift.

The page refuses the dark translucent slab floating over a 3D scene, and it refuses the leaderboard table.

**Key Characteristics:**
- Flag fields own whole regions: the Plunder section is the Blue Peter (blue field, white inset), the Code is the K flag's yellow half, the close is the black flag.
- Square corners everywhere. Shapes come from flags: rectangle, swallowtail, pennant.
- Stencil hull lettering for display, Archivo for reading, Martian Mono for every number.
- Between sections a full-bleed letter flag is hauled across the screen (the wipe) while the 3D camera moves behind it.

## Colors

Full palette: five signal colours, each with a job, never tinted down.

### Primary
- **Signal Red** (#d7263d): the primary action (Buy flag), the "flying now" tag, Cannonfire, the O flag, every fifth meter cell.

### Secondary
- **Signal Blue** (#1b4dbf): the Blue Peter field behind the Plunder section, the crew card, tx links, the focus ring.

### Tertiary
- **Signal Yellow** (#f9c80e): the Captain's row, the Code field, the escrow meter fill, the "next ETH" pills, text selection.

### Neutral
- **Flag Black** (#16181d): all text, the halyard and every flag outline, the close field.
- **Bunting White** (#f8f4ea): header, sheets, the white inset of the Blue Peter.
- **Bunting Shade** (#ece4d0): tag rows, waiting buttons, the empty card.
- **Ink Soft** (#464b57): secondary text on white.
- **Sky Horizon** (#ffd9a8): page ground and 3D fog, seen only around the scene.

### Named Rules
**The Real Signal Rule.** A flag on the page means what it means in the Code wherever the Code has a meaning that fits (O overboard, B explosives, P about to sail, numeral pennants for ranks). Never recolour a flag to match a section.

## Typography

**Display Font:** Big Shoulders Stencil Display 900 (fallback Archivo)
**Body Font:** Archivo 500/700/800
**Data Font:** Martian Mono 400/600

**Character:** stencilled hull markings and crate lettering, uppercase and condensed, against a sturdy grotesque that reads well small on phones.

### Hierarchy
- **Display** (900, clamp(66px, 9vw, 96px), 0.84): the hero and the close, uppercase.
- **Headline** (900, clamp(46px, 6.4vw, 88px), 0.86): section titles, uppercase, balanced.
- **Title** (900, clamp(24px, 2.4vw, 34px), 0.95): hoist names, rank labels, log entry kinds.
- **Body** (500, 15-17px, 1.45-1.5): explanations, max 46ch in the Plunder deck.
- **Label** (800, 13px, 0.06em, uppercase): buttons and the halyard.
- **Data** (600, 12-13px): balances, ETH, dates, tx hashes. Always Martian Mono, tabular.

### Named Rules
**The Stencil Is For Shouting Rule.** Stencil only at 18px and up, always uppercase. Names, sentences and numbers are never set in stencil.

## Layout

Each section has its own composition, chosen by what the flag would do:

| Section | Composition |
|---|---|
| Hero | copy column (max 600px) left, ship right, `min-height: 100svh` |
| Crew | white sheet (max 780px) on the right, 3D signposts on the left |
| Plunder | full-width blue field; four hoists on one line inside a white inset, each as wide as its share of the fees (min 190px) |
| Code | two halves: yellow half with the articles, the other half open to the 3D board |
| Your share, Log | white sheet (max 1040px) on the left, the chest or cannon on the right |
| Close | 46svh open to the black flag on the mainmast, then the black field |

Wipes are 64vh (44vh on phones). On phones every sheet drops below a 30svh window onto the 3D, hoists stack vertically with the line on the left, hero buttons go full width, and the header keeps only brand, Connect and Buy.

## Elevation & Depth

Flat fields with one soft lift: sheets and the Captain strip use `0 14px 30px -16px rgba(22,24,29,.55)`. The Buy flag casts a drop-shadow filter instead, because its swallowtail is clipped. No hard offset shadows, no glows.

## Shapes

Zero radius. The only non-rectangles are the flag shapes: swallowtail (`polygon(0 0, 100% 0, calc(100% - 16px) 50%, 100% 100%, 0 100%)` on the Buy button) and pennants. Structural lines are 3px black (the hoist line, sheet borders, article rules); hairlines are 1px black at 14-16% opacity.

## Components

### Buttons
- **Primary (Buy flag):** signal red, white label, swallowtail cut, 54px (42px small). Hover lifts 3px and darkens to #b81d31. Waiting state: bunting shade, ink-soft label, no shadow.
- **White flag:** bunting white, 3px black border, black label; hover inverts to black.

### Halyard (navigation)
A 2px black line with five letter flags hanging from it. The current section's flag tilts -6deg and grows 12%. Labels hide under 1240px; the halyard hides under 860px.

### The hoist (Crew)
A 3px black line down the left; each rank hangs its pennant from it. Rows: rank in stencil, holder (face, name, X badge), balance in mono, "next ETH" in a yellow pill. The Captain row is a yellow strip with the black swallowtail at 112px. Ranks 11-50 sit in the signal book, a dense grid under a 3px rule.

### The escrow meter
Ten bordered cells filled through `--fill` (0..1); the value moves with elastic mass so the reading overshoots and settles, like a needle.

### The wipe
A section's letter flag stretched full-bleed, sliding right to left with scroll (scrub 0.6) while its name in white stencil with a black stroke runs the other way; the field opens from a band to full height and closes again.

## Do's and Don'ts

### Do:
- **Do** draw every flag from `src/lib/flags.ts`, on the page and in 3D.
- **Do** give each section its own composition; let colour fields own whole regions.
- **Do** keep every number in Martian Mono with tabular figures.
- **Do** use hyphens for ranges ("No. 1-5"), never en or em dashes.

### Don't:
- **Don't** put translucent dark panels over the 3D scene.
- **Don't** round corners or soften the five signal colours.
- **Don't** add a kicker or eyebrow label above a section headline.
- **Don't** put a CSS `transition` on an element GSAP animates (under React StrictMode it corrupts the recorded end state).
