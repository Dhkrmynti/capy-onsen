---
name: Orbiters — Space Race Poster
description: "$ORBIT as a 1960s space-race poster you scroll through: flat red, paper and ultramarine fields cut on the diagonal, one orbit arc drawn across the page, over a light-cartoon 3D planet with a rocket on its pad."
colors:
  signal-red: "#d6372b"
  red-deep: "#b02a20"
  paper: "#f1e4c8"
  paper-shade: "#e6d3ad"
  ultramarine: "#1f2f8a"
  ultramarine-light: "#3b55d6"
  night: "#0e1433"
  ink: "#161616"
  ink-soft: "#4b4a52"
  burn: "#ff7a1a"
typography:
  display:
    fontFamily: "Unbounded, Golos Text, sans-serif"
    fontSize: "clamp(40px, 5.2vw, 76px)"
    fontWeight: 900
    lineHeight: 0.94
    letterSpacing: "-0.03em"
  headline:
    fontFamily: "Unbounded, Golos Text, sans-serif"
    fontSize: "clamp(40px, 5.6vw, 80px)"
    fontWeight: 900
    lineHeight: 0.94
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Unbounded, Golos Text, sans-serif"
    fontSize: "clamp(18px, 1.8vw, 24px)"
    fontWeight: 900
    lineHeight: 1.05
  body:
    fontFamily: "Golos Text, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 500
    lineHeight: 1.45
  label:
    fontFamily: "Golos Text, system-ui, sans-serif"
    fontSize: "13px"
    fontWeight: 800
    letterSpacing: "0.08em"
  data:
    fontFamily: "Spline Sans Mono, ui-monospace, monospace"
    fontSize: "12px"
    fontWeight: 500
    lineHeight: 1.3
rounded:
  none: "0px"
  disc: "50%"
spacing:
  gutter: "clamp(16px, 4vw, 48px)"
  sheet: "clamp(24px, 3vw, 40px)"
  cut: "44px"
  head: "64px"
components:
  button-primary:
    backgroundColor: "{colors.signal-red}"
    textColor: "{colors.paper}"
    rounded: "{rounded.none}"
    height: "54px"
    padding: "0 28px"
  button-primary-waiting:
    backgroundColor: "{colors.ultramarine}"
    textColor: "{colors.paper}"
  button-line:
    textColor: "{colors.paper}"
    rounded: "{rounded.none}"
    height: "54px"
    padding: "0 24px"
  sheet:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: "{spacing.sheet}"
  masthead:
    backgroundColor: "{colors.signal-red}"
    textColor: "{colors.paper}"
    height: "{spacing.head}"
---

# Design System: Orbiters

## Overview

**Creative North Star: "Space Race Poster"**

Orbiters reads like a 1960s space-race poster that you scroll through. Flat fields of signal red, paper cream and ultramarine sit on night blue, cut on the diagonal; big circles carry the people; heavy wide capitals carry the claims. Behind it all is a light-cartoon 3D planet (`src/kp/SpaceWalk.tsx`): a rocket on its pad atop a tiny cream world, crew pods in orbit with names on them, a fuel line, a flight-rules billboard, a landed capsule, a radar dish, and a red ringed planet far off. At the end of the page the rocket lifts off.

One orbit arc (`src/kp/Orbit.tsx`) crosses the whole page and is drawn as you scroll, with a small rocket riding its head. It is the page's only governing curve. Between sections a diagonal band slides across carrying the next section's name (`src/kp/Band.tsx`), while the 3D camera moves to the next subject behind it.

The page refuses the dark starfield with neon telemetry and glowing edges that space and crypto pages default to.

**Key Characteristics:**
- Fields own whole regions: the masthead is red, the flight plan is ultramarine, the flight rules are a red diagonal, the close is ultramarine cut on a slant.
- Square corners, with one corner clipped on every sheet and button.
- Circles only for people and planets: the Commander disc under poster rays, crew faces, log icons.
- Burn orange is reserved for what is firing now: the stage burning, the fuel in the gauge, the rocket flame.

## Colors

Full palette: four poster inks on night, plus one reserved accent.

