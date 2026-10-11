# Hawking ($HAWK): poster kondisi live

CA: `0xa19d5a29879eb9ce751a8a7416e1d0a475c3afca` · Situs: https://hawkings.fun · X: @hawkingrh

Poster now-2, now-3 dan now-4 memakai angka live dari hawkings.fun saat dirender (tertulis di pojok kanan bawah: "LIVE READING · …"). Angkanya berubah setiap beberapa menit, jadi render ulang tepat sebelum posting:

```
cd remotion-x && ./render-hawking-now.sh
```

Angka render terakhir (11 Oct 2026, 13:55 WIB): 3 holder di papan, 21 spaghettified, radiation level 0.0119 dari 0.02 ETH (59%).
Kalau dirender ulang, samakan angka di caption dengan posternya.

| File | Isi |
|---|---|
| `now-1-hawk-is-live.png` | "$HAWK is live." + CA, pita LIVE ON PONS |
| `now-2-zones-open.png` | "7 zones open.": cincin papan, zona kosong putus-putus |
| `now-3-radiation-level.png` | "59% charged.": level menuju The Emission |
| `now-4-spaghettified.png` | "21 spaghettified.": yang jual vs yang masih hold |

---

## 1. Live (quote post yang di-pin)

**Media:** `now-1-hawk-is-live.png`

> $HAWK is live on Pons. ⚠️
>
> The ten biggest holders sit nearest the core and get paid in ETH.
> Sell once and you're spaghettified.
>
> CA: 0xa19d5a29879eb9ce751a8a7416e1d0a475c3afca
> hawkings.fun

**Alt text:** A black poster with yellow hazard tape reading "Live on Pons", the headline "$HAWK is live.", and the contract address in a yellow box, beside a glowing black hole.

---

## 2. Zona kosong

**Media:** `now-2-zones-open.png`

> 7 zones open on the exposure board.
>
> Only 3 holders are near the core right now. The ten nearest split every 0.02 ETH emission:
> red zone No. 1-5 share 0.014, amber zone No. 6-10 share 0.006.
>
> Hold 100,000 $HAWK and you take a zone at once.
>
> CA: 0xa19d5a29879eb9ce751a8a7416e1d0a475c3afca

**Alt text:** Ten rings around a black hole inside a yellow-and-black hazard ring. Three rings carry a holder; seven are dashed and empty. Text: "7 zones open."

---

## 3. Radiation level

**Media:** `now-3-radiation-level.png`

> Radiation level: 59% charged. ⚠️
>
> 0.0119 of 0.02 ETH. Every trade adds to it.
> At 0.02 the engine emits it to the ten nearest the core.
>
> Watch it live: hawkings.fun

**Alt text:** A caution placard with a segmented yellow bar a little over half lit, reading 0.0119 / 0.02 ETH to The Emission, under the headline "59% charged."

---

## 4. Spaghettified

**Media:** `now-4-spaghettified.png` (atau `../gif-new-core.gif` sebagai balasan)

> 21 wallets sold. 21 spaghettified, for good.
>
> 3 still hold, and they split the next emission.
>
> hawkings.fun

**Alt text:** Red hazard tape reading "Spaghettified" over the headline "21 spaghettified.", two counts (3 still on site, 21 spaghettified) and a red no-selling sign.

---

## Urutan

1. Sekarang: **Post 1**.
2. +1 jam: **Post 2** (render ulang dulu).
3. Saat level di atas 80%: render ulang, lalu **Post 3**.
4. **Post 4** setelah gelombang jual, sebagai pengingat aturannya.
5. Setelah emission pertama dibayar: quote dengan link tx asli dari Incident log di situs.

$HAWK adalah memecoin tanpa janji nilai. Jangan pakai kata yield, APY atau passive income.

---

## Video berita: Mission Control briefing

**File:** `news-briefing.mp4` (32 detik, tanpa suara, teks terbakar di video)
Render ulang dengan angka terbaru: `cd remotion-x && ./render-hawking-news.sh`

