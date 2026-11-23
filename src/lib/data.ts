// Jalur untuk membaca dan mengubah data (kontrak, akun, riwayat, sesi masuk) dari halaman mana pun.
// Isinya disediakan oleh src/components/PenyediaData.tsx. Belum ada backend: semua data hidup di memori
// browser selama tab terbuka, jadi tambah, ubah, dan hapus benar-benar berjalan saat demo.
//
// Cara pakai di komponen:
//   const { kontrak, simpanKontrak } = useData()

import { createContext, useContext } from 'react'
import type { Akun, CatatanNonaktif, CatatanRiwayat, Dokumen, Kontrak } from '../types/kontrak'

/** Batas percobaan masuk sebelum akun dikunci sementara. */
export const MAKS_PERCOBAAN_MASUK = 5
/** Lama akun dikunci setelah terlalu banyak percobaan gagal, dalam detik. [ASUMSI] demo memakai 60 detik. */
export const LAMA_KUNCI_DETIK = 60

export type HasilMasuk =
  | { berhasil: true }
  | { berhasil: false; alasan: 'tidak-ada' | 'nonaktif' }
  | { berhasil: false; alasan: 'sandi'; sisaPercobaan: number }
  | { berhasil: false; alasan: 'terkunci'; sisaDetik: number }

export type IsiAdendum = {
  /** File adendum. Id dokumen dibuat oleh penyedia data. */
  dokumen: Omit<Dokumen, 'id'>
  /** Akhir kontrak yang baru, format YYYY-MM-DD. */
  tanggalBerakhir: string
  /** Nilai kontrak setelah adendum (sama dengan sebelumnya kalau tidak berubah). */
  nilai: number
}

export type IsianAkunBaru = Pick<Akun, 'nama' | 'email' | 'jabatan' | 'peran' | 'emailNotifikasi'>

/** Data diri yang boleh diubah pemilik akun di halaman Profil. Email kantor dan peran hanya diubah admin. */
export type IsianProfil = Pick<Akun, 'nama' | 'jabatan'>

/** Panjang minimal kata sandi baru (pola Sismon). */
export const MIN_PANJANG_SANDI = 8

export type NilaiData = {
  kontrak: Kontrak[]
  akun: Akun[]
  riwayat: CatatanRiwayat[]
  /** Akun yang sedang masuk, atau null kalau belum masuk. */
  pengguna: Akun | null

  masuk: (email: string, sandi: string) => HasilMasuk
  keluar: () => void

  /** Menambah (baru = true) atau mengubah kontrak. */
  simpanKontrak: (kontrak: Kontrak, baru: boolean) => void
  /** Menghapus kontrak secara permanen. Penghapusan dicatat di riwayat. */
  hapusKontrak: (id: string) => void
  /**
   * Menandai kontrak selesai. Status adendum yang belum diputuskan atau sedang diproses ikut menjadi
   * "Tidak diperpanjang", supaya catatan tidak bertentangan (impeccable harden, 19 Nov 2026).
   */
  tandaiSelesai: (id: string, keterangan: string) => void
  /**
   * Membuka kembali kontrak yang sudah ditandai selesai (misalnya salah tutup). Pengingat berjalan lagi;
   * status "Tidak diperpanjang" kembali menjadi "Belum diproses". Dicatat di riwayat.
   */
  bukaKembaliKontrak: (id: string) => void
  tambahDokumen: (kontrakId: string, dokumen: Dokumen) => void
  /**
   * Mencatat adendum perpanjangan dalam satu langkah: file adendum masuk ke daftar dokumen,
   * tanggal akhir dan nilai diganti, perpanjangan menjadi "Sudah diperpanjang", dan riwayat dicatat.
   * Pengingat ikut pindah karena dihitung dari tanggal akhir.
   */
  catatAdendum: (kontrakId: string, isi: IsiAdendum) => void

  /** Membuat akun baru. Mengembalikan kata sandi sementara. */
  tambahAkun: (isi: IsianAkunBaru) => string
  /** Membuat kata sandi sementara baru. Mengembalikan kata sandi itu. */
  resetSandi: (akunId: string) => string
  /** Mengaktifkan atau menonaktifkan akun. Menonaktifkan wajib menyertakan alasan (dicatat di akun dan riwayat). */
  ubahAktifAkun: (akunId: string, aktif: boolean, alasan?: Pick<CatatanNonaktif, 'alasan' | 'keterangan'>) => void
  /**
   * Menghapus akun secara permanen. HANYA untuk akun yang sudah nonaktif (Hisyam 19 Nov 2026).
   * Riwayat perubahan menyimpan nama sebagai teks, jadi jejak "siapa mengubah apa" tetap terbaca.
   */
  hapusAkun: (akunId: string) => void
  /** Mengganti email penerima pengingat (kosong = email kantor). Bisa oleh pemilik akun atau admin. Dicatat di riwayat. */
  ubahEmailNotifikasi: (akunId: string, email: string) => void
  /** Mengubah nama dan jabatan akun yang sedang masuk (halaman Profil). Dicatat di riwayat. */
  ubahProfil: (isi: IsianProfil) => void
  /**
   * Mengganti kata sandi akun yang sedang masuk. Mengembalikan false kalau kata sandi saat ini salah.
   * Panjang dan kecocokan kata sandi baru dicek di halaman Profil. Dicatat di riwayat (tanpa isi sandinya).
   */
  gantiSandi: (sandiLama: string, sandiBaru: string) => boolean

  /** Id notifikasi yang sudah dibaca. */
  notifikasiDibaca: ReadonlySet<string>
  tandaiDibaca: (ids: string[]) => void
}

export const KonteksData = createContext<NilaiData | null>(null)

export function useData(): NilaiData {
  const data = useContext(KonteksData)
  if (!data) throw new Error('useData harus dipakai di dalam <PenyediaData>.')
  return data
}

/** Akun yang sedang masuk. Dipakai di halaman yang hanya bisa dibuka setelah masuk. */
export function usePengguna(): Akun {
  const { pengguna } = useData()
  if (!pengguna) throw new Error('usePengguna dipakai di halaman yang belum dilindungi <RuteMasuk>.')
  return pengguna
}
