// Data, validasi, dan konversi form Tambah / Ubah kontrak (satu halaman).
// Dipisah dari tampilan supaya mudah diuji dan sama persis untuk form tambah dan ubah.

import type { CriticalPoint, Dokumen, JenisCriticalPoint, Kontrak } from '../types/kontrak'
import { hariIniTeks } from './format'

/** Batas ukuran file PDF. [ASUMSI] 10 MB, menunggu konfirmasi atasan. */
export const MAKS_UKURAN_PDF = 10 * 1024 * 1024

/** File PDF yang dipilih di form (belum ada backend, jadi hanya nama dan ukurannya yang disimpan). */
export type FileDipilih = { nama: string; ukuran: number }

/** Isi form selama diketik. Angka disimpan sebagai teks supaya mudah diketik. */
export type DataFormKontrak = {
  nama: string
  penyedia: string
  nomorPks: string
  /** Format YYYY-MM-DD */
  tanggalPks: string
  /** Format YYYY-MM-DD */
  tanggalMulai: string
  /** Format YYYY-MM-DD */
  tanggalBerakhir: string
  /** Nilai rupiah, hanya angka tanpa titik (misalnya "1200000000"). */
  nilai: string
  criticalPoint: CriticalPoint[]
  monitoring: string
  catatan: string
  keterangan: string
  /** PDF PKS baru yang dipilih. Kosong kalau tidak memilih file baru. */
  filePks: FileDipilih | null
  /** Nama PDF PKS yang sudah tersimpan (form ubah). Kosong untuk kontrak baru. */
  namaPksLama: string
}

export const DATA_AWAL: DataFormKontrak = {
  nama: '',
  penyedia: '',
  nomorPks: '',
  tanggalPks: '',
  tanggalMulai: '',
  tanggalBerakhir: '',
  nilai: '',
  criticalPoint: [],
  monitoring: '',
  catatan: '',
  keterangan: '',
  filePks: null,
  namaPksLama: '',
}

/** Kolom yang bisa salah. Urutannya sama dengan urutan di layar, untuk memindah fokus ke kolom pertama yang salah. */
export const URUTAN_KOLOM = [
  'nama',
  'penyedia',
  'nomorPks',
  'tanggalPks',
  'tanggalMulai',
  'tanggalBerakhir',
  'nilai',
  'criticalPoint',
  'filePks',
] as const

export type KolomForm = (typeof URUTAN_KOLOM)[number]

/** Pesan kesalahan per kolom. Kolom yang benar tidak punya pesan. */
export type GalatForm = Partial<Record<KolomForm, string>>

/** Membuang semua karakter selain angka, misalnya "1.200.000" menjadi "1200000". */
export function hanyaAngka(teks: string): string {
  return teks.replace(/\D/g, '')
}

/** Menampilkan angka dengan titik ribuan, misalnya "1200000" menjadi "1.200.000". */
export function denganTitikRibuan(angka: string): string {
  return angka ? Number(angka).toLocaleString('id-ID') : ''
}

/** Memeriksa file PDF. Mengembalikan pesan kesalahan, atau teks kosong kalau sah. */
export function periksaPdf(file: { name: string; type: string; size: number }): string {
  const pdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
  if (!pdf) return `"${file.name}" bukan file PDF. Pilih file berakhiran .pdf.`
  if (file.size > MAKS_UKURAN_PDF) return `"${file.name}" lebih dari 10 MB. Perkecil file lalu pilih lagi.`
  return ''
}

/** Normalisasi nomor PKS untuk membandingkan nomor ganda (abaikan spasi dan huruf besar/kecil). */
function kunciNomor(nomor: string): string {
  return nomor.replace(/\s+/g, '').toLowerCase()
}

/**
 * Memeriksa seluruh isian form.
 * `daftar` dipakai untuk menolak nomor PKS ganda; `idSendiri` dikecualikan saat mengubah kontrak.
 */
