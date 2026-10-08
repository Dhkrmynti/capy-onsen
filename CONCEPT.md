# Robin Heist ($RBANK) · konsep

Rebrand 8 Okt 2026 dari Pepads ($PADS). Mekanik engine tidak berubah; nama, ticker, maskot, UI dan lore diganti total. Token baru di-launch di Pons; engine dipindah ke CA baru, $PADS lama berhenti dapat split.

> Status: situs dan konten siap. Menunggu launch $RBANK, domain robinheist.fun, dan ganti handle X.

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
