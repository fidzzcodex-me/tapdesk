# tapdesk

Panel developer mengambang yang kamu tempel sendiri ke halaman yang sedang
diuji. Mirip Eruda: console, network, dan info dasar — tanpa buka F12.

Bukan proxy device. Bukan crack. Bukan aktivator lisensi.

## Struktur

```
app/
  page.tsx           landing
  gate/page.tsx      gate ringan (tebak 4 digit) sebelum masuk dashboard
  dashboard/page.tsx sessionId, snippet, bookmarklet, toggle sync, preview event
  demo/page.tsx      halaman target contoh — panel sudah terpasang di sini
  api/session/       POST → buat sesi baru
  api/tap/[id]/      GET/POST/PATCH/DELETE → event & status sync
public/
  tapdesk.js         panel in-page, vanilla JS, ini yang di-inject ke halaman lain
lib/store.ts         penyimpanan in-memory (ganti ke Redis/DB untuk produksi)
```

## Jalankan

```bash
npm install
npm run dev
```

Buka:

- `http://localhost:3000` — landing
- `http://localhost:3000/gate` — gate ringan
- `http://localhost:3000/dashboard` — bikin sesi, ambil snippet
- `http://localhost:3000/demo` — halaman target contoh, panel langsung aktif

## Cara pasang di halaman yang diuji

1. Buka `/dashboard`, salin snippet-nya:

   ```html
   <script src="http://localhost:3000/tapdesk.js" data-session="SESSION_ID" data-sync="true"></script>
   ```

2. Tempel sebelum `</body>` di halaman yang mau kamu uji.
3. Tombol biru bulat muncul di pojok kanan bawah. Bisa digeser, klik untuk
   buka panel.

Atau pakai bookmarklet dari dashboard: tarik ke bilah bookmark, klik saat
membuka halaman yang mau diuji.

## Cara kerja panel (`public/tapdesk.js`)

- Dipasang lewat Shadow DOM — CSS panel tidak bocor ke halaman host, dan
  sebaliknya.
- Menimpa `window.fetch`, `XMLHttpRequest`, dan `console.log/warn/error`
  untuk menyalin data (method, url, status, durasi, header, body, preview
  response). Request asli tetap jalan seperti biasa; panel cuma membaca
  salinannya lewat `clone()`.
- Tab **Network** menampilkan daftar request, klik satu baris untuk lihat
  detail header/body/response — ada tombol "copy all" di kepala detail
  untuk menyalin semuanya sekaligus.
- Tab **Console** menampilkan log/warn/error apa adanya.
- Tab **Source** menampilkan daftar `<script>` dan stylesheet yang dimuat
  halaman host.
- Tab **Resource** menampilkan isi Local Storage, Session Storage, dan
  Cookies halaman (read-only).
- Tab **System** menampilkan info perangkat (URL, UA, viewport, bahasa,
  koneksi, memori JS), status sesi, kontrol panel (tema, posisi tombol,
  bersihkan log), dan tombol **Matikan tapdesk** — ini mengembalikan
  `fetch`/`XHR`/`console` ke aslinya dan membongkar semua elemen panel dari
  halaman (minta konfirmasi dulu).

Catatan bug yang sudah diperbaiki: sebelumnya `sync()` memanggil `fetch`
biasa, padahal `fetch` sudah ditimpa tapdesk sendiri — jadi tiap laporan ke
dashboard ikut tercatat sebagai request baru, lalu dilaporkan lagi, tanpa
henti ("network spam"). Sekarang `sync()` selalu lewat `fetch` asli, dan
panggilan ke endpoint tapdesk sendiri (`/api/tap/...`) tidak pernah dicatat
sebagai entri Network.
- Kalau `data-sync="true"`, tiap event juga dikirim ke
  `POST /api/tap/:sessionId` supaya kelihatan di dashboard. Toggle "Kirim
  salinan ke dashboard" di dashboard mematikan/menghidupkan ini kapan saja
  lewat `DELETE`/`PATCH` ke endpoint yang sama, tanpa perlu pasang ulang
  snippet.

## Batas

Hanya menangkap fetch/XHR di halaman tempat script dipasang. Tidak melihat
trafik jaringan perangkat secara keseluruhan.

## Catatan produksi

`lib/store.ts` pakai in-memory Map — cukup untuk dev/demo satu proses, hilang
kalau server restart. Untuk pemakaian nyata, ganti dengan Redis/DB tapi
struktur fungsinya (`createSession`, `pushEvent`, dst.) sudah dipisah supaya
gampang diganti.
