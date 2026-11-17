---
name: Contract Management BBT
description: Website internal Badan Bank Tanah untuk mencatat dan memantau kontrak (PKS), dengan arah visual "Kavling".
colors:
  navy-tua: "#13254F"
  navy: "#2B4C9B"
  emas: "#F2B829"
  tanah: "#E07B2C"
  teks: "#1A2142"
  teks-lembut: "#59627D"
  latar: "#FAFAFC"
  panel: "#FFFFFF"
  sorot: "#EEF1F8"
  garis: "#E4E7EF"
  garis-lembut: "#ECEEF3"
  garis-input: "#7D88A3"
  segera-teks: "#7A5700"
  segera-latar: "#FBF0D3"
  lewat-teks: "#9E4113"
  lewat-latar: "#FCE6DA"
  hapus: "#D93645"
typography:
  display:
    fontFamily: "Public Sans, system-ui, sans-serif"
    fontSize: "64px"
    fontWeight: 800
    lineHeight: 1.02
    letterSpacing: "-0.035em"
  display-penekanan:
    fontFamily: "Source Serif 4, Georgia, serif"
    fontSize: "1.08em"
    fontWeight: 400
    letterSpacing: "-0.01em"
  headline:
    fontFamily: "Public Sans, system-ui, sans-serif"
    fontSize: "28px"
    fontWeight: 800
    lineHeight: 1.15
    letterSpacing: "-0.03em"
  title:
    fontFamily: "Public Sans, system-ui, sans-serif"
    fontSize: "22px"
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: "-0.02em"
  body:
    fontFamily: "Public Sans, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: normal
    fontFeature: "tnum"
  label:
    fontFamily: "Public Sans, system-ui, sans-serif"
    fontSize: "13px"
    fontWeight: 600
    lineHeight: 1.3
  display-masuk:
    fontFamily: "Public Sans, system-ui, sans-serif"
    fontSize: "40px"
    fontWeight: 800
    lineHeight: 1.05
    letterSpacing: "-0.035em"
  display-masuk-hp:
    fontFamily: "Public Sans, system-ui, sans-serif"
    fontSize: "32px"
    fontWeight: 800
  display-beranda:
    fontFamily: "Public Sans, system-ui, sans-serif"
    fontSize: "60px"
    fontWeight: 800
  display-hp:
    fontFamily: "Public Sans, system-ui, sans-serif"
    fontSize: "36px"
    fontWeight: 800
  headline-desktop:
    fontFamily: "Public Sans, system-ui, sans-serif"
    fontSize: "30px"
    fontWeight: 800
  headline-hp:
    fontFamily: "Public Sans, system-ui, sans-serif"
    fontSize: "26px"
    fontWeight: 800
  title-panel:
    fontFamily: "Public Sans, system-ui, sans-serif"
    fontSize: "20px"
    fontWeight: 700
  lead:
    fontFamily: "Public Sans, system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 400
  title-baris:
    fontFamily: "Public Sans, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 600
  caption:
    fontFamily: "Public Sans, system-ui, sans-serif"
    fontSize: "12px"
    fontWeight: 400
  mini:
    fontFamily: "Public Sans, system-ui, sans-serif"
    fontSize: "11px"
    fontWeight: 700
  angka-kartu:
    fontFamily: "Public Sans, system-ui, sans-serif"
    fontSize: "44px"
    fontWeight: 800
    letterSpacing: "-0.03em"
  merek-nav:
    fontFamily: "Public Sans, system-ui, sans-serif"
    fontSize: "17px"
    fontWeight: 800
    letterSpacing: "-0.02em"
rounded:
  mozaik: "10px"
  kalender: "12px"
  isian: "12px"
  panel-hp: "20px"
  panel: "24px"
  pil: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "48px"
  xxl: "64px"
