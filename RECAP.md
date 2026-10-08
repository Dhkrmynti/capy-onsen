# Rekap Proyek: Robin Heist ($RBANK)

*Ditulis 9 Oktober 2026. Ringkasan seluruh percakapan, untuk melanjutkan dari akun lain.*

---

## 1. Proyek ini apa

Memecoin di **Robinhood Chain** (chain id 4663) yang di-launch lewat **Pons** (ponsfamily.com), plus **fee engine** otomatis. Engine meng-claim fee creator dari escrow Pons lalu menjalankan siklus 3 langkah:

| Langkah | Ukuran escrow | Yang terjadi |
|---|---|---|
| **Feeding** ("the split") | 0,01 ETH | ETH dibagi ke **top 10 holder** berdasarkan saldo, pro-rata |
| **Keeper** ("hideout fund") | 0,02 ETH | ETH ke wallet treasury |
| **Sink** ("burn the ledger") | 0,01 ETH | Buyback token di curve Pons (Uniswap v4 setelah graduate), lalu **hanya jumlah yang dibeli** yang di-burn ke `0xdEaD` |

Lalu siklus mengulang. Pembagiannya 25% / 50% / 25%.

**Aturan utama:** wallet yang **pernah jual** (ke curve atau DEX) jadi "snitch" dan keluar dari crew selamanya. Pindah ke wallet sendiri tidak dihitung jual.

---

## 2. Riwayat singkat

1. **Diamond Pads, lalu Pepads ($PADS):** versi pertama dengan tema katak/pond.
   - Live di **pepads.fun** sejak 8 Okt 2026, CA `0x0799419ca81761d90212d25e930c0bb42e658544`.
   - Feeding #1 terbayar 0,0137 ETH on-chain.
   - Setelah itu trading berhenti: sekarang holder 0 dan 12 wallet tercatat snitch.
2. **Rebrand ke Robin Heist ($RBANK):** tema rakun pencuri, UI baru gaya koran 1930-an, **"The Robin Heist Gazette"**.
   - Backend, tokenomics, dan mekanisme tidak diubah, hanya UI dan lore.
   - Nama tidak boleh mengandung kata "bank", karena review Hostinger. Ticker tetap **$RBANK**.
   - Domain: **robinheist.cloud**.
3. Fitur yang ditambahkan setelah rebrand:
   - **Nickname geng + mugshot rakun:** setiap wallet, termasuk pembeli di GMGN, otomatis dapat alias dan mugshot. Holder bisa mengeditnya setelah connect wallet (tanda tangan gratis, tanpa gas).
   - **Connect X:** handle, foto, dan centang biru diambil dari X dan tidak bisa diedit. Logo X di leaderboard membuka profilnya.
   - **Tombol Connect wallet di header.**
   - **Layout compact:** semua halaman diperkecil, dan perbaikan mobile (hero gelap, halaman melebar ke samping, header terpotong).
   - **Mode demo** yang bisa dinyalakan dan dimatikan tanpa build ulang.
4. **Konten X** dibuat dengan Remotion: logo, banner, GIF, video demo, 3 post, dan caption.
5. Kode di-push ke **GitHub (private)**.

---

## 3. Status saat ini (9 Okt 2026)

| Hal | Status |
|---|---|
| robinheist.cloud | ✅ Live di VPS baru `76.13.20.64`, HTTPS (Certbot, auto-renew) |
| Mode situs | 🟡 **DEMO** (angka contoh). Kembalikan ke live dengan `scripts/site-mode.sh live` |
| Token $RBANK | ❌ **Belum launch di Pons** |
| robinheist-engine | 🟡 Standby (belum ada token, key, dan treasury) |
| Connect X | 🟡 Kode siap, `X_CLIENT_ID` dan `X_CLIENT_SECRET` masih kosong |
| pepads.fun + pepads-engine | ❌ Mati bersama VPS lama, tidak dipindah |
| GitHub | ✅ https://github.com/JelasBeres/robin-heist (private) |

### Hasil tes di mainnet

| Fungsi | Hasil |
|---|---|
| Claim escrow Pons | ✅ Terbukti live ($PADS) |
| Feeding ke top 10 | ✅ Terbukti live |
| Deteksi snitch | ✅ Terbukti live |
| Keeper (ETH ke treasury) | ✅ Lolos simulasi `eth_call`; belum pernah jalan sungguhan |
| Sink: buyback di curve | ✅ Lolos simulasi |
| Sink: burn | ⚠️ Hanya disimulasikan dengan jumlah 0 |
| Buyback lewat Uniswap v4 (setelah graduate) | ❌ Belum teruji |

---

## 4. Server (VPS Hostinger BARU)

