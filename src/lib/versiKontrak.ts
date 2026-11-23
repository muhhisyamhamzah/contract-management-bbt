// Versi data kontrak per dokumen (permintaan atasan, 20 Nov 2026).
// Setiap PKS dan adendum menyimpan data kontrak saat dokumen itu berlaku (Dokumen.versi). Saat dokumen lama dibuka
// di halaman Detail, data versi itu ditampilkan di samping data terbaru: data kontrak, ketentuan, dan riwayat.
// Dokumen lain (BAST, lainnya) mengikuti versi yang berlaku pada tanggal unggahnya.

import type { Dokumen, Kontrak, VersiKontrak } from '../types/kontrak'
import { urutkanDokumen } from './daftarKontrak'

/** PKS dan adendum menandai versi baru; dokumen lain tidak. */
export function dokumenBerversi(dokumen: Dokumen): boolean {
  return dokumen.jenis === 'PKS utama' || dokumen.jenis === 'Adendum'
}

/** Mengambil isi versi dari data kontrak saat ini. */
export function ambilVersi(kontrak: Kontrak): VersiKontrak {
  const { nama, penyedia, nomorPks, tanggalPks, tanggalMulai, tanggalBerakhir, nilai, ketentuan, perpanjangan } = kontrak
  return { nama, penyedia, nomorPks, tanggalPks, tanggalMulai, tanggalBerakhir, nilai, ketentuan: { ...ketentuan }, perpanjangan }
}

/**
 * Sebelum versi baru (adendum atau PKS pengganti) ditambahkan: pastikan versi yang sedang berlaku menyimpan datanya,
 * supaya data lama tidak hilang saat kontrak diperbarui.
 */
export function simpanVersiBerlaku(kontrak: Kontrak): Dokumen[] {
  const berlaku = urutkanDokumen(kontrak.dokumen).filter(dokumenBerversi).at(-1)
  if (!berlaku || berlaku.versi) return kontrak.dokumen
  return kontrak.dokumen.map((d) => (d.id === berlaku.id ? { ...d, versi: ambilVersi(kontrak) } : d))
}

export type InfoVersi = {
  /** PKS / adendum yang menentukan versi dokumen yang dibuka. */
  dokumenVersi: Dokumen
  /** true kalau versi ini yang berlaku sekarang (tidak perlu dibandingkan). */
  terbaru: boolean
  /** Data kontrak versi ini. Kosong kalau tidak tercatat (data lama). */
  data?: VersiKontrak
  /** Tanggal versi ini mulai berlaku. */
  mulai: string
  /** Tanggal versi berikutnya mulai berlaku (kosong kalau ini yang terbaru). */
  sampai?: string
  /** Jumlah adendum sampai versi ini. */
  jumlahAdendum: number
}

/** Versi data kontrak untuk dokumen yang dibuka. */
export function cariVersi(kontrak: Kontrak, dokumen: Dokumen): InfoVersi | null {
  const urut = urutkanDokumen(kontrak.dokumen).filter(dokumenBerversi)
  const dokumenVersi = dokumenBerversi(dokumen) ? dokumen : urut.filter((d) => d.tanggal <= dokumen.tanggal).at(-1)
  if (!dokumenVersi) return null
  const i = urut.findIndex((d) => d.id === dokumenVersi.id)
  return {
    dokumenVersi,
    terbaru: i === urut.length - 1,
    data: dokumenVersi.versi,
    mulai: dokumenVersi.tanggal,
    sampai: urut[i + 1]?.tanggal,
    jumlahAdendum: urut.slice(0, i + 1).filter((d) => d.jenis === 'Adendum').length,
  }
}
