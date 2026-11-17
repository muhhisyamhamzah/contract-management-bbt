// Penyedia data: menyimpan kontrak, akun, riwayat perubahan, sesi masuk, dan notifikasi yang sudah dibaca.
// Dipasang sekali di main.tsx. Halaman membaca dan mengubah data lewat useData() (src/lib/data.ts).
//
// Belum ada backend: data dimulai dari data contoh dan hidup di memori selama tab terbuka.
// Sesi masuk disimpan di sessionStorage supaya tidak keluar sendiri saat halaman dimuat ulang.

import { useCallback, useMemo, useRef, useState, type ReactNode } from 'react'
import { akunContoh, riwayatContoh } from '../data/akunContoh'
import { kontrakContoh } from '../data/kontrakContoh'
import {
  KonteksData,
  LAMA_KUNCI_DETIK,
  MAKS_PERCOBAAN_MASUK,
  type HasilMasuk,
  type IsianAkunBaru,
  type NilaiData,
} from '../lib/data'
import type { Akun, CatatanRiwayat, Dokumen, Kontrak } from '../types/kontrak'

const KUNCI_SESI = 'cm-bbt-pengguna'

/** Kata sandi sementara 10 karakter, tanpa huruf yang mirip (0/O, 1/l). */
function buatSandiSementara(): string {
  const huruf = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789'
  const acak = new Uint32Array(10)
  crypto.getRandomValues(acak)
  return Array.from(acak, (n) => huruf[n % huruf.length]).join('')
}

type Props = {
  children: ReactNode
}