components:
  button-primary:
    backgroundColor: "{colors.navy-tua}"
    textColor: "{colors.panel}"
    rounded: "{rounded.pil}"
    padding: "0 22px"
    height: "48px"
  button-primary-hover:
    backgroundColor: "{colors.navy}"
    textColor: "{colors.panel}"
  button-secondary:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.navy-tua}"
    rounded: "{rounded.pil}"
    padding: "0 18px"
    height: "44px"
  search-pill:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.teks}"
    rounded: "{rounded.pil}"
    padding: "6px 6px 6px 22px"
  search-pill-button:
    backgroundColor: "{colors.navy}"
    textColor: "{colors.panel}"
    rounded: "{rounded.pil}"
    height: "48px"
  input:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.teks}"
    rounded: "{rounded.isian}"
    padding: "0 14px"
    height: "44px"
  nav-pill:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.teks}"
    rounded: "{rounded.panel-hp}"
    padding: "10px 10px 10px 22px"
  nav-item-active:
    backgroundColor: "{colors.sorot}"
    textColor: "{colors.navy-tua}"
    rounded: "{rounded.pil}"
    padding: "0 14px"
    height: "44px"
  status-chip:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.teks}"
    rounded: "{rounded.pil}"
    padding: "0 16px"
    height: "40px"
  panel:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.teks}"
    rounded: "{rounded.panel}"
    padding: "10px 28px 14px"
  calendar-box:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.navy-tua}"
    rounded: "{rounded.kalender}"
    width: "54px"
---

# Design System: Contract Management BBT

## Overview

**Creative North Star: "Kavling"**

Badan Bank Tanah mengelola bidang-bidang tanah. Website ini meminjam bentuk itu: di bagian atas setiap halaman,
kotak-kotak warna BBT tersusun seperti peta kavling, dari navy di kiri ke emas dan tanah di kanan, lalu memudar ke putih
(sekitar 60% tinggi layar berwarna, 40% bawah polos). Di depannya navigasi pil putih yang ikut turun saat di-scroll.
Logo BBT duduk di situ dengan warna aslinya, tanpa alas tambahan.

Gayanya mengikuti referensi yang dipilih Hisyam: lapang, terang, membulat, dengan judul besar di tengah dan satu kata serif miring.
Tapi ini alat kerja harian tim pengadaan, bukan halaman pemasaran. Jadi judul besar rata tengah hanya di Beranda dan Masuk.
Halaman kerja (Kontrak, Critical point, Rekap, Ubah data, Detail, Tambah/Ubah, Admin) memakai judul rata kiri yang lebih kecil
dan panel bergaris yang padat. Kontrak dan critical point dikelompokkan menurut tahap pengingat (Sudah lewat, H-1, H-2, H-3 bulan). Angka (rupiah, sisa hari, tanggal) tetap menjadi pusat perhatian,
dan setiap tanggal akhir tampil sebagai kotak kalender.

**Key Characteristics:**
- Navigasi pil putih yang ikut turun saat di-scroll (sudut 22px, bayangan lembut), logo BBT 40px (26px di HP)
- Mozaik kavling warna BBT di semua halaman: dua baris atas berwarna, baris berikutnya sangat pudar (60:40)
- Judul Beranda di tengah: sans 800 rapat + satu kata Source Serif 4 miring
- Bentuk pil untuk tombol, chip status, kotak cari; panel bersudut 24px untuk isi
- Kotak kalender sebagai ciri khas tanggal; sisa waktu dalam pil berwarna status

## Colors

Latar hampir putih dengan navy sebagai suara utama. Emas dan tanah hanya muncul di mozaik, pita kalender, dan tanda kecil.

### Primary
- **Navy Tua** (navy-tua): tombol utama berbentuk pil, judul, menu aktif, ujung kiri mozaik.
- **Navy** (navy): tautan, tombol Cari di kotak cari, hover tombol utama.

### Secondary
- **Emas** (emas): pita kalender "Segera habis", bulatan jumlah pengingat, bagian tengah-kanan mozaik. Tidak pernah sebagai warna teks di atas putih.

