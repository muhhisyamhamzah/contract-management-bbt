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

## Acuan desain

- Tampilan dan interaksi mengikuti `docs/prototipe-referensi.html` semirip mungkin: tata letak, jarak, ukuran huruf, sudut membulat, warna, teks, dan interaksi.
- Cara membaca file itu: markup ada di dalam `<x-dc>`, logika dan data contoh di `class Component` di bagian bawah. `{{nama}}` adalah nilai dari `renderVals()`, `<sc-if>` adalah kondisi, `<sc-for>` adalah perulangan.
- JANGAN tiru bingkai HP (bezel hitam, notch, garis home). Aplikasinya hanya isi layar, lebar maksimal 430px di tengah layar.
- Logo di referensi memakai alamat `/_blob/...`; di aplikasi pakai `/logo-bbt.png`.
- Yang sengaja berbeda dari referensi: status, sisa hari, dan progres DIHITUNG dari tanggal (bukan angka tetap); tanggal data contoh relatif terhadap hari ini; perpindahan layar memakai `react-router-dom`.

## Tampilan

- Mobile-first. Ukuran acuan 390 x 844 (layar HP), lebar maksimal 430px di tengah layar.
- Jarak atas header (56px) dan bawah navigasi (20px) adalah ruang status bar dan garis home HP. Pakai `max(..., env(safe-area-inset-*))` supaya ikut membesar di HP yang butuh ruang lebih.
- Font: Plus Jakarta Sans (sudah dimuat di `index.html`). Ukuran huruf dasar 14px.
- Palet warna dan bayangan didaftarkan di `src/index.css` lewat `@theme`. Pakai class Tailwind dari token itu, JANGAN menulis kode hex di komponen. Warna yang dipakai referensi tapi belum ada di `@theme` ditambahkan sebagai token baru dengan nama yang jelas, bukan ditulis langsung.
  - `galaxy-900`, `galaxy-700`: gradasi header dan kartu utama
  - `judul`: judul dan teks tebal
  - `aksi`: tombol utama; `aksi-tua`: teks di kotak ungu muda; `aksi-ungu`: ujung gradasi tombol +
  - `aksen`, `lembut`: sorotan ringan, menu aktif
  - `latar`: latar halaman; `latar-tab`: latar tab
  - `garis`: border; `garis-input`: border isian form; `garis-lembut`: pembatas baris dan latar progress bar
  - `teks`, `teks-lembut`: teks biasa dan teks keterangan; `teks-header`: teks redup di header biru
  - `berjalan`, `segera`, `lewat`, `selesai`: warna pekat status (progress bar, titik)
  - `<status>-latar` dan `<status>-teks` (misalnya `segera-latar`, `segera-teks`): badge dan ikon status. Jangan pakai opacity seperti `bg-segera/15`.
  - `cincin-berjalan`, `cincin-segera`, `cincin-lewat`: cincin hitung mundur dan garis masa di header Detail
  - `lewat-kartu`, `lewat-garis-kartu`: kartu "Sudah lewat" di Pengingat
  - `hapus`, `hapus-latar`, `hapus-teks`: HANYA untuk aksi menghapus dan pesan kesalahan
  - Bayangan: `shadow-kartu`, `shadow-menu`, `shadow-menu-tebal`, `shadow-tab`, `shadow-toast`, `shadow-tombol-tambah`
- Label, ikon, dan class warna tiap status diambil dari `TAMPILAN_STATUS` di `src/lib/status.ts`, jangan ditulis ulang di komponen.
- Logo Badan Bank Tanah berwarna hijau dan kuning. Selalu taruh di atas panel putih, jangan langsung di atas latar biru gelap.

## Status kontrak

Dihitung dari tanggal berakhir, bukan diisi manual:

- `berjalan`: berakhir lebih dari 30 hari lagi. Label "Berjalan".
- `segera`: berakhir dalam 30 hari. Label "Segera habis".
- `lewat`: tanggal berakhir sudah lewat, belum ditutup. Label "Sudah lewat".
- `selesai`: ditandai selesai oleh admin. Label "Selesai".

Batas 30 hari harus berupa satu konstanta di `src/lib/status.ts`, bukan angka yang tersebar.

## Halaman

Navigasi bawah berisi 5 item: Beranda, Kontrak, tombol + (tambah kontrak), Pengingat, Profil. Navigasi bawah hanya tampil di Beranda, Kontrak, dan Pengingat. Profil belum masuk MVP: tombolnya hanya memunculkan toast "Halaman profil belum masuk desain MVP", tidak ada halaman Profil.

Tombol Kembali di Detail dan Batal di form mengikuti riwayat browser. Kalau halaman dibuka langsung lewat alamat (riwayat kosong), cadangannya ke `/kontrak` (Detail) dan `/` (form). Pakai `useKembali` di `src/lib/navigasi.ts`.

1. **Beranda**: sapaan, kartu "X kontrak butuh tindakan", 4 kotak status yang bisa diklik (membuka daftar dengan filter itu), deretan "Segera habis" yang bisa digeser ke samping, dan total nilai kontrak berjalan.
2. **Kontrak**: pencarian (judul, nomor, mitra), chip filter status, dropdown urutan (paling cepat habis, nilai terbesar, nama A-Z), daftar kartu kontrak. Ada tampilan kosong kalau tidak ada hasil.
3. **Pengingat**: dua kelompok, "Sudah lewat" dan "Habis dalam 30 hari".
4. **Detail kontrak**: header dengan lingkaran hitung mundur sisa hari, garis masa kontrak (mulai sampai berakhir), tab Ringkasan / Dokumen / Riwayat, tombol bawah "Tandai selesai" dan "Perpanjang", menu titik tiga (edit, unduh dokumen, hapus dengan konfirmasi).
5. **Tambah kontrak**: form 3 langkah (info kontrak; nilai dan waktu; dokumen dan pengingat), tombol Kembali dan Lanjut, validasi di tiap langkah, ringkasan sebelum simpan.
6. **Profil**: belum masuk MVP. Tidak ada halaman, hanya toast dari tombol Profil di navigasi bawah.

## Struktur folder

```
src/
  pages/        Beranda, Kontrak, Pengingat, DetailKontrak, FormKontrak
  components/   NavBawah, TataLetakHP, TataLetakUtama, Ikon, KartuKontrak, BadgeStatus, CincinHari, Toast, dll
  data/         kontrakContoh.ts
  lib/          status.ts (hitung status, label, warna), format.ts (rupiah, tanggal), navigasi.ts (tombol kembali)
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