function PenyediaData({ children }: Props) {
  const [kontrak, setKontrak] = useState<Kontrak[]>(kontrakContoh)
  const [akun, setAkun] = useState<Akun[]>(akunContoh)
  const [riwayat, setRiwayat] = useState<CatatanRiwayat[]>(riwayatContoh)
  const [penggunaId, setPenggunaId] = useState<string | null>(() => sessionStorage.getItem(KUNCI_SESI))
  const [notifikasiDibaca, setNotifikasiDibaca] = useState<ReadonlySet<string>>(new Set())

  // Percobaan masuk yang gagal per email, dan waktu kunci berakhir (milidetik).
  const percobaan = useRef(new Map<string, { gagal: number; kunciSampai: number }>())

  const pengguna = akun.find((a) => a.id === penggunaId && a.aktif) ?? null
  const namaPengguna = pengguna?.nama ?? '[Tidak diketahui]'

  const catat = useCallback(
    (isi: Omit<CatatanRiwayat, 'id' | 'waktu' | 'oleh'>) => {
      setRiwayat((lama) => [
        { id: `r-${Date.now()}-${lama.length}`, waktu: new Date().toISOString(), oleh: namaPengguna, ...isi },
        ...lama,
      ])
    },
    [namaPengguna],
  )

  const masuk = useCallback(
    (email: string, sandi: string): HasilMasuk => {
      const kunci = email.trim().toLowerCase()
      const catatan = percobaan.current.get(kunci) ?? { gagal: 0, kunciSampai: 0 }
      const sekarang = Date.now()

      if (catatan.kunciSampai > sekarang) {
        return { berhasil: false, alasan: 'terkunci', sisaDetik: Math.ceil((catatan.kunciSampai - sekarang) / 1000) }
      }

      const ditemukan = akun.find((a) => a.email.toLowerCase() === kunci)
      if (!ditemukan) return { berhasil: false, alasan: 'tidak-ada' }
      if (!ditemukan.aktif) return { berhasil: false, alasan: 'nonaktif' }

      if (ditemukan.sandi !== sandi) {
        const gagal = catatan.gagal + 1
        if (gagal >= MAKS_PERCOBAAN_MASUK) {
          percobaan.current.set(kunci, { gagal: 0, kunciSampai: sekarang + LAMA_KUNCI_DETIK * 1000 })
          return { berhasil: false, alasan: 'terkunci', sisaDetik: LAMA_KUNCI_DETIK }
        }
        percobaan.current.set(kunci, { gagal, kunciSampai: 0 })
        return { berhasil: false, alasan: 'sandi', sisaPercobaan: MAKS_PERCOBAAN_MASUK - gagal }
      }

      percobaan.current.delete(kunci)
      sessionStorage.setItem(KUNCI_SESI, ditemukan.id)
      setPenggunaId(ditemukan.id)
      return { berhasil: true }
    },
    [akun],
  )

  const keluar = useCallback(() => {
    sessionStorage.removeItem(KUNCI_SESI)
    setPenggunaId(null)
  }, [])

  const simpanKontrak = useCallback(
    (data: Kontrak, baru: boolean) => {
      setKontrak((lama) => (baru ? [data, ...lama] : lama.map((k) => (k.id === data.id ? data : k))))
      catat({
        aksi: baru ? 'tambah' : 'ubah',
        rincian: `${baru ? 'Menambah' : 'Mengubah'} kontrak "${data.nama}"`,
        kontrakId: data.id,
      })
    },
    [catat],
  )

  const hapusKontrak = useCallback(
    (id: string) => {
      const target = kontrak.find((k) => k.id === id)
      if (!target) return
      setKontrak((lama) => lama.filter((k) => k.id !== id))
      // Nama dan nomor PKS disimpan di catatan, karena kontraknya sudah tidak ada.
      catat({ aksi: 'hapus', rincian: `Menghapus kontrak "${target.nama}" (${target.nomorPks})` })
    },
    [kontrak, catat],
  )

  const tandaiSelesai = useCallback(
    (id: string, keterangan: string) => {
      const target = kontrak.find((k) => k.id === id)
      if (!target) return
      setKontrak((lama) =>
        lama.map((k) => (k.id === id ? { ...k, ditandaiSelesai: true, keteranganSelesai: keterangan } : k)),
      )
      catat({ aksi: 'selesai', rincian: `Menandai selesai "${target.nama}"`, kontrakId: id })
    },
    [kontrak, catat],
  )

  const tandaiCriticalSelesai = useCallback(
    (kontrakId: string, butirId: string, penanganan: string) => {
      const target = kontrak.find((k) => k.id === kontrakId)
      const butir = target?.criticalPoint.find((b) => b.id === butirId)
      if (!target || !butir) return
      setKontrak((lama) =>
        lama.map((k) =>
          k.id === kontrakId
            ? {
                ...k,
                criticalPoint: k.criticalPoint.map((b) =>
                  b.id === butirId ? { ...b, status: 'selesai', penanganan } : b,
                ),
              }
            : k,
        ),
      )
      catat({
        aksi: 'selesai',
        rincian: `Menandai selesai critical point ${butir.pasal || ''} di "${target.nama}"`.replace('  ', ' '),
        kontrakId,
      })
    },
    [kontrak, catat],
  )

  const tambahDokumen = useCallback(
    (kontrakId: string, dokumen: Dokumen) => {
      const target = kontrak.find((k) => k.id === kontrakId)
      if (!target) return
      setKontrak((lama) => lama.map((k) => (k.id === kontrakId ? { ...k, dokumen: [...k.dokumen, dokumen] } : k)))
      catat({ aksi: 'unggah', rincian: `Mengunggah ${dokumen.nama} ke "${target.nama}"`, kontrakId })
    },
    [kontrak, catat],
  )

  const tambahAkun = useCallback(
    (isi: IsianAkunBaru) => {
      const sandi = buatSandiSementara()
      setAkun((lama) => [...lama, { ...isi, id: `a-${Date.now()}`, aktif: true, sandi }])
      catat({ aksi: 'akun', rincian: `Membuat akun ${isi.nama} (${isi.peran === 'admin' ? 'Admin IT' : 'Pengguna'})` })
      return sandi
    },
    [catat],
  )

  const resetSandi = useCallback(
    (akunId: string) => {
      const sandi = buatSandiSementara()
      const target = akun.find((a) => a.id === akunId)
      setAkun((lama) => lama.map((a) => (a.id === akunId ? { ...a, sandi } : a)))
      if (target) catat({ aksi: 'akun', rincian: `Mereset kata sandi ${target.nama}` })
      return sandi
    },
    [akun, catat],
  )

  const ubahAktifAkun = useCallback(
    (akunId: string, aktif: boolean) => {
      const target = akun.find((a) => a.id === akunId)
      setAkun((lama) => lama.map((a) => (a.id === akunId ? { ...a, aktif } : a)))
      if (target) catat({ aksi: 'akun', rincian: `${aktif ? 'Mengaktifkan' : 'Menonaktifkan'} akun ${target.nama}` })
    },
    [akun, catat],
  )

  const tandaiDibaca = useCallback((ids: string[]) => {
    setNotifikasiDibaca((lama) => new Set([...lama, ...ids]))
  }, [])

  const nilai = useMemo<NilaiData>(
    () => ({
      kontrak,
      akun,
      riwayat,
      pengguna,
      masuk,
      keluar,
      simpanKontrak,
      hapusKontrak,
      tandaiSelesai,
      tandaiCriticalSelesai,
      tambahDokumen,
      tambahAkun,
      resetSandi,
      ubahAktifAkun,
      notifikasiDibaca,
      tandaiDibaca,
    }),
    [
      kontrak,
      akun,
      riwayat,
      pengguna,
      masuk,
      keluar,
      simpanKontrak,
      hapusKontrak,
      tandaiSelesai,
      tandaiCriticalSelesai,
      tambahDokumen,
      tambahAkun,
      resetSandi,
      ubahAktifAkun,
      notifikasiDibaca,
      tandaiDibaca,
    ],
  )

  return <KonteksData.Provider value={nilai}>{children}</KonteksData.Provider>
}

export default PenyediaData
