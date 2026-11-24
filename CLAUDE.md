# Contract Management BBT

Website untuk mencatat dan memantau kontrak (PKS) di Badan Bank Tanah, dipakai tim pengadaan
dan kepala divisi umum. Dikerjakan anak magang IT, lalu diserahkan ke tim IT kantor.
Kode harus mudah dibaca dan dirawat orang lain.

Sumber keputusan: `docs/KEBUTUHAN-WEBSITE.md` (per 16 Nov 2026), ditambah bagian
"Keputusan tambahan" di bawah (17 Nov 2026). Kalau keduanya bertentangan, "Keputusan tambahan" yang menang.
Perubahan berikutnya diusulkan ke Hisyam dulu.

Tanda keputusan: [DIKONFIRMASI] dijawab atasan, [ASUMSI] keputusan sementara tim,
[TERBUKA] belum diputuskan. Yang [TERBUKA] jangan dikunci di kode.

## Keputusan tambahan (Hisyam, 17 Nov 2026)

- Kolom Jenis kontrak, Unit pemilik, dan pilihan pengingat per kontrak DIHAPUS.
- Pengingat 3, 2, 1 bulan dihitung per bulan kalender (bukan per 30 hari).
- Halaman Profil diganti menu akun di navigasi atas. (Dibatalkan 21 Nov 2026: Profil kembali ada, lihat di bawah.)
- Hapus kontrak langsung permanen, tanpa arsip. Penghapusan tetap dicatat di riwayat perubahan.
- Logo BBT menjadi merek utama di navigasi atas (menggantikan ikon dokumen emas di desain v4). Layar pembuka dihapus.
- Arah visual "Kavling" dipilih (Hisyam, 17 Nov 2026), dari referensi gaya Hisyam. Acuan: `DESIGN.md` dan
  `design-system/contract-management-bbt/MASTER.md`. Mockup: `mockup/arah-4-kavling.html` (arah 1–3 hanya pembanding).
- Font: Public Sans (isi dan judul) + Source Serif 4 miring untuk SATU kata penekanan per judul.
  Menggantikan Plus Jakarta Sans.

## Keputusan tambahan (Hisyam, 18 Nov 2026)

- Critical point DIHAPUS (halaman, butir, dan pengingatnya). Diganti "Ketentuan kontrak": 4 kolom teks tetap
  (Pengakhiran kontrak, Denda, Jaminan kontrak, Keterangan), semuanya boleh kosong.
- Kolom Monitoring, Catatan, dan Keterangan lama DIHAPUS (Keterangan pindah ke Ketentuan kontrak).
- Kolom baru "Perpanjangan kontrak" (Belum diproses / Sedang diproses / Sudah diperpanjang / Tidak diperpanjang),
  hanya di form ubah, paling atas, berupa pilihan ke bawah. Status adendum yang tampil dihitung dari isian ini.
- Perpanjangan lewat adendum dicatat di kontrak yang sama (BUKAN kontrak baru) lewat halaman Catat adendum.
- Semua jenis file boleh diunggah (bukan hanya PDF). Sebutan "File PKS", bukan "PDF PKS". PKS lama tetap tersimpan.
- Menu Rekap dan Ubah data digabung ke Kontrak. Navigasi: Beranda, Kontrak, Admin.
- Peran ditulis "Admin" (bukan "Admin IT") di semua tampilan dan flowchart. Tim IT tetap pemegang peran ini.
- (19 Nov 2026) Akun yang keluar dinonaktifkan dulu; hanya akun NONAKTIF yang boleh dihapus permanen (dengan
  konfirmasi, dicatat di riwayat). Riwayat menyimpan nama sebagai teks, jadi tetap terbaca. Menonaktifkan wajib
  memilih alasan (`ALASAN_NONAKTIF` di `src/lib/akun.ts`, [ASUMSI] daftar usulan) + keterangan. Akun yang keluar
  dilihat di Admin, filter "Nonaktif", dengan alasan, waktu, dan siapa yang menonaktifkan.
- (19 Nov 2026) Beranda menampilkan pil "Total kontrak" di depan pil status.
- Mozaik kavling tampil di semua halaman. (24 Nov 2026) Bergerak hanya saat dilewati kursor, lihat "Acuan desain".
- Tanpa placeholder contoh dan tanpa tulisan "(opsional)" di form.

