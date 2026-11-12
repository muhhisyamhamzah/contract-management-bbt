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

- **Gaya visual (warna, bentuk, ikon) mengikuti Beranda yang sudah jadi** (`src/pages/Beranda.tsx`): navy dan emas, header navy bergelombang, kotak putih bersudut 16px dengan `shadow-kotak`, ikon di kotak bergradasi warna logo, huruf semibold (bukan extrabold), kotak kalender untuk tanggal. Halaman lain (Kontrak, Pengingat, Detail, Tambah) disesuaikan dengan gaya ini.
- **Isi, tata letak dasar, teks, dan interaksi** halaman lain tetap mengacu ke `docs/prototipe-referensi.html` (filter chip, pencarian, dropdown urutan, menu titik tiga, tab, form bertahap, toast, dll), tapi warnanya diganti ke palet navy dan emas.
- Warna utama sengaja navy, BUKAN hijau atau teal, supaya berbeda dari aplikasi Sismon. Warna logo (hijau, emas, oranye tanah) hanya untuk aksen kecil seperti ikon status.
- Cara membaca file itu: markup ada di dalam `<x-dc>`, logika dan data contoh di `class Component` di bagian bawah. `{{nama}}` adalah nilai dari `renderVals()`, `<sc-if>` adalah kondisi, `<sc-for>` adalah perulangan.
- JANGAN tiru bingkai HP (bezel hitam, notch, garis home). Aplikasinya hanya isi layar, lebar maksimal 430px di tengah layar.
- Logo di referensi memakai alamat `/_blob/...`; di aplikasi pakai `/logo-bbt.png`.
- Yang sengaja berbeda dari referensi: status, sisa hari, dan progres DIHITUNG dari tanggal (bukan angka tetap); tanggal data contoh relatif terhadap hari ini; perpindahan layar memakai `react-router-dom`.

## Tampilan

- Mobile-first. Ukuran acuan 390 x 844 (layar HP), lebar maksimal 430px di tengah layar.
- Jarak atas header (56px) dan bawah navigasi (16px) adalah ruang status bar dan garis home HP. Pakai `max(..., env(safe-area-inset-*))` supaya ikut membesar di HP yang butuh ruang lebih.
- Font: Plus Jakarta Sans (sudah dimuat di `index.html`). Ukuran huruf dasar 14px.
- Ukuran huruf ditulis dalam piksel, misalnya `text-[12px]`, `text-[16px]`, sesuai angka di referensi. JANGAN pakai `text-xs`, `text-sm`, `text-lg`, dan sejenisnya, karena class itu ikut mengubah jarak baris. Jarak baris dasar sengaja `normal` (diatur di `src/index.css`), sama dengan referensi.
- Judul `h1` sampai `h3` sudah tebal (700) dari `src/index.css`. Tambahkan `font-extrabold` kalau referensi memakai 800.
- Palet warna dan bayangan didaftarkan di `src/index.css` lewat `@theme`. Pakai class Tailwind dari token itu, JANGAN menulis kode hex di komponen. Warna baru ditambahkan sebagai token dengan nama yang jelas, bukan ditulis langsung.
  - `galaxy-900` (navy tua), `galaxy-700` (navy): gradasi header, tombol +, kotak ikon navy
  - `judul`: judul dan teks tebal
  - `aksi`: tombol utama, tautan, menu aktif (navy); `aksi-tua`: navy tua untuk teks di kotak biru muda
  - `logo-hijau`, `logo-emas`, `logo-tanah`: warna logo BBT, HANYA untuk aksen kecil (gradasi ikon status, pita kalender, lingkaran profil)
  - `aksen`, `lembut`: sorotan ringan, menu aktif
  - `latar`: latar halaman; `latar-tab`: latar tab
  - `garis`: border; `garis-input`: border isian form; `garis-lembut`: pembatas baris dan latar progress bar
  - `teks`, `teks-lembut`: teks biasa dan teks keterangan; `teks-header`: teks redup di header biru
  - `berjalan`, `segera`, `lewat`, `selesai`: warna pekat status (progress bar, titik)
  - `<status>-latar` dan `<status>-teks` (misalnya `segera-latar`, `segera-teks`): badge dan ikon status. Jangan pakai opacity seperti `bg-segera/15`.
  - `cincin-berjalan`, `cincin-segera`, `cincin-lewat`: cincin hitung mundur dan garis masa di header Detail
  - `lewat-kartu`, `lewat-garis-kartu`: kartu "Sudah lewat" di Pengingat
  - `hapus`, `hapus-latar`, `hapus-teks`: HANYA untuk aksi menghapus dan pesan kesalahan
  - Bayangan: `shadow-kotak` (kotak dan kartu putih gaya baru), `shadow-kartu`, `shadow-menu`, `shadow-menu-tebal`, `shadow-tab`, `shadow-toast`, `shadow-tombol-tambah`
  - Animasi: `animate-meletup` untuk ikon yang muncul. Selalu pakai `motion-safe:` dan beri `motion-reduce:transition-none` pada efek gerak, supaya pengguna yang mematikan animasi tidak terganggu.
