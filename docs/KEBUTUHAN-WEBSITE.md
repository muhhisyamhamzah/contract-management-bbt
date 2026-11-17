# Kebutuhan Website Contract Management BBT

Ringkasan keputusan per 16 November 2026. File ini menggantikan arah "aplikasi HP" di `CLAUDE.md`.
Kalau ada yang bertentangan dengan `CLAUDE.md`, ikuti file ini dan usulkan perubahan `CLAUDE.md` ke Hisyam dulu.

Tanda di dokumen ini:
- **[DIKONFIRMASI]** sudah dijawab atasan (Pak Wahyu, kepala divisi umum)
- **[ASUMSI]** keputusan sementara tim, belum dikonfirmasi atasan
- **[TERBUKA]** belum diputuskan, jangan dikunci di kode

---

## 1. Status projek

- **[DIKONFIRMASI]** Projek disetujui. Bentuknya **website**, bukan aplikasi HP.
- **[DIKONFIRMASI]** Ruang lingkup tetap hanya contract management. Tidak ada fitur General Affair.
- **[DIKONFIRMASI]** Menu alur persetujuan (workflow) tetap ditunda. Struktur data tetap harus bisa menambah status nanti.
- **[ASUMSI]** Website tetap responsif: desktop untuk kerja di kantor, tampilan HP tetap bisa dipakai.
- Kode yang ada sekarang masih versi aplikasi HP (Beranda, Kontrak, Pengingat, Detail, Tambah, Profil). Gaya visualnya diteruskan, tata letaknya diubah jadi website.

## 2. Pengguna dan hak akses

- **[DIKONFIRMASI]** Pengguna: seluruh tim pengadaan dan kepala divisi umum.
- **[DIKONFIRMASI]** Semua pengguna boleh melihat, menambah, mengubah, dan menghapus **semua** kontrak. Tidak ada pembatasan per bagian.
- **[DIKONFIRMASI]** Semua pengguna menerima pengingat.
- **[DIKONFIRMASI]** Admin = tim IT. Admin mengelola akun (tambah, nonaktifkan, reset kata sandi), membantu kalau ada masalah, dan bisa melakukan semua yang dilakukan pengguna.
- Jadi cukup dua peran: `pengguna` dan `admin`.
- Tidak ada "lupa kata sandi" otomatis. Pengguna menghubungi admin IT, lalu admin membuat kata sandi sementara.
- Login wajib (email kantor + kata sandi) dengan pembatasan percobaan masuk, seperti di Sismon.

## 3. Data kontrak

Kolom dari atasan **[DIKONFIRMASI]**:

| Kolom | Catatan |
|---|---|
| No | Nomor urut tampilan, tidak disimpan |
| Nama kontrak | wajib |
| Penyedia | wajib. Ganti istilah "Mitra" jadi "Penyedia" di seluruh UI |
| Nomor PKS | wajib, unik. Sistem menolak nomor ganda |
| Tanggal PKS | wajib |
| Awal kontrak | wajib |
| Akhir kontrak | wajib, harus setelah awal kontrak |
| Periode kontrak | **[ASUMSI]** dihitung otomatis dari awal dan akhir, tidak diisi manual |
| Nilai kontrak | wajib. **[ASUMSI]** "nominal kontrak" dan "nilai kontrak" dianggap sama, jadi satu kolom |
| Critical point | lihat bagian 4 |
| Monitoring | teks. **[TERBUKA]** isinya progres pekerjaan atau status pembayaran |
| Catatan | teks |
| Keterangan | teks. **[TERBUKA]** beda catatan dan keterangan belum jelas |

- **[DIKONFIRMASI]** Data diisi **manual**. Fitur membaca PDF otomatis tidak dibuat.
- **[DIKONFIRMASI]** Setiap kontrak wajib punya **file PDF PKS** sebagai bukti. Dokumen tambahan (adendum, BAST) boleh diunggah kemudian.
- **[ASUMSI]** Hanya PDF, maksimal 10 MB per file. File disimpan seperti foto di Sismon (Cloudflare R2), dengan tautan bertanda tangan.
- **[ASUMSI]** Impor dari Excel rekap lama layak dibuat untuk memindahkan data awal. Minta template Excel ke atasan dulu.
- Data contoh tetap fiktif dengan kata "Contoh". **Jangan** memakai isi PKS asli (nama penyedia, nomor, pasal) di data contoh, repo, atau screenshot.

