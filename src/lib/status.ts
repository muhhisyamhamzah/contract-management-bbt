// Logika status kontrak: menghitung status, sisa hari, progres, dan jadwal pengingat dari tanggal,
// serta label, ikon, dan warna tiap status.

import type { NamaIkon } from '../components/Ikon'
import type { Kontrak, StatusKontrak } from '../types/kontrak'
import { geserBulan, keTanggal } from './format'

/** Kontrak dianggap "segera habis" kalau berakhir dalam sekian hari ini. [DIKONFIRMASI] 90 hari. */
export const BATAS_HARI_SEGERA = 90

/**
 * Tahap pengingat: berapa bulan kalender sebelum kontrak habis. [DIKONFIRMASI] 3, 2, lalu 1 bulan.
 * Urutan dari yang paling awal dikirim.
 */
export const TAHAP_PENGINGAT_BULAN = [3, 2, 1] as const

const MILIDETIK_PER_HARI = 24 * 60 * 60 * 1000

/** Tanggal jam 00:00, supaya perhitungan hari tidak terpengaruh jam. */
function awalHari(tanggal: Date): Date {
  return new Date(tanggal.getFullYear(), tanggal.getMonth(), tanggal.getDate())
}

/** Selisih hari dari tanggal a ke tanggal b (b - a). */
function selisihHari(a: Date, b: Date): number {
  // Math.round menghindari selisih satu jam saat pergantian zona waktu musim panas.
  return Math.round((awalHari(b).getTime() - awalHari(a).getTime()) / MILIDETIK_PER_HARI)
}

/**
 * Menghitung sisa hari sampai tanggal tertentu.
 * Hasil 0 berarti hari ini, angka negatif berarti sudah lewat.
 */
export function hitungSisaHari(tanggal: string, hariIni: Date = new Date()): number {
  return selisihHari(hariIni, keTanggal(tanggal))
}

/** Menentukan status kontrak. Urutan pengecekan penting: "selesai" didahulukan. */
export function hitungStatus(kontrak: Kontrak, hariIni: Date = new Date()): StatusKontrak {
  if (kontrak.ditandaiSelesai) return 'selesai'

  const sisaHari = hitungSisaHari(kontrak.tanggalBerakhir, hariIni)
  if (sisaHari < 0) return 'lewat'
  if (sisaHari <= BATAS_HARI_SEGERA) return 'segera'
  return 'berjalan'
}

/** Kontrak yang perlu perhatian: sudah lewat atau segera habis. */
export function perluPerhatian(kontrak: Kontrak, hariIni: Date = new Date()): boolean {
  const status = hitungStatus(kontrak, hariIni)
  return status === 'lewat' || status === 'segera'
}

/**
 * Persen masa kontrak yang sudah dilalui (0 sampai 100), untuk garis masa kontrak.
 * Kontrak yang sudah lewat atau selesai selalu 100.
 */
export function hitungProgres(kontrak: Kontrak, hariIni: Date = new Date()): number {
  const status = hitungStatus(kontrak, hariIni)
  if (status === 'lewat' || status === 'selesai') return 100
  return persenPadaGaris(kontrak, hariIni)
}

/** Posisi suatu tanggal pada garis masa kontrak, dalam persen 0 sampai 100. */
export function persenPadaGaris(kontrak: Kontrak, tanggal: Date): number {
  const mulai = keTanggal(kontrak.tanggalMulai)
  const berakhir = keTanggal(kontrak.tanggalBerakhir)
  const totalHari = selisihHari(mulai, berakhir)
  if (totalHari <= 0) return 100
  const persen = Math.round((selisihHari(mulai, tanggal) / totalHari) * 100)
  return Math.min(100, Math.max(0, persen))
}

/** Teks sisa waktu, misalnya "18 hari lagi", "Lewat 8 hari", atau "Selesai". */
export function teksSisaHari(kontrak: Kontrak, hariIni: Date = new Date()): string {
  const status = hitungStatus(kontrak, hariIni)
  if (status === 'selesai') return 'Selesai'

  const sisaHari = hitungSisaHari(kontrak.tanggalBerakhir, hariIni)
  if (status === 'lewat') return `Lewat ${Math.abs(sisaHari)} hari`
  if (sisaHari === 0) return 'Habis hari ini'
  if (status === 'berjalan') return 'Berjalan'
  return `${sisaHari} hari lagi`
}

