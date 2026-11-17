# Audit UI: Contract Management BBT (versi website, arah "Kavling")

Tanggal audit: 17 November 2026
Menggantikan audit versi HP (16 November 2026).
Cakupan: Masuk, Beranda, Kontrak (termasuk hasil cari kosong), Detail (`/kontrak/5`), Ubah/Tambah, Pengingat, Admin,
panel notifikasi, menu akun, dan dialog konfirmasi.

Cara audit:
- Detector impeccable: `impeccable detect --json src`.
- Rasio kontras WCAG dihitung dari token di `src/index.css` (tabel lengkap di `design-system/contract-management-bbt/MASTER.md`).
- Playwright (Chromium) di `localhost:5199` pada 390×844 dan 1440×900, masuk sebagai admin contoh. Yang diperiksa:
  - lebar halaman (scroll ke samping)
  - ukuran semua elemen yang bisa diklik
  - 8 kali tombol Tab per halaman untuk memeriksa tanda fokus
- Pedoman Web Interface Guidelines (Vercel), diperiksa lewat pencarian pola di `src/` dan `index.html`.

Skill: impeccable (critique, audit, harden), ui-ux-pro-max (kontras dan target sentuh), web-design-guidelines.

**Belum dicoba:**
- HP sungguhan dan Safari/iOS
- Pembaca layar (VoiceOver/TalkBack)
- Zoom teks 200%

---

## Skor kesehatan

| # | Dimensi | Skor | Catatan |
|---|---------|------|---------|
| 1 | Aksesibilitas | 4/4 | Semua pasangan warna lolos. Fokus terlihat di semua halaman. Galat form per kolom dengan `aria-describedby` |
| 2 | Performa | 4/4 | Hiasan blur dihapus. Font memakai `preconnect`. Logo punya `width`/`height` |
| 3 | Tema / token | 4/4 | Tidak ada kode hex di komponen. Token lama (header navy, gradasi) dihapus |
| 4 | Responsif / sentuh | 4/4 | Tanpa scroll ke samping di 390 dan 1440. Semua kontrol minimal 44px |
| 5 | Integritas implementasi | 4/4 | Detector impeccable: **0 temuan** |
| **Total** | | **20/20** | Audit versi HP: 14/20. Critique awal Fase 0: 17/20 |

---

## Temuan yang masih terbuka, urut dari yang paling penting

### [P2] 1. Form tidak memperingatkan perubahan yang belum disimpan
- **Lokasi:** `src/pages/FormKontrak.tsx`
- **Masalah:** Kalau pengguna menekan tombol kembali browser atau menutup tab saat form terisi, isian hilang tanpa peringatan.
  Tombol "Batal" di form tidak termasuk masalah ini.
- **Saran:** Tambahkan peringatan `beforeunload` saat form sudah diubah. Untuk navigasi di dalam aplikasi, pakai `useBlocker` dari react-router.
  Fungsinya berubah, jadi minta persetujuan dulu.

### [P2] 2. Angka di lonceng dan di menu Pengingat berbeda
- **Lokasi:** `src/components/PanelNotifikasi.tsx`, `src/components/NavAtas.tsx`
- **Masalah:**
  - Lonceng menampilkan "9+" (notifikasi belum dibaca).
  - Menu Pengingat menampilkan "6" (kontrak yang perlu perhatian).
  - Keduanya benar, tapi pengguna bisa mengira angkanya salah.
- **Saran:** Ubah tampilan bulatan lonceng menjadi titik tanpa angka, atau tulis "9 baru" di panel.

### [P3] 3. Teks 11px di pita kalender dan bulatan angka
- **Lokasi:** `src/components/KotakKalender.tsx`, `src/components/NavAtas.tsx`, `src/components/PanelNotifikasi.tsx`
- **Catatan:** Kontrasnya lolos (navy di emas 8,30:1, navy di tanah 5,01:1). Ukurannya sengaja kecil sesuai bentuk kalender meja.
  Tetap uji zoom teks 200% di HP (WCAG 1.4.4).

---

## Pembaruan 17 November 2026 (sore): halaman baru dan latar 60:40

Diperiksa ulang dengan cara yang sama (Playwright 390 dan 1440, detector impeccable, hitung kontras):
- Halaman baru **Kontrak** (per tahap pengingat), **Critical point**, **Rekap**, dan **Ubah data**: tanpa scroll ke samping
  di 390 dan 1440, tidak ada fokus keyboard yang hilang (8 kali Tab per halaman), tidak ada galat di konsol.
- Navbar muat satu baris mulai 1280px. Di 390px menu jadi grid 3 kolom. Di 360px avatar sedikit melewati tepi pil
  (di bawah patokan 390px proyek, belum diperbaiki).
