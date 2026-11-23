// Logika daftar kontrak: menyaring (status + kata kunci) dan mengurutkan.
// Dipisah dari komponen supaya mudah diuji dan dipakai ulang.

import type { Dokumen, Kontrak, StatusKontrak } from '../types/kontrak'
import { hitungSisaHari, hitungStatus } from './status'

/** Filter status di halaman Kontrak. "semua" berarti tanpa filter. */
export type FilterStatus = StatusKontrak | 'semua'

/** Urutan chip filter. */
export const URUTAN_FILTER: FilterStatus[] = ['semua', 'lewat', 'segera', 'berjalan', 'selesai']

export type Urutan = 'berakhir' | 'nilai' | 'nama'

export const LABEL_URUTAN: Record<Urutan, string> = {
  berakhir: 'Paling cepat habis',
  nilai: 'Nilai terbesar',
  nama: 'Nama A sampai Z',
}

/** Mengubah teks dari alamat (misalnya ?status=lewat) menjadi filter yang sah. */
export function bacaFilter(teks: string | null): FilterStatus {
  return URUTAN_FILTER.includes(teks as FilterStatus) ? (teks as FilterStatus) : 'semua'
}

/** Mengubah teks dari alamat (misalnya ?urut=nilai) menjadi urutan yang sah. */
export function bacaUrutan(teks: string | null): Urutan {
  return teks && teks in LABEL_URUTAN ? (teks as Urutan) : 'berakhir'
}

/** Apakah kontrak cocok dengan kata kunci (dicari di nama, penyedia, dan nomor PKS). */
export function cocokKataKunci(kontrak: Kontrak, kataKunci: string): boolean {
  const kunci = kataKunci.trim().toLowerCase()
  if (!kunci) return true
  return `${kontrak.nama} ${kontrak.penyedia} ${kontrak.nomorPks}`.toLowerCase().includes(kunci)
}

/** Nilai pengurut untuk "Paling cepat habis": kontrak selesai selalu di paling bawah. */
function kunciBerakhir(kontrak: Kontrak, hariIni: Date): number {
  if (hitungStatus(kontrak, hariIni) === 'selesai') return Number.POSITIVE_INFINITY
  return hitungSisaHari(kontrak.tanggalBerakhir, hariIni)
}

/**
 * Selisih dua kunci urutan yang aman untuk Infinity: kontrak selesai bernilai tak hingga, dan
 * Infinity - Infinity = NaN membuat urutan sort tidak menentu. Nilai sama dianggap 0.
 */
function bandingkan(a: number, b: number): number {
  return a === b ? 0 : a - b
}

/** Mengurutkan kontrak dari yang paling cepat habis. Daftar asli tidak diubah. */
export function urutkanPalingCepatHabis(daftar: Kontrak[], hariIni: Date = new Date()): Kontrak[] {
  return [...daftar].sort((a, b) => bandingkan(kunciBerakhir(a, hariIni), kunciBerakhir(b, hariIni)))
}

/** Menyaring lalu mengurutkan daftar kontrak. Daftar asli tidak diubah. */
export function saringDanUrutkan(
  daftar: Kontrak[],
  filter: FilterStatus,
  kataKunci: string,
  urutan: Urutan,
  hariIni: Date = new Date(),
): Kontrak[] {
  const hasil = daftar
    .filter((kontrak) => filter === 'semua' || hitungStatus(kontrak, hariIni) === filter)
    .filter((kontrak) => cocokKataKunci(kontrak, kataKunci))

  const pembanding: Record<Urutan, (a: Kontrak, b: Kontrak) => number> = {
    berakhir: (a, b) => bandingkan(kunciBerakhir(a, hariIni), kunciBerakhir(b, hariIni)),
    nilai: (a, b) => b.nilai - a.nilai,
    nama: (a, b) => a.nama.localeCompare(b.nama, 'id'),
  }
  return [...hasil].sort(pembanding[urutan])
}

/**
 * Dokumen kontrak urut dari yang paling lama (PKS awal) ke yang paling baru (adendum terakhir).
 * Dipakai untuk daftar dokumen bernomor 1, 2, 3, ... di Detail kontrak.
 */
export function urutkanDokumen(dokumen: Dokumen[]): Dokumen[] {
  return dokumen.toSorted((a, b) => a.tanggal.localeCompare(b.tanggal))
}