## Keputusan tambahan (atasan lewat Hisyam, 20 Nov 2026)

- Data per versi dokumen: setiap PKS dan adendum menyimpan data kontrak saat dokumen itu berlaku (`Dokumen.versi`,
  `src/lib/versiKontrak.ts`). Membuka dokumen lama di Detail menampilkan dua sisi, "Saat <dokumen>" dan "Terbaru",
  untuk Data kontrak dan Ketentuan kontrak (`TabelBanding`), dan Riwayat dibagi "Sampai <dokumen> berlaku" /
  "Sesudahnya". BAST dan dokumen lain mengikuti versi yang berlaku pada tanggal unggahnya.
  Versi dicatat saat Catat adendum, unggah PKS/adendum di Detail, dan ganti PKS di form ubah.
- Unduh Excel (.xlsx) tanpa library: tombol "Unduh Excel" di halaman Kontrak dan menu ⋮ Detail. Pilihan: kontrak ini
  (dari Detail), semua kontrak, atau pilih sendiri (centang). Lembar "Kontrak" (dengan total nilai lewat rumus SUM) dan
  "Dokumen". Kode: `src/lib/excel.ts` (format file), `src/lib/rekapExcel.ts` (isi).
  (23 Nov 2026) "Pilih kontrak dan dokumen": per kontrak yang dicentang, kotak centang per PKS/adendum (nomor sama dengan
  daftar dokumen di Detail, `daftarVersi` di `src/lib/versiKontrak.ts`). Boleh satu saja (misalnya dokumen 4 dari 7) atau
  beberapa; bawaannya dokumen terbaru. "Semua kontrak" bisa terbaru saja atau semua versi. Kolom "Versi data" menandai
  barisnya. Total: SUM biasa kalau tiap kontrak satu baris; SUMIF baris "Terbaru" kalau ada kontrak yang muncul lebih
  dari sekali, supaya tidak terhitung ganda.
  Dari Detail, dokumen lama yang sedang dibuka langsung terpilih sebagai versinya. [ASUMSI] Susunan kolom sementara,
  diganti mengikuti template Excel atasan.
- Pengingat juga dikirim ke email. Masuk tetap dengan email kantor; tiap akun boleh punya "Email pengingat" pribadi
  (Gmail, `Akun.emailNotifikasi`), kosong = email kantor. Diatur pemilik akun (halaman Profil) atau admin (Tambah akun,
  menu ⋮ di daftar akun); perubahan dicatat di riwayat. Langsung aktif TANPA izin (beda dengan Web Push).
  Purwarupa hanya menyimpan alamat; pengiriman dibuat di backend (layanan email/SMTP belum dipilih).

## Keputusan tambahan (Hisyam, 21 Nov 2026)

- Halaman Profil KEMBALI ADA (`/profil`, `src/pages/Profil.tsx`), isinya meniru Profil Sismon: kepala identitas,
  Data diri (nama dan jabatan bisa diubah sendiri; email kantor dan peran hanya oleh admin), Keamanan akun
  (kata sandi saat ini, kata sandi baru minimal 8 karakter `MIN_PANJANG_SANDI`, ulangi), Email pengingat, dan Keluar.
  Dibuka dari menu "Profil" di navigasi atas (atau klik avatar). Dropdown menu akun DIHAPUS (23 Nov 2026): email pengingat
  dan Keluar ada di halaman Profil. Ubah profil dan ganti sandi dicatat di riwayat.
- "Lihat contoh email" di Profil menampilkan email pengingat yang akan diterima (tujuan, subjek, daftar kontrak
  sama dengan lonceng). Purwarupa tidak mengirim email.

## Ruang lingkup

- HANYA contract management. Jangan menambah fitur General Affair (kendaraan, ruang meeting, ATK, inventaris).
- Alur persetujuan (workflow) DITUNDA. Jangan dibuat, tapi jaga struktur status supaya bisa ditambah nanti.
- Data diisi manual. Tidak ada fitur membaca isi file PKS otomatis.
- Data contoh selalu fiktif dan memakai kata "Contoh". JANGAN memakai isi PKS asli
  (nama penyedia, nomor, pasal) di data contoh, repo, atau screenshot.

## Pengguna dan hak akses

