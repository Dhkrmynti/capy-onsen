---
name: The Robin Heist Gazette
description: "$RBANK set as a 1930s crime tabloid: one sheet of cold newsprint in wood type, ink and one red, where every heist is the front-page story."
colors:
  paper: "#dedcd5"
  paper-deep: "#cfccc3"
  paper-shade: "#bdb9ae"
  paper-lift: "#e9e7e1"
  ink: "#161514"
  ink-soft: "#3d3b37"
  ink-faint: "#5d5a54"
  rule-soft: "rgba(22, 21, 20, 0.28)"
  red: "#c8241b"
  red-deep: "#9e1a13"
  red-ink: "#fbf3ee"
  night-paper: "#171614"
  night-paper-deep: "#201f1c"
  night-paper-shade: "#2c2a26"
  night-paper-lift: "#23221f"
  night-ink: "#e6e3da"
  night-ink-soft: "#c2beb3"
  night-ink-faint: "#a29e93"
  night-rule-soft: "rgba(230, 227, 218, 0.3)"
  night-red: "#e2392d"
  night-red-deep: "#c42b20"
typography:
  masthead:
    fontFamily: "Alfa Slab One, Rockwell, serif"
    fontSize: "clamp(25px, 6.55vw, 94px)"
    fontWeight: 400
    lineHeight: 1.1
  display:
    fontFamily: "League Gothic, Arial Narrow, sans-serif"
    fontSize: "clamp(62px, 10.6vw, 152px)"
    fontWeight: 400
    lineHeight: 0.88
    letterSpacing: "0.005em"
  headline:
    fontFamily: "League Gothic, Arial Narrow, sans-serif"
    fontSize: "clamp(52px, 7.2vw, 110px)"
    fontWeight: 400
    lineHeight: 0.9
    letterSpacing: "0.005em"
  title:
    fontFamily: "League Gothic, Arial Narrow, sans-serif"
    fontSize: "34px"
    fontWeight: 400
    lineHeight: 1
  deck:
    fontFamily: "PT Serif, Georgia, serif"
    fontSize: "clamp(18px, 1.5vw, 21px)"
    fontWeight: 400
    lineHeight: 1.5
  body:
    fontFamily: "PT Serif, Georgia, serif"
    fontSize: "18px"
    fontWeight: 400
    lineHeight: 1.55
  label:
    fontFamily: "Archivo Narrow, Arial Narrow, sans-serif"
    fontSize: "14px"
    fontWeight: 600
    lineHeight: 1
    letterSpacing: "0.08em"
  button:
    fontFamily: "Archivo Narrow, Arial Narrow, sans-serif"
    fontSize: "18px"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "0.06em"
  wire:
    fontFamily: "Courier Prime, Courier New, monospace"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.35
rounded:
  none: "0px"
  card: "10px"
spacing:
  gutter: "clamp(16px, 3.4vw, 44px)"
  col-gap: "clamp(18px, 2.2vw, 30px)"
  max: "1360px"
  page-top: "clamp(40px, 6vh, 72px)"
components:
  button-primary:
    backgroundColor: "{colors.red}"
    textColor: "{colors.red-ink}"
    typography: "{typography.button}"
    rounded: "{rounded.none}"
    padding: "0 26px"
    height: "54px"
  button-primary-hover:
    backgroundColor: "{colors.red-deep}"
    textColor: "{colors.red-ink}"
  button-primary-active:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
  button-ink:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    typography: "{typography.button}"
    rounded: "{rounded.none}"
    padding: "0 26px"
    height: "54px"
  button-ink-hover:
    backgroundColor: "{colors.red}"
    textColor: "{colors.red-ink}"
  button-small:
    padding: "0 16px"
    height: "40px"
  coupon:
    backgroundColor: "{colors.paper-lift}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: "0 14px"
    height: "54px"
  coupon-active:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
  input-lookup:
    backgroundColor: "{colors.paper-lift}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: "0 16px"
    height: "54px"
  extra-bar:
    backgroundColor: "{colors.red}"
    textColor: "{colors.red-ink}"
    padding: "7px 16px 5px"
  crew-card:
    backgroundColor: "{colors.paper-lift}"
    textColor: "{colors.ink}"
    rounded: "{rounded.card}"
    padding: "20px 22px 18px"
    width: "520px"
  wanted-poster:
    backgroundColor: "{colors.paper-lift}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: "30px 26px 28px"
  classified-ad:
    backgroundColor: "{colors.paper-lift}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: "18px 20px"
  classified-ad-notice:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
  running-head:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    height: "58px"