## 4. Critical point

- **[DIKONFIRMASI]** Critical point = klausul berisiko di PKS, terutama **pengakhiran kontrak** (cara kontrak bisa diakhiri) dan **denda**. Atasan selalu menekankan bagian ini.
- **[DIKONFIRMASI]** Jumlah per kontrak "tergantung", jadi bisa 0, 1, atau lebih.
- **[DIKONFIRMASI]** Critical point punya pengingat.
- **[DIKONFIRMASI]** Critical point bisa ditandai selesai.
- Bentuk data yang diusulkan: setiap butir berisi jenis (Pengakhiran kontrak / Denda / Lainnya), rujukan pasal, ringkasan singkat yang ditulis pengguna, tanggal penting (opsional), status (Aktif / Selesai), dan keterangan penanganan saat ditandai selesai.
- **[ASUMSI]** Pengingat critical point hanya untuk butir yang punya tanggal penting, dengan jadwal yang sama seperti kontrak (3, 2, 1 bulan sebelumnya). Klausul tanpa tanggal hanya tampil sebagai informasi.
- Contoh tanggal penting: batas serah terima pekerjaan (denda keterlambatan mulai berlaku).

## 5. Status dan pengingat

- Status dihitung dari tanggal akhir, tidak diisi manual:
  - `berjalan`: berakhir lebih dari 90 hari lagi
  - `segera`: berakhir dalam 90 hari ("Segera habis")
  - `lewat`: tanggal akhir sudah lewat, belum ditutup
  - `selesai`: ditandai selesai oleh pengguna
- **[DIKONFIRMASI]** Batas "segera habis" berubah dari 30 hari menjadi **90 hari** (konstanta tunggal di `src/lib/status.ts`).
- **[DIKONFIRMASI]** Pengingat bertahap: **3 bulan, 2 bulan, lalu 1 bulan** sebelum kontrak habis, dikirim ke seluruh tim pengadaan dan kepala divisi umum.
- Setiap tahap pengingat hanya dikirim sekali per kontrak. Catat pengingat yang sudah terkirim supaya tidak berulang tiap hari.
- Kanal: notifikasi di dalam website + push notification (pola Sismon). Belum perlu email atau WhatsApp.
- Pengingat berhenti kalau kontrak ditandai selesai atau dihapus.

## 6. Hapus, arsip, dan riwayat

- **[ASUMSI / USULAN, belum disetujui atasan]** Hapus kontrak tidak langsung permanen. Kontrak masuk **Arsip** dan bisa dipulihkan admin IT.
- Setiap tambah, ubah, hapus, tandai selesai, unggah PDF, dan perubahan akun dicatat di **riwayat perubahan**: siapa, kapan, apa yang berubah. Alasannya: semua pengguna boleh menghapus, jadi admin harus bisa melacak.

## 7. Halaman website

Halaman inti:
1. Masuk (login)
2. Beranda: kontrak yang perlu perhatian (sudah lewat + habis dalam 3 bulan), ringkasan jumlah per status
3. Daftar kontrak: cari (nama, penyedia, nomor PKS), filter status, urutkan
4. Detail kontrak: data kontrak, critical point, dokumen PDF, jadwal pengingat, monitoring dan catatan, tombol Ubah dan Tandai selesai, menu hapus
5. Tambah / ubah kontrak: satu halaman form, PDF wajib, ringkasan muncul sebagai konfirmasi sebelum simpan
6. Pengingat: sudah lewat, lalu habis dalam 3 bulan
7. Admin (hanya admin IT): akun pengguna, arsip kontrak, riwayat perubahan