- Dua peran: `pengguna` dan `admin`.
- `pengguna` (tim pengadaan, kepala divisi umum): melihat, menambah, mengubah, menghapus SEMUA kontrak,
  dan menerima pengingat. Tidak ada pembatasan per bagian.
- `admin` (tim IT): semua hak pengguna, ditambah kelola akun (tambah, nonaktifkan, hapus akun nonaktif, reset kata sandi)
  dan melihat riwayat perubahan.
- Login wajib: email kantor + kata sandi, dengan pembatasan percobaan masuk (pola Sismon).
  Tidak ada "lupa kata sandi" otomatis: admin membuat kata sandi sementara.
  Admin yang lupa kata sandi (Hisyam 18 Nov 2026): direset admin lain; kalau tidak ada admin lain,
  tim IT mengganti kata sandi langsung di database. Halaman Masuk menjelaskan kedua jalan ini di panel "Lupa kata sandi?".

## Stack

- Frontend: React + Vite + TypeScript, Tailwind CSS v4 lewat `@tailwindcss/vite` (tanpa `tailwind.config`),
  `react-router-dom`.
- Backend (belum dibuat, pola Sismon): FastAPI + SQLAlchemy + Alembic + PostgreSQL (Neon).
- File kontrak (PKS, adendum, BAST): Cloudflare R2, akses lewat tautan bertanda tangan.
- Login: JWT + pembatasan percobaan masuk. Notifikasi: di dalam website + Web Push.
- Riwayat perubahan: tabel log audit.
- Jangan menambah library baru tanpa bertanya dulu.

## Acuan desain

- Acuan visual utama: `DESIGN.md` (arah Kavling). Desain v4 di
  `~/Downloads/MAGANG/figma_contract_management/versi_4_sederhana_bercorak/png/` hanya acuan isi dan alur.
  Versi 1–3 hanya pembanding.
- Acuan alur: `~/Downloads/MAGANG/Flowchart_ContractManagement/` (Flowchart 0–7).
- `docs/prototipe-referensi.html` adalah prototipe versi HP lama. Hanya arsip, bukan acuan lagi.
- Pertahankan: palet navy dan emas (`src/index.css`), kotak kalender untuk tanggal akhir,
  ikon garis dari `src/components/Ikon.tsx`, satu tombol utama per layar.
- TIDAK ADA sidebar. Navigasi berupa pil putih yang melayang di atas, di semua halaman
  (logo di kiri, menu, lonceng, akun, tombol Tambah kontrak). Header navy bergelombang DIHAPUS.
- Mozaik kavling (kotak warna BBT yang memudar ke putih) tampil di atas semua halaman (18 Nov 2026), termasuk Masuk.
  (24 Nov 2026) Gelombang setiap 9 detik DIHAPUS. Kotak muncul berurutan sekali saat dibuka, lalu diam; hanya kotak
  di bawah kursor yang bergerak sebentar (`useGerakKursor` di `src/components/Mozaik.tsx`, Web Animations, tanpa
  pengatur waktu dan tanpa library). Di HP (tanpa kursor) diam. Tetap mati saat mode kurangi gerak.
  Warna kotak di belakang teks dibatasi per warna (`PUTIH_MINIMAL` di `src/components/Mozaik.tsx`) supaya teks
  tetap minimal 4,5:1. Di desktop mozaik turun 20px, jadi judul halaman mulai di `md:pt-21` (Beranda juga, sejak 23 Nov 2026)
  dan tidak pernah berada di atas baris kotak pekat.
  Judul besar rata tengah HANYA di Beranda dan Masuk. Halaman kerja memakai judul rata kiri dan panel padat.
- Larangan "ciri AI" (lingkaran blur, kaca buram, gradasi, emoji, eyebrow, kartu berbayangan seragam, dll.):
  lihat `DESIGN.md` bagian Do's and Don'ts.
- Logo BBT (`/logo-bbt.png`) adalah merek utama di navigasi atas dan di halaman Masuk.
  Logo duduk langsung di atas putih navigasi pil (44px, 34px di HP), tanpa alas tambahan.
  - JANGAN mewarnai ulang, memberi filter (`brightness`, `invert`, `grayscale`, `opacity`), memotong,
    atau mengubah bentuk logo. Warna aslinya (hijau dan kuning) harus tetap.
  - Logo tidak diletakkan di atas latar navy. Kalau suatu saat terpaksa, beri alas putih; yang diubah alasnya, bukan logonya.
  - Logo wajib punya `alt` yang jelas, misalnya "Badan Bank Tanah".
