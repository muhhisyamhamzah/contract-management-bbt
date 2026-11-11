// Data contoh selama belum ada backend. Semua nama mitra fiktif dan berisi kata "Contoh".
//
// Tanggal berakhir dihitung relatif dari hari ini (misalnya "120 hari lagi"),
// supaya status kontrak tetap bervariasi kapan pun aplikasi dibuka.

import type { Kontrak } from '../types/kontrak'
import { keTeksTanggal } from '../lib/format'

/** Tanggal "YYYY-MM-DD" yang bergeser sekian hari dari hari ini (negatif = ke belakang). */
function geserHari(jumlahHari: number): string {
  const tanggal = new Date()
  tanggal.setDate(tanggal.getDate() + jumlahHari)
  return keTeksTanggal(tanggal)
}

export const kontrakContoh: Kontrak[] = [
  // --- Berjalan (berakhir lebih dari 30 hari lagi) ---
  {
    id: 'k-001',
    nomor: 'PKS/001/BBT/2026',
    judul: 'Kerja Sama Pemanfaatan Lahan Kawasan Industri',
    jenis: 'PKS',
    mitra: 'PT Contoh Lahan Nusantara',
    unitPemilik: 'Divisi Pemanfaatan Tanah',
    nilai: 2_750_000_000,
    tanggalMulai: geserHari(-200),
    tanggalBerakhir: geserHari(530),
    ditandaiSelesai: false,
    pengingatHari: 90,
  },
  {
    id: 'k-002',
    nomor: 'SPK/014/BBT/2026',
    judul: 'Jasa Pengukuran dan Pemetaan Bidang Tanah',
    jenis: 'SPK',
    mitra: 'CV Contoh Ukur Presisi',
    unitPemilik: 'Divisi Pengadaan Tanah',
    nilai: 485_000_000,
    tanggalMulai: geserHari(-60),
    tanggalBerakhir: geserHari(120),
    ditandaiSelesai: false,
    pengingatHari: 30,
  },
  {
    id: 'k-003',
    nomor: 'SPK/021/BBT/2026',
    judul: 'Pemeliharaan Sistem Informasi Pertanahan',
    jenis: 'SPK',
    mitra: 'PT Contoh Solusi Digital',
    unitPemilik: 'Divisi Teknologi Informasi',
    nilai: 320_000_000,
    tanggalMulai: geserHari(-30),
    tanggalBerakhir: geserHari(75),
    ditandaiSelesai: false,
    pengingatHari: 60,
  },

  // --- Segera habis (berakhir dalam 30 hari) ---
  {
    id: 'k-004',
    nomor: 'SPK/008/BBT/2026',
    judul: 'Jasa Keamanan Aset Tanah Wilayah Barat',
    jenis: 'SPK',
    mitra: 'PT Contoh Jaga Aman',
    unitPemilik: 'Divisi Pengelolaan Aset',
    nilai: 612_500_000,
    tanggalMulai: geserHari(-335),
    tanggalBerakhir: geserHari(12),
    ditandaiSelesai: false,
    pengingatHari: 30,
  },
  {
    id: 'k-005',
    nomor: 'PKS/005/BBT/2026',
    judul: 'Kerja Sama Penyediaan Data Spasial',
    jenis: 'PKS',
    mitra: 'Universitas Contoh Geodesi',
    unitPemilik: 'Divisi Perencanaan',
    nilai: 150_000_000,
    tanggalMulai: geserHari(-180),
    tanggalBerakhir: geserHari(27),
    ditandaiSelesai: false,
    pengingatHari: 60,
  },

  // --- Sudah lewat (tanggal berakhir lewat, belum ditutup) ---
  {
    id: 'k-006',
    nomor: 'SPK/003/BBT/2025',
    judul: 'Sewa Kendaraan Operasional Survei Lapangan',
    jenis: 'SPK',
    mitra: 'PT Contoh Trans Mandiri',
    unitPemilik: 'Divisi Pengadaan Tanah',
    nilai: 96_000_000,
    tanggalMulai: geserHari(-370),
    tanggalBerakhir: geserHari(-5),
    ditandaiSelesai: false,
    pengingatHari: 30,
  },
  {
    id: 'k-007',
    nomor: 'LN/002/BBT/2025',
    judul: 'Pendampingan Hukum Sengketa Lahan',
    jenis: 'Lainnya',
    mitra: 'Kantor Hukum Contoh & Rekan',
    unitPemilik: 'Divisi Hukum',
    nilai: 240_000_000,
    tanggalMulai: geserHari(-400),
    tanggalBerakhir: geserHari(-40),
    ditandaiSelesai: false,
    pengingatHari: 60,
  },

  // --- Selesai (sudah ditandai selesai oleh admin) ---
  {
    id: 'k-008',
    nomor: 'SPK/011/BBT/2025',
    judul: 'Jasa Penilaian Harga Tanah (Appraisal)',
    jenis: 'SPK',
    mitra: 'KJPP Contoh Nilai Wajar',
    unitPemilik: 'Divisi Pemanfaatan Tanah',
    nilai: 175_000_000,
    tanggalMulai: geserHari(-300),
    tanggalBerakhir: geserHari(-20),
    ditandaiSelesai: true,
    pengingatHari: 30,
  },
]
