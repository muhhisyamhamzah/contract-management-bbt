// Logika halaman daftar Kontrak: menyaring (status + kata kunci) dan mengurutkan.
// Dipisah dari komponen supaya mudah diuji dan dipakai ulang.

import type { Kontrak, StatusKontrak } from '../types/kontrak'
import { hitungSisaHari, hitungStatus } from './status'

/** Filter status di halaman Kontrak. "semua" berarti tanpa filter. */
export type FilterStatus = StatusKontrak | 'semua'

/** Urutan chip filter, sama dengan referensi. */
export const URUTAN_FILTER: FilterStatus[] = ['semua', 'segera', 'lewat', 'berjalan', 'selesai']

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

/** Apakah kontrak cocok dengan kata kunci (dicari di nomor, judul, dan mitra). */
export function cocokKataKunci(kontrak: Kontrak, kataKunci: string): boolean {
  const kunci = kataKunci.trim().toLowerCase()
  if (!kunci) return true
  return `${kontrak.nomor} ${kontrak.judul} ${kontrak.mitra}`.toLowerCase().includes(kunci)
}

/** Nilai pengurut untuk "Paling cepat habis": kontrak selesai selalu di paling bawah. */
function kunciBerakhir(kontrak: Kontrak, hariIni: Date): number {
  if (hitungStatus(kontrak, hariIni) === 'selesai') return Number.POSITIVE_INFINITY
  return hitungSisaHari(kontrak.tanggalBerakhir, hariIni)
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
    berakhir: (a, b) => kunciBerakhir(a, hariIni) - kunciBerakhir(b, hariIni),
    nilai: (a, b) => b.nilai - a.nilai,
    nama: (a, b) => a.judul.localeCompare(b.judul, 'id'),
  }
  return [...hasil].sort(pembanding[urutan])
}
