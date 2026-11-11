// Data dan aturan validasi form Tambah kontrak (3 langkah).
// Dipisah dari tampilan supaya mudah diuji dan bisa dipakai ulang untuk form Edit nanti.

import type { JenisKontrak, PengingatHari } from '../types/kontrak'

export type Langkah = 1 | 2 | 3

export const NAMA_LANGKAH: Record<Langkah, string> = {
  1: 'Info kontrak',
  2: 'Nilai dan waktu',
  3: 'Dokumen dan pengingat',
}

/** Pilihan sementara (menunggu konfirmasi, lihat CLAUDE.md). */
export const PILIHAN_JENIS: JenisKontrak[] = ['PKS', 'SPK', 'Lainnya']
export const PILIHAN_PENGINGAT: PengingatHari[] = [30, 60, 90]
export const UNIT_KERJA = ['[Unit kerja A]', '[Unit kerja B]']

/** Batas jumlah termin pembayaran yang bisa ditambahkan. */
export const MAKS_TERMIN = 6

export type IsianTermin = {
  /** Bulan jatuh tempo, format YYYY-MM. */
  bulan: string
  /** Persen dari nilai kontrak, berupa teks angka. */
  persen: string
}

/** Isi form selama diketik. Angka disimpan sebagai teks supaya mudah diketik. */
export type DataFormKontrak = {
  judul: string
  nomor: string
  jenis: JenisKontrak
  mitra: string
  unitPemilik: string
  /** Nilai rupiah, hanya angka tanpa titik (misalnya "1200000000"). */
  nilai: string
  /** Format YYYY-MM-DD */
  tanggalMulai: string
  /** Format YYYY-MM-DD */
  tanggalBerakhir: string
  pakaiTermin: boolean
  termin: IsianTermin[]
  /** Nama file dokumen yang dipilih, kosong kalau belum ada. */
  namaFile: string
  pengingatHari: PengingatHari
}

export const DATA_AWAL: DataFormKontrak = {
  judul: '',
  nomor: '',
  jenis: 'PKS',
  mitra: '',
  unitPemilik: '',
  nilai: '',
  tanggalMulai: '',
  tanggalBerakhir: '',
  pakaiTermin: true,
  termin: [
    { bulan: '', persen: '' },
    { bulan: '', persen: '' },
  ],
  namaFile: '',
  pengingatHari: 30,
}

/** Membuang semua karakter selain angka, misalnya "1.200.000" menjadi "1200000". */
export function hanyaAngka(teks: string): string {
  return teks.replace(/\D/g, '')
}

/** Menampilkan angka dengan titik ribuan, misalnya "1200000" menjadi "1.200.000". */
export function denganTitikRibuan(angka: string): string {
  return angka ? Number(angka).toLocaleString('id-ID') : ''
}

/** Nama kolom wajib yang masih kosong di langkah ini, untuk ditandai merah. */
export function kolomKosong(langkah: Langkah, data: DataFormKontrak): (keyof DataFormKontrak)[] {
  const wajib: Record<Langkah, (keyof DataFormKontrak)[]> = {
    1: ['judul', 'nomor', 'mitra'],
    2: ['nilai', 'tanggalMulai', 'tanggalBerakhir'],
    3: [],
  }
  return wajib[langkah].filter((kolom) => !String(data[kolom]).trim())
}

/**
 * Memeriksa isian satu langkah sebelum boleh lanjut.
 * Mengembalikan pesan kesalahan, atau teks kosong kalau sudah benar.
 */
export function periksaLangkah(langkah: Langkah, data: DataFormKontrak): string {
  if (langkah === 1 && kolomKosong(1, data).length > 0) {
    return 'Isi judul, nomor kontrak, dan mitra dulu.'
  }
  if (langkah === 2) {
    if (kolomKosong(2, data).length > 0) return 'Isi nilai serta tanggal mulai dan berakhir.'
    // Format YYYY-MM-DD bisa dibandingkan langsung sebagai teks.
    if (data.tanggalBerakhir <= data.tanggalMulai) return 'Tanggal berakhir harus setelah tanggal mulai.'
  }
  return ''
}

/** Class bersama untuk kotak isian (input dan select). */
export const KELAS_ISIAN =
  'h-[50px] w-full min-w-0 rounded-[14px] border border-garis-input bg-white px-3.5 text-[15px] font-normal text-teks outline-none focus:border-aksi focus:ring-2 focus:ring-aksi/20 aria-[invalid=true]:border-hapus'