---

# Design System: The Robin Heist Gazette

## Overview

**Creative North Star: "The Late Edition"**

The site is one sheet of cheap 1930s crime tabloid that keeps going to press. The engine's state is the news: the front page headline is set from live data, the heist schedule is a column of copy, the leaderboard is the stock quotations, the sell log is the police blotter, and the back page is the classifieds. Everything is ink on gray newsprint with one red, cut in wood type and laid out on a column grid with drawn rules. No surface pretends to be an app.

Density is a newspaper's: tight leading on headlines, generous body measure, rules doing the work that cards and boxes do elsewhere. Material is printed: a fixed halftone grain over the whole sheet, photographs printed as halftone screens computed from the mascot's own art, double rules under the masthead and above every page. Motion is a press run: rules are drawn, headlines slam onto the sheet out of a blur, decks are printed down by a roller, and the front page is turned over by the pages beneath it. The late edition (dark scheme) is the same paper printed in light ink on black stock.

**Key Characteristics:**
- Cold gray newsprint ground with stepped paper tones; ink, never pure black.
- One red, used for the masthead, the EXTRA bar, snitch counts, the one live action and the fuse flame.
- Five self-hosted faces with strict jobs: slab masthead, condensed wood-type headlines, serif reading copy, narrow sans labels, typewriter wire copy.
- Square newspaper geometry; the crew card is the only rounded object.
- Halftone as the photo material; one soft shadow for paper lying on paper.
- Press-run motion with a pinned front page that the next pages slide over.

## Colors

Three inks on gray stock: newsprint, carbon ink and a single tabloid red, with a full night-final inversion under `prefers-color-scheme: dark`.

### Primary
- **Tabloid Red** (`red`): the paper's one spot color. It prints the masthead and running-head name, the full-width EXTRA bar, the snitch count on the front rail, the WANTED numeral and the pull quote slogan, the live buy button, the fuse flame, the crew-card stamp when a wallet is out, plus the system's focus ring, text selection, caret and link-hover underline. **Pressed Red** (`red-deep`) is its hover and error-text step. **Red Paper** (`red-ink`) is the off-white type that sits on red.

### Neutral
- **Newsprint** (`paper`): the ground of every page and the running head.
- **Back Stock** (`paper-deep`): recessed fills, such as the keeper share of the take bar, the mugshot frame, table-row hover, the scrollbar track.
- **Shade Stock** (`paper-shade`): the deepest paper step, reserved for shaded paper.
- **Fresh Sheet** (`paper-lift`): anything pasted onto the page, such as the notice sheet, wanted poster, crew card, classified ads, coupon, input field and photo mounts.
- **Carbon Ink** (`ink`): type, rules (the `--rule` alias is the same ink), the inverted buttons, the feeding share of the take bar, the classified NOTICE ad.
- **Worn Ink** (`ink-soft`): decks, captions and secondary copy.
- **Faded Ink** (`ink-faint`): metadata, placeholders, blotter meta lines, disabled and waiting states.
- **Ghost Rule** (`rule-soft`): dotted and dashed hairlines between table rows, rule items and column rules.

