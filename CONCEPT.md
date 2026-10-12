# Capy Onsen ($ONSEN) · working name · branch `lore-onsen` (12 Oct 2026)

Rebranded from Take a Seat ($SEAT). Same site features and the same engine underneath; the lore and the whole UI changed.

**Lore.** A hot spring bathhouse run by capybaras. The ten biggest holders are the ten capybaras soaking in the water, and No. 1 wears the yuzu on its head. Overtake someone and you wade to their spot; the yuzu changes heads. Sell once and you are out of the water, in the cold, for good. The dev wallet is the attendant at the counter: always shown, never in the water, never paid. Under the bath is the boiler room, where the trading fees come down the pipe and run the loop. Each capybara wears its holder's portrait traits (coat, what is on the head, extras, the wall behind). Original characters.

**Engine.** Unchanged from Take a Seat: no buyback and no burn. The cycle is two steps: reward (0.02 ETH to the ten in the water: No. 1-5 share 0.014, No. 6-10 share 0.006) then treasury (0.025 ETH), then again. The engine never buys, sells or destroys the token. (A four-step version with buyback and burn was restored and then dropped again on 12 Oct 2026; it is in commit 6bae269 if it is ever wanted.) Only the token name in logs and the text a wallet signs changed.

Vocabulary: the bath (board) · the yuzu (No. 1) · hot pool / warm pool (the two tiers) · the towel line (11-50) · washing up (holding not aged yet) · got out (sold) · the attendant, at the counter (dev) · your bath tag (wallet card) · the changing room (name, capybara, X) · the boiler room (the cycle) · the ledger (log).

UI: flat illustration, no 3D. A noren over a Fuji mural, wood, tile, water, coal. Dela Gothic One, Zen Kaku Gothic New, DM Mono. Three scroll transitions: the noren lifts and the water rises over the doorway; the fees running down the drain and along the pipe past the two valves in the boiler room; paper doors sliding open on the house rules. See `DESIGN.md`.

Name and ticker live in `src/lib/brand.ts` (plus the engine logs, `index.html`, `public/favicon.svg`). The page is in `src/onsen/`. `lobby.html`, `city.html` and `brawl.html` are older prototypes and still show the ape and rabbit worlds. `scripts/`, `DEPLOY-VPS.md`, `public/terms.html` and `public/privacy.html` still name the earlier domain and X handle; nothing is deployed for this lore.

---

# Take a Seat ($SEAT) · working name · branch `lore-seat` (12 Oct 2026)

Rebranded from Hawking ($HAWK). Same site and engine underneath; two things changed.

**Lore.** A waiting room. The ten biggest holders are bored cartoon apes seated on ten numbered chairs, No. 1 on the gold one. Overtake someone and your ape gets up and punches theirs down the row. Sell once and you are punched out through the window, for good. The dev wallet is the ape behind the front desk: always shown, never seated, never paid. Each ape wears its holder's portrait traits (fur, hat, eyewear, shirt), so the 2D portrait and the 3D ape match. Original characters: not copies of any NFT collection.

**Engine.** No buyback and no burn. The cycle is two steps: reward (0.02 ETH to the seated ten: No. 1-5 share 0.014, No. 6-10 share 0.006) then treasury (0.025 ETH), then again. The engine never buys, sells or destroys the token.

Vocabulary: the row (board) · gold chair (No. 1) · front row / back row (the two tiers) · standing in line (11-50) · at the door (holding not aged yet) · thrown out (sold) · front desk (dev) · your ticket (wallet card) · receipts (log).

Name and ticker live in `src/lib/brand.ts` (plus a few strings in the wallet card, `index.html` and the engine logs). `scripts/` and `DEPLOY-VPS.md` still describe the Hawking server; nothing is deployed for this lore.

---

# Robin Heist ($RBANK) · konsep

Rebrand 8 Okt 2026 dari Pepads ($PADS). Mekanik engine tidak berubah; nama, ticker, maskot, UI dan lore diganti total. Token baru di-launch di Pons; engine dipindah ke CA baru, $PADS lama berhenti dapat split.

> Status: situs dan konten siap. Menunggu launch $RBANK, domain robinheist.cloud, dan ganti handle X.

---

## 1. Lore

