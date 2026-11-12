// Data contoh selama belum ada backend. Isinya sama dengan docs/prototipe-referensi.html.
// Semua nama mitra fiktif dan berisi kata "Contoh".
//
// Tanggal TIDAK ditulis mati, tapi dihitung dari hari ini. Contoh: hariIniPlus(18)
// berarti 18 hari dari sekarang. Selisihnya disamakan dengan referensi
// (yang "hari ini"-nya 10 November 2026), jadi statusnya tetap bervariasi
// kapan pun aplikasi dibuka: 3 segera habis, 2 sudah lewat, 2 berjalan, 1 selesai.

import type { Kontrak } from '../types/kontrak'
import { keTeksTanggal } from '../lib/format'

/** Tanggal "YYYY-MM-DD" yang bergeser sekian hari dari hari ini (negatif = ke belakang). */
function hariIniPlus(jumlahHari: number): string {
  const tanggal = new Date()
  tanggal.setDate(tanggal.getDate() + jumlahHari)
  return keTeksTanggal(tanggal)
}

/** Unit pemilik belum ditentukan. Sementara memakai teks pengganti seperti di referensi. */
const UNIT_SEMENTARA = '[Unit kerja]'

export const kontrakContoh: Kontrak[] = [
  // --- Segera habis (berakhir dalam 30 hari) ---
  {
    id: '1',
    nomor: '015/BBT/PKS/2026',
    judul: 'Kerja sama pemanfaatan lahan',
    jenis: 'PKS',
    mitra: 'PT Contoh Agro Lestari',
    unitPemilik: UNIT_SEMENTARA,
    nilai: 1_200_000_000,
    tanggalMulai: hariIniPlus(-344),
    tanggalBerakhir: hariIniPlus(18),
    ditandaiSelesai: false,
    pengingatHari: 30,
  },
  {
    id: '2',
    nomor: '027/BBT/SPK/2026',
    judul: 'Jasa konsultan hukum',
    jenis: 'SPK',
    mitra: 'Kantor Hukum Contoh dan Rekan',
    unitPemilik: UNIT_SEMENTARA,
    nilai: 640_000_000,
    tanggalMulai: hariIniPlus(-313),
    tanggalBerakhir: hariIniPlus(23),
    ditandaiSelesai: false,
    pengingatHari: 30,
  },
  {
    id: '3',
    nomor: '031/BBT/SPK/2026',
    judul: 'Pengembangan sistem informasi',
    jenis: 'SPK',
    mitra: 'PT Contoh Solusi Digital',
    unitPemilik: UNIT_SEMENTARA,
    nilai: 450_000_000,
    tanggalMulai: hariIniPlus(-337),
    tanggalBerakhir: hariIniPlus(27),
    ditandaiSelesai: false,
    pengingatHari: 30,
  },

  // --- Sudah lewat (tanggal berakhir lewat, belum ditutup) ---
  {
    id: '4',
    nomor: '008/BBT/SPK/2026',
    judul: 'Jasa penilaian aset',
    jenis: 'SPK',
    mitra: 'KJPP Contoh',
    unitPemilik: UNIT_SEMENTARA,
    nilai: 285_000_000,
    tanggalMulai: hariIniPlus(-281),
    tanggalBerakhir: hariIniPlus(-8),
    ditandaiSelesai: false,
    pengingatHari: 30,
  },
  {
    id: '5',
    nomor: '019/BBT/PKS/2025',
    judul: 'Survei dan pengukuran bidang tanah',
    jenis: 'PKS',
    mitra: 'PT Contoh Geospasial',
    unitPemilik: UNIT_SEMENTARA,
    nilai: 2_100_000_000,
    tanggalMulai: hariIniPlus(-374),
    tanggalBerakhir: hariIniPlus(-10),
    ditandaiSelesai: false,
    pengingatHari: 30,
  },

  // --- Berjalan (berakhir lebih dari 30 hari lagi) ---
  {
    id: '6',
    nomor: '040/BBT/PKS/2026',
    judul: 'Kerja sama pengembangan kawasan',
    jenis: 'PKS',
    mitra: 'PT Contoh Properti',
    unitPemilik: UNIT_SEMENTARA,
    nilai: 2_400_000_000,
    tanggalMulai: hariIniPlus(-132),
    tanggalBerakhir: hariIniPlus(232),
    ditandaiSelesai: false,
    pengingatHari: 30,
  },
  {
    id: '7',
    nomor: '044/BBT/SPK/2026',
    judul: 'Audit laporan keuangan',
    jenis: 'SPK',
    mitra: 'KAP Contoh',
    unitPemilik: UNIT_SEMENTARA,
    nilai: 310_000_000,
    tanggalMulai: hariIniPlus(-240),
    tanggalBerakhir: hariIniPlus(125),
    ditandaiSelesai: false,
    pengingatHari: 30,
  },

  // --- Selesai (sudah ditandai selesai oleh admin) ---
  {
    id: '8',
    nomor: '003/BBT/SPK/2026',
    judul: 'Penyusunan kajian kelayakan',
    jenis: 'SPK',
    mitra: 'PT Contoh Konsultan',
    unitPemilik: UNIT_SEMENTARA,
    nilai: 195_000_000,
    tanggalMulai: hariIniPlus(-282),
    tanggalBerakhir: hariIniPlus(-133),
    ditandaiSelesai: true,
    pengingatHari: 30,
  },
]
