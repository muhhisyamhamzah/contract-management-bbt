# Audit UI teknis: Contract Management BBT

Tanggal audit: 16 November 2026
Cakupan: Beranda, Kontrak, Pengingat, Profil, Detail kontrak (`/kontrak/1`), Tambah kontrak (`/tambah`).
Cara audit:
- Membaca kode di `src/`.
- Menjalankan detector impeccable (`impeccable detect src`).
- Menghitung rasio kontras WCAG dari token di `src/index.css`.
- Mencoba di browser (Playwright, Chromium) pada ukuran 390 x 844 di dev server `localhost:5199`. Yang dicoba: navigasi Tab di setiap halaman, mengukur ukuran setiap elemen yang bisa diklik, dan mengirim form kosong.

Skill yang dipakai: impeccable (`audit`) dan pedoman UX ui-ux-pro-max (fokus, target sentuh, label form).

**Batasan:** Arah visual (navy-emas, header bergelombang, kotak kalender) **tidak** dinilai dan tidak perlu diubah. Saran perbaikan di bawah memilih cara yang tidak mengubah tampilan, misalnya menggelapkan nilai token yang sudah ada.

**Belum dicoba:** HP sungguhan, Safari/iOS, pembaca layar (VoiceOver/TalkBack), dan langkah 3 form lewat keyboard.

---

## Skor kesehatan

| # | Dimensi | Skor | Temuan utama |
|---|---------|------|--------------|
| 1 | Aksesibilitas | 2/4 | Kotak cari di Kontrak tidak menampilkan fokus. Garis kotak isian hanya 1,31:1. Pesan galat form tidak terhubung ke kolomnya. |
| 2 | Performa | 3/4 | Tidak ada masalah berarti. Ada tiga lapisan `blur-3xl` di header (wajar untuk 1 header per halaman). |
| 3 | Tema / token | 3/4 | Token dipakai dengan konsisten. Beberapa token kontrasnya kurang (lihat di bawah). |
| 4 | Responsif / sentuh | 3/4 | Semua lolos WCAG AA 24px, tapi 5 jenis kontrol masih di bawah aturan proyek 44px. |
| 5 | Integritas implementasi | 3/4 | Sistemnya utuh dan khas. Detector hanya memberi 1 catatan (easing memantul). |
| **Total** | | **14/20** | **Baik**. Aksesibilitas yang perlu dikejar. |

### Integritas implementasi: LULUS
Komponen memakai token dari `@theme` secara konsisten. Warna status diambil dari `TAMPILAN_STATUS`. Elemen yang bisa diklik memakai `<button>`/`<a>` asli. Detector hanya menemukan satu hal: `cubic-bezier(0.34, 1.56, 0.64, 1)` pada `animate-meletup` (`src/index.css:65`). Itu bagian gaya Beranda yang sudah disetujui, dan sudah dibungkus `motion-safe:`. Jadi temuan ini **diabaikan dengan sengaja**.

### Ringkasan
- Jumlah temuan: **P0: 0 · P1: 4 · P2: 5 · P3: 2**
- Yang paling penting:
  1. Kotak cari di halaman Kontrak tidak menampilkan tanda fokus sama sekali.
  2. Garis tepi kotak isian form nyaris tidak terlihat (1,31:1, minimal 3:1).
  3. Pesan galat form umum, letaknya jauh dari kolom, dan tidak terhubung ke kolomnya. Galat "tanggal berakhir harus setelah tanggal mulai" tidak menandai kolom mana pun.
  4. Teks bulan putih pada pita kalender oranye (kontrak lewat) hanya 2,98:1.

---

## Temuan, urut dari yang paling penting

### [P1] 1. Kotak cari di Kontrak tidak menampilkan fokus
- **Lokasi:** `src/pages/Kontrak.tsx:75` (input `type="search"`) dan `label` pembungkusnya di baris 66
- **Kategori:** Aksesibilitas, navigasi keyboard
- **Bukti:** Saat ditekan Tab, `outline` bernilai `none` dan `box-shadow` kosong. Di tangkapan layar, kotak cari yang sedang fokus tampak sama persis dengan saat tidak fokus.
- **Dampak:** Pengguna keyboard tidak tahu posisinya. Kotak cari ini juga elemen pertama di halaman, dan otomatis difokuskan saat dibuka dari Beranda.
- **Standar:** WCAG 2.4.7 Focus Visible (AA)
- **Saran:** Tambahkan `focus-within:ring-2 focus-within:ring-aksi` (atau outline 2px `aksi`) pada `label` pembungkus. Polanya sama dengan kotak "Nilai kontrak" di form, tapi dengan ring yang pekat.
- **Perintah:** `$impeccable harden`