### Night Final
The dark scheme redefines the same custom properties: black stock (`night-paper` with its deep, shade and lift steps), light ink (`night-ink`, `night-ink-soft`, `night-ink-faint`), and a brighter red (`night-red`, `night-red-deep`) so the spot color holds on black. The red-ink type stays the same. The shadow darkens to pure black. The halftone screen prints positive in night final, so dots carry the image's light instead of its dark.

### Illustration Only
The `--rb-*` family (slate fur, navy coat, brass, coin gold, sack tan, tie red, hat navy) colors Robin's SVG and nothing else. On the page it never prints in color: the halftone renders it in ink and the mugshot runs it through grayscale.

### Named Rules
**The One Red Rule.** Red is the only hue on the sheet. It marks the paper's identity (masthead, EXTRA), the danger (snitches) and the one action worth taking (the live buy). A second accent breaks the newspaper.

**The Ink Not Black Rule.** Ink is warm carbon (`ink`), never `#000`; paper is gray stock, never `#fff`.

## Typography

**Masthead Font:** Alfa Slab One (with Rockwell, serif)
**Headline Font:** League Gothic (with Arial Narrow, sans-serif)
**Body Font:** PT Serif (with Georgia, serif), regular, italic and bold
**Label Font:** Archivo Narrow (with Arial Narrow, sans-serif), 500 to 700
**Wire Font:** Courier Prime (with Courier New, monospace), 400 and 700

All five are self-hosted through @fontsource; no font loads from a third party.

**Character:** Wood-type condensed capitals shout the news while a sturdy newspaper serif carries the reading; a narrow grotesque handles every table and label, and a typewriter face marks anything that came off the wire.

### Hierarchy
- **Masthead** (400, `clamp(25px, 6.55vw, 94px)`, 1.1): the paper's name, centered, never wrapping, in red. Also the running-head name (20px) and the crew-card issuer line (16px).
- **Display** (400, `clamp(62px, 10.6vw, 152px)`, 0.88, uppercase): the front-page banner. Above 1080px it runs as a single line fitted to the full measure (up to 230px).
- **Headline** (400, `clamp(52px, 7.2vw, 110px)`, 0.9, uppercase, balanced): each inside page's head. The same face sets the WANTED poster, the pull-quote slogan, the back-page close, drop caps and big numerals.
- **Title** (400, 30 to 34px, 1, uppercase): rail heads, column subheads, ad heads.
- **Deck** (PT Serif italic, `clamp(18px, 1.5vw, 21px)`, 1.5, max 58ch): the standfirst under each page head; also captions and the submast line.
- **Body** (PT Serif 400, 18px, 1.55; 17px at 760px and below): the lede, column copy (set in 3, 2 or 1 newspaper columns with hyphenation), notices.
- **Label** (Archivo Narrow 600 to 700, 12 to 15px, 0.06 to 0.12em, uppercase): datelines, nav, table headers, fact terms, button text (18px, 700).
- **Wire** (Courier Prime 400, 12 to 16px): blotter entries, the contract address, folios, bylines, rail readouts and source lines.

### Named Rules
**The Job Per Face Rule.** Each face has one job. League Gothic never sets body copy; PT Serif never sets labels; Courier Prime is for wire copy and data only, never headings or prose.

**The Tabular Figures Rule.** Every live number uses tabular figures so counts and prices do not jitter as they update.

## Layout

A centered sheet (max 1360px) with a fluid outer gutter (`gutter`) and a fluid column gap (`col-gap`). The front page sits on a 12-column grid: photo 5, story 4, rail 3, the rail separated by a vertical rule. Inside pages open with a 6px double rule drawn across the full measure, a wire-type folio line, then the head and deck. Body copy flows in true newspaper columns with column rules (3 on desktop, 2 at 1080px, 1 at 760px). The notice and crew-card pages use a two-column grid with a sticky companion (the wanted poster). The back page is a classified grid with a lead ad spanning two rows.

Breakpoints: 1080px (front grid becomes 6 and 6 with the rail below; the banner stops fitting to one line), 900px (running-head index hidden), 760px (single column, story above photo, full-width buttons, take bar stacked, body 17px).

