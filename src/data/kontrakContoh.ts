// Data contoh selama belum ada backend. Semua nama penyedia fiktif dan berisi kata "Contoh".
// JANGAN memakai isi PKS asli (nama penyedia, nomor, pasal) di sini.
//
// Tanggal TIDAK ditulis mati, tapi dihitung dari hari ini. Contoh: hariIniPlus(18)
// berarti 18 hari dari sekarang. Jadi statusnya tetap bervariasi kapan pun website dibuka:
// 2 sudah lewat, 4 segera habis (dalam 90 hari), 2 berjalan, 1 selesai.

import type { CriticalPoint, Dokumen, Kontrak } from '../types/kontrak'
import { keTeksTanggal } from '../lib/format'

/** Tanggal "YYYY-MM-DD" yang bergeser sekian hari dari hari ini (negatif = ke belakang). */
export function hariIniPlus(jumlahHari: number): string {
  const tanggal = new Date()
  tanggal.setDate(tanggal.getDate() + jumlahHari)
  return keTeksTanggal(tanggal)
}

/** Ukuran file contoh dalam byte. */
const MB = 1024 * 1024

function pksUtama(id: string, nomorPks: string, tanggal: string, ukuranMb: number): Dokumen {
  return {
    id: `${id}-pks`,
    nama: `PKS ${nomorPks.replaceAll('/', '-')}.pdf`,
    jenis: 'PKS utama',
    ukuran: Math.round(ukuranMb * MB),
    tanggal,
  }
}