### [P1] 2. Garis tepi kotak isian terlalu pucat
- **Lokasi:** token `--color-garis-input: #DCE1EE` (`src/index.css:26`). Dipakai di `KELAS_ISIAN` (`src/lib/formKontrak.ts:105`), `kelasIsianKecil` (`src/components/LangkahNilaiWaktu.tsx:20`), kotak Nilai kontrak, dan `TombolPilihan` yang tidak aktif.
- **Kategori:** Aksesibilitas, kontras komponen
- **Bukti:** `#DCE1EE` di atas putih = **1,31:1**. Kotak isian putih di atas latar `#F3F5FB` = 1,09:1. Batas kolom hampir hanya terlihat dari bayangan dan sudutnya.
- **Dampak:** Di HP dengan layar redup atau di bawah sinar matahari, pengguna sulit melihat di mana kolom isian berada. Ini juga berlaku untuk orang dengan penglihatan rendah.
- **Standar:** WCAG 1.4.11 Non-text Contrast (AA), minimal 3:1
- **Saran:** Cukup ganti **nilai** token `garis-input`, tidak perlu mengubah komponen. Contoh: `#8590AB` (3,19:1 di putih). Warnanya tetap abu kebiruan, jadi tampilan tidak bergeser. Biarkan token `garis` (pembatas kartu dan chip) apa adanya, karena batas itu dekoratif.
- **Perintah:** `$impeccable harden`

### [P1] 3. Pesan galat form: tidak spesifik dan tidak terhubung ke kolom
- **Lokasi:** `src/pages/FormKontrak.tsx:119-126`, `src/lib/formKontrak.ts:83-97`, ketiga file `Langkah*.tsx`
- **Kategori:** Aksesibilitas, form
- **Bukti (dicoba dengan menekan Lanjut saat form kosong):**
  - Ketiga kolom kosong mendapat `aria-invalid="true"` dan garis merah. Tapi tidak ada `aria-describedby`, jadi pembaca layar hanya menyebut "tidak valid" tanpa alasan.
  - Pesan "Isi judul, nomor kontrak, dan mitra dulu." muncul **di bawah semua kolom**, setelah "Unit pemilik". Di langkah 2 yang lebih panjang (ada termin), pesan bisa berada di luar layar HP.
  - Fokus tidak dipindah ke kolom pertama yang salah.
  - Galat "Tanggal berakhir harus setelah tanggal mulai." **tidak menandai kolom apa pun**, karena `kolomKosong()` hanya memeriksa kolom yang kosong.
  - Kolom wajib tidak ditandai sebelum pengguna mencoba lanjut. "Unit pemilik" (tidak wajib) tampak sama dengan kolom wajib.
- **Dampak:** Pengguna harus menebak kolom mana yang salah. Pengguna pembaca layar tidak mendapat penjelasan sama sekali.
- **Standar:** WCAG 3.3.1 Error Identification (A), 3.3.2 Labels or Instructions (A), 1.3.1 Info and Relationships (A)
- **Saran:**
  - Beri pesan pendek di bawah setiap kolom yang salah, misalnya "Judul kontrak wajib diisi". Hubungkan lewat `aria-describedby`.
  - Setelah Lanjut gagal, pindahkan fokus ke kolom pertama yang salah.
  - Tandai `tanggalBerakhir` sebagai tidak valid untuk galat urutan tanggal.
  - Tambahkan `required`/`aria-required` pada kolom wajib, dan tulis "(opsional)" pada label "Unit pemilik".
  - Kotak galat di bawah boleh tetap ada sebagai ringkasan.
- **Perintah:** `$impeccable clarify` lalu `$impeccable harden`