A fixed running head (58px, closed by a double rule) drops in once the masthead scrolls off the top.

### Named Rules
**The Rules Do The Boxing Rule.** Structure comes from printed rules (hairline, 2px, 4px, and 5 to 6px double), not from cards, fills or gaps.

## Elevation & Depth

Paper lying on paper. Depth comes from stock tone (`paper-lift` pasted onto `paper`), from printed rules, and from one soft offset shadow tinted to the ground. A fixed halftone grain (1px ink dots on a 5px grid at 7% opacity) sits over the whole sheet and never repaints on scroll. The page turn adds its own depth: the stacked inside pages cast an upward shadow and a fold crease onto the front page as they slide over it.

### Shadow Vocabulary
- **Lift** (`box-shadow: 0 14px 30px -18px rgba(40, 36, 28, 0.55), 0 2px 5px -2px rgba(40, 36, 28, 0.35)`): the live button, the wanted poster, the crew card. Night final: same geometry in black at 0.8 and 0.6.
- **Page edge** (`box-shadow: 0 -34px 50px -34px rgba(20, 18, 14, 0.55)`) with a crease gradient (`rgba(20, 18, 14, 0.14)` to transparent, 18px): only on the stack of pages that turns over the front page.

### Named Rules
**The One Lift Rule.** There is one soft shadow. Hard offset shadows, glows and stacked elevations do not belong to newsprint.

## Shapes

Newspaper is square: every rule, box, button, field, table, ad and photo mount has square corners. The crew card is the one rounded object (`rounded.card`), a pocket press pass. Rounding is reserved for things that are round in the world, like the twisted fuse cord. Pasted-up pieces sit slightly askew: the wanted poster at 2deg (1deg on mobile), the crew card at -1deg, the stamp at -12deg. Borders do the shape work: solid for printed edges, dashed for coupons, blanks and cut-out lines, dotted for ledger rows, double rules for section breaks.

## Components

### Buttons
Printed plates: square, ink-bordered, uppercase narrow type.
- **Shape:** square corners, 2px ink border, 54px tall (40px small).
- **Primary (live action):** red plate, red-paper text, 18px Archivo Narrow 700 at 0.06em, the lift shadow.
- **Hover:** darkens to pressed red and rises 1px (0.18s, `--ease-press`).
- **Active:** one-bit inversion: the plate goes to ink with paper text and sinks 1px.
- **Ink variant:** ink plate with paper text that turns red on hover.
- **Waiting:** transparent, dashed border, faded ink, no shadow.
- **Focus:** a 3px red outline at 3px offset (system-wide).

### Coupon (contract address)
A dashed cut-out on fresh stock: scissors icon, an ink "CA" tag, the address in wire type with an ellipsis, a copy icon. Hover turns the dashes red; active inverts to ink, as the buttons do.

### Inputs / Fields
- **Style:** square, 2px ink border, fresh-sheet fill, 54px tall, Archivo Narrow 17px with tabular figures, joined flush to its button (no shadow on that button).
- **Focus:** 3px red outline at zero offset.
- **Error:** bold pressed-red text below; help text in faded ink.

### Navigation
The running head: newsprint bar with a double-rule bottom, the masthead name in red slab type at left, a centered index of uppercase narrow labels (underline in red on hover), the live button at right. It slides down once the masthead has scrolled away and hides its index below 900px.

### The Front Page
Dateline row in labels, red slab masthead, italic submast closed by a double rule, the red EXTRA bar in League Gothic, the fitted banner headline, then the photo, lede with a drop cap, and the rail. The rail carries the fuse, a twisted ink cord burning left to right with ash, char and a stepped red flame, followed by fact rows with big gothic numerals (snitches in red) and a wire-type source line.