Keadaan yang wajib ada (hasil pencocokan dengan flowchart):
- Pesan login gagal: akun tidak ditemukan/nonaktif, kata sandi salah, akun dikunci sementara
- Isian salah ditandai merah, dengan pesan yang menjelaskan cara memperbaiki
- Nomor PKS ganda ditolak
- PDF ditolak (bukan PDF atau terlalu besar)
- Konfirmasi: simpan, tandai selesai (dengan keterangan), hapus, nonaktifkan akun
- Pesan berhasil yang konsisten dengan nama tombol ("Simpan kontrak" menghasilkan "Kontrak tersimpan")
- Daftar kosong dan hasil pencarian kosong
- Panel notifikasi saat lonceng diklik
- Kartu kata sandi sementara setelah admin membuat akun atau mereset sandi
- Menu akun dengan tombol Keluar

## 8. Arah desain

- Acuan visual: `~/Downloads/MAGANG/figma_contract_management/versi_4_sederhana_bercorak/png/`
- Versi lain (untuk perbandingan, bukan acuan): `versi_1_sidebar`, `versi_2_navigasi_atas`, `versi_3_sederhana`
- Flowchart acuan alur: `~/Downloads/MAGANG/Flowchart_ContractManagement/` (Flowchart 0–7, PNG + .drawio)
- Pertahankan: palet navy dan emas dari `src/index.css`, header navy bergelombang, kotak kalender untuk tanggal berakhir, ikon garis dari `src/components/Ikon.tsx`, satu tombol utama per layar, tidak ada sidebar (supaya berbeda dari Sismon).
- **[TERBUKA]** Usulan perbaikan visual yang belum diputuskan Hisyam:
  1. Beranda dibuka dengan kontrak yang paling cepat habis (kalender besar), bukan tiga kartu angka
  2. Kotak kalender jadi ciri utama, ikon bergradasi dikurangi
  3. Daftar tanpa bungkus kartu, cukup garis pemisah dan judul kelompok biasa
  4. Tanpa label huruf kapital semua dan tanpa pemisah titik tengah
  5. Header gelombang penuh hanya di Beranda, halaman lain lebih tipis
- Pakai `border`, bukan `ring`, untuk garis tepi.
- **[TERBUKA]** Nama resmi aplikasi. Sementara "Contract Management".

## 9. Teknologi

Mengikuti pola Sismon supaya bisa dirawat tim IT BBT:
- Frontend: React + Vite + TypeScript + Tailwind v4 (sudah ada)
- Backend: FastAPI + SQLAlchemy + Alembic + PostgreSQL (Neon)
- File PDF: Cloudflare R2, akses lewat tautan bertanda tangan
- Login: JWT + pembatasan percobaan masuk
- Notifikasi: di dalam website + Web Push
- Riwayat perubahan: tabel log audit
- Jangan menambah library baru tanpa bertanya.

## 10. Aturan kerja

- Jangan commit atau push tanpa izin Hisyam.
- Jangan menjalankan Claude Code di terminal dan di panel pada projek yang sama secara bersamaan.
- Kerjakan bertahap dan laporkan tiap tahap.
- Tandai jelas mana yang asumsi dan mana yang sudah dikonfirmasi.

## 11. Urutan kerja berikutnya

1. Hisyam memutuskan usulan visual (bagian 8) dan memilih versi desain bersama atasan.
2. Perbarui `CLAUDE.md` mengikuti file ini (minta persetujuan Hisyam dulu).
3. Ubah tipe data dan data contoh (`src/types/kontrak.ts`, `src/data/`) sesuai bagian 3–4.
4. Ubah tata letak dari aplikasi HP menjadi website responsif, halaman demi halaman.
5. Siapkan backend mengikuti pola Sismon.
6. Audit UI (kontras, keyboard, label form) setelah versi website jalan.

## 12. Pertanyaan yang masih harus ditanyakan ke atasan

- Batas ukuran PDF, dan apakah hapus kontrak masuk arsip dulu.
- Arti kolom monitoring, catatan, dan keterangan.
- Patokan tanggal pengingat critical point.
- Contoh template Excel rekap kontrak yang sekarang dipakai.
- Nama resmi aplikasi.
