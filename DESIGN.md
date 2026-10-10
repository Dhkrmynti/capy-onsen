---
name: Horizon — Gravity Well Figure
description: "$VOID as a physics figure about a black hole: white hairlines on the void, a grid that bends into a well as you scroll, a polar plot of orbits, journal captions, and one accretion orange, over a realistic, light 3D black hole."
colors:
  void: "#050506"
  void-raised: "#0d0d10"
  paper: "#f3f3ef"
  muted: "#8f8f8a"
  hairline: "rgba(243, 243, 239, 0.22)"
  hairline-strong: "rgba(243, 243, 239, 0.45)"
  accretion: "#ff6b1a"
  accretion-deep: "#d9540d"
typography:
  display:
    fontFamily: "Schibsted Grotesk, system-ui, sans-serif"
    fontSize: "clamp(64px, 8.6vw, 96px)"
    fontWeight: 900
    lineHeight: 0.88
    letterSpacing: "-0.045em"
  headline:
    fontFamily: "Schibsted Grotesk, system-ui, sans-serif"
    fontSize: "clamp(40px, 5.2vw, 72px)"
    fontWeight: 800
    lineHeight: 0.96
    letterSpacing: "-0.035em"
  caption:
    fontFamily: "STIX Two Text, Times New Roman, serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.5
  law:
    fontFamily: "STIX Two Text, Times New Roman, serif"
    fontSize: "clamp(20px, 2.1vw, 27px)"
    fontWeight: 400
    lineHeight: 1.35
  label:
    fontFamily: "Schibsted Grotesk, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 700
    letterSpacing: "0.08em"
  data:
    fontFamily: "Geist Mono, ui-monospace, monospace"
    fontSize: "12px"
    fontWeight: 400
    lineHeight: 1.3
rounded:
  none: "0px"
spacing:
  gutter: "clamp(16px, 4vw, 48px)"
  frame: "clamp(24px, 3vw, 44px)"
  head: "60px"
components:
  button-primary:
    backgroundColor: "{colors.accretion}"
    textColor: "{colors.void}"
    rounded: "{rounded.none}"
    height: "52px"
    padding: "0 26px"
  button-line:
    textColor: "{colors.paper}"
    rounded: "{rounded.none}"
    height: "52px"
    padding: "0 24px"
  frame:
    backgroundColor: "{colors.void}"
    textColor: "{colors.paper}"
    rounded: "{rounded.none}"
    padding: "{spacing.frame}"
---

# Design System: Horizon

## Overview

**Creative North Star: "Gravity Well Figure"**

Horizon is a physics figure about a black hole that you scroll through. White hairlines on the void, a coordinate grid behind everything that bends toward one point and deepens with the scroll (`src/kp/Well.tsx`), and every section framed as a figure with a journal caption. Rank is distance: the biggest holder is the Singularity, on the innermost orbit.

Behind it all is a realistic but light 3D black hole (`src/kp/VoidWalk.tsx`): a shader accretion disk (hot inner edge, cooler outer edge, streaks sheared by orbital speed, one side Doppler-bright), a camera-facing lensed halo arcing over and under the horizon, a photon ring, the rubber-sheet well as a grid funnel below, the ten closest holders as rocky bodies in Keplerian orbit with mono name labels, matter spiralling in, and a gold-foil probe. At the end the camera crosses the horizon.

**Key Characteristics:**
- Monochrome hairline figures; one accretion orange owned outright.
- Figures, not cards: a polar orbit plot, a 1/r fall curve, a cycle ring, numbered equations, a lab log.
- Captions and laws in STIX Two Text, the face of physics journals.
- Between sections the next title is pulled in from wide and faint to tight and solid, under its figure number.

## Colors

### Primary
- **Accretion** (#ff6b1a): the Buy, No. 1 (dot, rank, next-pull chip), the step firing now, the escrow marker, the horizon line in the fall plot, focus rings. Nowhere else.

### Neutral
- **Void** (#050506) and **Void Raised** (#0d0d10): ground and figure frames (frames at 88% over the 3D).
- **Paper** (#f3f3ef): type, plotted lines, bodies.
- **Muted** (#8f8f8a): captions, secondary data.
- **Hairline** and **Hairline Strong** (paper at 22% and 45%): rules, rings, axes, leaders.

### Named Rules
**The One Orange Rule.** Orange is the action and the present tense. It never decorates, never tints a background, never appears twice in a row of equals.

## Typography

**Display:** Schibsted Grotesk 800/900. **Captions and laws:** STIX Two Text 400 and italic. **Data:** Geist Mono 400/500.

- **Display** (900, clamp(64px, 8.6vw, 96px), 0.88, -0.045em): hero and close, sentence case.
- **Headline** (800, clamp(40px, 5.2vw, 72px), 0.96): section titles.
- **Caption** (STIX 15px/1.5, muted, "Fig. n." in paper italic): under every figure.
- **Law** (STIX clamp(20px, 2.1vw, 27px)): the laws as numbered equations, the arrow in orange, the number in mono at the right.
- **Data** (Geist Mono 11-14px): masses ("m = 9.4M"), ETH, dates, hashes.

## Layout

Each section is a figure frame (max 1180px; laws, your orbit and observations narrower and left-aligned so the 3D shows on the right). The orbit figure pairs the 520px polar plot with the table; the cycle pairs the 440px ring with the step list. Bands are 56vh (40vh on phones). Under 1100px the figure grids stack and the nav hides; under 760px frames drop below a 30svh window onto the 3D and the hero copy sits on a void panel under the black hole.

## Elevation & Depth

Flat. No shadows; depth comes from the 3D behind the frames. The 3D is physically lit by the disk itself (a warm point light at the centre), a faint cool rim, and a dimmed studio environment; the disk, halo, photon ring and infall are additive light.

## Shapes

Zero radius. Circles only where physics draws them: orbits, the horizon, bodies, log marks. Lines are 1px.

## Components

- **Buttons:** orange block (Buy) with void label; hairline secondary that fills paper on hover; waiting state is a hairline outline in muted.
- **Fall plot:** axes, the 1/r curve, a dashed orange horizon line, an orange body that falls with a little overshoot.
- **Polar orbit plot:** ten rings (photon ring stronger), the horizon at the centre, one body per ring, mono labels on leader lines; No. 1 orange.
- **Cycle ring:** four arcs sized by fee share, traced in order with the scroll; the firing step orange.
- **Laws:** numbered equations with hairline rules.
- **Observation log:** mono rows with drawn marks: a filled body (Pull), a half body (Dark Matter), an orange ring (Into the Void).

## Do's and Don'ts

### Do:
- **Do** caption every figure ("Fig. n.") in STIX.
- **Do** keep every number in Geist Mono.
- **Do** use hyphens for ranges ("No. 1-5").

### Don't:
- **Don't** add glows or gradients to UI; the 3D carries the light.
- **Don't** use orange for anything but the action and what is happening now.
- **Don't** round corners or add a kicker above a headline.
- **Don't** put a CSS `transition` on an element GSAP animates.