Isi video:
1. Konferensi pers: astronot Hawking di podium Mission Control: "Hello everyone." → "Today, the first emission went out." → "0.048 ETH, paid to the 10 holders nearest the core."
2. Grafik candle hijau naik ("Green on the board."), dengan label ILLUSTRATION · NOT A PRICE FEED. Candle itu gambar, bukan harga asli.
3. BREAKING: top 10 holder live (wallet, jumlah $HAWK, ETH yang diterima dari emission #1).
4. "Sell once, and you're spaghettified. Thank you." → end card hawkings.fun + CA.

> 🎙️ Mission Control briefing.
>
> Emission #1 is done: 0.048 ETH went to the ten holders nearest the core.
> 0.032 ETH went to the Containment Fund. Next up: buyback & burn.
>
> Here are the top ten. Are you on the board?
>
> CA: 0xa19d5a29879eb9ce751a8a7416e1d0a475c3afca
> hawkings.fun

**Alt text:** A cartoon hawk in an astronaut helmet gives a press briefing at a Mission Control podium, with a LIVE news chyron and ticker. A drawn green candle chart labelled as an illustration climbs, then a "Breaking: the top ten holders" table lists wallets, $HAWK holdings and ETH received from emission #1.

---

## 3 post: news + 2 hook

Render ulang post news dengan angka terbaru: `cd remotion-x && ./render-hawking-hooks.sh` (dua hook ikut dirender, isinya tetap).

### News: siklus 1 selesai

**File:** `news-cycle-complete.png` (angka 11 Oct 2026, 14:56 WIB)

> 🚨 Mission Control bulletin: cycle 1 is complete.
>
> All four steps ran on their own, on chain:
> ⚠️ 0.048 ETH paid to the ten nearest the core
> 🛡️ 0.057 ETH into the Containment Fund
> 🔥 2.17M $HAWK bought back and burned
>
> 37 on site. 93 spaghettified. Next up: The Emission.
>
> CA: 0xa19d5a29879eb9ce751a8a7416e1d0a475c3afca
> hawkings.fun

**Alt text:** A "Mission Control Bulletin" news card: "Cycle 1 is complete." with three totals (0.048 ETH paid to the ten nearest the core, 0.057 ETH into the Containment Fund, 2.17M $HAWK bought back and burned), counts of 37 on site and 93 spaghettified, and "Next up: The Emission".

### Hook: lowongan astronot

**File:** `hook-astronauts-wanted.png`

> Now hiring. 🧑‍🚀
>
> Requirements: hold 100,000 $HAWK.
> Pay: ETH, every emission.
> Dismissal: sell once.
>
> Apply at hawkings.fun

**Alt text:** A job notice with hazard tape: "Now hiring · Mission Control. Astronauts wanted." listing requirements (hold 100,000 $HAWK), pay (ETH every emission), location (within ten rings of a black hole), hours (24/7) and dismissal (sell once, spaghettified), with the hawk astronaut mascot beside it.

### Hook: bold choice

**File:** `hook-bold-choice.png` (cocok sebagai balasan saat ada yang jual)

> Someone sold $HAWK.
>
> Bold choice. Their share of every emission now goes to the ten who held. 🍝
>
> hawkings.fun

**Alt text:** Red tape reading "Seller detected" over the headline "Bold choice.", the line "It's off the board for good. Its share of every emission now goes to the ten who held.", and the hawk astronaut mascot saying "Spaghetti, extra long."

---

## 3 post lagi: news reward #2 + 2 gimmick

Render ulang news dengan angka terbaru: `cd remotion-x && ./render-hawking-hooks2.sh`

### News: reward ke-2 masuk

**File:** `news-reward-landed.png` (angka 11 Oct 2026, 16:06 WIB)

> 🚨 The 2nd reward landed.
>
> 0.0205 ETH went straight to the 10 wallets nearest the core.
>
> So far:
> ⚠️ 0.0685 ETH paid to holders over 2 rewards
> 🔥 2.17M $HAWK bought back and burned
> ⚙️ 5 rounds, all run by the engine on its own
>
> Top earner: 0xec9c…32ab, +0.0128 ETH. Never sold.
>
> CA: 0xa19d5a29879eb9ce751a8a7416e1d0a475c3afca
> hawkings.fun

**Alt text:** A "Mission Control Bulletin" card: "The 2nd reward landed." 0.0205 ETH to the 10 wallets nearest the core, with totals (0.0685 ETH paid over 2 rewards, 5 rounds, 2.17M $HAWK burned), the top earner 0xec9c…32ab at +0.0128 ETH, 41 holders on site, and Treasury running now.

### Gimmick: boarding pass

**File:** `hook-boarding-pass.png`

> Now boarding. ✈️
>
> From: your wallet
> To: the core
> Baggage: 100,000 $HAWK
> Return ticket: none
>
> Gate: Pons · hawkings.fun

**Alt text:** A "Hawking Air" boarding pass from WLT to CORE: passenger You, seat No. 1-10, baggage 100,000 $HAWK minimum, return ticket None, class Diamond Hands, gate Pons, with the hawk astronaut mascot in the corner.

### Gimmick: ramalan cuaca

**File:** `hook-forecast-from-the-core.png`

> Today's forecast from the core: 🌤️
>
> Top 10: sunny, ETH every reward
> Sellers: severe spaghettification
> Supply: falling, buybacks burn what they buy
>
> hawkings.fun

**Alt text:** A weather report titled "Forecast from the core." with the hawk astronaut as presenter: Top 10 sunny (ETH every reward), Sellers severe (spaghettification, no recovery), Supply falling (buybacks burn what they buy).

---

## Fitur baru: siklus live di web

**File:** `feature-watch-the-cycle-live.png` (tangkapan layar asli hawkings.fun, 11 Oct 2026; saat itu Buyback & burn yang berjalan, 0.0047 / 0.01 ETH)

> New on hawkings.fun: watch the cycle live. ⚠️
>
> Only the step running now lights up, with its meter filling toward the next payout. The others wait in grey for their turn.
>
> Reward → Treasury → Buyback & burn → Treasury → again.
>
> hawkings.fun/#round

**Alt text:** "New on hawkings.fun: Watch the cycle live." above a screenshot of the site's cycle section: three placards (Reward, Treasury, Buyback & burn); only Buyback & burn is lit with a Running beacon and a meter at 0.0047 / 0.01 ETH, the other two are greyed out, and a line shows the loop Reward → Treasury → Buyback & burn → Treasury → again.

---

## News: penerima reward ke-2

**File:** `news-reward-2-paid.png` (data asli dari engine: reward #2, dibayar 11 Oct 2026, 15:32 WIB)

> Reward #2 is paid. 0.0205 ETH, ten wallets, straight from the engine. ⚠️
>
> No. 1 0xc364…37e8: +0.00387 ETH
> No. 2 0xec9c…32ab: +0.00310 ETH
> No. 3 0xe730…da3d: +0.00259 ETH
> …down to No. 10 0x3ba7…ea71: +0.00116 ETH
>
> No. 1-5 share 70%, No. 6-10 share 30%, by balance. Every transfer is on chain.
>
> Next reward goes to whoever holds the top ten then. Sellers are out for good.
>
> hawkings.fun

**Alt text:** A pay slip titled "Ten wallets. Paid." for Reward #2 (total 0.0205 ETH): ten rows with rank, short wallet address, holding in $HAWK, ETH received (from +0.00387 for No. 1 to +0.00116 for No. 10) and the start of each transaction hash, with a dashed line between No. 5 and No. 6.

---

## Gimmick: misclick

**File:** `hook-no-undo-button.png`

> PSA: the core has no undo button. ⚠️
>
> The engine can't tell a misclick from a sell. Any sale, any size, and that wallet is spaghettified for good.
>
> Check twice. Click once. Or just don't click.
>
> hawkings.fun

**Alt text:** A confirm dialog from "Mission Control" asking "Are you sure you want to sell $HAWK? Even 10%. Even by accident. This wallet will be spaghettified and never earn another reward." with a crossed-out red SELL button and a yellow HOLD button, beside the headline "The core has no undo button." and the hawk astronaut mascot.

---

## Update fitur: Connect X + 3 konten (news, gimmick, hook)

Render ulang news dengan angka terbaru: `cd remotion-x && ./render-hawking-hooks3.sh`

### Update fitur: Connect X

**File:** `feature-connect-x.png`

> New on hawkings.fun: Connect X. 🧑‍🚀
>
> Put your X handle, picture and badge on the exposure board, right next to your rank.
>
> 1. Connect the wallet that holds $HAWK
> 2. Your dosimeter → "Set your name, astronaut or connect X"
> 3. Connect X → Sign & connect X → Authorize
>
> Read-only. We never post or see your DMs. Free to sign, moves no funds.
>
> hawkings.fun

**Alt text:** "New on hawkings.fun: Connect X." with three numbered steps, beside a screenshot of the site's booth showing the Connect X tab and a "Sign & connect X" button, and a large X logo.

### News: burn ke-2

**File:** `news-burn-2.png` (angka 11 Oct 2026, 17:54 WIB)

> 🔥 Evaporation #2: 1.95M $HAWK gone.
>
> The engine bought it back on Pons and burned exactly what it bought.
>
> So far:
> 🔥 4.12M $HAWK burned for good
> ⚠️ 0.0685 ETH paid to the ten nearest the core
> 🛡️ 0.0856 ETH into the Containment Fund
>
> 7 rounds, no hands. Treasury is filling now, then the next reward.
>
> hawkings.fun

**Alt text:** A "Mission Control Bulletin" card: "1.95M $HAWK gone." for the 2nd buyback and burn, with totals (4.12M $HAWK burned, 0.0685 ETH to the ten nearest the core, 0.0856 ETH into the Containment Fund), 7 rounds, Treasury running now at 0.0207 / 0.025 ETH, then the next reward.

### Gimmick: hello, my name is

**File:** `gimmick-hello-my-name-is.png`

> Mission Control dress code: wear your @ to the core. 🏷️
>
> Connect X on hawkings.fun and the board shows your handle instead of 0x…

**Alt text:** A red "Hello, my name is" sticker reading "@you" with an X logo and "Rank: near the core · Status: never sold", next to the line "Wear your @ to the core." and the hawk astronaut mascot.

### Hook: nobody remembers 0x…

**File:** `hook-nobody-remembers-0x.png`

> Nobody remembers 0x1a2b…3c4d.
>
> Hold near the core with your X on it. Let them see who's getting paid.
>
> hawkings.fun

**Alt text:** The headline "Nobody remembers 0x1a2b…3c4d." beside a slice of the exposure board where rank 01 shows "@you" with an X logo highlighted in yellow, above two anonymous wallet addresses.

---

## Video: fitur Connect X

**File:** `video-connect-x.mp4` (19 detik, tanpa suara)

> New on hawkings.fun: Connect X. 🧑‍🚀
>
> Three clicks and the exposure board shows your X handle, picture and badge instead of 0x…
>
> Connect the wallet → Your dosimeter → Connect X.
> Read-only. We never post or see your DMs.
>
> hawkings.fun

**Alt text:** Animated video: an X logo pops in over "Connect X.", three numbered steps appear beside a screenshot of the site's Connect X booth, then a row on the exposure board turns from an anonymous 0x address into "@you" with the hawk astronaut avatar and the tag "That's you".

## Video: good afternoon, red day

**File:** `video-good-afternoon-red-day.mp4` (32 detik, tanpa suara; angka engine asli saat render. Render ulang: `cd remotion-x && ./render-hawking-videos2.sh`)

> 🎙️ Good afternoon from Mission Control.
>
> Yes, the market is red today. The engine doesn't read charts, it reads trades.
> Every trade, up or down, still pays a fee into the escrow, and the cycle keeps running:
> reward → treasury → buyback & burn → treasury.
>
> Sellers get spaghettified. Holders stay near the core.
>
> hawkings.fun

**Alt text:** The hawk astronaut gives an afternoon press briefing at a Mission Control podium with a LIVE chyron, a drawn red candle chart labelled as an illustration, then an "engine report" with the real totals: ETH paid to the ten nearest the core, $HAWK burned, ETH into the Containment Fund and rounds run.

## Video hook: red day = scoop day

**File:** `video-red-day-scoop.mp4` (16 detik, tanpa suara. Render ulang: `cd remotion-x && ./render-hawking-videos3.sh`)

> The chart is red. 🔴
> Mission Control's plan:
>
> Scoop. Scoop. Scoop. 🥄🥄🥄
>
> Then hold. 100,000+ $HAWK puts you on the board, the ten nearest the core share every 0.02 ETH reward, and one sale spaghettifies you for good.
>
> hawkings.fun
> CA: 0xa19d5a29879eb9ce751a8a7416e1d0a475c3afca
>
> NFA · memecoin

**Alt text:** Animated video: a drawn red candle chart under "The chart is red. Mission Control's plan:", then the hawk astronaut scoops three red candles with a giant spoon into a $HAWK bag as "Scoop. Scoop. Scoop." pops in, a card with the rules (100,000+ to get on the board, top 10 share each reward, sell once and you're out), and an end card "Red day = scoop day, hawkings.fun".

## Video gimmick: paper hands vs scooper

**File:** `video-paper-hands-vs-scooper.mp4` (17 detik, tanpa suara)

> Same red candle. Two astronauts. 🧑‍🚀🧑‍🚀
>
> 🔴 Paper hands: "it's red, I'm out." → SELL → spaghettified, forever.
> 🟡 Scooper: "it's red. scoop." → BUY → climbs the board, closer to the core.
>
> Which astronaut are you? 👇
>
> hawkings.fun

**Alt text:** Split-screen animation: on the left, a "paper hands" hawk astronaut presses SELL and is stretched and pulled into a black hole ("Spaghettified. Forever."); on the right, a "scooper" presses BUY, a spoon drops in and its exposure-board rank climbs from #14 to #08, "in the ten". It ends with "Which astronaut are you?" and hawkings.fun.
