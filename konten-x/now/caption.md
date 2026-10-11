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
