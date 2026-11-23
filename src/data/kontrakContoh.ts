// Data contoh selama belum ada backend. Semua nama penyedia fiktif dan berisi kata "Contoh".
// JANGAN memakai isi PKS asli (nama penyedia, nomor, pasal) di sini.
//
// Tanggal TIDAK ditulis mati, tapi dihitung dari hari ini. Contoh: hariIniPlus(18)
// berarti 18 hari dari sekarang. Jadi statusnya tetap bervariasi kapan pun website dibuka:
// 2 sudah lewat, 4 segera habis (dalam 90 hari), 2 berjalan, 1 selesai.

import type { Dokumen, Kontrak, VersiKontrak } from '../types/kontrak'
import { keTeksTanggal } from '../lib/format'

/** Tanggal "YYYY-MM-DD" yang bergeser sekian hari dari hari ini (negatif = ke belakang). */
export function hariIniPlus(jumlahHari: number): string {
  const tanggal = new Date()
  tanggal.setDate(tanggal.getDate() + jumlahHari)
  return keTeksTanggal(tanggal)
}

/** Ukuran file contoh dalam byte. */
const MB = 1024 * 1024

function pksUtama(id: string, nomorPks: string, tanggal: string, ukuranMb: number, versi?: VersiKontrak): Dokumen {
  return {
    id: `${id}-pks`,
    nama: `PKS ${nomorPks.replaceAll('/', '-')}.pdf`,
    jenis: 'PKS utama',
    ukuran: Math.round(ukuranMb * MB),
    tanggal,
    versi,
  }
}

/** Adendum contoh ke-n, dengan data kontrak saat adendum itu berlaku (versi). */
function adendum(id: string, ke: number, tanggal: string, versi?: VersiKontrak): Dokumen {
  return { id: `${id}-adendum-${ke}`, nama: `Adendum ${ke} Contoh.pdf`, jenis: 'Adendum', ukuran: (600 + ke * 90) * 1024, tanggal, versi }
}

/**
 * Versi data kontrak contoh: data dasar ditambah yang berubah di versi itu. Dipakai untuk riwayat adendum
 * kontrak 3 dan 5, supaya halaman Detail bisa menampilkan data saat dokumen lama dibuka (fiktif).
 */
function versi(
  dasar: VersiKontrak,
  ubah: Partial<Omit<VersiKontrak, 'ketentuan'>> & { ketentuan?: Partial<VersiKontrak['ketentuan']> },
): VersiKontrak {
  return { ...dasar, ...ubah, ketentuan: { ...dasar.ketentuan, ...ubah.ketentuan } }
}

const DASAR_3: VersiKontrak = {
  nama: 'Kerja sama pemanfaatan lahan',
  penyedia: 'PT Contoh Agro Lestari',
  nomorPks: '015/BBT/PKS/2026',
  tanggalPks: hariIniPlus(-348),
  tanggalMulai: hariIniPlus(-344),
  tanggalBerakhir: hariIniPlus(-262),
  nilai: 700_000_000,
  ketentuan: {
    pengakhiran: 'Pasal 9: Kontrak bisa diakhiri sepihak kalau lahan dipakai di luar peruntukan yang disepakati.',
    denda: '',
    jaminan: '',
    keterangan: '',
  },
  perpanjangan: 'belum',
}

const DASAR_5: VersiKontrak = {
  nama: 'Pengembangan sistem informasi',
  penyedia: 'PT Contoh Solusi Digital',
  nomorPks: '031/BBT/PKS/2026',
  tanggalPks: hariIniPlus(-279),
  tanggalMulai: hariIniPlus(-275),
  tanggalBerakhir: hariIniPlus(-33),
  nilai: 900_000_000,
  ketentuan: {
    pengakhiran: 'Pasal 12: Bisa diakhiri lebih awal kalau penyedia melanggar dan tidak memperbaiki dalam 10 hari kerja.',
    denda: 'Pasal 13: Terlambat serah terima: denda 1‰ per hari, maksimal 1% nilai pekerjaan.',
    jaminan: 'Pasal 15: Jaminan pelaksanaan 5% dari nilai kontrak, berlaku sampai serah terima pekerjaan (contoh).',
    keterangan: '',
  },
  perpanjangan: 'belum',
}

/** Satu kontrak contoh. Tanggal PKS = 4 hari sebelum awal kontrak. */
function kontrak(isi: Omit<Kontrak, 'tanggalPks' | 'dokumen' | 'ditandaiSelesai' | 'keteranganSelesai'> &
  Partial<Pick<Kontrak, 'dokumen' | 'ditandaiSelesai' | 'keteranganSelesai'>>): Kontrak {
  const tanggalPks = hariIniPlusDari(isi.tanggalMulai, -4)
  return {
    tanggalPks,
    dokumen: [pksUtama(isi.id, isi.nomorPks, tanggalPks, 2.4)],
    ditandaiSelesai: false,
    keteranganSelesai: '',
    ...isi,
  }
}