- **VPS lama `72.61.210.75` mati** (9 Okt 2026). Domain robinheist.fun juga kena `clientHold` dari registrar. Keduanya **tidak dipakai lagi**.
  - Pepads ($PADS), pepads.fun, dan situs-situs lain yang dulu ada di VPS lama tidak ikut dipindah.
  - Config dan state engine Pepads hilang bersama VPS lama.
- **VPS baru:** `root@76.13.20.64` (Ubuntu 26.04, RAM 8 GB, disk 96 GB). Login pakai SSH key laptop ini.
  - Password root sempat dikirim lewat chat. **Ganti password root di hPanel.**
- **Domain:** **robinheist.cloud** (+ `www`), A record ke `76.13.20.64`. HTTPS via Certbot, auto-renew.
- Terpasang: Node 22, nginx, pm2 (auto-start saat boot), Certbot. Firewall (ufw) tidak aktif.

| | Lokasi |
|---|---|
| Situs | `/var/www/robinheist.cloud/dist` |
| nginx | `/etc/nginx/sites-available/robinheist.cloud` (`/api/` → 127.0.0.1:5031) |
| Engine | `/var/www/robinheist-engine`, pm2 `robinheist-engine`, port 5031 |
| `.env` engine | `PORT`, `SITE_URL`, `ADMIN_SECRET` (dibuat baru, hanya ada di server), `X_CLIENT_ID`, `X_CLIENT_SECRET` (kosong), `X_DEMO` |

- File state engine ada di folder engine: `bot-config.json`, `bot-state.json`, `bot-logs.json`, `bot-bylines.json`.
- **ADMIN_SECRET jangan pernah dibagikan.** Secret ini diperlukan untuk mengubah token, key, atau treasury setelah pertama kali diisi.
- Kalau SSH tiba-tiba ditolak (fail2ban), jalankan `fail2ban-client unban <IP>` dari Browser terminal di hPanel.

## 5. Langkah berikutnya (urut)

1. **Siapkan wallet creator BARU untuk $RBANK** dan isi sedikit ETH untuk gas (misalnya 0,003 ETH).
   - Jangan pakai wallet Pepads (`0x33E1…`). Kalau dipakai, dua engine akan berebut escrow Pons yang sama, dan saldo wallet itu hanya sekitar 0,0005 ETH.
2. **Launch $RBANK di Pons** dari wallet itu. Nama: Robin Heist, ticker: RBANK, gambar: `konten-x/logo-x.png`.
3. **Kembalikan situs ke mode live:** `scripts/site-mode.sh live`.
4. **Segera isi /memex di robinheist.cloud** (CA, private key wallet creator, alamat treasury).
   - /memex menerima isian pertama **tanpa password**. Kalau didahului orang lain, timpa pakai ADMIN_SECRET.
5. Pantau engine sampai claim pertama: `ssh root@76.13.20.64 "pm2 logs robinheist-engine --lines 50"`.
6. **Connect X:**
   - Buat app di developer.x.com: OAuth 2.0, tipe Web App, permission Read, callback `https://robinheist.cloud/api/x/callback`.
   - Isi `X_CLIENT_ID` dan `X_CLIENT_SECRET` di `/var/www/robinheist-engine/.env`, lalu `pm2 restart robinheist-engine --update-env`.
7. **Ganti link X di situs:** `X_URL` di `src/lib/api.ts` masih `https://x.com/pepadsrh` (akun lama). Ganti ke handle X Robin Heist, lalu deploy.
8. Isi `[CA]` di `konten-x/caption.md` dan mulai posting.
9. **Ganti password root VPS** di hPanel, karena sempat dikirim lewat chat.

---

## 6. Perintah penting

```bash
# Development lokal
npm install
npm run dev            # situs di http://localhost:5183  (?demo=1 = mode demo)
npm run bot            # engine lokal di port 5023 (.env lokal)
npm run build          # typecheck + build ke dist/

# Deploy situs + engine sekaligus (catatan: deploy mengembalikan mode situs ke LIVE)
scripts/deploy.sh
# Server kosong baru: scripts/deploy.sh setup   (lalu setelah DNS aktif: scripts/deploy.sh https)

# Mode situs, tanpa build ulang
scripts/site-mode.sh demo   # angka contoh + login X demo (X_DEMO=1)
scripts/site-mode.sh live   # versi asli, siap launch (X_DEMO=0)
# robinheist.cloud/?live selalu menampilkan versi asli; ?demo selalu demo

# Konten X (Remotion)
cd remotion-x && ./render-gazette.sh   # render ulang semuanya ke ../konten-x
```

---

## 7. Struktur kode