- **Kontras di atas mozaik:** baris mozaik di belakang teks dibuat minimal 88% putih. Teks abu (`teks-lembut`) di atasnya
  minimal 4,80:1 (kotak navy), judul minimal 11,86:1. Nilai awal 82% sempat hanya sekitar 4,3:1 dan sudah diperbaiki.
- **Rekap:** baris dibuka dengan `<button aria-expanded aria-controls>`, tombol Unduh punya nama lengkap untuk pembaca layar.
- **Ubah data:** memakai form yang sama dengan Ubah kontrak (validasi per kolom, konfirmasi, riwayat). Diuji: simpan
  dari `/ubah-data/5` tetap di halaman yang sama dengan toast "Perubahan kontrak tersimpan.".
- Alamat lama `/pengingat` diarahkan ke `/kontrak`. Kotak cari Beranda membuka `/kontrak?q=`.
- Detector impeccable: 0 temuan (skala huruf 44px dan 17px dicatat di DESIGN.md).

## Yang sudah diperbaiki dalam perombakan ini

**Visual ("ciri AI" dari critique Fase 0):**
- Dibuang dari header dan halaman Masuk: lingkaran blur, lingkaran garis konsentris, dan pola titik.
- Logo BBT tidak lagi di pil putih kecil berbayangan. Sekarang logo duduk di navigasi pil putih (44px), dengan `alt="Badan Bank Tanah"`.
- Dibuang: kotak ikon bergradasi, lingkaran hiasan di pojok kartu, dan animasi memantul pada kartu ringkasan.
  Ringkasan sekarang berupa pil status yang bisa diklik.
- Sapaan "Halo, … 👋" diganti judul tugas: "6 kontrak perlu *ditindaklanjuti*".
- Halaman Masuk tidak lagi mirip landing page. Label emas huruf kapital dan daftar centang fitur dibuang.
- Tombol bergradasi dan tombol emas bercahaya diganti tombol pil navy datar.
- Kotak ikon di judul setiap bagian Detail dihapus.
- Kartu di dalam kartu (critical point, jadwal, dokumen, form) diganti baris bergaris.
- Garis tepi kiri berwarna pada critical point dihapus.
- Label huruf kapital dihapus di Masuk, kelompok Pengingat, dan pita kalender.
- Pemisah titik tengah dihapus di sekitar 15 tempat. Penggantinya kolom, baris baru, atau koma.
- Keadaan kosong tidak lagi memakai ikon di dalam lingkaran.

**Teknis:**
- Tautan emas di header yang hanya 4,47:1 sudah tidak ada (header navy dihapus).
- `teks-lembut` sekarang 5,81:1 di latar (sebelumnya 4,70:1 di latar abu).
- `garis-input` sekarang 3,40:1 di latar (sebelumnya 2,96:1).
- Tanda status `selesai` sekarang 3,20:1 (sebelumnya 2,56:1).
- Tautan logo di HP sekarang setinggi 44px (sebelumnya 34px).
- Kotak unggah PDF: garis putus-putus memakai `garis-input` (3,40:1, sebelumnya `aksen` 2,39:1), dan warnanya tanpa opacity.
- Detector impeccable menandai 38 ukuran huruf di luar skala. Ukuran diseragamkan dan skalanya dicatat di `DESIGN.md`. Hasilnya 0 temuan.
- Web Interface Guidelines:
  - `theme-color` disamakan dengan latar terang.
  - Logo punya `width`/`height`, dan logo di halaman Masuk memakai `fetchPriority="high"`.
  - `spellCheck={false}` pada isian email.
  - `touch-action: manipulation` dan `-webkit-tap-highlight-color` diatur.
- Temuan audit versi HP 1–10 sudah selesai sebelum perombakan dan tetap terjaga. Contohnya: fokus kotak cari, galat per kolom, menu dropdown sebagai disclosure, dan `aria-controls` tab.

## Yang sudah baik (pertahankan)

- Semua elemen yang bisa diklik memakai `<button>`, `<a>`, atau `<Link>`. Tombol ikon punya `aria-label`.
- Ada satu aturan `:focus-visible` global. Kotak cari memakai `focus-within` pada pembungkusnya.
- Dialog memakai `<dialog>` + `showModal()`: fokus terkunci di dalam dialog dan Escape berarti Batal.
- Mozaik kavling selalu `aria-hidden`. Animasinya hanya sekali, dengan `motion-safe:`.
- Status selalu ditulis dengan teks, tidak hanya warna.
- Pencarian dan filter Kontrak tersimpan di alamat (`?q=`, `?status=`, `?urut=`). Kotak cari Beranda membuka alamat itu.
