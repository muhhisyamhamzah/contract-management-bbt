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
- Halaman Profil diganti menu akun di navigasi atas.
- Hapus kontrak langsung permanen, tanpa arsip. Penghapusan tetap dicatat di riwayat perubahan.
- Logo BBT menjadi merek utama di navigasi atas (menggantikan ikon dokumen emas di desain v4). Layar pembuka dihapus.
- Arah visual "Kavling" dipilih (Hisyam, 17 Nov 2026), dari referensi gaya Hisyam. Acuan: `DESIGN.md` dan
  `design-system/contract-management-bbt/MASTER.md`. Mockup: `mockup/arah-4-kavling.html` (arah 1–3 hanya pembanding).
- Font: Public Sans (isi dan judul) + Source Serif 4 miring untuk SATU kata penekanan per judul.
  Menggantikan Plus Jakarta Sans.

## Ruang lingkup

- HANYA contract management. Jangan menambah fitur General Affair (kendaraan, ruang meeting, ATK, inventaris).
- Alur persetujuan (workflow) DITUNDA. Jangan dibuat, tapi jaga struktur status supaya bisa ditambah nanti.
- Data diisi manual. Tidak ada fitur membaca PDF otomatis.
- Data contoh selalu fiktif dan memakai kata "Contoh". JANGAN memakai isi PKS asli
  (nama penyedia, nomor, pasal) di data contoh, repo, atau screenshot.

## Pengguna dan hak akses

- Dua peran: `pengguna` dan `admin`.
- `pengguna` (tim pengadaan, kepala divisi umum): melihat, menambah, mengubah, menghapus SEMUA kontrak,
  dan menerima pengingat. Tidak ada pembatasan per bagian.
- `admin` (tim IT): semua hak pengguna, ditambah kelola akun (tambah, nonaktifkan, reset kata sandi)
  dan melihat riwayat perubahan.
- Login wajib: email kantor + kata sandi, dengan pembatasan percobaan masuk (pola Sismon).
  Tidak ada "lupa kata sandi" otomatis: admin membuat kata sandi sementara.

## Stack

- Frontend: React + Vite + TypeScript, Tailwind CSS v4 lewat `@tailwindcss/vite` (tanpa `tailwind.config`),
  `react-router-dom`.
- Backend (belum dibuat, pola Sismon): FastAPI + SQLAlchemy + Alembic + PostgreSQL (Neon).
- File PDF: Cloudflare R2, akses lewat tautan bertanda tangan.
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
- Mozaik kavling (kotak warna BBT yang memudar ke putih) dan judul besar rata tengah HANYA di Beranda dan Masuk.
  Halaman kerja memakai judul rata kiri dan panel padat.
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
  - `galaxy-900`, `galaxy-700`: navy tua dan navy (tombol utama, judul, mozaik)
  - `judul`, `teks`, `teks-lembut`: warna teks
  - `aksi`, `aksi-tua`: tombol, tautan, menu aktif
  - `lembut`, `latar`: sorotan dan latar; `mozaik-biru`: HANYA warna tengah mozaik
  - `garis`: pembatas dekoratif; `garis-input`: tepi kotak isian (minimal 3:1 terhadap latarnya); `garis-lembut`: pembatas baris
  - `logo-hijau`, `logo-emas`, `logo-tanah`: HANYA aksen kecil
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
| Nilai kontrak | wajib, rupiah angka bulat. [ASUMSI] nominal = nilai |
| Critical point | 0 sampai banyak butir, lihat di bawah |
| Monitoring, Catatan, Keterangan | teks. [TERBUKA] artinya belum jelas, jangan diberi aturan khusus |

- Tidak ada kolom Jenis kontrak, Unit pemilik, atau pilihan pengingat per kontrak.
- [TERBUKA] Termin pembayaran: tunggu arti kolom Monitoring dari atasan. Jangan ditambah ke tipe atau form baru.
- Setiap kontrak wajib punya file PDF PKS. Dokumen tambahan (adendum, BAST) boleh menyusul.
  [ASUMSI] Hanya PDF, maksimal 10 MB per file.