- Warna utama navy, BUKAN hijau atau teal. Warna logo (hijau, emas, oranye tanah) hanya untuk aksen kecil.
- Garis tepi memakai `border`, bukan `ring`. Fokus keyboard memakai `outline` (`:focus-visible`).
- Ikon 3D atau gambar ikon dari luar sudah DITOLAK, jangan dipakai.
- [DIPUTUSKAN] Usulan visual KEBUTUHAN-WEBSITE.md bagian 8: usulan 2, 3, 4 diterapkan. Usulan 1 diganti
  agenda kontrak + rekap status berupa pil. Usulan 5 tidak berlaku (gelombang dihapus).
- [TERBUKA] Nama resmi aplikasi. Sementara "Contract Management".

## Tampilan

- Website responsif. Acuan desktop 1440px dengan konten di tengah (lebar maksimal 1120px, `KELAS_WADAH`).
  Tampilan HP (mulai 390px) tetap harus bisa dipakai: tanpa scroll ke samping, area sentuh minimal 44px.
- Font: Public Sans + Source Serif 4 miring (dimuat di `index.html`). Ukuran huruf dasar 14px.
  Kata penekanan: `font-judul italic font-normal`, paling banyak satu kata per judul.
- Sudut: panel 24px (20px di HP), kotak kalender 12px, kotak isian 12px. Tombol, chip, kotak cari, item menu berbentuk pil.
- Ukuran huruf ditulis dalam piksel, misalnya `text-[12px]`. JANGAN pakai `text-xs`, `text-sm`, `text-lg`
  dan sejenisnya, karena ikut mengubah jarak baris. Jarak baris dasar `normal` (diatur di `src/index.css`).
- Judul `h1`–`h3` sudah tebal (700) dari `src/index.css`; `h1` dan `h2` berjarak huruf rapat (-0.02em).
- Warna, bayangan, dan animasi didaftarkan di `src/index.css` lewat `@theme`. Pakai class dari token itu,
  JANGAN menulis kode hex di komponen. Warna baru ditambahkan sebagai token dengan nama yang jelas.
  - `galaxy-900`: navy tua (tombol utama, judul, mozaik). `galaxy-700` dihapus 19 Nov 2026 (tidak terpakai)
  - `judul`, `teks`, `teks-lembut`: warna teks
  - `aksi`, `aksi-tua`: tombol, tautan, menu aktif
  - `lembut`, `latar`: sorotan dan latar; `mozaik-biru`: HANYA warna tengah mozaik
  - `garis`: pembatas dekoratif; `garis-input`: tepi kotak isian (minimal 3:1 terhadap latarnya); `garis-lembut`: pembatas baris
  - `logo-emas`, `logo-tanah`: HANYA aksen kecil. `logo-hijau` dihapus 19 Nov 2026 (tidak terpakai; tambahkan lagi kalau perlu)
  - `berjalan`, `segera`, `lewat`, `selesai` + `<status>-latar` / `<status>-teks`: warna status.
    Jangan pakai opacity seperti `bg-segera/15`.
  - `hapus`, `hapus-latar`, `hapus-teks`: HANYA aksi menghapus dan pesan kesalahan
  - Bayangan: `shadow-pil` (HANYA navigasi pil dan kotak cari), `shadow-menu`, `shadow-menu-tebal`, `shadow-toast`.
    Panel tanpa bayangan.
  - Class tata letak bersama (lebar konten, kotak, tombol, kotak isian) ada di `src/lib/tataLetak.ts`.
  - Token yang tidak terpakai lagi setelah perubahan ke website dihapus di commit yang sama.
- Efek gerak selalu memakai `motion-safe:` dan `motion-reduce:transition-none`.
- Label, ikon, dan class warna tiap status diambil dari `TAMPILAN_STATUS` di `src/lib/status.ts`.
- Kontras: teks minimal 4,5:1, tepi kotak isian dan ikon minimal 3:1.

## Data kontrak

Kolom [DIKONFIRMASI] dari atasan. Semua definisi tipe ada di `src/types/kontrak.ts`.