```
src/                    Situs (Vite + React 19 + TypeScript, GSAP + ScrollTrigger + Lenis)
  App.tsx               Susunan halaman, strip mode demo, restoreWallet
  components/
    FrontPage.tsx       Hero (satu layar); efek "page turn" hanya di desktop
    Masthead.tsx        Header yang muncul saat scroll (+ Connect + Buy)
    Connect.tsx         Tombol Connect wallet di header
    TheTake.tsx         "How the heist runs": 4 panel + bar 25/50/25
    Notice.tsx          Aturan crew + poster Wanted
    CrewCard.tsx        Cek crew card + Mugshot booth (nickname/mugshot/Connect X)
    TheVault.tsx        Leaderboard (top 10 + tombol "show more")
    Blotter.tsx         Log setiap heist beserta tx
    BackPage.tsx        Iklan baris + "Still holding."
    Mugshot.tsx         Mugshot rakun SVG (bulu/topi/aksesori/latar)
    Face.tsx            Avatar (foto X atau mugshot), centang X, link X
    Memex.tsx           Halaman admin /memex (token, key, treasury)
  lib/
    api.ts              Klien API, saklar mode DEMO, data demo, simpan demo
    wallet.ts           EIP-1193: connect, personal_sign, akun bersama
    alias.ts            Alias geng otomatis dari alamat wallet
  styles/               tokens.css, base.css, gazette.css, memex.css
bot/                    Engine (Node + tsx + ethers v6, dijalankan pm2)
  pads-engine.ts        Indexer, siklus feeding/keeper/sink, HTTP API
  store.ts              Config dan state (parser .env bawaan)
  byline.ts             Nickname + mugshot + X (tanda tangan EIP-191, nonce, cooldown 24 jam)
  xlink.ts              OAuth 2.0 X dengan PKCE (token langsung dicabut), mode demo
  uniswap-v4.ts         Buyback setelah token graduate
remotion-x/             Studio Remotion untuk konten X (src/Gazette.tsx = set Robin Heist)
konten-x/               Output konten X (folder datar, tanpa subfolder)
arsip-konten/           Konten lama (Pepads + Robin versi awal)
scripts/site-mode.sh    Saklar demo/live
```

### API engine
- `GET /api/status`, `/api/pond`, `/api/wallet/:addr`, `/api/rounds`
- `GET /api/byline/nonce?addr=`, lalu `POST /api/byline`: simpan nickname dan mugshot (hanya holder; ditandatangani wallet)
- `POST /api/x/start`, `GET /api/x/callback`, `POST /api/x/unlink`: Connect X
- `POST /api/x/demo/start`, `GET /api/x/demo/result`: login X untuk demo, tidak disimpan (hanya jalan kalau `X_DEMO=1`)
- `POST /api/config` dan `/api/admin/*`: setting dan admin (perlu `x-admin-secret` setelah pertama kali diisi)

---

## 8. Konten X (`konten-x/`)

| File | Isi |
|---|---|
| `logo-x.png` | Robin di segel merah (1080×1080), tetap terbaca di ukuran 48px |
| `banner-x.png` | Halaman depan Gazette (1500×500); kiri bawah dikosongkan untuk foto profil |
| `gif-sell-once.gif` | "Sell once, you're a snitch" lalu stempel "NO CUT. EVER." (3 MB) |
| `video-demo.mp4` | Demo 37 detik, 1080p: intro, cara kerja, tampilan situs asli, aturan, ajakan |
| `post-1-every-trade-is-a-heist.png` | Cara kerja siklus |
| `post-2-sell-once-snitch.png` | Aturan snitch + poster Wanted |
| `post-3-get-your-mugshot.png` | Fitur nickname, mugshot, dan Connect X |
| `caption.md` | Bio + caption untuk semua file di atas (`[CA]` diisi setelah launch) |

---

## 9. Hal yang perlu diingat

- **Jangan mengubah backend, tokenomics, atau fitur** tanpa diminta; perubahan UI dan lore boleh.
- **Konfirmasi dulu sebelum deploy ke produksi.**
- **Mode demo tidak pernah menampilkan CA atau tombol beli palsu.** Ini disengaja, supaya tidak ada yang mengirim dana ke alamat palsu.
- Nickname, mugshot, dan Connect X di mode live **hanya untuk holder $RBANK**. Wallet yang belum holding akan melihat penjelasan di bawah crew card.
- **Wallet bawaan GMGN tidak bisa tanda tangan.** Holder perlu membuka situs di browser MetaMask, Rabby, atau OKX.
- Kalau HP dalam mode gelap, situs tampil versi gelap ("night edition"). Ini disengaja.
- RPC `rpc.mainnet.chain.robinhood.com` pernah sesekali error sertifikat dari Node di laptop. Dari VPS normal.
- Skill frontend yang dipakai: impeccable, design-taste-frontend/taste, gsap-*, remotion-best-practices (daftar lengkap di `~/.claude/skills`).