function butir(isi: Omit<CriticalPoint, 'status' | 'penanganan'> & Partial<CriticalPoint>): CriticalPoint {
  return { status: 'aktif', penanganan: '', ...isi }
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
    penyedia: 'PT Contoh Geospasial',
    nomorPks: '019/BBT/PKS/2025',
    tanggalMulai: hariIniPlus(-374),
    tanggalBerakhir: hariIniPlus(-10),
    nilai: 2_100_000_000,
    criticalPoint: [
      butir({
        id: '1-cp1',
        jenis: 'denda',
        pasal: 'Pasal 14',
        ringkasan: 'Terlambat menyerahkan laporan akhir: denda 1‰ per hari, maksimal 5% nilai kontrak.',
        tanggalPenting: hariIniPlus(-10),
      }),
    ],
    monitoring: 'Laporan akhir belum diterima',
    catatan: 'Penyedia meminta perpanjangan 30 hari. Menunggu keputusan kepala divisi.',
    keterangan: '',
  }),
  kontrak({
    id: '2',
    nama: 'Jasa penilaian aset',
    penyedia: 'KJPP Contoh',
    nomorPks: '008/BBT/PKS/2026',
    tanggalMulai: hariIniPlus(-281),
    tanggalBerakhir: hariIniPlus(-8),
    nilai: 285_000_000,
    criticalPoint: [],
    monitoring: 'Pekerjaan 100%, BAST belum ditandatangani',
    catatan: '',
    keterangan: '',
  }),

  // --- Segera habis (berakhir dalam 90 hari) ---
  kontrak({
    id: '3',
    nama: 'Kerja sama pemanfaatan lahan',
    penyedia: 'PT Contoh Agro Lestari',
    nomorPks: '015/BBT/PKS/2026',
    tanggalMulai: hariIniPlus(-344),
    tanggalBerakhir: hariIniPlus(18),
    nilai: 1_200_000_000,
    criticalPoint: [
      butir({
        id: '3-cp1',
        jenis: 'pengakhiran',
        pasal: 'Pasal 9',
        ringkasan: 'Kontrak bisa diakhiri sepihak kalau lahan dipakai di luar peruntukan yang disepakati.',
        tanggalPenting: '',
      }),
    ],
    monitoring: 'Pemanfaatan lahan berjalan sesuai rencana',
    catatan: 'Rencana diperpanjang 1 tahun lewat adendum.',
    keterangan: '',
  }),
  kontrak({
    id: '4',
    nama: 'Jasa konsultan hukum',
    penyedia: 'Kantor Hukum Contoh dan Rekan',
    nomorPks: '027/BBT/PKS/2026',
    tanggalMulai: hariIniPlus(-313),
    tanggalBerakhir: hariIniPlus(23),
    nilai: 640_000_000,
    criticalPoint: [],
    monitoring: 'Pendampingan berjalan',
    catatan: '',
    keterangan: '',
  }),
  kontrak({
    id: '5',
    nama: 'Pengembangan sistem informasi',
    penyedia: 'PT Contoh Solusi Digital',
    nomorPks: '031/BBT/PKS/2026',
    tanggalMulai: hariIniPlus(-275),
    tanggalBerakhir: hariIniPlus(27),
    nilai: 980_000_000,
    criticalPoint: [
      butir({
        id: '5-cp1',
        jenis: 'pengakhiran',
        pasal: 'Pasal 12',
        ringkasan: 'Bisa diakhiri lebih awal kalau penyedia melanggar dan tidak memperbaiki dalam 10 hari kerja.',
        tanggalPenting: '',
      }),
      butir({
        id: '5-cp2',
        jenis: 'denda',
        pasal: 'Pasal 13',
        ringkasan: 'Terlambat serah terima: denda 1‰ per hari, maksimal 1% nilai pekerjaan.',
        tanggalPenting: hariIniPlus(27),
      }),
    ],
    monitoring: 'Uji coba 80%',
    catatan: 'Pelatihan pengguna dijadwalkan minggu depan.',
    keterangan: '',
    dokumen: [
      pksUtama('5', '031/BBT/PKS/2026', hariIniPlus(-279), 2.4),
      { id: '5-adendum', nama: 'Adendum 1.pdf', jenis: 'Adendum', ukuran: 820 * 1024, tanggal: hariIniPlus(-60) },
    ],
  }),
  kontrak({
    id: '6',
    nama: 'Pemeliharaan gedung kantor',
    penyedia: 'PT Contoh Graha Prima',
    nomorPks: '036/BBT/PKS/2026',
    tanggalMulai: hariIniPlus(-300),
    tanggalBerakhir: hariIniPlus(65),
    nilai: 450_000_000,
    criticalPoint: [
      butir({
        id: '6-cp1',
        jenis: 'denda',
        pasal: 'Pasal 8',
        ringkasan: 'Respons kerusakan lebih dari 2×24 jam dikenai denda Rp 500.000 per kejadian.',
        tanggalPenting: '',
      }),
    ],
    monitoring: 'Laporan bulanan lengkap',
    catatan: '',
    keterangan: '',
  }),

  // --- Berjalan (berakhir lebih dari 90 hari lagi) ---
  kontrak({
    id: '7',
    nama: 'Audit laporan keuangan',
    penyedia: 'KAP Contoh',
    nomorPks: '044/BBT/PKS/2026',
    tanggalMulai: hariIniPlus(-240),
    tanggalBerakhir: hariIniPlus(125),
    nilai: 310_000_000,
    criticalPoint: [
      butir({
        id: '7-cp1',
        jenis: 'lainnya',
        pasal: 'Pasal 5',
        ringkasan: 'Draf laporan audit wajib diserahkan paling lambat 60 hari sebelum kontrak berakhir.',
        tanggalPenting: hariIniPlus(65),
      }),
    ],
    monitoring: 'Audit lapangan selesai',
    catatan: '',
    keterangan: '',
  }),
  kontrak({
    id: '8',
    nama: 'Kerja sama pengembangan kawasan',
    penyedia: 'PT Contoh Properti',
    nomorPks: '040/BBT/PKS/2026',
    tanggalMulai: hariIniPlus(-132),
    tanggalBerakhir: hariIniPlus(232),
    nilai: 2_400_000_000,
    criticalPoint: [],
    monitoring: 'Tahap perencanaan',
    catatan: '',
    keterangan: '',
  }),

  // --- Selesai (sudah ditandai selesai) ---
  kontrak({
    id: '9',
    nama: 'Penyusunan kajian kelayakan',
    penyedia: 'PT Contoh Konsultan',
    nomorPks: '003/BBT/PKS/2026',
    tanggalMulai: hariIniPlus(-282),
    tanggalBerakhir: hariIniPlus(-133),
    nilai: 195_000_000,
    criticalPoint: [],
    monitoring: 'Selesai, BAST sudah ditandatangani',
    catatan: '',
    keterangan: '',
    ditandaiSelesai: true,
    keteranganSelesai: 'Pekerjaan diterima lengkap. BAST sudah ditandatangani kedua pihak.',
  }),
]