### Tertiary
- **Tanah** (tanah): pita kalender "Sudah lewat", ujung kanan mozaik. Teks di atasnya selalu navy tua.

### Neutral
- **Latar** (latar): latar halaman, tempat mozaik memudar.
- **Panel** (panel): navigasi pil, kotak cari, panel agenda, form.
- **Sorot** (sorot): latar menu aktif dan avatar.
- **Teks** (teks), **Teks Lembut** (teks-lembut): isi dan keterangan. Keduanya lolos 4,5:1 di putih, latar, dan sorot.
- **Garis** (garis), **Garis Lembut** (garis-lembut): tepi panel dan pembatas baris.
- **Garis Input** (garis-input): tepi kotak isian, minimal 3:1.

### Named Rules
**The Mozaik 60:40 Rule.** Mozaik kavling ada di semua halaman (keputusan Hisyam 17 Nov 2026), selalu `aria-hidden`.
Hanya dua baris teratas yang berwarna (di belakang navigasi). Baris di belakang judul dan teks dibuat sangat pudar (88–96% putih)
supaya kontras teks tetap lolos.

**The Status Selalu Bertulisan Rule.** Warna status selalu disertai teks ("Lewat 10 hari", "18 hari lagi"). Emas `segera` tidak boleh membawa informasi sendirian.

## Typography

**Display Font:** Public Sans 800 (fallback system-ui)
**Body Font:** Public Sans 400–700
**Penekanan:** Source Serif 4 miring 400 (fallback Georgia)

**Character:** Sans yang tebal dan rapat memberi kesan tegas dan modern. Satu kata serif miring memberi kehangatan, seperti tanda tangan di dokumen resmi.

### Hierarchy
- **Display** (800, 64px desktop / 38px HP, 1.02, -0.035em): judul Beranda dan Masuk, rata tengah.
- **Headline** (800, 28px, -0.03em): judul halaman kerja (Kontrak, Detail, Tambah), rata kiri.
- **Title** (700, 22px, -0.02em): judul panel ("Agenda kontrak", "Critical point").
- **Body** (400, 14px, normal): isi, nilai, keterangan. Angka tabular.
- **Label** (600, 13px): label kolom dan keterangan data. Huruf biasa.
- **Skala lengkap yang dipakai:** 11 (pita kalender, angka di bulatan), 12 (catatan kecil), 13 (label), 14 (isi), 15 (nama kontrak, isian),
  16 (kalimat pembuka, angka rekap), 20 (judul panel dan dialog), 22 (judul panel Beranda), 26/30 (judul halaman HP/desktop),
  32/40 (judul Masuk), 36/60 (judul Beranda). Ukuran lain tidak dipakai.

### Named Rules
**The Satu Kata Miring Rule.** Paling banyak satu kata serif miring per judul. Hanya di judul Beranda, Masuk, dan judul panel utama. Tidak pernah di teks isi, tombol, atau tabel.

**The Kalimat Biasa Rule.** Tidak ada label huruf kapital semua dan tidak ada label kecil di atas judul.

**The Piksel Rule.** Ukuran huruf ditulis dalam piksel (`text-[13px]`). Jangan pakai `text-sm` dan sejenisnya.

## Layout

- Navigasi hanya di atas, **tanpa sidebar**. Navigasi pil menempel di atas saat di-scroll (sticky), selebar wadah konten.
  Isinya: logo + "Contract Management", menu (Beranda, Kontrak, Critical point, Rekap, Ubah data, Admin khusus admin),
  lonceng, avatar, dan tombol pil "Tambah kontrak" (tidak tampil di halaman form).