- Label, ikon, dan class warna tiap status (termasuk `kelasIkonGradasi` dan `kelasHiasan`) diambil dari `TAMPILAN_STATUS` di `src/lib/status.ts`, jangan ditulis ulang di komponen.
- Ikon: pakai ikon garis di `src/components/Ikon.tsx`. Ikon 3D atau gambar ikon dari luar sudah dicoba dan DITOLAK, jangan dipakai.
- Logo Badan Bank Tanah (`/logo-bbt.png`, hijau dan kuning) HANYA tampil di layar pembuka (`src/components/LayarPembuka.tsx`) dengan latar putih, saat aplikasi pertama dibuka. Di dalam aplikasi (Beranda dan halaman lain) tidak ada logo.

## Status kontrak

Dihitung dari tanggal berakhir, bukan diisi manual:

- `berjalan`: berakhir lebih dari 30 hari lagi. Label "Berjalan".
- `segera`: berakhir dalam 30 hari. Label "Segera habis".
- `lewat`: tanggal berakhir sudah lewat, belum ditutup. Label "Sudah lewat".
- `selesai`: ditandai selesai oleh admin. Label "Selesai".

Batas 30 hari harus berupa satu konstanta di `src/lib/status.ts`, bukan angka yang tersebar.

## Halaman

Navigasi bawah berisi 5 item: Beranda, Kontrak, tombol + (tambah kontrak), Pengingat, Profil. Navigasi bawah tampil di Beranda, Kontrak, Pengingat, dan Profil.

Tombol Kembali di Detail dan Batal di form mengikuti riwayat browser. Kalau halaman dibuka langsung lewat alamat (riwayat kosong), cadangannya ke `/kontrak` (Detail) dan `/` (form). Pakai `useKembali` di `src/lib/navigasi.ts`.

1. **Beranda** (SUDAH JADI, jadi acuan gaya): header navy bergelombang (judul aplikasi, sapaan, tanggal, lonceng dengan jumlah, lingkaran profil yang memunculkan toast), kotak pencarian yang membuka daftar Kontrak, "Ringkasan kontrak" 6 kotak (4 status yang membuka daftar dengan filter itu, Tambah, Pengingat), daftar "Segera habis" ke bawah dengan kotak kalender, dan total nilai kontrak yang belum selesai.
2. **Kontrak**: pencarian (judul, nomor, mitra), chip filter status, dropdown urutan (paling cepat habis, nilai terbesar, nama A-Z), daftar kartu kontrak. Ada tampilan kosong kalau tidak ada hasil.
3. **Pengingat**: dua kelompok, "Sudah lewat" dan "Habis dalam 30 hari".
4. **Detail kontrak**: header dengan lingkaran hitung mundur sisa hari, garis masa kontrak (mulai sampai berakhir), tab Ringkasan / Dokumen / Riwayat, tombol bawah "Tandai selesai" dan "Perpanjang", menu titik tiga (edit, unduh dokumen, hapus dengan konfirmasi).
5. **Tambah kontrak**: form 3 langkah (info kontrak; nilai dan waktu; dokumen dan pengingat), tombol Kembali dan Lanjut, validasi di tiap langkah, ringkasan sebelum simpan.
6. **Profil** (`/profil`, juga dibuka dari lingkaran inisial di Beranda): identitas admin, ringkasan kerja (tercatat, butuh tindakan, selesai), info akun, pengaturan pengingat, bantuan, tentang aplikasi, dan Keluar dengan konfirmasi. Belum ada login: data akun memakai teks pengganti seperti "[Nama admin]", dan tombol yang belum berfungsi memunculkan toast bertanda "(contoh)". Jangan menambah menu General Affair di sini.

## Struktur folder

```
src/
  pages/        Beranda, Kontrak, Pengingat, DetailKontrak, FormKontrak, Profil
  components/   Satu komponen satu file: NavBawah, MenuNav, TataLetakHP, TataLetakUtama, LayarPembuka, HeaderGelombang, Ikon, Kotak*/Kartu*/Baris* (tampilan daftar), BadgeStatus, CincinHari, MenuDropdown, DialogKonfirmasi, Toast, Langkah* (form), dll
  data/         kontrakContoh.ts, rincianContoh.ts (termin, dokumen, riwayat)
  lib/          status.ts (status, label, warna), format.ts (rupiah, tanggal), daftarKontrak.ts (saring, urut), formKontrak.ts (validasi form), navigasi.ts, toast.ts
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