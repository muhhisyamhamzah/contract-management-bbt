# Design System Master File: Contract Management BBT

> **LOGIKA:** Saat membangun satu halaman, cek dulu `design-system/contract-management-bbt/pages/[nama-halaman].md`.
> Kalau file itu ada, aturannya **mengalahkan** file ini. Kalau tidak ada, ikuti file ini.
> Rincian visual lengkap (komponen, larangan "ciri AI") ada di `DESIGN.md` di akar proyek.

---

**Proyek:** Contract Management BBT (website internal Badan Bank Tanah)
**Dibuat:** 17 November 2026 dengan `ui-ux-pro-max --design-system --persist`
(query: "government contract monitoring internal web")
**Kategori:** Government/Public Service, aplikasi kerja internal (bukan landing page)
**Arah terpilih:** Arah 4 "Kavling" (dipilih Hisyam, 17 Nov 2026, berdasarkan referensi gaya dari Hisyam).
Mockup: `mockup/arah-4-kavling.html`. Arah 1–3 (`mockup/arah-1..3-*.html`) hanya pembanding.
Judul besar di tengah HANYA di Beranda dan Masuk. Mozaik di semua halaman dengan pola 60:40 (keputusan 17 Nov 2026, lihat di bawah).

---

## Yang diambil dan yang diabaikan dari hasil skill

| Hasil skill | Keputusan | Alasan |
|---|---|---|
| Gaya "Accessible & Ethical": kontras tinggi, fokus jelas, sedikit gerak, target 44px | **Dipakai** | Cocok untuk pegawai 30–55 tahun yang memakai laptop kantor |
| Palet slate + biru (`#0F172A`, `#0369A1`, ...) | **Diganti** | Warna brand navy-emas BBT menang (aturan `~/.claude/CLAUDE.md`) |
| Font Atkinson Hyperlegible | **Diganti** | Diganti Public Sans (mudah dibaca, dibuat untuk layanan pemerintah) + Source Serif 4 miring untuk satu kata penekanan sesuai referensi |
| Pattern "Minimal Single Column" (hero, CTA tengah) | **Diabaikan** | Hanya untuk landing page. Aplikasi ini memakai navigasi atas + konten |
| Saran bayangan bertingkat dan kartu yang terangkat saat hover | **Diabaikan** | Panel memakai garis tepi. Bayangan lembut hanya untuk navigasi pil dan kotak cari yang melayang |
| Larangan: hiasan berlebihan, kontras rendah, efek gerak, gradasi ungu/pink | **Dipakai, dengan satu pengecualian** | Mozaik kavling adalah hiasan yang disengaja (pilihan Hisyam), di semua halaman dengan pola 60:40, warna BBT, tanpa blur |

---

## Palet warna (token di `src/index.css`)

| Peran | Token | Hex |
|---|---|---|
| Navy tua: tombol utama, judul, ujung kiri mozaik | `galaxy-900`, `judul`, `aksi-tua` | `#13254F` |
| Navy: tautan, tombol Cari, hover tombol | `aksi`, `galaxy-700` | `#2B4C9B` |
| Emas: pita kalender "segera", jumlah pengingat, bagian mozaik | `logo-emas` | `#F2B829` |
| Tanah: pita kalender "lewat", ujung kanan mozaik | `logo-tanah` | `#E07B2C` |
| Teks utama | `teks` | `#1A2142` |
| Teks kedua | `teks-lembut` | `#59627D` |
| Latar halaman | `latar` | `#FAFAFC` |
| Panel, navigasi pil, kotak cari | `white` | `#FFFFFF` |
| Sorotan menu aktif | `lembut` | `#EEF1F8` |
| Garis pembatas dekoratif | `garis` | `#E4E7EF` |
| Pembatas baris | `garis-lembut` | `#ECEEF3` |
| Tepi kotak isian | `garis-input` | `#7D88A3` |
| Status | `berjalan`, `segera`, `lewat`, `selesai` (+ `-latar`, `-teks`) | lihat `src/index.css` |
| Hapus dan galat | `hapus`, `hapus-latar`, `hapus-teks` | `#D93645`, `#FBE6E8`, `#9F2430` |

### Pemeriksaan kontras (WCAG 2.1, dihitung 17 Nov 2026)