- Wadah konten maksimal 1280px supaya semua menu muat satu baris mulai 1280px. Di bawah itu menu pindah ke baris kedua di dalam pil.
- **Mozaik:** di semua halaman, setinggi 60% layar (45% di HP), di belakang navigasi dan judul.
- **Beranda:** pembuka rata tengah (tanggal, judul display, satu kalimat ringkasan, kotak cari pil, rekap status berupa pil),
  lalu "Agenda kontrak" berupa kartu (3 kolom desktop), lalu critical point terdekat dalam garis masa per bulan dengan penanda "Hari ini".
- **Kontrak dan Critical point:** kotak cari, pil lompat cepat, lalu tabel terpisah per tahap dengan judul dan satu kalimat penjelasan.
- **Rekap:** tabel semua kontrak; baris dibuka di tempat untuk rincian dan PDF. **Ubah data:** daftar kontrak di kiri, form di kanan.
- **HP (390px):** menu jadi grid 3 kolom di dalam pil. Tombol "Tambah kontrak" pindah ke dalam halaman (Beranda, Kontrak).
  Baris agenda menjadi kalender di kiri, info bertumpuk di kanan. Area sentuh minimal 44px. Tanpa scroll ke samping.

## Elevation & Depth

Panel datar dengan garis tepi 1px. Bayangan lembut yang bergeser ke bawah (`shadow-pil`: 0 12px 32px -18px navy 35%) hanya untuk dua benda yang "melayang":
navigasi pil dan kotak cari. Menu akun, panel notifikasi, dialog, dan toast memakai `shadow-menu` / `shadow-toast`.

### Named Rules
**The Satu Kedalaman Rule.** Panel memakai garis tepi ATAU bayangan, tidak keduanya. Hanya benda yang melayang (navigasi pil, kotak cari, menu) yang boleh memakai keduanya.

## Shapes

Bentuknya lembut dan membulat. Kontrol berbentuk pil: tombol, chip status, kotak cari, item menu. Panel isi bersudut 24px (20px di HP).
Kotak kalender dan kotak mozaik bersudut 10–12px, supaya terbaca sebagai "kotak" dan bukan pil. Kotak isian form bersudut 12px,
karena textarea yang tinggi akan aneh kalau berbentuk pil.

## Components

### Buttons
- **Shape:** pil.
- **Primary:** navy tua, teks putih 600, tinggi 48px. Satu per layar ("Tambah kontrak", "Simpan kontrak").
- **Hover / Focus:** hover menjadi navy (150ms). Fokus keyboard memakai garis navy 2px dengan jarak 2px (`:focus-visible` global).
- **Secondary:** pil putih dengan garis `garis-input`, teks navy tua, tinggi 44px.
- **Hapus:** merah `hapus`, hanya di dialog konfirmasi hapus.

### Chips (status)
- **Style:** pil putih bergaris, tanda kotak kecil warna status, angka tebal lalu label ("2 Sudah lewat").
- **State:** berupa tautan ke daftar kontrak yang sudah difilter. Saat aktif (di halaman Kontrak): latar `sorot`, teks navy tua.

### Cards / Containers (panel)
- **Corner Style:** 24px (20px di HP).
- **Background:** putih.
- **Shadow Strategy:** tanpa bayangan.
- **Border:** 1px `garis`.
- **Aturan:** satu panel per kelompok isi (agenda, form, critical point). Isi panel dipisah garis, bukan kartu kecil. Tidak ada panel di dalam panel.

### Inputs / Fields
- **Style:** putih, garis 1px `garis-input`, sudut 12px, tinggi 44px, label terlihat di atas.
- **Kotak cari:** pil putih bergaris dengan tombol pil "Cari" navy di dalamnya.
- **Focus:** garis fokus navy 2px. **Error:** garis merah 2px dan pesan per kolom (`aria-describedby`).

