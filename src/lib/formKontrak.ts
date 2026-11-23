// Data, validasi, dan konversi form Tambah / Ubah kontrak (satu halaman).
// Dipisah dari tampilan supaya mudah diuji dan sama persis untuk form tambah dan ubah.

import type { Dokumen, KetentuanKontrak, Kontrak, Perpanjangan } from '../types/kontrak'
import { urutkanDokumen } from './daftarKontrak'
import { ambilVersi, simpanVersiBerlaku } from './versiKontrak'
import { hariIniTeks } from './format'

/** File PKS yang dipilih di form (semua jenis file boleh). `url` = alamat sementara browser untuk pratinjau (purwarupa). */
export type FileDipilih = { nama: string; ukuran: number; url?: string }

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
  /** Empat kolom ketentuan kontrak, boleh kosong. */
  ketentuan: KetentuanKontrak
  /** Perpanjangan kontrak. Bawaan "Belum diproses". */
  perpanjangan: Perpanjangan
  /** File PKS baru yang dipilih. Kosong kalau tidak memilih file baru. */
  filePks: FileDipilih | null
  /** Nama file PKS yang sudah tersimpan (form ubah). Kosong untuk kontrak baru. */
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
  ketentuan: { pengakhiran: '', denda: '', jaminan: '', keterangan: '' },
  perpanjangan: 'belum',
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
  'filePks',
] as const

export type KolomForm = (typeof URUTAN_KOLOM)[number]

/** Pesan kesalahan per kolom. Kolom yang benar tidak punya pesan. */
export type GalatForm = Partial<Record<KolomForm, string>>

/** Membuang semua karakter selain angka, misalnya "1.200.000" menjadi "1200000". */
/**
 * Paling banyak 15 digit (sampai Rp 999 triliun). Angka JavaScript hanya akurat sampai sekitar 9 kuadriliun,
 * jadi salah ketik dengan terlalu banyak digit bisa tersimpan keliru tanpa peringatan (impeccable harden, 19 Nov 2026).
 */
export const MAKS_DIGIT_NILAI = 15

/** Isian rupiah: hanya angka, tanpa nol di depan, paling banyak MAKS_DIGIT_NILAI digit. */
export function hanyaAngka(teks: string): string {
  return teks.replace(/\D/g, '').replace(/^0+(?=\d)/, '').slice(0, MAKS_DIGIT_NILAI)
}

/** Menampilkan angka dengan titik ribuan, misalnya "1200000" menjadi "1.200.000". */
export function denganTitikRibuan(angka: string): string {
  return angka ? Number(angka).toLocaleString('id-ID') : ''
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

  if (!data.filePks && !data.namaPksLama) galat.filePks = 'Unggah file PKS sebagai bukti kontrak.'

  return galat
}

/** Mengisi form dari kontrak yang sudah ada (form ubah). */
export function dariKontrak(kontrak: Kontrak): DataFormKontrak {
  // PKS yang berlaku = PKS utama paling baru (PKS lama tetap tersimpan sebagai riwayat).
  const pks = urutkanDokumen(kontrak.dokumen).findLast((d) => d.jenis === 'PKS utama')
  return {
    nama: kontrak.nama,
    penyedia: kontrak.penyedia,
    nomorPks: kontrak.nomorPks,
    tanggalPks: kontrak.tanggalPks,
    tanggalMulai: kontrak.tanggalMulai,
    tanggalBerakhir: kontrak.tanggalBerakhir,
    nilai: String(kontrak.nilai),
    ketentuan: { ...kontrak.ketentuan },
    perpanjangan: kontrak.perpanjangan,
    filePks: null,
    namaPksLama: pks?.nama ?? '',
  }
}

/** Mengubah isi form menjadi data kontrak. `lama` diisi saat mengubah kontrak yang sudah ada. */
export function keKontrak(data: DataFormKontrak, id: string, lama?: Kontrak): Kontrak {
  // Kalau PKS berganti, versi yang sedang berlaku menyimpan datanya dulu (lihat src/lib/versiKontrak.ts).
  let dokumen: Dokumen[] = lama ? (data.filePks ? simpanVersiBerlaku(lama) : lama.dokumen) : []
  if (data.filePks) {
    const pksBaru: Dokumen = {
      id: `${id}-pks-${Date.now()}`,
      nama: data.filePks.nama,
      jenis: 'PKS utama',
      ukuran: data.filePks.ukuran,
      tanggal: hariIniTeks(),
      url: data.filePks.url,
    }
    // PKS lama TIDAK dihapus: tetap ada di daftar dokumen sebagai riwayat (PKS awal, adendum, PKS baru).
    dokumen = [...dokumen, pksBaru]
  }

  const hasil: Kontrak = {
    id,
    nama: data.nama.trim(),
    penyedia: data.penyedia.trim(),
    nomorPks: data.nomorPks.trim(),
    tanggalPks: data.tanggalPks,
    tanggalMulai: data.tanggalMulai,
    tanggalBerakhir: data.tanggalBerakhir,
    nilai: Number(data.nilai),
    ketentuan: {
      pengakhiran: data.ketentuan.pengakhiran.trim(),
      denda: data.ketentuan.denda.trim(),
      jaminan: data.ketentuan.jaminan.trim(),
      keterangan: data.ketentuan.keterangan.trim(),
    },
    perpanjangan: data.perpanjangan,
    dokumen,
    ditandaiSelesai: lama?.ditandaiSelesai ?? false,
    keteranganSelesai: lama?.keteranganSelesai ?? '',
  }
  // PKS baru menyimpan data kontrak yang berlaku sejak PKS itu (versi).
  if (data.filePks) {
    const idPks = dokumen.at(-1)?.id
    hasil.dokumen = dokumen.map((d) => (d.id === idPks ? { ...d, versi: ambilVersi(hasil) } : d))
  }
  return hasil
}