| Kolom | Aturan |
|---|---|
| Nama kontrak | wajib |
| Penyedia | wajib. Di UI selalu "Penyedia", BUKAN "Mitra" |
| Nomor PKS | wajib, unik (nomor ganda ditolak) |
| Tanggal PKS | wajib |
| Awal kontrak | wajib |
| Akhir kontrak | wajib, harus setelah awal kontrak |
| Periode | [ASUMSI] dihitung dari awal dan akhir, tidak diisi |
| Nilai kontrak | wajib, rupiah angka bulat, paling banyak 15 digit (`MAKS_DIGIT_NILAI`, sampai Rp 999 triliun). [ASUMSI] nominal = nilai |
| Ketentuan kontrak | 4 kolom teks: Pengakhiran kontrak, Denda, Jaminan kontrak, Keterangan. Boleh kosong |
| Perpanjangan kontrak | Belum diproses / Sedang diproses / Sudah diperpanjang / Tidak diperpanjang. Kontrak baru selalu Belum diproses |

- Tidak ada kolom Jenis kontrak, Unit pemilik, atau pilihan pengingat per kontrak.
- [TERBUKA] Termin pembayaran. Jangan ditambah ke tipe atau form sebelum ada keputusan atasan.
- Setiap kontrak wajib punya file PKS (semua jenis file). Dokumen tambahan (adendum, BAST) boleh menyusul.
  Dokumen ditampilkan bernomor dari yang paling lama. [ASUMSI] Belum ada batas ukuran di layar; backend perlu batasnya.
- Status adendum (`STATUS_PERPANJANGAN` di `src/lib/status.ts`): Belum diproses → "Menunggu keputusan" [ASUMSI],
  Sedang diproses → "Proses melakukan adendum", Sudah diperpanjang → "Sudah dilakukan adendum",
  Tidak diperpanjang → "Tidak diperpanjang". Di daftar, pil ini hanya tampil kalau kontrak segera habis/lewat
  atau statusnya bukan Belum diproses (`tampilkanStatusAdendum`). Detail selalu menampilkannya.
- Catat adendum (`/kontrak/:id/adendum`): file adendum, tanggal adendum, akhir kontrak baru (harus setelah akhir
  sekarang), nilai kontrak. Sekali simpan: dokumen bertambah, akhir dan nilai diganti, perpanjangan menjadi
  Sudah diperpanjang, pengingat pindah, riwayat dicatat. Adendum yang tidak memperpanjang cukup diunggah di Detail.
- [ASUMSI] Impor Excel untuk data awal: tunggu template dari atasan, jangan dibuat dulu.

## Status kontrak dan pengingat

Status dihitung dari tanggal akhir, tidak diisi manual:

- `berjalan`: berakhir lebih dari 90 hari lagi. Label "Berjalan".
- `segera`: berakhir dalam 90 hari. Label "Segera habis".
- `lewat`: tanggal akhir sudah lewat, belum ditutup. Label "Sudah lewat".
- `selesai`: ditandai selesai oleh pengguna mana pun. Label "Selesai".

- Batas 90 hari adalah satu konstanta (`BATAS_HARI_SEGERA`) di `src/lib/status.ts`.
- Pengingat bertahap 3, 2, lalu 1 bulan kalender sebelum kontrak habis, ke semua pengguna.
  Tahapnya satu konstanta (misalnya `TAHAP_PENGINGAT_BULAN = [3, 2, 1]`) di `src/lib/status.ts`.
  Contoh: akhir 13 Des → pengingat 13 Sep, 13 Okt, 13 Nov.
  [ASUMSI] Kalau tanggalnya tidak ada di bulan itu (misalnya 31), pakai hari terakhir bulan tersebut.
- Tiap tahap dikirim sekali per kontrak (dicatat supaya tidak berulang). Pengingat berhenti kalau
  kontrak selesai atau dihapus.
- Lonceng menampilkan satu notifikasi per kontrak (tahap terbaru), jadi angkanya sama dengan kontrak yang perlu diurus.
- Kanal: notifikasi di dalam website + Web Push + email (email pengingat pribadi atau email kantor, tanpa izin). Belum ada WhatsApp.

## Hapus dan riwayat

- Hapus kontrak langsung permanen (tidak ada arsip), selalu dengan dialog konfirmasi yang
  menyebut nama kontrak dan bahwa tindakan ini tidak bisa dibatalkan.