**Robin** adalah rakun yang menyamar jadi pengusaha. Topeng banditnya bulu asli; topi bowler, dasi kupu-kupu dan monokel cuma kostum bankir. Tiap trade di $RBANK menjatuhkan fee, Robin "merampoknya", lalu membagi hasilnya ke crew yang paling setia. Siapa pun yang jual dianggap **snitch**: keluar dari crew, selamanya.

- Tagline: **"never snitch."**
- Sub-tagline: *"robbing the paper hands since block one."*
- Voice: degen CT santai, lowercase, sedikit sombong ala bos geng ("the heist ran. the crew got paid.").
- Parodi, bukan lembaga keuangan sungguhan. **Bukan** dividen, saham, atau investasi: selalu pakai istilah plesetan dan disclaimer.

| Istilah | Arti di mesin |
|---|---|
| **the vault** | ekosistem $RBANK / leaderboard di situs |
| **loot** | creator fee (ETH) yang masuk ke escrow Pons |
| **the heist** | engine claim fee saat escrow mencapai ukuran langkah berikutnya |
| **the split** | langkah 1: 0.01 ETH dikirim sebagai ETH ke 10 bag terbesar, dibagi sesuai saldo |
| **hideout fund** | langkah 2: 0.02 ETH ke treasury, dipamerkan terbuka |
| **burn the ledger** | langkah 3: 0.01 ETH buyback $RBANK lalu kirim ke 0x…dEaD |
| **the crew** | holder yang belum pernah jual dan saldonya ≥ minimum |
| **snitched** | wallet yang pernah jual → keluar permanen |
| **lookout** | holder di bawah minimum |
| **crew card** | cek wallet di situs |
| **the ledger** | riwayat semua heist + tx |

## 2. Maskot: Robin (original)

- Rakun abu-abu, topeng bandit hitam alami di sekitar mata, ekor bergelang.
- Kostum menyamar: topi bowler hitam dengan pita kuningan, dasi kupu-kupu merah, rompi navy, monokel emas berantai.
- Duduk di tumpukan koin emas, karung uang bertanda $ di sampingnya.
- **Bukan rubah** (Robin Hood rubah identik dengan Disney) dan bukan karakter milik proyek lain.

## 3. Visual

- Palet "brankas malam": navy baja `#15243b`, kertas uang `#f3ecdc`, kuningan `#e2b64e`, hijau uang `#83d17a`, merah alarm `#e0482d`.
- Latar: panel baja berpaku keling. Papan split-flap tetap dipakai sebagai **Heist board** (papan kurs).
- Font: **Alfa Slab One** untuk brand dan judul utama (poster WANTED klasik), Big Shoulders untuk judul bagian, Barlow Condensed untuk flap.

## 4. Mekanik (sama dengan engine yang berjalan)

1. **The heist**: tiap 10 detik engine cek escrow Pons. Kalau mencapai ukuran langkah berikutnya → claim.
2. **The split** (0.01 ETH) → ETH langsung ke top 10 crew berdasarkan saldo, dibagi sesuai porsi saldo. 1 crew → dia dapat semua.
3. **Hideout fund** (0.02 ETH) → treasury.
4. **Burn the ledger** (0.01 ETH) → buyback $RBANK, yang dibeli saja yang dibakar (bag dev di wallet bot tidak tersentuh).
5. Ulang dari 1. Porsi satu siklus: 25% crew / 50% treasury / 25% burn, ditampilkan terbuka.

Syarat crew: tidak pernah jual, saldo ≥ 100.000 $RBANK, hold time sesuai `minHoldHours` (live: 0).

## 5. Migrasi dari $PADS

- Launch $RBANK di Pons **dari wallet bot yang sama** (`0x33E1…6213`) supaya fee masuk ke escrow yang dibaca engine.
- Di `/memex`, ganti CA ke $RBANK pakai `ADMIN_SECRET`. State holder dan riwayat round ter-reset untuk token baru.
- $PADS lama berhenti dapat split. Umumkan terbuka (post migrasi di `konten-x/caption.md`), jangan diam-diam.
- Engine membaca escrow Pons per wallet creator (`balanceOf(wallet)`). Kalau Pons menggabungkan fee semua token dari creator yang sama, fee $PADS yang masih masuk ikut terpakai untuk siklus $RBANK. Belum diverifikasi; cek di escrow setelah launch.