### Navigation
- **Navigasi pil putih** yang menempel saat di-scroll, sudut 22px (20px di HP), bayangan `shadow-pil`.
- Judul "Contract Management" 17px tebal (13px di HP). Menu: teks 500. Menu aktif: pil `sorot`, teks navy tua 700.
- Jumlah di Kontrak (kontrak perlu perhatian) dan Critical point (butir yang sudah masuk tahap pengingat): bulatan emas dengan angka navy.
- **HP:** logo 26px, menu dalam grid 3 kolom, tombol Tambah kontrak keluar dari navigasi.

### Mozaik Kavling (Signature Component)
Grid kotak bersudut 10px (20 kolom di desktop, 8 di HP, 8 baris, setinggi 60% layar). Dua baris atas berwarna, sisanya sangat pudar. Warna berpindah dari navy tua, navy, biru muda, emas, ke tanah
dari kiri ke kanan, dicampur putih makin ke bawah, dan beberapa kotak dibiarkan kosong. Polanya tetap, bukan acak.
Dipudarkan ke latar dengan mask. Warna diambil dari token (`color-mix` dengan `var(--color-*)`). Dekoratif (`aria-hidden`).

### Kartu Kontrak (Signature Component)
Kartu Agenda di Beranda: kotak kalender, angka sisa hari 44px berwarna status (pusat perhatian), nama dan penyedia,
garis masa kontrak berwarna status, nomor PKS, dan nilai. Seluruh kartu adalah tautan ke Detail.

### Tabel Tahap (Signature Component)
Dipakai halaman Kontrak dan Critical point: judul tahap (22px), satu kalimat penjelasan pengingat, lalu panel bergaris berisi baris
(kalender, nama, nomor PKS, nilai, pil sisa waktu, panah). Tahap dihitung dari bulan kalender: Sudah lewat, H-1, H-2, H-3 bulan, lalu Berjalan.

### Kotak Kalender (Signature Component)
Kalender meja kecil 54px bersudut 12px: pita bulan di atas ("Nov", huruf biasa), tanggal besar navy tua di bawah.
Pita emas untuk "Segera habis", tanah untuk "Sudah lewat". Teks pita selalu navy tua.

## Do's and Don'ts

### Do:
- **Do** letakkan logo BBT langsung di navigasi pil putih, dengan `alt="Badan Bank Tanah"`.
- **Do** batasi judul display rata tengah hanya di Beranda dan Masuk. Mozaik boleh di semua halaman, dengan baris di belakang teks sangat pudar.
- **Do** buka setiap halaman dengan judul berupa kalimat tugas atau nama objek, bukan sapaan.
- **Do** tampilkan setiap tanggal akhir dengan kotak kalender, dan sisa waktu dalam pil berwarna status.
- **Do** pakai garis untuk memisah baris di dalam panel.
- **Do** pakai `motion-safe:` dan `motion-reduce:transition-none` untuk setiap gerak.

### Don't:
- **Don't** pakai lingkaran blur, pola titik, lingkaran garis konsentris, atau kaca buram (backdrop blur).
- **Don't** pakai mozaik ungu/pink, atau taruh teks di atas baris mozaik yang pekat (dua baris teratas).
- **Don't** pakai lebih dari satu kata serif miring per judul.
- **Don't** pakai kotak ikon bergradasi atau kotak ikon berwarna di depan setiap judul.
- **Don't** pakai tombol bergradasi atau bayangan berwarna yang bercahaya.
- **Don't** pakai emoji, termasuk di sapaan.
- **Don't** pakai label huruf kapital semua atau label kecil di atas judul.
- **Don't** sambung metadata dengan titik tengah ("A · B · C"). Pakai kolom, baris baru, atau kalimat.
- **Don't** taruh kartu di dalam panel, atau panel di dalam panel.
- **Don't** pakai animasi memantul.
- **Don't** taruh logo di alas putih terpisah di atas latar navy. Jangan beri filter, warnai ulang, ubah opacity, atau potong logo.
- **Don't** pakai garis tepi kiri berwarna lebih dari 1px pada kartu atau butir daftar.
- **Don't** tulis kode hex di komponen. Pakai token dari `src/index.css`.
