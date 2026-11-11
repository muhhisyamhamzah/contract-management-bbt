# Contract Management BBT

Aplikasi HP untuk mencatat dan memantau kontrak di Badan Bank Tanah. Dikerjakan anak magang IT, lalu diserahkan ke tim IT kantor. Kode harus mudah dibaca dan dirawat orang lain.

## Ruang lingkup

- HANYA contract management. Jangan menambah fitur General Affair (kendaraan, ruang meeting, ATK, inventaris).
- Fokus fase ini: pencatatan kontrak, dokumen, pengingat jatuh tempo, dan pemantauan status.
- Menu workflow (alur persetujuan kontrak) DITUNDA atas arahan atasan. Jangan dibuat. Tapi jaga struktur data supaya status kontrak bisa ditambah nanti.
- Belum ada backend. Pakai data contoh di `src/data/`. Nama mitra selalu berisi kata "Contoh", jangan pakai data asli.

## Stack

- React + Vite + TypeScript
- Tailwind CSS v4 lewat `@tailwindcss/vite` (tanpa `tailwind.config`)
- `react-router-dom` untuk perpindahan halaman
- Rencana: dijadikan PWA nanti. Belum dikerjakan.
- Jangan menambah library baru tanpa bertanya dulu.

## Tampilan

- Mobile-first. Ukuran acuan 390 x 844 (layar HP). Tetap rapi di layar lebih lebar dengan membatasi lebar konten di tengah.
- Font: Plus Jakarta Sans (sudah dimuat di `index.html`).
- Palet warna sudah didaftarkan di `src/index.css` lewat `@theme`. Pakai class Tailwind dari token itu, JANGAN menulis kode hex di komponen:
  - `galaxy-900`, `galaxy-700`: gradasi header dan kartu utama
  - `judul`: judul dan teks tebal
  - `aksi`: tombol utama
  - `aksen`, `lembut`: sorotan ringan, menu aktif
  - `latar`: latar halaman; `garis`: border
  - `teks`, `teks-lembut`: teks biasa dan teks keterangan
  - `berjalan`, `segera`, `lewat`, `selesai`: warna status
  - `hapus`: HANYA untuk aksi menghapus
- Logo Badan Bank Tanah berwarna hijau dan kuning. Selalu taruh di atas panel putih, jangan langsung di atas latar biru gelap.

## Status kontrak

Dihitung dari tanggal berakhir, bukan diisi manual:

- `berjalan`: berakhir lebih dari 30 hari lagi. Label "Berjalan".
- `segera`: berakhir dalam 30 hari. Label "Segera habis".
- `lewat`: tanggal berakhir sudah lewat, belum ditutup. Label "Sudah lewat".
- `selesai`: ditandai selesai oleh admin. Label "Selesai".

Batas 30 hari harus berupa satu konstanta di `src/lib/status.ts`, bukan angka yang tersebar.

## Halaman

Navigasi bawah berisi 5 item: Beranda, Kontrak, tombol + (tambah kontrak), Pengingat, Profil.

1. **Beranda**: sapaan, kartu "X kontrak butuh tindakan", 4 kotak status yang bisa diklik (membuka daftar dengan filter itu), deretan "Segera habis" yang bisa digeser ke samping, dan total nilai kontrak berjalan.
2. **Kontrak**: pencarian (judul, nomor, mitra), chip filter status, dropdown urutan (paling cepat habis, nilai terbesar, nama A-Z), daftar kartu kontrak. Ada tampilan kosong kalau tidak ada hasil.
3. **Pengingat**: dua kelompok, "Sudah lewat" dan "Habis dalam 30 hari".
4. **Detail kontrak**: header dengan lingkaran hitung mundur sisa hari, garis masa kontrak (mulai sampai berakhir), tab Ringkasan / Dokumen / Riwayat, tombol bawah "Tandai selesai" dan "Perpanjang", menu titik tiga (edit, unduh dokumen, hapus dengan konfirmasi).
5. **Tambah kontrak**: form 3 langkah (info kontrak; nilai dan waktu; dokumen dan pengingat), tombol Kembali dan Lanjut, validasi di tiap langkah, ringkasan sebelum simpan.
6. **Profil**: belum masuk MVP. Cukup halaman sederhana.

## Struktur folder

```
src/
  pages/        Beranda, Kontrak, Pengingat, DetailKontrak, FormKontrak, Profil
  components/   NavBawah, KartuKontrak, BadgeStatus, CincinHari, Toast, dll
  data/         kontrakContoh.ts
  lib/          status.ts (hitung status, label, warna), format.ts (rupiah, tanggal)
  types/        kontrak.ts
```

## Model data (sementara, belum final)

```ts
type Kontrak = {
  id: string
  nomor: string
  judul: string
  jenis: 'PKS' | 'SPK' | 'Lainnya'
  mitra: string
  unitPemilik: string
  nilai: number            // rupiah, angka bulat
  tanggalMulai: string     // format YYYY-MM-DD
  tanggalBerakhir: string  // format YYYY-MM-DD
  ditandaiSelesai: boolean
  pengingatHari: 30 | 60 | 90
}
```

Field ini masih menunggu hasil wawancara dengan kepala divisi. Simpan semua definisi tipe di satu tempat supaya mudah diubah.

## Aturan kerja

- Teks di layar, nama komponen, dan komentar memakai Bahasa Indonesia.
- Komponen kecil dan bisa dipakai ulang. Satu komponen satu file.
- Aksesibilitas: pakai `<button>` dan `<a>` asli, bukan `div` yang diberi `onClick`. Area sentuh minimal 44px. Ikon tanpa teks wajib punya `aria-label`.
- Format rupiah dan tanggal Indonesia lewat fungsi di `src/lib/format.ts`.
- Jangan commit file `.env` atau folder `node_modules`.
- Jangan menjalankan `npm audit fix --force`.
- Kerja di branch fitur, bukan langsung di `main`. Commit kecil dengan pesan yang jelas.
- Kerjakan satu bagian per permintaan, lalu jelaskan file apa yang dibuat atau diubah dan alasannya.

## Masih menunggu konfirmasi

- Jenis kontrak final (sementara PKS, SPK, Lainnya).
- Pilihan waktu pengingat (sementara 30/60/90 hari) dan kanalnya (notifikasi HP atau email).
- Daftar field final dan hak akses per peran.

## Panel VS Code atau terminal

Saya bekerja utama lewat panel Claude Code di VS Code. Sebelum mengerjakan permintaan, nilai dulu apakah tugas itu lebih cocok dijalankan di Claude Code versi terminal. Kalau iya, JANGAN langsung kerjakan. Beri tahu saya dulu dengan format:

> Saran: jalankan di terminal Claude. Alasan: [alasan singkat]. Prompt yang bisa ditempel: [prompt siap pakai]

Tugas dianggap lebih cocok di terminal kalau:
- mengubah atau membuat banyak file sekaligus (lebih dari sekitar 8 file) yang tidak perlu dicek baris per baris
- butuh menjalankan perintah panjang atau berulang (install, build, test berkali-kali)
- butuh fitur atau perintah yang tidak tersedia di panel VS Code

Selain itu, kerjakan di panel seperti biasa.

Ingatkan saya juga: jangan menjalankan panel dan terminal Claude bersamaan di project yang sama.