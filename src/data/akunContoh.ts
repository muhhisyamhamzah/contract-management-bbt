// Akun dan riwayat perubahan contoh selama belum ada backend. Semua nama fiktif dan berisi kata "Contoh".
// Kata sandi ditulis terbuka HANYA untuk demo. Backend nanti menyimpan hash, bukan teks asli.

import type { Akun, CatatanRiwayat } from '../types/kontrak'

/** Kata sandi semua akun contoh. Ditampilkan di halaman Masuk supaya demo mudah. */
export const SANDI_CONTOH = 'contoh123'

export const akunContoh: Akun[] = [
  {
    id: 'a1',
    nama: 'Wahyu Contoh',
    email: 'wahyu.contoh@banktanah.id',
    jabatan: 'Kepala Divisi Umum',
    peran: 'pengguna',
    aktif: true,
    sandi: SANDI_CONTOH,
  },
  {
    id: 'a2',
    nama: 'Dewi Contoh',
    email: 'dewi.contoh@banktanah.id',
    jabatan: 'Tim Pengadaan',
    peran: 'pengguna',
    aktif: true,
    sandi: SANDI_CONTOH,
  },
  {
    id: 'a3',
    nama: 'Rizal Contoh',
    email: 'rizal.contoh@banktanah.id',
    jabatan: 'Tim Pengadaan',
    peran: 'pengguna',
    aktif: true,
    sandi: SANDI_CONTOH,
  },
  {
    id: 'a4',
    nama: 'Sari Contoh',
    email: 'sari.contoh@banktanah.id',
    jabatan: 'Tim Pengadaan',
    peran: 'pengguna',
    aktif: false,
    sandi: SANDI_CONTOH,
  },
  {
    id: 'a5',
    nama: 'Admin IT Contoh',
    email: 'admin.contoh@banktanah.id',
    jabatan: 'Admin IT',
    peran: 'admin',
    aktif: true,
    sandi: SANDI_CONTOH,
  },
]

/** Waktu ISO sekian hari dan jam yang lalu. */
function lalu(hari: number, jam = 0): string {
  return new Date(Date.now() - (hari * 24 + jam) * 60 * 60 * 1000).toISOString()
}

/** Riwayat perubahan contoh, dari yang terbaru. */
export const riwayatContoh: CatatanRiwayat[] = [
  {
    id: 'r1',
    waktu: lalu(0, 3),
    oleh: 'Dewi Contoh',
    aksi: 'ubah',
    rincian: 'Mengubah monitoring "Pengembangan sistem informasi" menjadi "Uji coba 80%"',
    kontrakId: '5',
  },
  {
    id: 'r2',
    waktu: lalu(1, 2),
    oleh: 'Rizal Contoh',
    aksi: 'unggah',
    rincian: 'Mengunggah Adendum 1.pdf ke "Pengembangan sistem informasi"',
    kontrakId: '5',
  },
  {
    id: 'r3',
    waktu: lalu(3, 5),
    oleh: 'Admin IT Contoh',
    aksi: 'akun',
    rincian: 'Menonaktifkan akun Sari Contoh',
  },
  {
    id: 'r4',
    waktu: lalu(6, 1),
    oleh: 'Wahyu Contoh',
    aksi: 'selesai',
    rincian: 'Menandai selesai "Penyusunan kajian kelayakan"',
    kontrakId: '9',
  },
  {
    id: 'r5',
    waktu: lalu(12, 4),
    oleh: 'Dewi Contoh',
    aksi: 'tambah',
    rincian: 'Menambah kontrak "Kerja sama pengembangan kawasan"',
    kontrakId: '8',
  },
  {
    id: 'r6',
    waktu: lalu(20, 2),
    oleh: 'Rizal Contoh',
    aksi: 'hapus',
    rincian: 'Menghapus kontrak "Sewa ruang arsip sementara" (012/BBT/PKS/2025)',
  },
]