### [P1] 4. Teks bulan di pita kalender "Sudah lewat" kurang kontras
- **Lokasi:** `src/components/KartuPengingat.tsx:329` (`kelasPita="bg-logo-tanah text-white"`) dan contohnya di komentar `KotakKalender.tsx:151`
- **Kategori:** Aksesibilitas, kontras teks
- **Bukti:** Putih di atas `#E07B2C` = **2,98:1**. Teksnya 10px tebal, jadi tetap dihitung teks kecil (minimal 4,5:1).
- **Dampak:** Bulan berakhir pada kontrak yang paling mendesak justru paling sulit dibaca.
- **Standar:** WCAG 1.4.3 Contrast Minimum (AA)
- **Saran:** Pertahankan pita oranye, ganti warna teksnya menjadi `text-galaxy-900` (5,01:1). Ini sama dengan pita emas yang sudah memakai teks navy, jadi lebih konsisten.
- **Perintah:** `$impeccable harden`

### [P2] 5. Teks tab tidak aktif di Detail sedikit di bawah batas
- **Lokasi:** `src/pages/DetailKontrak.tsx:184` (`text-teks-lembut` di atas `bg-latar-tab`)
- **Bukti:** `#646E89` di atas `#E6EAF5` = **4,22:1** (teks 13px semibold, minimal 4,5:1)
- **Standar:** WCAG 1.4.3 (AA)
- **Saran:** Pakai `text-teks` atau `text-aksi` untuk tab tidak aktif (6,69:1). Bisa juga menambah token baru, misalnya `teks-tab: #545E7A` (5,35:1). Jangan menggelapkan `teks-lembut` secara global tanpa memeriksa ulang semua pemakaiannya.
- **Perintah:** `$impeccable harden`

### [P2] 6. Gaya fokus belum seragam dan sebagian lemah
- **Lokasi:** global (tidak ada aturan `:focus-visible` di `src/index.css`), `KELAS_ISIAN`, `PilihFile.tsx:17`
- **Bukti:**
  - Hampir semua tombol dan tautan memakai cincin fokus bawaan browser (`outline: auto`). Di Chromium cincinnya ganda dan terlihat, juga di header navy. Tapi tampilannya berbeda di tiap browser. Di Safari, cincin biru bawaan di atas navy kira-kira 2,5:1.
  - Kotak isian memakai `outline-none`. Penggantinya hanya perubahan garis 1px menjadi `aksi` ditambah ring `aksi/20` (1,39:1). Fokusnya masih terlihat, tapi tipis.
  - Kotak pilih file memakai ring `aksi/30` (1,66:1).
- **Dampak:** Pengguna keyboard (misalnya admin yang memakai laptop) bisa kehilangan jejak fokus, terutama di Safari.
- **Standar:** WCAG 2.4.7 (AA). Rujukan kualitas: 2.4.13 Focus Appearance (AAA): minimal 2px dan 3:1.
- **Saran:** Satu aturan global di `@layer base`, misalnya `:focus-visible { outline: 2px solid var(--color-aksi); outline-offset: 2px }`, ditambah varian putih untuk elemen di dalam header gelap. Ganti `ring-aksi/20` dan `ring-aksi/30` dengan ring pekat. Tampilan saat disentuh di HP tidak berubah, karena `:focus-visible` tidak muncul pada sentuhan.
- **Perintah:** `$impeccable harden`

### [P2] 7. Beberapa target sentuh di bawah 44px (aturan proyek)
- **Lokasi dan ukuran terukur (390 x 844):**

  | Kontrol | Ukuran | File |
  |---|---|---|
  | Tautan "Lihat semua" (2x di Beranda) | 74 x 33 | `Beranda.tsx:98`, `:139` |
  | Chip filter status | lebar x 36 | `ChipFilter.tsx:20` (`h-9`) |
  | Tombol urutan "Paling cepat habis" | 159 x 36 | `Kontrak.tsx:125` (`h-9`) |
  | Tab Ringkasan / Dokumen / Riwayat | 111 x 40 | `DetailKontrak.tsx:184` (`h-10`) |
  | "Lihat semua kontrak" di kartu Segera habis | 318 x 41 | `Beranda.tsx:147` (`py-3`) |

- **Standar:** Semua lolos WCAG 2.5.8 Target Size Minimum (AA, 24px). Tapi melanggar aturan di `CLAUDE.md` ("Area sentuh minimal 44px") dan pedoman HP (44pt iOS / 48dp Android).
- **Dampak:** Chip berjarak 8px dan tinggi 36px mudah meleset saat dipakai dengan satu jempol.
- **Saran:** Ukuran yang terlihat tidak perlu diubah. Perbesar area sentuhnya saja: tambah padding vertikal pada tautan, atau pseudo-element `before:absolute before:-inset-y-1` pada chip dan tombol urutan sehingga area sentuh minimal 44px. Tab cukup `h-11`.
- **Perintah:** `$impeccable adapt`