- Critical point = klausul berisiko di PKS (terutama pengakhiran kontrak dan denda). Tiap butir:
  jenis (Pengakhiran kontrak / Denda / Lainnya), rujukan pasal, ringkasan, tanggal penting (opsional),
  status (Aktif / Selesai), keterangan penanganan saat ditandai selesai.
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
- [ASUMSI] Pengingat critical point hanya untuk butir yang punya tanggal penting, dengan jadwal yang sama.
- Kanal: notifikasi di dalam website + Web Push. Belum ada email atau WhatsApp.

## Hapus dan riwayat

- Hapus kontrak langsung permanen (tidak ada arsip), selalu dengan dialog konfirmasi yang
  menyebut nama kontrak dan bahwa tindakan ini tidak bisa dibatalkan.
- Setiap tambah, ubah, hapus, tandai selesai, unggah PDF, dan perubahan akun dicatat:
  siapa, kapan, apa yang berubah. Catatan penghapusan menyimpan nama dan nomor PKS kontrak yang dihapus.

## Halaman

Navigasi atas: logo BBT + nama aplikasi, Beranda, Kontrak, Pengingat (dengan jumlah),
Admin (hanya admin), lonceng notifikasi, dan menu akun.

1. **Masuk**: logo BBT, email kantor + kata sandi. Pesan gagal: akun tidak ditemukan/nonaktif,
   kata sandi salah, akun dikunci sementara.
2. **Beranda**: judul rata tengah, kotak cari pil, rekap jumlah per status berupa pil (tautan ke daftar terfilter),
   panel "Agenda kontrak" (sudah lewat + habis dalam 90 hari, dengan kotak kalender), tombol Tambah kontrak.
3. **Daftar kontrak**: cari (nama, penyedia, nomor PKS), filter status, urutkan. Ada tampilan daftar kosong
   dan hasil pencarian kosong.
4. **Detail kontrak**: data kontrak, critical point, dokumen PDF, jadwal pengingat, monitoring dan catatan,
   tombol Ubah dan Tandai selesai (dengan keterangan), menu hapus dengan konfirmasi.
5. **Tambah / ubah kontrak**: SATU halaman form, PDF wajib, ringkasan sebagai konfirmasi sebelum simpan.
6. **Pengingat**: sudah lewat, lalu habis dalam 90 hari.
7. **Admin** (hanya admin): akun pengguna dan riwayat perubahan. Kartu kata sandi sementara
   setelah membuat akun atau mereset sandi.

Menu akun (klik avatar di kanan atas): nama, email kantor, peran, dan tombol Keluar (dengan konfirmasi).
Tidak ada halaman Profil terpisah.

Keadaan yang wajib ada:
- Isian salah ditandai merah, dengan pesan per kolom yang menjelaskan cara memperbaiki
  (dihubungkan lewat `aria-describedby`, fokus pindah ke kolom pertama yang salah).
- Nomor PKS ganda ditolak. PDF ditolak kalau bukan PDF atau terlalu besar.
- Konfirmasi untuk: simpan, tandai selesai, hapus, nonaktifkan akun.
- Pesan berhasil sama dengan nama tombolnya ("Simpan kontrak" menghasilkan "Kontrak tersimpan").
- Panel notifikasi saat lonceng diklik.

## Struktur folder

```
src/
  pages/        satu file per halaman
  components/   satu komponen satu file
  data/         data contoh (fiktif, berkata "Contoh")
  lib/          status.ts (status, batas hari, tahap pengingat, warna), format.ts (rupiah, tanggal),
                daftarKontrak.ts (saring, urut), formKontrak.ts (validasi), navigasi.ts, toast.ts
  types/        kontrak.ts (semua tipe)
```

## Aturan kerja

- Teks di layar, nama komponen, dan komentar memakai Bahasa Indonesia.
- Komponen kecil dan bisa dipakai ulang. Satu komponen satu file.
- Aksesibilitas: pakai `<button>` dan `<a>` asli. Ikon tanpa teks wajib punya `aria-label`.
  Setiap kotak isian punya label yang terlihat.
- Format rupiah dan tanggal Indonesia lewat `src/lib/format.ts`.
- Kerja di branch fitur, bukan langsung di `main`. Commit kecil dengan pesan yang jelas.
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

- Batas ukuran PDF.
- Arti kolom Monitoring, Catatan, dan Keterangan (termasuk apakah termin pembayaran masuk Monitoring).
- Patokan tanggal pengingat critical point.
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
