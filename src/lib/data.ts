// Jalur untuk membaca dan mengubah data (kontrak, akun, riwayat, sesi masuk) dari halaman mana pun.
// Isinya disediakan oleh src/components/PenyediaData.tsx. Belum ada backend: semua data hidup di memori
// browser selama tab terbuka, jadi tambah, ubah, dan hapus benar-benar berjalan saat demo.
//
// Cara pakai di komponen:
//   const { kontrak, simpanKontrak } = useData()

import { createContext, useContext } from 'react'
import type { Akun, CatatanRiwayat, Dokumen, Kontrak } from '../types/kontrak'

/** Batas percobaan masuk sebelum akun dikunci sementara. */
export const MAKS_PERCOBAAN_MASUK = 5
/** Lama akun dikunci setelah terlalu banyak percobaan gagal, dalam detik. [ASUMSI] demo memakai 60 detik. */
export const LAMA_KUNCI_DETIK = 60

export type HasilMasuk =
  | { berhasil: true }
  | { berhasil: false; alasan: 'tidak-ada' | 'nonaktif' }
  | { berhasil: false; alasan: 'sandi'; sisaPercobaan: number }
  | { berhasil: false; alasan: 'terkunci'; sisaDetik: number }

export type IsianAkunBaru = Pick<Akun, 'nama' | 'email' | 'jabatan' | 'peran'>

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
  tandaiSelesai: (id: string, keterangan: string) => void
  tandaiCriticalSelesai: (kontrakId: string, butirId: string, penanganan: string) => void
  tambahDokumen: (kontrakId: string, dokumen: Dokumen) => void

  /** Membuat akun baru. Mengembalikan kata sandi sementara. */
  tambahAkun: (isi: IsianAkunBaru) => string
  /** Membuat kata sandi sementara baru. Mengembalikan kata sandi itu. */
  resetSandi: (akunId: string) => string
  ubahAktifAkun: (akunId: string, aktif: boolean) => void

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