### Halftone Photograph
The photo material. A canvas renders a 45-degree dot screen computed from Robin's own SVG, mounted in a fresh-sheet frame with a hairline border and an italic caption. It develops from a coarse screen to a fine one (on load above the fold, scrubbed by scroll below it) and comes to rest as fine dots with only a faint trace of line art. In night final the screen prints positive.

### Crew Card
The signature lookup result: a press pass on fresh stock, 2px ink border, the one 10px radius, lift shadow, tilted -1deg. Double-ruled header (red slab issuer, label kind), grayscale mugshot in an ink frame, a gothic name, a two-column fact grid, an italic line, and a rubber stamp (4px border, gothic caps, -12deg) colored by state: ink for in, faded ink for waiting, red for out. The empty state is a dashed, untilted, shadowless blank.

### Wanted Poster
A sticky notice beside the rules: fresh stock, 2px border, lift, 2deg tilt, gothic WANTED, a giant red count, and a reward line under a double rule.

### Tables (the Vault)
Stock-quotation styling: Archivo Narrow throughout, 4px rule top and bottom, 2px under the header, vertical hairlines between columns, dotted row rules, right-aligned tabular numbers, bold top rows, a back-stock hover.

### Blotter Entry
Police-ledger entries in two columns with a column rule: an ink hairline on top, a wire-type meta line in faded ink, wire-type copy with bold uppercase names, and the transaction link.

### Classified Ads
The back page grid: fresh-stock boxes with hairline borders (3px on the lead ad), gothic heads, serif copy, and one inverted ink NOTICE ad.

### Motion
A press run on the `--ease-press` curve (`cubic-bezier(0.16, 1, 0.3, 1)`) for CSS and GSAP `expo.out` for entrances. Every inside page head runs the same sequence: the double rule draws from the left, the headline slams in from 1.16 scale out of a 7px blur, and the deck is printed down by a clip-path roller. Each section then adds one move of its own: take shares are counted out left to right, notice rules are pasted up by a horizontal wipe, the wanted poster is slapped on with a back-out overshoot, the crew card is printed in and stamped, vault rows come off the wire one at a time, and blotter entries are stamped in batches as they scroll into view. The signature move is the page turn: once the whole front page has been read, it pins at its bottom and scrubs to 0.94 scale and 0.82 brightness while the inside pages slide over it. Smooth scroll is Lenis. With reduced motion, every animation, the smooth scroll and the pin are skipped, the halftone renders at its finished fine screen, and the fuse is set directly.

The operator room at `/lotnok` reuses these tokens (paper, ink, card radius, lift) but is a utility screen, not a designed surface.

## Do's and Don'ts

### Do:
- **Do** keep red to its jobs: masthead, EXTRA, snitch counts and slogan, the one live action, the fuse flame, the out stamp, focus and selection.
- **Do** separate content with printed rules (hairline, 2px, 4px, double) before reaching for boxes or fills.
- **Do** give each face its one job: League Gothic for heads and big numerals, PT Serif for reading, Archivo Narrow for labels, tables and buttons, Courier Prime for wire copy and data.
- **Do** print images as halftone from the real mascot art, at a fine screen at rest.
- **Do** invert to ink on paper for pressed states on buttons and the coupon.
- **Do** open every new inside page with the drawn double rule, folio, slammed headline and rolled deck, then one move native to its content.
- **Do** define every color as a token and redefine it for night final; nothing hard-codes a light-only value.
- **Do** collapse all motion to the finished static sheet under reduced motion.

### Don't:
- **Don't** add a second accent hue, gradients or tinted panels.
- **Don't** round corners on anything but the crew card at 10px.
- **Don't** use any shadow other than the lift and the page-turn edge; no hard offset shadows, glows or blur panels.
- **Don't** set prose or headings in Courier Prime, or body copy in League Gothic.
- **Don't** use stock photos or full-color art on the sheet; Robin's palette only reaches the page through halftone or grayscale.
- **Don't** use pure `#000` ink or pure `#fff` paper.