| Pasangan | Rasio | Syarat | Hasil |
|---|---|---|---|
| `teks` di putih / di `latar` | 15,67 / 15,03 | 4,5 | Lolos |
| `teks-lembut` **baru** `#59627D` di putih / `latar` / `lembut` | 6,06 / 5,81 / 5,36 | 4,5 | Lolos |
| `judul` / `galaxy-900` di putih | 14,94 | 4,5 | Lolos |
| Putih di tombol utama `galaxy-900` | 14,94 | 4,5 | Lolos |
| `aksi` (tautan) di putih / `latar` | 8,05 / 7,72 | 4,5 | Lolos |
| Putih di tombol Cari (`aksi`) | 8,05 | 4,5 | Lolos |
| `galaxy-900` di bulatan jumlah emas | 8,30 | 4,5 | Lolos |
| Teks pil sisa waktu: `segera-teks` di `segera-latar` / `lewat-teks` di `lewat-latar` | 5,80 / 5,43 | 4,5 | Lolos |
| `galaxy-900` di `lembut` (menu aktif) | 13,22 | 4,5 | Lolos |
| `garis-input` **baru** `#7D88A3` di putih / `latar` | 3,55 / 3,40 | 3,0 | Lolos |
| `galaxy-900` di pita emas (`logo-emas`) | 8,30 | 4,5 | Lolos |
| `galaxy-900` di pita lewat (`logo-tanah`) | 5,01 | 4,5 | Lolos |
| `segera-teks` di putih / `latar` | 6,58 / 6,09 | 4,5 | Lolos |
| `lewat-teks` di putih / `latar` | 6,52 / 6,04 | 4,5 | Lolos |
| `berjalan-teks` / `selesai-teks` di putih | 5,87 / 7,50 | 4,5 | Lolos |
| `hapus-teks` di `hapus-latar`; putih di `hapus` | 6,35; 4,60 | 4,5 | Lolos |
| Tanda status `selesai` **baru** `#8291A8` di putih | 3,20 | 3,0 | Lolos |
| Tanda status `lewat` / `berjalan` di putih | 3,30 / 3,41 | 3,0 | Lolos |
| Tanda status `segera` `#E0A100` di putih | 2,27 | 3,0 | **Pengecualian**, lihat di bawah |
| Kotak mozaik | – | – | Hiasan, `aria-hidden`, tidak membawa informasi. Teks tidak boleh diletakkan di atas mozaik |

### Warna yang disesuaikan, dan alasannya

1. **`teks-lembut` `#646E89` → `#59627D`.** Nilai lama 4,70:1 di latar abu, terlalu tipis di atas batas 4,5:1.
   Teks kedua banyak dipakai (penyedia, keterangan, label pil), jadi dibuat 5,8:1. Warnanya tetap abu kebiruan.
2. **`garis-input` `#8590AB` → `#7D88A3`.** Nilai lama 2,96:1 di latar abu (gagal 3:1 untuk tepi isian, WCAG 1.4.11).
   Nilai baru 3,40:1 di latar `#FAFAFC` dan 3,55:1 di putih.
3. **`selesai` `#94A3B8` → `#8291A8`.** Tanda kotak kecil status "Selesai" di rekap hanya 2,56:1.
   Nilai baru 3,20:1, jadi tanda ini tetap terlihat sebagai objek grafis.
4. **`latar` `#F3F5FB` → `#FAFAFC`, `lembut` `#EAEEFF` → `#EEF1F8`.** Nilai lama sedikit keunguan.
   Arah Kavling memakai latar hampir putih seperti referensi, supaya mozaik bisa memudar ke latar.
5. **Pengecualian `segera` `#E0A100` (2,27:1 di putih).** Kuning emas tidak bisa mencapai 3:1 di putih tanpa menjadi cokelat
   dan kehilangan arti "emas". Warna ini dipertahankan HANYA sebagai tanda yang selalu disertai teks
   ("Segera habis", "18 hari lagi" dengan `segera-teks` 6,58:1). Jangan pernah memakainya sendirian sebagai pembawa informasi.

---

## Tipografi

- **Judul (h1, h2):** Public Sans 800 (h1) / 700 (h2), jarak huruf rapat (-0.02 sampai -0.035em)
- **Kata penekanan:** Source Serif 4 miring 400, satu kata per judul, hanya di judul Beranda, Masuk, dan judul bagian utama
- **Isi dan kontrol:** Public Sans 400–700
- **Angka:** `font-variant-numeric: tabular-nums` di seluruh halaman, supaya rupiah dan tanggal sejajar
- **Ukuran huruf dasar:** 14px. Ditulis dalam piksel, misalnya `text-[13px]` (aturan CLAUDE.md)
- **Dimuat dari:** Google Fonts di `index.html` (dengan `preconnect`)