export function periksaForm(data: DataFormKontrak, daftar: Kontrak[], idSendiri?: string): GalatForm {
  const galat: GalatForm = {}

  if (!data.nama.trim()) galat.nama = 'Isi nama kontrak sesuai dokumen PKS.'
  if (!data.penyedia.trim()) galat.penyedia = 'Isi nama penyedia, misalnya nama perusahaan.'

  if (!data.nomorPks.trim()) {
    galat.nomorPks = 'Isi nomor PKS, misalnya 045/BBT/PKS/2026.'
  } else {
    const ganda = daftar.find((k) => k.id !== idSendiri && kunciNomor(k.nomorPks) === kunciNomor(data.nomorPks))
    if (ganda) galat.nomorPks = `Nomor PKS ini sudah dipakai kontrak "${ganda.nama}". Periksa lagi nomornya.`
  }

  if (!data.tanggalPks) galat.tanggalPks = 'Pilih tanggal PKS ditandatangani.'
  if (!data.tanggalMulai) galat.tanggalMulai = 'Pilih tanggal awal kontrak.'
  if (!data.tanggalBerakhir) {
    galat.tanggalBerakhir = 'Pilih tanggal akhir kontrak.'
  } else if (data.tanggalMulai && data.tanggalBerakhir <= data.tanggalMulai) {
    // Format YYYY-MM-DD bisa dibandingkan langsung sebagai teks.
    galat.tanggalBerakhir = 'Tanggal akhir harus setelah tanggal awal kontrak.'
  }

  if (!data.nilai || Number(data.nilai) <= 0) galat.nilai = 'Isi nilai kontrak dalam rupiah, lebih dari 0.'

  const butirKosong = data.criticalPoint.findIndex((b) => !b.ringkasan.trim())
  if (butirKosong >= 0) {
    galat.criticalPoint = `Critical point ke-${butirKosong + 1} belum punya ringkasan. Isi ringkasannya atau hapus butir itu.`
  }

  if (!data.filePks && !data.namaPksLama) galat.filePks = 'Unggah file PDF PKS sebagai bukti kontrak.'

  return galat
}

/** Membuat critical point kosong untuk form. */
export function butirBaru(jenis: JenisCriticalPoint = 'pengakhiran'): CriticalPoint {
  return {
    id: `cp-${Date.now()}-${Math.round(Math.random() * 1000)}`,
    jenis,
    pasal: '',
    ringkasan: '',
    tanggalPenting: '',
    status: 'aktif',
    penanganan: '',
  }
}

/** Mengisi form dari kontrak yang sudah ada (form ubah). */
export function dariKontrak(kontrak: Kontrak): DataFormKontrak {
  const pks = kontrak.dokumen.find((d) => d.jenis === 'PKS utama')
  return {
    nama: kontrak.nama,
    penyedia: kontrak.penyedia,
    nomorPks: kontrak.nomorPks,
    tanggalPks: kontrak.tanggalPks,
    tanggalMulai: kontrak.tanggalMulai,
    tanggalBerakhir: kontrak.tanggalBerakhir,
    nilai: String(kontrak.nilai),
    criticalPoint: kontrak.criticalPoint.map((b) => ({ ...b })),
    monitoring: kontrak.monitoring,
    catatan: kontrak.catatan,
    keterangan: kontrak.keterangan,
    filePks: null,
    namaPksLama: pks?.nama ?? '',
  }
}

/** Mengubah isi form menjadi data kontrak. `lama` diisi saat mengubah kontrak yang sudah ada. */
export function keKontrak(data: DataFormKontrak, id: string, lama?: Kontrak): Kontrak {
  let dokumen: Dokumen[] = lama?.dokumen ?? []
  if (data.filePks) {
    const pksBaru: Dokumen = {
      id: `${id}-pks-${Date.now()}`,
      nama: data.filePks.nama,
      jenis: 'PKS utama',
      ukuran: data.filePks.ukuran,
      tanggal: hariIniTeks(),
    }
    dokumen = [pksBaru, ...dokumen.filter((d) => d.jenis !== 'PKS utama')]
  }

  return {
    id,
    nama: data.nama.trim(),
    penyedia: data.penyedia.trim(),
    nomorPks: data.nomorPks.trim(),
    tanggalPks: data.tanggalPks,
    tanggalMulai: data.tanggalMulai,
    tanggalBerakhir: data.tanggalBerakhir,
    nilai: Number(data.nilai),
    criticalPoint: data.criticalPoint.map((b) => ({ ...b, pasal: b.pasal.trim(), ringkasan: b.ringkasan.trim() })),
    monitoring: data.monitoring.trim(),
    catatan: data.catatan.trim(),
    keterangan: data.keterangan.trim(),
    dokumen,
    ditandaiSelesai: lama?.ditandaiSelesai ?? false,
    keteranganSelesai: lama?.keteranganSelesai ?? '',
  }
}
