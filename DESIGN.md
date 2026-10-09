---
name: The Hoard — Dragon's Cave
description: "$HOARD as a dragon's cave walked by scrolling: the biggest holder is the dragon asleep on the pile, the top 10 are Keepers in the alcoves, and every fee flows down a lava river."
colors:
  grape-0: "#140c14"
  grape-1: "#201420"
  grape-2: "#3a2433"
  ink: "#1a0f0d"
  edge: "#6b4a3a"
  lime: "#ffc83d"     # gold (token name kept from the shared stylesheet)
  violet: "#1f8f55"   # jade, the dragon
  violet-soft: "#8fe3b6"
  crown: "#ff6a1f"    # ember
  cream: "#f3e9d2"
  cream-2: "#cdbfa5"
  exile: "#e2341d"
typography:
  display: "Grenze Gotisch 600/800"
  body: "Manrope 500/700/800"
  mono: "Martian Mono 400/600"
---

# The Hoard

## World

One continuous 3D cave (`src/kp/HoardWalk.tsx`, @react-three/fiber) sits fixed behind the page. Scrolling moves the camera along a CatmullRom path through one station per section (`top`, `ladder`, `round`, `rules`, `card`, `record`, `closing`), holding at each and gliding between them.

| Station | Subject in 3D | Panel |
|---|---|---|
| top | jade dragon asleep on the gold mound | Hero, left |
| ladder | ten alcoves with nameplates (gold No. 1–5, bone No. 6–10) | The Keepers, wide |
| round | lava river carrying the fees | The Haul, right |
| rules | rune wall "The Law of the Hoard" | The Law, left |
| card | treasure chest, lid opens on arrival | Your hoard, wide |
| record | fire pit | The Chronicle, wide |
| closing | dragon wakes, eye to eye | Close, centred |

## Rendering rules

- Light cartoon: `MeshToonMaterial` with a 3-step gradient, inverted-hull black outlines, no postprocessing.
- `frameloop="demand"`, invalidated at 30 fps; dpr drops to 0.75 if the first 3 s average under 22 fps.
- Instanced coins, gems, stalactites and boulders. Text in 3D comes from canvas textures.
- The 3D layer loads lazily after a WebGL check and idle callback; without WebGL the page is a dark gradient with the same panels.

## Panels

Dark stone slabs (`rgba(20,12,20,.86)`) with a 2px gold edge and 14px radius. Short panels are sticky; tall ones (Keepers, Your hoard, Chronicle) scroll normally. On phones, panels sit below the scene with a top margin so the 3D subject stays visible above them.

## Vocabulary

Haul (0.02 ETH to the top 10) · Chest (0.025 ETH treasury) · Dragonfire (0.01 ETH buyback and burn) · Keepers (holders) · Burned (sold once, out for good) · Chronicle (the record).
