# Product

<!-- impeccable:product-schema 1 -->

Catatan: fakta produk Contract Management BBT, dibuat lewat `impeccable init` (19 Nov 2026) dari jawaban Hisyam,
`docs/KEBUTUHAN-WEBSITE.md`, dan `CLAUDE.md`. Aturan teknis dan visual tetap di `CLAUDE.md` dan `DESIGN.md`;
file ini hanya menyimpan kebenaran produk.

## Platform

web

## Users

- **Tim pengadaan** (pengguna utama): mencatat setiap PKS beserta adendumnya, memantau kontrak yang mendekati
  tanggal akhir, lalu memutuskan diperpanjang (adendum) atau ditandai selesai.
- **Kepala divisi umum**: memantau keseluruhan kontrak dan yang perlu ditindaklanjuti; memakai rekap jumlah,
  nilai, dan status untuk mengambil keputusan.
- **Admin (tim IT)**: semua hak pengguna, ditambah mengelola akun (tambah, nonaktifkan dengan alasan,
  hapus akun nonaktif, reset kata sandi) dan melihat riwayat perubahan.
- Semua pengguna boleh melihat, menambah, mengubah, dan menghapus semua kontrak. Tidak ada pembatasan per bagian.
- Situasi pakai: sebagian besar di **laptop atau PC kantor**; HP hanya sesekali untuk cek cepat (dikonfirmasi Hisyam).

## Product Purpose

Website internal Badan Bank Tanah untuk mencatat dan memantau kontrak (PKS) di satu tempat.
Sebelumnya kontrak dipantau lewat Excel; detail cara pencatatan lama belum diketahui lengkap (terbuka).

Berhasil kalau (semua dipilih Hisyam sebagai ukuran keberhasilan di mata atasan):
1. **Rekap cepat**: jumlah, nilai, dan status semua kontrak terlihat tanpa menyusun Excel.
2. **Dokumen satu tempat**: PKS dan semua adendum tersimpan bernomor dan mudah dicari.
3. **Tidak ada yang telat**: tidak ada kontrak yang lewat tanggal akhir tanpa keputusan (pengingat 3, 2, 1 bulan).
4. **Jejak perubahan jelas**: selalu tahu siapa mengubah apa dan kapan.

## Positioning

Pengganti rekap Excel yang bukan sekadar tabel: status dihitung otomatis dari tanggal akhir, pengingat bertahap
3, 2, 1 bulan kalender dikirim ke semua pengguna, perpanjangan dicatat sebagai adendum pada kontrak yang sama
(bukan kontrak baru) sehingga dokumen, tanggal akhir, dan pengingat berubah bersama, dan setiap perubahan tercatat.

## Operating Context

- Alur utama: Masuk → Beranda (kontrak yang perlu ditindaklanjuti, total dan rekap per status) → Kontrak
  (cari, filter, urutkan) → Detail → Ubah data, Catat adendum, atau Tandai selesai. Admin ditambah menu Admin.
- Dokumen nyata yang dikelola: PKS dan adendum (semua jenis file), BAST dan dokumen tambahan menyusul.
- Pengingat lewat notifikasi di website (lonceng) + Web Push + email (Gmail pribadi kalau diisi, kalau tidak email
  kantor; tanpa izin). Belum ada WhatsApp.
- Rekap bisa diunduh sebagai Excel (semua, satu, atau kontrak pilihan). Membuka dokumen lama menampilkan data
  kontrak saat dokumen itu berlaku di samping data terbaru (20 Nov 2026).
- Hasil kerja ditunjukkan ke atasan (Pak Wahyu, kepala divisi umum) dalam demo; flowchart POV Pengguna dan Admin
  ada di `~/Downloads/MAGANG/Flowchart_ContractManagement/Demo POV Pengguna dan Admin/`.
- Dikerjakan anak magang IT lalu diserahkan ke tim IT kantor: kode dan keputusan harus mudah dirawat orang lain.

## Capabilities and Constraints

- Ruang lingkup HANYA contract management. Tidak ada fitur General Affair. Alur persetujuan ditunda.
- Data diisi manual; tidak ada pembacaan isi PKS otomatis. Impor Excel menunggu template dari atasan.
- Kolom kontrak dikonfirmasi atasan; istilah di layar "Penyedia", bukan "Mitra".
- Status (Berjalan, Segera habis ≤ 90 hari, Sudah lewat, Selesai) dihitung, tidak diisi manual.
- Hapus kontrak permanen tanpa arsip, selalu dengan konfirmasi dan dicatat di riwayat.
- Akun tidak dihapus langsung: dinonaktifkan dulu dengan alasan; hanya akun nonaktif yang boleh dihapus.
- Lupa kata sandi tanpa reset otomatis: pengguna lewat admin; admin lewat admin lain atau tim IT di database.
- Saat ini purwarupa: data contoh di memori browser, backend (FastAPI + PostgreSQL, pola Sismon) belum dibuat.
- Terbuka (jangan dikunci): nama resmi aplikasi (sementara "Contract Management"), batas ukuran file,
  nama status untuk "Belum diproses" (sementara "Menunggu keputusan"), termin pembayaran,
  daftar alasan nonaktif akun, template Excel rekap.

## Brand Commitments

- Merek: Badan Bank Tanah. Logo BBT (`public/logo-bbt.png`) tidak boleh diwarnai ulang, diberi filter, dipotong,
  atau diubah bentuknya, dan tidak diletakkan langsung di atas latar navy.
- Semua teks di layar, istilah, dan komentar memakai Bahasa Indonesia yang sederhana dan sopan.
- Peran ditulis "Pengguna" dan "Admin".

## Evidence on Hand

- Kolom data, peran, dan aturan pengingat: `docs/KEBUTUHAN-WEBSITE.md` (dikonfirmasi atasan, 16 Nov 2026).
- Data contoh selalu fiktif dan berkata "Contoh". Isi PKS asli (nama penyedia, nomor, pasal) TIDAK boleh dipakai
  di data contoh, repo, screenshot, atau materi demo.
- Belum ada: data kontrak asli, template Excel rekap, testimoni pengguna, angka penggunaan. Jangan dikarang.

## Product Principles

1. **Yang perlu ditindaklanjuti selalu di depan.** Kontrak yang lewat dan segera habis lebih penting daripada
   kelengkapan tampilan.
2. **Satu kontrak, satu catatan utuh.** Perpanjangan, dokumen, dan perubahan melekat pada kontrak yang sama;
   tidak ada data ganda.
3. **Tidak ada yang hilang tanpa jejak.** Hapus, nonaktifkan, dan ubah selalu dengan konfirmasi dan tercatat.
4. **Sederhana untuk pegawai kantor.** Sedikit menu, istilah sehari-hari, satu tombol utama per layar.
5. **Mudah diserahkan.** Keputusan ditandai [DIKONFIRMASI], [ASUMSI], atau [TERBUKA] supaya tim IT bisa melanjutkan.

## Accessibility & Inclusion

- Kontras teks minimal 4,5:1; tepi kotak isian dan ikon minimal 3:1.
- Area sentuh minimal 44 px, fokus keyboard selalu terlihat, setiap isian punya label yang terlihat.
- Gerak otomatis menghormati mode kurangi gerak. Mozaik bergelombang terus tanpa sakelar (keputusan Hisyam 23 Nov 2026).
