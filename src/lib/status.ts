// Logika status kontrak: menghitung status, sisa hari, dan progres dari tanggal,
// serta label, ikon, dan warna tiap status.

import type { NamaIkon } from '../components/Ikon'
import type { Kontrak, StatusKontrak } from '../types/kontrak'
import { keTanggal } from './format'

/** Kontrak dianggap "segera habis" kalau berakhir dalam sekian hari ini. */
export const BATAS_HARI_SEGERA = 30

const MILIDETIK_PER_HARI = 24 * 60 * 60 * 1000

/** Tanggal hari ini jam 00:00, supaya perhitungan hari tidak terpengaruh jam. */
function awalHari(tanggal: Date): Date {
  return new Date(tanggal.getFullYear(), tanggal.getMonth(), tanggal.getDate())
}

/** Selisih hari dari tanggal a ke tanggal b (b - a). */
function selisihHari(a: Date, b: Date): number {
  // Math.round menghindari selisih satu jam saat pergantian zona waktu musim panas.
  return Math.round((awalHari(b).getTime() - awalHari(a).getTime()) / MILIDETIK_PER_HARI)
}

/**
 * Menghitung sisa hari sampai tanggal berakhir.
 * Hasil 0 berarti berakhir hari ini, angka negatif berarti sudah lewat.
 */
export function hitungSisaHari(tanggalBerakhir: string, hariIni: Date = new Date()): number {
  return selisihHari(hariIni, keTanggal(tanggalBerakhir))
}

/** Menentukan status kontrak. Urutan pengecekan penting: "selesai" didahulukan. */
export function hitungStatus(kontrak: Kontrak, hariIni: Date = new Date()): StatusKontrak {
  if (kontrak.ditandaiSelesai) return 'selesai'

  const sisaHari = hitungSisaHari(kontrak.tanggalBerakhir, hariIni)
  if (sisaHari < 0) return 'lewat'
  if (sisaHari <= BATAS_HARI_SEGERA) return 'segera'
  return 'berjalan'
}

/**
 * Persen masa kontrak yang sudah dilalui (0 sampai 100), untuk progress bar.
 * Kontrak yang sudah lewat atau selesai selalu 100.
 */
export function hitungProgres(kontrak: Kontrak, hariIni: Date = new Date()): number {
  const status = hitungStatus(kontrak, hariIni)
  if (status === 'lewat' || status === 'selesai') return 100

  const mulai = keTanggal(kontrak.tanggalMulai)
  const berakhir = keTanggal(kontrak.tanggalBerakhir)
  const totalHari = selisihHari(mulai, berakhir)
  if (totalHari <= 0) return 100

  const sudahDilalui = selisihHari(mulai, hariIni)
  const persen = Math.round((sudahDilalui / totalHari) * 100)
  return Math.min(100, Math.max(0, persen))
}

/** Teks sisa waktu, misalnya "18 hari lagi", "Lewat 8 hari", atau "Selesai". */
export function teksSisaHari(kontrak: Kontrak, hariIni: Date = new Date()): string {
  const status = hitungStatus(kontrak, hariIni)
  if (status === 'selesai') return 'Selesai'

  const sisaHari = hitungSisaHari(kontrak.tanggalBerakhir, hariIni)
  if (status === 'lewat') return `Lewat ${Math.abs(sisaHari)} hari`
  if (sisaHari === 0) return 'Habis hari ini'
  return `${sisaHari} hari lagi`
}

/** Menghitung berapa kontrak di setiap status, misalnya { berjalan: 2, segera: 3, ... }. */
export function hitungJumlahPerStatus(
  daftar: Kontrak[],
  hariIni: Date = new Date(),
): Record<StatusKontrak, number> {
  const jumlah: Record<StatusKontrak, number> = { berjalan: 0, segera: 0, lewat: 0, selesai: 0 }
  for (const kontrak of daftar) {
    jumlah[hitungStatus(kontrak, hariIni)] += 1
  }
  return jumlah
}

type TampilanStatus = {
  /** Teks yang tampil di layar. */
  label: string
  /** Ikon status (kotak ikon di Beranda dan kartu kontrak). */
  ikon: NamaIkon
  /** Latar muda + teks gelap. Untuk badge, kotak ikon, dan kotak peringatan. */
  kelasBadge: string
  /** Warna teks saja, misalnya untuk chip filter yang tidak aktif. */
  kelasTeks: string
  /** Warna pekat untuk progress bar dan titik. */
  kelasBar: string
  /** Warna garis cincin (SVG) di atas header gelap. */
  kelasCincin: string
  /** Warna garis masa kontrak di atas header gelap. */
  kelasBarHeader: string
  /** Kotak ikon bergradasi warna logo + bayangan berwarna (gaya Beranda). */
  kelasIkonGradasi: string
  /** Hiasan lingkaran samar di pojok kotak ringkasan. */
  kelasHiasan: string
}

/**
 * Label, ikon, dan class warna untuk setiap status.
 * Class ditulis lengkap (bukan disusun dari potongan teks) supaya Tailwind bisa menemukannya.
 */
export const TAMPILAN_STATUS: Record<StatusKontrak, TampilanStatus> = {
  berjalan: {
    label: 'Berjalan',
    ikon: 'play',
    kelasBadge: 'bg-berjalan-latar text-berjalan-teks',
    kelasTeks: 'text-berjalan-teks',
    kelasBar: 'bg-berjalan',
    kelasCincin: 'stroke-cincin-berjalan',
    kelasBarHeader: 'bg-cincin-berjalan',
    kelasIkonGradasi: 'from-berjalan to-logo-hijau shadow-logo-hijau/35',
    kelasHiasan: 'bg-logo-hijau/10',
  },
  segera: {
    label: 'Segera habis',
    ikon: 'jam',
    kelasBadge: 'bg-segera-latar text-segera-teks',
    kelasTeks: 'text-segera-teks',
    kelasBar: 'bg-segera',
    kelasCincin: 'stroke-cincin-segera',
    kelasBarHeader: 'bg-cincin-segera',
    kelasIkonGradasi: 'from-logo-emas to-logo-tanah shadow-logo-emas/40',
    kelasHiasan: 'bg-logo-emas/12',
  },
  lewat: {
    label: 'Sudah lewat',
    ikon: 'peringatan',
    kelasBadge: 'bg-lewat-latar text-lewat-teks',
    kelasTeks: 'text-lewat-teks',
    kelasBar: 'bg-lewat',
    kelasCincin: 'stroke-cincin-lewat',
    kelasBarHeader: 'bg-cincin-lewat',
    kelasIkonGradasi: 'from-logo-tanah to-hapus shadow-logo-tanah/40',
    kelasHiasan: 'bg-logo-tanah/10',
  },
  selesai: {
    label: 'Selesai',
    ikon: 'centangLingkaran',
    kelasBadge: 'bg-selesai-latar text-selesai-teks',
    kelasTeks: 'text-selesai-teks',
    kelasBar: 'bg-selesai',
    kelasCincin: 'stroke-selesai',
    kelasBarHeader: 'bg-selesai',
    kelasIkonGradasi: 'from-selesai to-selesai-teks shadow-selesai/45',
    kelasHiasan: 'bg-selesai/15',
  },
}