## Bentuk dan jarak

- **Sudut:** panel 24px (20px di HP), kotak kalender dan kotak mozaik 10–12px, isian 12px. Tombol, chip, navigasi, kotak cari: pil (bulat penuh).
- **Kedalaman:** panel datar bergaris tepi. Bayangan lembut `shadow-pil` hanya untuk navigasi pil dan kotak cari. `shadow-menu` dan `shadow-toast` untuk menu, dialog, toast.
- **Lebar konten:** maksimal 1280px supaya semua menu navbar muat satu baris (Beranda, Kontrak, Critical point, Rekap, Ubah data, Admin). Di HP jarak tepi 20px.
- **Jarak:** kelipatan 4px. Ruang di atas judul bagian lebih besar dari ruang di bawahnya.

## Gaya

**Kavling:** modern, lapang, dan ramah, tapi tetap rapi untuk kantor pemerintah.
Kunci: navigasi pil putih yang melayang dengan logo BBT di warna aslinya, mozaik kotak warna BBT (kavling tanah)
yang memudar ke putih di semua halaman (60% atas layar berwarna, 40% bawah polos), judul sans tebal di tengah dengan satu kata serif miring,
kotak cari berbentuk pil, rekap status berupa pil, agenda dalam panel bersudut lebar, kotak kalender untuk tanggal.

---

## Larangan (jangan dipakai)

- Lingkaran blur, pola titik, lingkaran garis konsentris, kaca buram (backdrop blur) sebagai hiasan
- Teks di atas baris mozaik yang pekat (dua baris teratas); mozaik ungu/pink
- Kotak ikon bergradasi, kotak ikon berwarna sebelum setiap judul
- Tombol bergradasi, tombol bercahaya (bayangan berwarna)
- Emoji di teks atau sebagai ikon
- Label huruf kapital semua, label kecil di atas judul (eyebrow)
- Lebih dari satu kata miring serif per judul, atau kata miring di teks isi
- Pemisah titik tengah untuk menyambung metadata (pakai kolom, baris baru, atau kalimat)
- Semua isi dibungkus kartu dengan bayangan yang sama; kartu di dalam kartu
- Animasi memantul; animasi muncul yang sama di setiap bagian
- Logo di alas putih terpisah di atas navy; logo yang diberi filter, diwarnai ulang, atau dipotong
- Garis tepi kiri berwarna lebih dari 1px pada kartu atau daftar

---

## Daftar periksa sebelum diserahkan

- [ ] Tidak ada emoji. Ikon hanya dari `src/components/Ikon.tsx`
- [ ] Semua yang bisa diklik memakai `<button>` atau `<a>`, dengan `cursor-pointer`
- [ ] Transisi hover 150ms, dengan `motion-reduce:transition-none`
- [ ] Kontras teks minimal 4,5:1, tepi isian dan ikon minimal 3:1 (tabel di atas)
- [ ] Fokus keyboard terlihat (`:focus-visible` global di `src/index.css`)
- [ ] `prefers-reduced-motion` dihormati (`motion-safe:`)
- [ ] Responsif: 390px, 768px, 1024px, 1440px, tanpa scroll ke samping
- [ ] Area sentuh minimal 44px di HP


---

## Pembaruan 17 November 2026 (sore)

Keputusan Hisyam setelah meninjau mockup `mockup/rencana.html`:
- **Latar 60:40 di semua halaman:** mozaik menutupi sekitar 60% tinggi layar lalu memudar. Hanya dua baris teratas yang berwarna;
  baris di belakang judul dibuat 88–96% putih, sehingga teks judul (navy tua) tetap di atas 12:1.
- **Navbar** menempel saat di-scroll; judul "Contract Management" diperkecil (17px); lonceng notifikasi tetap; wadah 1280px.
- **Halaman:** Kontrak (gabungan Kontrak + Pengingat, tabel per tahap H-1/H-2/H-3 bulan), Critical point, Rekap (data lengkap + PDF),
  Ubah data (admin dan pengguna). Halaman Pengingat dihapus; alamat `/pengingat` diarahkan ke `/kontrak`.