/** Jarak ke suatu tanggal dalam teks, misalnya "18 hari lagi", "hari ini", atau "lewat 3 hari". */
export function teksJarakHari(tanggal: string, hariIni: Date = new Date()): string {
  const sisa = hitungSisaHari(tanggal, hariIni)
  if (sisa === 0) return 'hari ini'
  return sisa > 0 ? `${sisa} hari lagi` : `lewat ${Math.abs(sisa)} hari`
}

/** Menghitung berapa kontrak di setiap status, misalnya { berjalan: 2, segera: 3, ... }. */
export function hitungJumlahPerStatus(daftar: Kontrak[], hariIni: Date = new Date()): Record<StatusKontrak, number> {
  const jumlah: Record<StatusKontrak, number> = { berjalan: 0, segera: 0, lewat: 0, selesai: 0 }
  for (const kontrak of daftar) {
    jumlah[hitungStatus(kontrak, hariIni)] += 1
  }
  return jumlah
}

export type TahapPengingat = {
  /** Berapa bulan sebelum tanggal akhir. */
  bulan: number
  /** Tanggal pengingat dikirim, format YYYY-MM-DD. */
  tanggal: string
  /** true kalau tanggal pengingat sudah lewat atau hari ini (sudah terkirim). */
  terkirim: boolean
}

/** Jadwal pengingat bertahap untuk tanggal akhir tertentu (3, 2, 1 bulan kalender sebelumnya). */
export function jadwalPengingat(tanggalBerakhir: string, hariIni: Date = new Date()): TahapPengingat[] {
  return TAHAP_PENGINGAT_BULAN.map((bulan) => {
    const tanggal = geserBulan(tanggalBerakhir, -bulan)
    return { bulan, tanggal, terkirim: hitungSisaHari(tanggal, hariIni) <= 0 }
  })
}

type TampilanStatus = {
  /** Teks yang tampil di layar. */
  label: string
  /** Ikon status (kotak ikon di ringkasan Beranda). */
  ikon: NamaIkon
  /** Latar muda + teks gelap. Untuk badge dan kotak peringatan. */
  kelasBadge: string
  /** Warna teks saja, misalnya untuk judul kelompok. */
  kelasTeks: string
  /** Warna pekat untuk garis masa kontrak dan titik di badge. */
  kelasBar: string
  /** Kotak ikon bergradasi warna logo + bayangan berwarna (gaya Beranda). */
  kelasIkonGradasi: string
  /** Hiasan lingkaran samar di pojok kotak ringkasan. */
  kelasHiasan: string
  /** Pita bulan di kotak kalender. */
  kelasPita: string
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
    kelasIkonGradasi: 'from-berjalan to-logo-hijau shadow-logo-hijau/35',
    kelasHiasan: 'bg-logo-hijau/10',
    kelasPita: 'bg-latar-tab text-judul',
  },
  segera: {
    label: 'Segera habis',
    ikon: 'jam',
    kelasBadge: 'bg-segera-latar text-segera-teks',
    kelasTeks: 'text-segera-teks',
    kelasBar: 'bg-segera',
    kelasIkonGradasi: 'from-logo-emas to-logo-tanah shadow-logo-emas/40',
    kelasHiasan: 'bg-logo-emas/12',
    kelasPita: 'bg-logo-emas text-galaxy-900',
  },
  lewat: {
    label: 'Sudah lewat',
    ikon: 'peringatan',
    kelasBadge: 'bg-lewat-latar text-lewat-teks',
    kelasTeks: 'text-lewat-teks',
    kelasBar: 'bg-lewat',
    kelasIkonGradasi: 'from-logo-tanah to-hapus shadow-logo-tanah/40',
    kelasHiasan: 'bg-logo-tanah/10',
    // Teks navy, bukan putih: putih di atas oranye hanya 2,98:1 (lihat docs/ui-audit.md).
    kelasPita: 'bg-logo-tanah text-galaxy-900',
  },
  selesai: {
    label: 'Selesai',
    ikon: 'centangLingkaran',
    kelasBadge: 'bg-selesai-latar text-selesai-teks',
    kelasTeks: 'text-selesai-teks',
    kelasBar: 'bg-selesai',
    kelasIkonGradasi: 'from-selesai to-selesai-teks shadow-selesai/45',
    kelasHiasan: 'bg-selesai/15',
    kelasPita: 'bg-latar-tab text-selesai-teks',
  },
}

/** Label jenis critical point. */
export const LABEL_CRITICAL_POINT = {
  pengakhiran: 'Pengakhiran kontrak',
  denda: 'Denda',
  lainnya: 'Lainnya',
} as const
