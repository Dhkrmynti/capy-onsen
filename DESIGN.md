---
name: Kingpin — The Board
description: "$KING as a chessboard in play: the holders are pieces on loud lime and violet squares, the biggest holder is the King, and every fee is a move on the clock."
colors:
  grape-0: "#170c29"
  grape-1: "#22133d"
  grape-2: "#362262"
  ink: "#170c29"
  edge: "#5b3fa8"
  violet: "#6c3bff"
  violet-deep: "#4b1fd8"
  violet-soft: "#b9a3ff"
  lime: "#c6f432"
  lime-deep: "#9fd014"
  cream: "#fff6e3"
  cream-2: "#d6cbee"
  crown: "#ff7a1a"
  exile: "#ff4d6a"
  exile-ink: "#b3132f"
typography:
  display:
    fontFamily: "Dela Gothic One, Arial Rounded MT Bold, sans-serif"
    fontSize: "clamp(56px, 8.4vw, 96px)"
    fontWeight: 400
    lineHeight: 0.92
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Dela Gothic One, Arial Rounded MT Bold, sans-serif"
    fontSize: "clamp(40px, 6vw, 76px)"
    fontWeight: 400
    lineHeight: 0.95
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Dela Gothic One, Arial Rounded MT Bold, sans-serif"
    fontSize: "clamp(26px, 4.2vw, 56px)"
    fontWeight: 400
    lineHeight: 1.05
  body:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 800
    lineHeight: 1
  data:
    fontFamily: "Martian Mono, ui-monospace, monospace"
    fontSize: "12px"
    fontWeight: 600
    lineHeight: 1.35
    fontFeature: "tnum"
rounded:
  square: "6px"
  tile: "8px"
  card: "12px"
  panel: "18px"
  pill: "999px"
spacing:
  gutter: "clamp(16px, 4vw, 48px)"
  tile-gap: "12px"
  crowd-gap: "6px"
  section: "clamp(72px, 10vw, 128px)"
  head: "68px"
  max: "1240px"
components:
  button-primary:
    backgroundColor: "{colors.crown}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    height: "52px"
    padding: "0 24px"
    typography: "{typography.label}"
  button-waiting:
    backgroundColor: "{colors.grape-2}"
    textColor: "{colors.cream-2}"
    rounded: "{rounded.pill}"
    height: "52px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.cream}"
    rounded: "{rounded.pill}"
    height: "52px"
  tile-king:
    backgroundColor: "{colors.crown}"
    textColor: "{colors.ink}"
    rounded: "{rounded.card}"
  tile-court-light:
    backgroundColor: "{colors.lime}"
    textColor: "{colors.ink}"
    rounded: "{rounded.tile}"
  tile-court-dark:
    backgroundColor: "{colors.violet}"
    textColor: "{colors.cream}"
    rounded: "{rounded.tile}"
  crowd-square:
    backgroundColor: "{colors.grape-1}"
    textColor: "{colors.cream}"
    rounded: "{rounded.square}"
  seat-card:
    backgroundColor: "{colors.violet}"
    textColor: "{colors.cream}"
    rounded: "{rounded.card}"
  input:
    backgroundColor: "{colors.cream}"
    textColor: "{colors.ink}"
    rounded: "{rounded.panel}"
    height: "52px"
---

# Design System: Kingpin — The Board

## Overview

**Creative North Star: "The Board in Play."** The holder ladder is a chessboard mid-game. No. 1 is the King on his lit square, No. 2–5 are the Court (queen, rook, bishop, knight), No. 6–10 the Guard (pawns), everyone after stands on small squares, and sellers lie on their side in the captured tray. Fees are moves on a chess clock.

The voice is a loud toy board, not a classical one: two saturated squares, chunky toy caps, printed game tokens you can press. It is cocky and fast, never serious or luxurious. The page reads in seconds and says little: one headline per viewport, short lines, numbers in a mono notation face.

Anti-references: the previous world (navy-and-gold vault, luxury serif, bank tropes); the category default (dark page, glowing gold crown, neon Buy button, a plain table).

## Colors

Full palette, committed at page scale: each viewport is owned by one field colour.

- **Electric Lime** (`lime`) and **Royal Violet** (`violet`, with `violet-deep` for the dark square) are the two board squares and the two fields that own whole sections (Rules is lime; the hero and the War Chest moves are violet).
- **Crown Orange** (`crown`) belongs to the King: his tile, his throne square, the primary button, the clock arc, the close. It also carries the moments a crown changes hands.
- **Grape** (`grape-0/1/2`) is the dark ground under the Ladder, Seat and Record. `ink` equals `grape-0`; on dark ground a lit `edge` (`#5b3fa8`) and a deeper base shadow (`#07030f`) carry the outline instead.
- **Cream** text on dark and violet; **ink** text on lime, crown and cream. Secondary text is `cream-2`, a violet-tinted cream, never grey.
- **Captured Red** (`exile`, `exile-ink` on cream) marks sellers only.

## Typography