- Setiap tambah, ubah, hapus, tandai selesai, unggah file, catat adendum, dan perubahan akun dicatat:
  siapa, kapan, apa yang berubah. Catatan penghapusan menyimpan nama dan nomor PKS kontrak yang dihapus.

## Halaman

Navigasi atas: logo BBT + nama aplikasi, Beranda, Kontrak (dengan jumlah yang perlu perhatian),
Admin (hanya admin), Profil, lonceng notifikasi, avatar (ke Profil), dan tombol Tambah kontrak (kecuali di halaman form).
Alamat lama `/pengingat`, `/rekap`, `/ubah-data`, `/critical-point` diarahkan ke halaman barunya.

1. **Masuk**: logo BBT, email kantor + kata sandi. Pesan gagal: akun tidak ditemukan/nonaktif,
   kata sandi salah, akun dikunci sementara.
2. **Beranda**: judul rata tengah, kotak cari pil, rekap jumlah per status berupa pil (tautan ke daftar terfilter),
   panel "Agenda kontrak" (sudah lewat + habis dalam 90 hari, dengan kotak kalender), tombol Tambah kontrak.
   (24 Nov 2026) Pil status ikut menampilkan total nilai. Di bawah pembuka ada dua kolom (bertumpuk di bawah 1024px):
   kiri = garis waktu "Kontrak berakhir" 12 bulan (klik bulan membuka `/kontrak?bulan=YYYY-MM`) + "Aktivitas terakhir"
   (5 perubahan kontrak terbaru; [ASUMSI] terlihat semua pengguna, perubahan akun tetap hanya di Admin); kanan =
   "Pengingat bulan ini" + "Adendum sedang diproses". Kedua kolom sama tinggi (panel terakhir tiap kolom `flex-1`).
   Agenda kontrak paling bawah, lebar penuh, 3 kolom, tinggi 2 baris kartu (6 kartu di desktop); sisanya di-scroll di
   dalam kotaknya dan muncul dari bawah saat masuk (`src/components/DaftarAgenda.tsx`, tanpa library).
   Hitungan di `src/lib/beranda.ts`.
3. **Kontrak** (gabungan Kontrak, Pengingat, Rekap): satu tabel semua kontrak. Cari (nama, penyedia, nomor PKS),
   filter status, urutkan (lewat alamat `?q=&status=&urut=`).
   (24 Nov 2026) Tombol "Filter" membuka panel filter tambahan (`src/lib/filterKontrak.ts`,
   `src/components/PanelFilterKontrak.tsx`): status adendum, tanggal berakhir (30/60/90 hari, tahun ini, pilih tanggal;
   `?bulan=` dari Beranda), nilai ([ASUMSI] batas `BATAS_NILAI` < Rp 500 jt / sampai Rp 1 M / > Rp 1 M), riwayat
   adendum (pernah/belum), BAST (ada/belum). Langsung berlaku, disimpan di alamat. Filter aktif tampil sebagai chip
   yang bisa dihapus satu per satu. Filter penyedia tidak dibuat: cukup lewat kotak cari. Ada tampilan daftar kosong dan hasil pencarian kosong.
4. **Detail kontrak**: data kontrak (termasuk status dan jumlah adendum, jadwal pengingat), ketentuan kontrak,
   riwayat, dropdown dokumen bernomor + unggah + pratinjau. Tombol Ubah, Catat adendum, Tandai selesai
   (dengan keterangan), menu hapus dengan konfirmasi.
5. **Tambah / ubah kontrak**: SATU halaman form, file PKS wajib, ringkasan sebagai konfirmasi sebelum simpan.
   Form ubah punya bagian Perpanjangan kontrak paling atas.
6. **Catat adendum**: form perpanjangan (lihat "Data kontrak"), dengan tabel sebelum dan sesudah.
7. **Admin** (hanya admin): akun pengguna dan riwayat perubahan. Kartu kata sandi sementara
   setelah membuat akun atau mereset sandi.

8. **Profil** (`/profil`): data diri, email pengingat + contoh email, ganti kata sandi, keluar (21 Nov 2026).

Tidak ada dropdown menu akun lagi (23 Nov 2026). Menu "Profil" ada di navigasi atas; avatar juga membuka Profil.
Keluar (dengan konfirmasi) ada di halaman Profil.

Keadaan yang wajib ada:
- Isian salah ditandai merah, dengan pesan per kolom yang menjelaskan cara memperbaiki
  (dihubungkan lewat `aria-describedby`, fokus pindah ke kolom pertama yang salah).