/** Menggeser tanggal teks sekian hari. Ditulis di sini supaya data contoh tidak bergantung pada urutan impor. */
function hariIniPlusDari(teks: string, jumlahHari: number): string {
  const [tahun, bulan, hari] = teks.split('-').map(Number)
  return keTeksTanggal(new Date(tahun, bulan - 1, hari + jumlahHari))
}

export const kontrakContoh: Kontrak[] = [
  // --- Sudah lewat (tanggal akhir lewat, belum ditutup) ---
  kontrak({
    id: '1',
    nama: 'Survei dan pengukuran bidang tanah',
    perpanjangan: 'proses',
    penyedia: 'PT Contoh Geospasial',
    nomorPks: '019/BBT/PKS/2025',
    tanggalMulai: hariIniPlus(-374),
    tanggalBerakhir: hariIniPlus(-10),
    nilai: 2_100_000_000,
    ketentuan: {
      pengakhiran: '',
      denda: 'Pasal 14: Terlambat menyerahkan laporan akhir: denda 1‰ per hari, maksimal 5% nilai kontrak.',
      jaminan: '',
      keterangan: 'Penyedia meminta perpanjangan 30 hari. Menunggu keputusan kepala divisi.',
    },
  }),
  kontrak({
    id: '2',
    nama: 'Jasa penilaian aset',
    perpanjangan: 'belum',
    penyedia: 'KJPP Contoh',
    nomorPks: '008/BBT/PKS/2026',
    tanggalMulai: hariIniPlus(-281),
    tanggalBerakhir: hariIniPlus(-8),
    nilai: 285_000_000,
    ketentuan: {
      pengakhiran: '',
      denda: '',
      jaminan: '',
      keterangan: '',
    },
  }),

  // --- Segera habis (berakhir dalam 90 hari) ---
  kontrak({
    id: '3',
    nama: 'Kerja sama pemanfaatan lahan',
    // Sedang memproses adendum ke-6. Data contoh sebelumnya "sudah diperpanjang" padahal tanggal akhirnya
    // tetap 18 hari lagi (bertentangan). Kontrak ini enak dipakai mencoba Catat adendum saat demo.
    perpanjangan: 'proses',
    penyedia: 'PT Contoh Agro Lestari',
    nomorPks: '015/BBT/PKS/2026',
    tanggalMulai: hariIniPlus(-344),
    tanggalBerakhir: hariIniPlus(18),
    nilai: 1_200_000_000,
    ketentuan: {
      pengakhiran: 'Pasal 9: Kontrak bisa diakhiri sepihak kalau lahan dipakai di luar peruntukan yang disepakati.',
      denda: '',
      jaminan: '',
      keterangan: 'Sudah lima kali adendum. Adendum 6 untuk perpanjangan berikutnya sedang diproses.',
    },
    // Riwayat dokumen: PKS awal lalu lima adendum (fiktif), untuk contoh daftar dokumen bernomor.
    dokumen: [
      pksUtama('3', '015/BBT/PKS/2026', hariIniPlus(-348), 3.1, DASAR_3),
      adendum('3', 1, hariIniPlus(-280), versi(DASAR_3, { tanggalBerakhir: hariIniPlus(-202), nilai: 800_000_000, perpanjangan: 'diperpanjang', ketentuan: { keterangan: 'Adendum 1: perpanjangan 2 bulan.' } })),
      adendum('3', 2, hariIniPlus(-210), versi(DASAR_3, { tanggalBerakhir: hariIniPlus(-142), nilai: 900_000_000, perpanjangan: 'diperpanjang', ketentuan: { jaminan: 'Pasal 11: Jaminan pelaksanaan 5% (contoh).', keterangan: 'Adendum 2: perpanjangan 2 bulan dan tambahan jaminan.' } })),
      adendum('3', 3, hariIniPlus(-150), versi(DASAR_3, { tanggalBerakhir: hariIniPlus(-82), nilai: 1_000_000_000, perpanjangan: 'diperpanjang', ketentuan: { jaminan: 'Pasal 11: Jaminan pelaksanaan 5% (contoh).', keterangan: 'Adendum 3: perpanjangan 2 bulan.' } })),
      adendum('3', 4, hariIniPlus(-90), versi(DASAR_3, { tanggalBerakhir: hariIniPlus(-22), nilai: 1_100_000_000, perpanjangan: 'diperpanjang', ketentuan: { keterangan: 'Adendum 4: perpanjangan 2 bulan, jaminan dihapus.' } })),
      adendum('3', 5, hariIniPlus(-20), versi(DASAR_3, { tanggalBerakhir: hariIniPlus(18), nilai: 1_200_000_000, perpanjangan: 'diperpanjang', ketentuan: { keterangan: 'Sudah lima kali adendum. Adendum 5 memperpanjang masa kontrak.' } })),
    ],
  }),
  kontrak({
    id: '4',
    nama: 'Jasa konsultan hukum',
    perpanjangan: 'belum',
    penyedia: 'Kantor Hukum Contoh dan Rekan',
    nomorPks: '027/BBT/PKS/2026',
    tanggalMulai: hariIniPlus(-313),
    tanggalBerakhir: hariIniPlus(23),
    nilai: 640_000_000,
    ketentuan: {
      pengakhiran: '',
      denda: '',
      jaminan: '',
      keterangan: '',
    },
  }),
  kontrak({
    id: '5',
    nama: 'Pengembangan sistem informasi',
    perpanjangan: 'proses',
    penyedia: 'PT Contoh Solusi Digital',
    nomorPks: '031/BBT/PKS/2026',
    tanggalMulai: hariIniPlus(-275),
    tanggalBerakhir: hariIniPlus(27),
    nilai: 980_000_000,
    ketentuan: {
      pengakhiran: 'Pasal 12: Bisa diakhiri lebih awal kalau penyedia melanggar dan tidak memperbaiki dalam 10 hari kerja.',
      denda: 'Pasal 13: Terlambat serah terima: denda 1‰ per hari, maksimal 1% nilai pekerjaan.',
      jaminan: 'Pasal 15: Jaminan pelaksanaan 5% dari nilai kontrak, berlaku sampai serah terima pekerjaan (contoh).',
      keterangan: 'Pelatihan pengguna dijadwalkan minggu depan.',
    },
    dokumen: [
      pksUtama('5', '031/BBT/PKS/2026', hariIniPlus(-279), 2.4, DASAR_5),
      adendum('5', 1, hariIniPlus(-60), versi(DASAR_5, { tanggalBerakhir: hariIniPlus(27), nilai: 980_000_000, perpanjangan: 'diperpanjang', ketentuan: { keterangan: 'Adendum 1: perpanjangan 2 bulan untuk pelatihan pengguna.' } })),
    ],
  }),
  kontrak({
    id: '6',
    nama: 'Pemeliharaan gedung kantor',
    perpanjangan: 'belum',
    penyedia: 'PT Contoh Graha Prima',
    nomorPks: '036/BBT/PKS/2026',
    tanggalMulai: hariIniPlus(-300),
    tanggalBerakhir: hariIniPlus(65),
    nilai: 450_000_000,
    ketentuan: {
      pengakhiran: '',
      denda: 'Pasal 8: Respons kerusakan lebih dari 2×24 jam dikenai denda Rp 500.000 per kejadian.',
      jaminan: '',
      keterangan: '',
    },
  }),

  // --- Berjalan (berakhir lebih dari 90 hari lagi) ---
  kontrak({
    id: '7',
    nama: 'Audit laporan keuangan',
    perpanjangan: 'belum',
    penyedia: 'KAP Contoh',
    nomorPks: '044/BBT/PKS/2026',
    tanggalMulai: hariIniPlus(-240),
    tanggalBerakhir: hariIniPlus(125),
    nilai: 310_000_000,
    ketentuan: {
      pengakhiran: '',
      denda: '',
      jaminan: '',
      keterangan: 'Pasal 5: Draf laporan audit wajib diserahkan paling lambat 60 hari sebelum kontrak berakhir.',
    },
  }),
  kontrak({
    id: '8',
    nama: 'Kerja sama pengembangan kawasan',
    perpanjangan: 'belum',
    penyedia: 'PT Contoh Properti',
    nomorPks: '040/BBT/PKS/2026',
    tanggalMulai: hariIniPlus(-132),
    tanggalBerakhir: hariIniPlus(232),
    nilai: 2_400_000_000,
    ketentuan: {
      pengakhiran: '',
      denda: '',
      jaminan: '',
      keterangan: '',
    },
  }),

  // --- Selesai (sudah ditandai selesai) ---
  kontrak({
    id: '9',
    nama: 'Penyusunan kajian kelayakan',
    perpanjangan: 'tidak',
    penyedia: 'PT Contoh Konsultan',
    nomorPks: '003/BBT/PKS/2026',
    tanggalMulai: hariIniPlus(-282),
    tanggalBerakhir: hariIniPlus(-133),
    nilai: 195_000_000,
    ketentuan: {
      pengakhiran: '',
      denda: '',
      jaminan: '',
      keterangan: '',
    },
    ditandaiSelesai: true,
    keteranganSelesai: 'Pekerjaan diterima lengkap. BAST sudah ditandatangani kedua pihak.',
  }),
]
