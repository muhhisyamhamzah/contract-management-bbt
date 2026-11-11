// Logika status kontrak: menghitung status dari tanggal, label, dan warnanya.

import type { Kontrak, StatusKontrak } from '../types/kontrak'
import { keTanggal } from './format'

/** Kontrak dianggap "segera habis" kalau berakhir dalam sekian hari ini. */
export const BATAS_HARI_SEGERA = 30

const MILIDETIK_PER_HARI = 24 * 60 * 60 * 1000

/**
 * Menghitung sisa hari sampai tanggal berakhir.
 * Hasil 0 berarti berakhir hari ini, angka negatif berarti sudah lewat.
 */
export function hitungSisaHari(tanggalBerakhir: string, hariIni: Date = new Date()): number {
  const awalHariIni = new Date(hariIni.getFullYear(), hariIni.getMonth(), hariIni.getDate())
  const selisih = keTanggal(tanggalBerakhir).getTime() - awalHariIni.getTime()
  // Math.round menghindari selisih satu jam saat pergantian zona waktu musim panas.
  return Math.round(selisih / MILIDETIK_PER_HARI)
}

/** Menentukan status kontrak. Urutan pengecekan penting: "selesai" didahulukan. */
export function hitungStatus(kontrak: Kontrak, hariIni: Date = new Date()): StatusKontrak {
  if (kontrak.ditandaiSelesai) return 'selesai'

  const sisaHari = hitungSisaHari(kontrak.tanggalBerakhir, hariIni)
  if (sisaHari < 0) return 'lewat'
  if (sisaHari <= BATAS_HARI_SEGERA) return 'segera'
  return 'berjalan'
}

/** Teks yang tampil di layar untuk setiap status. */
export const LABEL_STATUS: Record<StatusKontrak, string> = {
  berjalan: 'Berjalan',
  segera: 'Segera habis',
  lewat: 'Sudah lewat',
  selesai: 'Selesai',
}

/**
 * Class Tailwind untuk badge status: latar muda (opacity 15%) dan teks pekat.
 * Ditulis lengkap (bukan disusun dari potongan teks) supaya Tailwind bisa menemukannya.
 */
export const WARNA_STATUS: Record<StatusKontrak, string> = {
  berjalan: 'bg-berjalan/15 text-berjalan',
  segera: 'bg-segera/15 text-segera',
  lewat: 'bg-lewat/15 text-lewat',
  selesai: 'bg-selesai/15 text-selesai',
}

/** Urutan status saat ditampilkan (misalnya 4 kotak di Beranda dan chip filter). */
export const URUTAN_STATUS: StatusKontrak[] = ['berjalan', 'segera', 'lewat', 'selesai']