### Primary
- **Signal Red** (#d6372b): masthead, the Buy block, the Commander strip, the flight rules field, flight crew numerals, The Burn.

### Secondary
- **Ultramarine** (#1f2f8a): the flight plan field, the close field, the Commander disc, the crew badge, waiting buttons, backup crew numerals.
- **Ultramarine Light** (#3b55d6): Mission Fund stages, pod panels.

### Tertiary
- **Burn** (#ff7a1a): only what is firing now.

### Neutral
- **Paper** (#f1e4c8): sheets, display type on dark fields, the orbit line.
- **Paper Shade** (#e6d3ad): tag rows, "next ETH" chips, the empty badge.
- **Night** (#0e1433): page ground behind the 3D.
- **Ink** (#161616) and **Ink Soft** (#4b4a52): text on paper.

### Named Rules
**The One Burn Rule.** Burn orange marks one thing at a time: the stage firing now, the fuel already in the tank, the flame. Never decoration.

**The Ejected Is Final Rule.** Ejected wallets are struck through in red and never softened or greyed into neutrality.

## Typography

**Display Font:** Unbounded 900 (fallback Golos Text)
**Body Font:** Golos Text 500/700/800
**Data Font:** Spline Sans Mono 500/600

**Character:** wide geometric poster capitals against a plain grotesque that stays legible on phones; every number in mono.

### Hierarchy
- **Display** (900, clamp(40px, 5.2vw, 76px), 0.94, uppercase): hero and close.
- **Headline** (900, clamp(40px, 5.6vw, 80px), 0.94, uppercase): section titles.
- **Title** (900, 18-24px, uppercase): stage names, log kinds, labels in sheets.
- **Body** (500, 15-17px, 1.45-1.5): explanations, max 44-52ch.
- **Label** (800, 12-15px, 0.08em, uppercase): buttons, nav, tags.
- **Data** (500-600, 11-15px, mono): balances, ETH, dates, hashes; the fuel reading at 30px.

### Named Rules
**The Wide Caps Rule.** Unbounded only at 15px and up, uppercase except holder names in the Commander disc. Never for sentences.

## Layout

| Section | Composition |
|---|---|
| Hero | copy column (max 720px) left over the 3D, rocket right; on phones the copy sits on an ultramarine block cut on a slant |
| Crew | paper sheet (max 900px) on the right; Commander disc with rays (260px column) beside flight and backup crew; roster grid below; pods in 3D on the left |
| Flight plan | full ultramarine field; the four-stage rocket stack with stages as tall as their share of the fees, leader lines to the stage text |
| Flight rules | red field (64% wide) with a diagonal right edge; billboard in 3D on the right |
| Your seat, Mission log | paper sheet (max 1040px) on the left; capsule or radar on the right |
| Close | 48svh open to the liftoff, then the ultramarine field |

Bands are 58vh (40vh on phones). Under 760px every sheet drops below a 30svh window onto the 3D, stage bodies narrow to 92px, and the nav hides (under 1080px).

## Elevation & Depth

Flat. No shadows on UI; depth comes from the fields overlapping the 3D and from diagonal cuts. The 3D carries the only shading, toon-stepped with ink outlines.

## Shapes

Zero radius, except circles for people, planets and log icons. Every sheet clips its top-left corner (`--cut`, 44px; 28px on phones); buttons clip their top-right corner by 16px. The Commander strip, the flight rules field and the close field are parallelograms. Structural rules are 3px ink on paper, 2px paper at half strength on red.

## Components

### Buttons
- **Primary (Buy):** signal red block, paper label, top-right corner clipped, 54px (40px in the masthead, where it turns paper on red).
- **Waiting:** ultramarine with paper at 75%.
- **Line:** 2px currentColor border, transparent; hover fills paper with ink text.

### Masthead
Red bar, mark and wide caps wordmark, five sections in uppercase Golos; the current one brightens and a paper dot appears under it.

### Fuel gauge
A semicircle dial: paper track at 22%, burn arc for the fuel held, eleven ticks, a paper needle with a red hub that swings with elastic mass and settles.

### Commander disc
A 200px ultramarine circle with a 6px ink ring holding the portrait, under red poster rays that turn in on reveal.

### The stage stack
Nose cone, four stages, fins. Stage bodies are paper (Supply Drop), ultramarine light (Mission Fund) or red (The Burn); the stage firing now turns burn orange and carries a "burning now" chip.

### Band
A diagonal field (red, paper or ultramarine) sliding across with scroll, its name repeated in wide caps, crossed by a thin stripe moving the other way.

## Do's and Don'ts

### Do:
- **Do** keep every number in Spline Sans Mono with tabular figures.
- **Do** cut sheets and buttons on one corner; keep everything else square.
- **Do** use hyphens for ranges ("No. 1-5"), never en or em dashes.
- **Do** keep 3D subjects clear of the sheet they sit beside.

### Don't:
- **Don't** add glows, neon, or gradients to UI fields.
- **Don't** use burn orange for anything that is not firing now.
- **Don't** add a kicker above a section headline.
- **Don't** put a CSS `transition` on an element GSAP animates.
- **Don't** use political symbols; the poster world is the space race's graphics, not its propaganda.