### [P2] 8. Menu dropdown diumumkan sebagai `role="menu"` tapi tidak bisa dipakai dengan panah
- **Lokasi:** `src/components/MenuDropdown.tsx:91-121` (urutan di Kontrak, titik tiga di Detail)
- **Bukti:** Saat menu dibuka, fokus tetap di tombol pembuka. Tombol panah atas/bawah tidak berfungsi. Kalau pengguna menekan Tab keluar dari menu, menu tetap terbuka. Escape sudah benar.
- **Dampak:** Pembaca layar memberi tahu bahwa ini "menu" lalu mengharapkan tombol panah, padahal panah tidak berfungsi. Pengguna jadi bingung.
- **Standar:** WCAG 4.1.2 Name, Role, Value (A), pola WAI-ARIA Menu Button
- **Saran:** Pilih satu:
  - (a) Lengkapi pola menu: fokus ke item pertama saat dibuka, panah atas/bawah, Home/End, tutup saat fokus keluar.
  - (b) Hapus `role="menu"`/`menuitem`, lalu perlakukan sebagai panel tombol biasa (disclosure) yang tertutup saat fokus keluar.

  Opsi (b) lebih sederhana untuk dirawat tim IT.
- **Perintah:** `$impeccable harden`

### [P2] 9. Teks placeholder di form terlalu pucat
- **Lokasi:** `KELAS_ISIAN` (`src/lib/formKontrak.ts:105`). Placeholder memakai warna bawaan Tailwind (50% dari warna teks).
- **Bukti:** kira-kira **3,18:1**. Placeholder di sini membawa contoh format penting, misalnya "Contoh: 045/BBT/SPK/2026".
- **Standar:** WCAG 1.4.3 (AA), karena placeholder berisi informasi
- **Saran:** Tambahkan `placeholder:text-teks-lembut` (5,08:1) ke `KELAS_ISIAN`. Kotak cari di Kontrak sudah memakai cara ini.
- **Perintah:** `$impeccable harden`

### [P3] 10. `aria-controls` tab menunjuk ke panel yang tidak ada
- **Lokasi:** `src/pages/DetailKontrak.tsx:179`
- **Bukti:** Hanya panel aktif yang digambar, jadi `aria-controls="panel-dokumen"` pada tab tidak aktif menunjuk ke id yang tidak ada.
- **Saran:** Pasang `aria-controls` hanya pada tab aktif, atau gambar ketiga panel dan beri atribut `hidden` pada yang tidak aktif.
- **Perintah:** `$impeccable polish`

### [P3] 11. Teks sangat kecil (10–11px) pada badge, pita kalender, dan label navigasi
- **Lokasi:** `BadgeStatus.tsx:19` (11px), `KotakKalender.tsx:164,170` (10px), `MenuNav.tsx:22` (11px), `KotakRingkasan.tsx:90` (11px)
- **Catatan:** Semua kontrasnya lolos (badge 5,18–6,62:1). Ukuran ini bagian dari arah visual, jadi **tidak perlu diubah sekarang**. Cukup pastikan aplikasi tetap rapi saat pengguna memperbesar teks di HP (zoom teks 200%, WCAG 1.4.4).
- **Perintah:** `$impeccable adapt` (cukup diuji, tanpa mengubah gaya)

---

## Tabel kontras yang diukur