- Nomor PKS ganda ditolak. Akhir kontrak di Catat adendum ditolak kalau tidak setelah akhir kontrak sekarang.
- Konfirmasi untuk: simpan, simpan adendum, tandai selesai, hapus, nonaktifkan akun.
- Pesan berhasil sama dengan nama tombolnya ("Simpan kontrak" menghasilkan "Kontrak tersimpan").
- Panel notifikasi saat lonceng diklik.

## Struktur folder

```
src/
  pages/        satu file per halaman
  components/   satu komponen satu file
  data/         data contoh (fiktif, berkata "Contoh")
  lib/          status.ts (status, batas hari, tahap pengingat, warna), format.ts (rupiah, tanggal),
                daftarKontrak.ts (saring, urut), formKontrak.ts (validasi), navigasi.ts, toast.ts,
                versiKontrak.ts (data per versi dokumen), excel.ts + rekapExcel.ts (unduh Excel),
                akun.ts (alasan nonaktif, email pengingat)
                beranda.ts (nilai per status, pengingat bulan ini, adendum diproses, garis waktu, aktivitas)
                filterKontrak.ts (filter tambahan halaman Kontrak)
  types/        kontrak.ts (semua tipe)
```

## Aturan kerja

- Teks di layar, nama komponen, dan komentar memakai Bahasa Indonesia.
- Komponen kecil dan bisa dipakai ulang. Satu komponen satu file.
- Aksesibilitas: pakai `<button>` dan `<a>` asli. Ikon tanpa teks wajib punya `aria-label`.
  Setiap kotak isian punya label yang terlihat.
- Format rupiah dan tanggal Indonesia lewat `src/lib/format.ts`.
- (Hisyam 23 Nov 2026) Kerja langsung di `main`, seperti Sismon: commit dan push dari VS Code, rekan tim cukup `git pull`.
  Sebelum push, `git pull` dulu supaya perubahan rekan tidak bertabrakan. Cabang `fitur/website-responsif` sudah
  digabung ke `main` dan tidak dipakai lagi. Commit kecil dengan pesan yang jelas.
- JANGAN commit atau push tanpa izin Hisyam.
- Jangan commit `.env` atau `node_modules`. Jangan menjalankan `npm audit fix --force`.
- Kerjakan bertahap, satu bagian per permintaan. Laporkan file yang dibuat atau diubah dan alasannya.
  Tandai jelas mana yang asumsi dan mana yang dikonfirmasi.

## Urutan kerja

1. Hisyam memutuskan usulan visual dan versi desain bersama atasan.
2. Ubah tipe data dan data contoh (`src/types/kontrak.ts`, `src/data/`).
3. Ubah tata letak dari aplikasi HP ke website responsif, halaman demi halaman.
4. Siapkan backend mengikuti pola Sismon.
5. Audit UI ulang (kontras, keyboard, label form) setelah versi website jalan.
   `docs/ui-audit.md` adalah audit versi HP. Temuan kontras dan form masih berlaku.

## Masih ditanyakan ke atasan

- Batas ukuran file.
- Nama status untuk "Belum diproses" (sementara "Menunggu keputusan").
- Termin pembayaran perlu dicatat atau tidak.
- Template Excel rekap kontrak yang sekarang dipakai.
- Nama resmi aplikasi.
- (Opsional) Konfirmasi bahwa hapus permanen tanpa arsip bisa diterima.

## Panel VS Code atau terminal

Saya bekerja utama lewat panel Claude Code di VS Code. Sebelum mengerjakan permintaan, nilai dulu
apakah tugas itu lebih cocok di Claude Code versi terminal. Kalau iya, JANGAN langsung kerjakan.
Beri tahu saya dulu dengan format:

> Saran: jalankan di terminal Claude. Alasan: [alasan singkat]. Prompt yang bisa ditempel: [prompt siap pakai]

Lebih cocok di terminal kalau:
- mengubah atau membuat banyak file sekaligus (lebih dari sekitar 8 file) yang tidak perlu dicek baris per baris
- butuh perintah panjang atau berulang (install, build, test berkali-kali)
- butuh fitur yang tidak tersedia di panel VS Code

Ingatkan saya: jangan menjalankan panel dan terminal Claude bersamaan di project yang sama.
