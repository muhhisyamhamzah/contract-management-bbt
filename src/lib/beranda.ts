// Hitungan untuk bagian-bagian Beranda (24 Nov 2026): nilai per status, pengingat bulan ini, adendum yang
// sedang diproses, garis waktu kontrak berakhir per bulan, dan aktivitas terakhir.
// Semua dihitung dari data yang sudah ada (tanpa kolom baru). Dipisah dari halaman supaya mudah diuji.

import type { CatatanRiwayat, Kontrak, StatusKontrak } from '../types/kontrak'
import { keTanggal } from './format'
import { hitungSisaHari, hitungStatus, jadwalPengingat } from './status'

/** Total nilai kontrak per status, untuk pil rekap status. */
export function hitungNilaiPerStatus(daftar: Kontrak[], hariIni: Date = new Date()): Record<StatusKontrak, number> {
  const nilai: Record<StatusKontrak, number> = { berjalan: 0, segera: 0, lewat: 0, selesai: 0 }
  for (const kontrak of daftar) {
    nilai[hitungStatus(kontrak, hariIni)] += kontrak.nilai
  }
  return nilai
}

export type PengingatBulanIni = {
  kontrak: Kontrak
  /** Tahap pengingat: 3, 2, atau 1 bulan sebelum habis. */
  bulan: number
  /** Tanggal pengingat, YYYY-MM-DD. */
  tanggal: string
  /** true kalau tanggalnya sudah lewat atau hari ini. */
  terkirim: boolean
}

/**
 * Pengingat 3/2/1 bulan yang jatuh pada bulan kalender ini, urut dari tanggal paling awal.
 * Kontrak yang sudah selesai tidak dihitung (pengingatnya berhenti).
 */
export function pengingatBulanIni(daftar: Kontrak[], hariIni: Date = new Date()): PengingatBulanIni[] {
  const awalan = `${hariIni.getFullYear()}-${String(hariIni.getMonth() + 1).padStart(2, '0')}`
  return daftar
    .filter((kontrak) => hitungStatus(kontrak, hariIni) !== 'selesai')
    .flatMap((kontrak) =>
      jadwalPengingat(kontrak.tanggalBerakhir, hariIni)
        .filter((tahap) => tahap.tanggal.startsWith(awalan))
        .map((tahap) => ({ kontrak, ...tahap })),
    )
    .sort((a, b) => a.tanggal.localeCompare(b.tanggal))
}

/** Kontrak dengan status adendum "Sedang diproses" yang belum selesai, dari yang paling cepat habis. */
export function adendumDiproses(daftar: Kontrak[], hariIni: Date = new Date()): Kontrak[] {
  return daftar
    .filter((kontrak) => kontrak.perpanjangan === 'proses' && hitungStatus(kontrak, hariIni) !== 'selesai')
    .sort((a, b) => hitungSisaHari(a.tanggalBerakhir, hariIni) - hitungSisaHari(b.tanggalBerakhir, hariIni))
}

/** Jumlah bulan di garis waktu Beranda, mulai bulan ini. */
export const JUMLAH_BULAN_GARIS_WAKTU = 12

export type BulanBerakhir = {
  /** Kunci bulan YYYY-MM, sama dengan parameter ?bulan= di halaman Kontrak. */
  kunci: string
  /** Hari pertama bulan itu. */
  tanggal: Date
  /** Kontrak yang berakhir di bulan itu, urut tanggal akhir. */
  kontrak: Kontrak[]
  nilai: number
}

/** Kontrak yang berakhir di setiap bulan, mulai bulan ini sampai JUMLAH_BULAN_GARIS_WAKTU bulan ke depan. */
export function berakhirPerBulan(daftar: Kontrak[], hariIni: Date = new Date()): BulanBerakhir[] {
  return Array.from({ length: JUMLAH_BULAN_GARIS_WAKTU }, (_, i) => {
    const tanggal = new Date(hariIni.getFullYear(), hariIni.getMonth() + i, 1)
    const kunci = `${tanggal.getFullYear()}-${String(tanggal.getMonth() + 1).padStart(2, '0')}`
    const kontrak = daftar
      .filter((k) => k.tanggalBerakhir.startsWith(kunci))
      .sort((a, b) => a.tanggalBerakhir.localeCompare(b.tanggalBerakhir))
    return { kunci, tanggal, kontrak, nilai: kontrak.reduce((total, k) => total + k.nilai, 0) }
  })
}

/** Mengubah teks dari alamat (misalnya ?bulan=2027-01) menjadi kunci bulan yang sah, atau null. */
export function bacaBulan(teks: string | null): string | null {
  return teks && /^\d{4}-(0[1-9]|1[0-2])$/.test(teks) ? teks : null
}

/** Contoh: "2027-01" menjadi "Januari 2027". */
export function formatBulan(kunci: string): string {
  return keTanggal(`${kunci}-01`).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })
}

/** Jumlah aktivitas di Beranda. */
export const JUMLAH_AKTIVITAS = 5

/**
 * Perubahan kontrak terbaru untuk Beranda. [ASUMSI] Semua pengguna boleh melihatnya; perubahan akun
 * (aksi "akun") tetap hanya di halaman Admin.
 */
export function aktivitasTerakhir(riwayat: CatatanRiwayat[]): CatatanRiwayat[] {
  return riwayat
    .filter((catatan) => catatan.aksi !== 'akun')
    .toSorted((a, b) => b.waktu.localeCompare(a.waktu))
    .slice(0, JUMLAH_AKTIVITAS)
}