| Pasangan | Rasio | Hasil |
|---|---|---|
| Badge Berjalan (`berjalan-teks` / `berjalan-latar`) | 5,18 | Lolos |
| Badge Segera habis | 5,80 | Lolos |
| Badge Sudah lewat | 5,43 | Lolos |
| Badge Selesai | 6,62 | Lolos |
| Chip "Segera habis" tidak aktif (teks di putih) | 6,58 | Lolos |
| `teks-lembut` di putih / di `latar` | 5,08 / 4,66 | Lolos |
| `teks-lembut` di `latar-tab` (tab tidak aktif) | 4,22 | **Gagal** |
| `aksi` di putih (tautan) | 8,05 | Lolos |
| Teks putih di tombol Hapus (`hapus`) | 4,60 | Lolos (tipis) |
| Pesan galat (`hapus-teks` / `hapus-latar`) | 6,35 | Lolos |
| Teks redup header (`white/70` di `galaxy-700`, bagian terang gradasi) | 4,85 | Lolos |
| Pita emas (`galaxy-900` di `logo-emas`) | 8,30 | Lolos |
| Pita lewat (putih di `logo-tanah`) | 2,98 | **Gagal** |
| Placeholder form (bawaan) | ~3,18 | **Gagal** |
| Garis isian `garis-input` di putih (komponen, minimal 3:1) | 1,31 | **Gagal** |
| Garis putus-putus `aksen` (Unggah, Tambah termin) | 2,39 | Kurang, tapi tidak wajib karena teks tombol sudah jelas |
| Ring fokus isian `aksi/20` | 1,39 | Lemah (garis `aksi` 1px yang menyelamatkan) |

---

## Pola yang berulang

- **Fokus diserahkan ke browser.** Tidak ada satu aturan `:focus-visible` di proyek. Tempat yang memakai `outline-none` lalu menjadi rawan, dan kotak cari di Kontrak sudah kena.
- **Token warna "garis" dipakai untuk dua peran.** Pembatas dekoratif boleh pucat, tapi batas kolom isian harus 3:1. Peran kedua sebaiknya memakai token sendiri yang lebih gelap.
- **Validasi form hanya di tingkat langkah.** Pesan galat masih satu untuk satu langkah, belum per kolom.
- **Tinggi kontrol `h-9`/`h-10`** dipakai untuk kontrol yang padat (chip, urutan, tab). Area sentuhnya perlu diperbesar tanpa mengubah tampilannya.

## Yang sudah baik (pertahankan)

- Hampir semua elemen yang bisa diklik memakai `<button>`/`<a>` asli. Tidak ada `div` dengan `onClick`.
- Tombol ikon punya `aria-label` (Kembali, Batal, Menu lainnya, Hapus kata kunci, Hapus file). Lonceng menyebut jumlah kontrak di labelnya.
- Dialog konfirmasi memakai `<dialog>` + `showModal()`, sehingga fokus terkunci di dalam dan Escape berfungsi sebagai Batal.
- Tab di Detail mendukung panah kiri/kanan dan *roving tabindex*.
- Chip dan tombol pilihan memakai `aria-pressed`. Item urutan memakai `menuitemradio` + `aria-checked`.
- Jumlah hasil pencarian, langkah form, dan toast diumumkan lewat `aria-live`/`role="status"`. Galat memakai `role="alert"`.
- Label form membungkus input. Grup pilihan memakai `fieldset` + `legend`.
- Semua efek gerak memakai `motion-safe:`/`motion-reduce:`.
- Semua badge status lolos 4,5:1. Warna status selalu disertai teks atau ikon, tidak hanya warna.
- Urutan Tab di setiap halaman sudah sesuai urutan tampilan, dan tidak ada jebakan keyboard.
- Safe area HP (`env(safe-area-inset-*)`) sudah dipakai di header, navigasi bawah, dan tombol bawah.

---

## Urutan perbaikan yang disarankan

1. **[P1] `$impeccable harden`**: fokus kotak cari Kontrak, token `garis-input` yang lebih gelap, teks pita kalender lewat, placeholder form, dan satu aturan `:focus-visible` global (temuan 1, 2, 4, 6, 9).
2. **[P1] `$impeccable clarify`**: pesan galat per kolom, `aria-describedby`, fokus ke kolom pertama yang salah, tanda wajib/opsional, dan galat urutan tanggal (temuan 3).
3. **[P2] `$impeccable harden`**: teks tab tidak aktif, dan menu dropdown dirapikan menjadi disclosure atau dilengkapi pola menu (temuan 5, 8).
4. **[P2] `$impeccable adapt`**: area sentuh 44px untuk chip, tombol urutan, tab, dan tautan "Lihat semua" tanpa mengubah tampilan, lalu uji zoom teks 200% (temuan 7, 11).
5. **[P3] `$impeccable polish`**: `aria-controls` tab, lalu pemeriksaan akhir (temuan 10).

Setelah perbaikan, jalankan ulang `$impeccable audit` untuk melihat kenaikan skor.