- **Dela Gothic One** is the only display voice: hero, section heads, move names, rule lines, tile ranks, the stamp. Display tops out at 96px; tracking -0.02em.
- **Archivo** (400/600/800) for reading and controls. Buttons and labels are 800.
- **Martian Mono** (400/600) is the data voice: balances, ETH, prices, the clock, board coordinates (e1, d1, a3…), move numbers. Always tabular.

## Layout

- Fixed header 68px (60px on phones), solid grape; the nav collapses under 1080px and the wordmark under 760px.
- Content wrap `min(1240px, 100% - 2·gutter)`; sections pad `clamp(72px, 10vw, 128px)` vertically.
- **Hero**: full-viewport violet field; a tilted 8×8 board fills the lower part; top-left the headline names the King ("The King is @name.", lime second line, shrinking for long names), his balance and lead in an ink pill, the CTAs; at the right the King's portrait in a cream printed frame with a 3D crown resting on it; the chess clock bottom-left (a one-line escrow readout on phones).
- **Ladder**: King tile spanning two rows beside a 2×2 Court; Guard row of five; crowd of 40 on an 8-column grid (5 at 1080px, 2 on phones). Founder, Pending and Captured strips above. Refreshes every 3 seconds.
- **Round**: pinned; a horizontal track of panels (intro, four moves, tally), each one field colour, separated by 8px ink gaps. Stacks vertically on phones.
- **Rules**: lime field, five display lines ruled with 3px ink, the captured tray on an ink plate.
- **Seat**: two columns (lookup | card and desk), one on phones. **Record**: a move list. **Close**: crown field.

## Elevation & Depth

Flat colour with printed-token depth: every tile, button and clock sits on a hard base shadow straight down (`0 6px 0`), like a game piece on its base. This is the world's own material (printed board-game tokens), not a decoration. On colour fields the base is `ink`; on grape it is `#07030f`. Pressing a button pushes it onto its base (translateY 4px, shadow 2px). No soft ambient shadows, no glass, no glows.

## Shapes

- Outlines: 3px ink on tiles, cards, inputs and buttons; 2px on small controls; 2px lit `edge` on dark ground.
- Radii stay square-ish: 6px crowd squares, 8px tiles and rows, 10–12px King tile and seat card, 18px inputs and the clock body, pills only for buttons, the coupon and the Connect control.
- Pieces are the authored SVG toy set (flat fill, 3.2px ink stroke, base plate). Never Unicode chess glyphs.

## Components

- **Buttons**: crown pill with ink outline and base; `is-waiting` grape with no base before launch; ghost is a cream outline that fills cream on hover.
- **Tiles**: rank and board coordinate top-left (display / mono), piece top-right (the King's piece large, centred right), holder (portrait or X picture, X logo before the name, badge) and two mono lines (balance · dollars, next Tribute share) at the foot. Open squares are dashed with a faded piece.
- **Crowd square**: rank and coordinate, small portrait and name, balance and the gap to the zone.
- **Chess clock**: grape body with a crown button on top, a 240° arc in crown orange, a cream hand, mono readout.
- **Seat card**: violet card tilted -1°, display name, mono facts, a display stamp pill (lime; red when captured). The desk below is cream with ink tabs (the selected tab inverts to ink and lime) and lime dial buttons.
- **Record row**: move number, a Phosphor icon tinted by kind (crown / violet-soft / exile), display move name, mono ETH, time and tx link.

## Motion

- Hero entrance: the board rises from 75° and the headline lines slide up out of their masks (expo.out).
- **Signature**: scrolling the pinned hero lays the board flat (rotateX 58→0, scale 1.45) while the copy and clock leave and the King shrinks away.
- **Round**: the section pins and the move track pans sideways with the scroll; on desktop the current move is marked by its full-opacity number.
- **Ladder**: when ranks change, squares glide from their old positions (FLIP, 0.9s expo.out); a new No. 1 triggers the "New King!" shout.
- Section entrances stagger once (tiles tip up from -50°, crowd squares pop with back.out). No bounce easing.
- **Crown drop**: on load the crown falls onto the King's portrait with an overshoot landing and turns slowly; when No. 1 changes it lifts and drops onto the new King. With no King it hovers over an empty frame.
- The crown is the only WebGL: toon-shaded with an ink outline, at most 30 fps, paused off screen and while the tab is hidden. Reduced motion stops the pins, the pans and the King's turn.

## Do's and Don'ts

**Do**
- Give each viewport one owning field colour; keep lime and violet as the board and crown for the King.
- Put every number in Martian Mono, tabular, with board coordinates wherever a rank is shown.
- Draw pieces from the authored SVG set; captured pieces lie at 90°.
- Keep copy short: one headline, one line, the action.

**Don't**
- Don't bring back navy-and-gold, vault, bank or luxury-serif cues.
- Don't use glass, blur, glows, gradient text or soft drop shadows.
- Don't use Unicode chess glyphs or emoji as icons.
- Don't add eyebrow labels above headings or section numbers.
- Don't add another 3D object; the hero crown is the only one.
