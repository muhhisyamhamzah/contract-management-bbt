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
  type IsiAdendum,
  type IsianAkunBaru,
  type IsianProfil,
  type NilaiData,
} from '../lib/data'
import { formatRupiah, formatTanggalSingkat } from '../lib/format'
import { ambilVersi, dokumenBerversi, simpanVersiBerlaku } from '../lib/versiKontrak'
import type { Akun, CatatanNonaktif, CatatanRiwayat, Dokumen, Kontrak } from '../types/kontrak'

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
      // Kontrak yang sudah diperpanjang tetap "Sudah diperpanjang"; selain itu ditutup = tidak diperpanjang.
      const perpanjangan = target.perpanjangan === 'diperpanjang' ? 'diperpanjang' : 'tidak'
      setKontrak((lama) =>
        lama.map((k) => (k.id === id ? { ...k, ditandaiSelesai: true, keteranganSelesai: keterangan, perpanjangan } : k)),
      )
      const berubah = perpanjangan !== target.perpanjangan ? ' Status adendum menjadi Tidak diperpanjang.' : ''
      catat({ aksi: 'selesai', rincian: `Menandai selesai "${target.nama}". Keterangan: ${keterangan}.${berubah}`, kontrakId: id })
    },
    [kontrak, catat],
  )

  const bukaKembaliKontrak = useCallback(
    (id: string) => {
      const target = kontrak.find((k) => k.id === id)
      if (!target || !target.ditandaiSelesai) return
      const perpanjangan = target.perpanjangan === 'tidak' ? 'belum' : target.perpanjangan
      setKontrak((lama) =>
        lama.map((k) => (k.id === id ? { ...k, ditandaiSelesai: false, keteranganSelesai: '', perpanjangan } : k)),
      )
      catat({ aksi: 'ubah', rincian: `Membuka kembali kontrak "${target.nama}" yang sudah ditandai selesai`, kontrakId: id })
    },
    [kontrak, catat],
  )

  const tambahDokumen = useCallback(
    (kontrakId: string, dokumen: Dokumen) => {
      const target = kontrak.find((k) => k.id === kontrakId)
      if (!target) return
      setKontrak((lama) =>
        lama.map((k) => {
          if (k.id !== kontrakId) return k
          // PKS atau adendum yang diunggah di Detail (tanpa perpanjangan) juga menjadi versi baru dengan data
          // yang sama; versi sebelumnya menyimpan datanya dulu (src/lib/versiKontrak.ts).
          if (!dokumenBerversi(dokumen)) return { ...k, dokumen: [...k.dokumen, dokumen] }
          return { ...k, dokumen: [...simpanVersiBerlaku(k), { ...dokumen, versi: ambilVersi(k) }] }
        }),
      )
      catat({ aksi: 'unggah', rincian: `Mengunggah ${dokumen.nama} ke "${target.nama}"`, kontrakId })
    },
    [kontrak, catat],
  )

  const catatAdendum = useCallback(
    (kontrakId: string, isi: IsiAdendum) => {
      const target = kontrak.find((k) => k.id === kontrakId)
      if (!target) return
      setKontrak((lama) =>
        lama.map((k) => {
          if (k.id !== kontrakId) return k
          // Versi sebelum adendum disimpan dulu, lalu adendum baru menyimpan data sesudahnya (src/lib/versiKontrak.ts).
          const sesudah: Kontrak = { ...k, tanggalBerakhir: isi.tanggalBerakhir, nilai: isi.nilai, perpanjangan: 'diperpanjang' }
          const dokumenAdendum = { ...isi.dokumen, id: `${kontrakId}-adendum-${Date.now()}`, versi: ambilVersi(sesudah) }
          return { ...sesudah, dokumen: [...simpanVersiBerlaku(k), dokumenAdendum] }
        }),
      )
      const ke = target.dokumen.filter((d) => d.jenis === 'Adendum').length + 1
      const perubahanNilai =
        isi.nilai !== target.nilai ? `, nilai ${formatRupiah(target.nilai)} menjadi ${formatRupiah(isi.nilai)}` : ''
      catat({
        aksi: 'ubah',
        rincian: `Mencatat adendum ke-${ke} "${target.nama}": akhir kontrak ${formatTanggalSingkat(target.tanggalBerakhir)} menjadi ${formatTanggalSingkat(isi.tanggalBerakhir)}${perubahanNilai}`,
        kontrakId,
      })
    },
    [kontrak, catat],
  )

  const tambahAkun = useCallback(
    (isi: IsianAkunBaru) => {
      const sandi = buatSandiSementara()
      setAkun((lama) => [...lama, { ...isi, emailNotifikasi: isi.emailNotifikasi?.trim() || undefined, id: `a-${Date.now()}`, aktif: true, sandi }])
      catat({ aksi: 'akun', rincian: `Membuat akun ${isi.nama} (${isi.peran === 'admin' ? 'Admin' : 'Pengguna'})` })
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
    (akunId: string, aktif: boolean, alasan?: Pick<CatatanNonaktif, 'alasan' | 'keterangan'>) => {
      const target = akun.find((a) => a.id === akunId)
      const nonaktif: CatatanNonaktif | undefined =
        !aktif && alasan ? { ...alasan, waktu: new Date().toISOString(), oleh: namaPengguna } : undefined
      setAkun((lama) => lama.map((a) => (a.id === akunId ? { ...a, aktif, nonaktif } : a)))
      if (!target) return
      if (aktif) {
        catat({ aksi: 'akun', rincian: `Mengaktifkan akun ${target.nama}` })
      } else {
        const ket = alasan?.keterangan ? ` (${alasan.keterangan})` : ''
        catat({ aksi: 'akun', rincian: `Menonaktifkan akun ${target.nama}. Alasan: ${alasan?.alasan ?? '-'}${ket}` })
      }
    },
    [akun, catat, namaPengguna],
  )

  const hapusAkun = useCallback(
    (akunId: string) => {
      const target = akun.find((a) => a.id === akunId)
      // Akun aktif tidak boleh dihapus langsung: harus dinonaktifkan dulu (dengan alasan).
      if (!target || target.aktif) return
      setAkun((lama) => lama.filter((a) => a.id !== akunId))
      const alasan = target.nonaktif ? ` Alasan nonaktif: ${target.nonaktif.alasan}.` : ''
      catat({ aksi: 'akun', rincian: `Menghapus akun ${target.nama} (${target.email}).${alasan}` })
    },
    [akun, catat],
  )

  const ubahEmailNotifikasi = useCallback(
    (akunId: string, email: string) => {
      const target = akun.find((a) => a.id === akunId)
      const baru = email.trim() || undefined
      setAkun((lama) => lama.map((a) => (a.id === akunId ? { ...a, emailNotifikasi: baru } : a)))
      if (target)
        catat({
          aksi: 'akun',
          rincian: baru
            ? `Mengatur email pengingat ${target.nama} ke ${baru}`
            : `Mengembalikan email pengingat ${target.nama} ke email kantor`,
        })
    },
    [akun, catat],
  )

  const ubahProfil = useCallback(
    (isi: IsianProfil) => {
      if (!pengguna) return
      const nama = isi.nama.trim()
      const jabatan = isi.jabatan.trim()
      setAkun((lama) => lama.map((a) => (a.id === pengguna.id ? { ...a, nama, jabatan } : a)))
      const berubah = [
        nama !== pengguna.nama && `nama "${pengguna.nama}" menjadi "${nama}"`,
        jabatan !== pengguna.jabatan && `jabatan "${pengguna.jabatan}" menjadi "${jabatan}"`,
      ].filter(Boolean)
      if (berubah.length) catat({ aksi: 'akun', rincian: `Mengubah profil sendiri: ${berubah.join(', ')}` })
    },
    [pengguna, catat],
  )

  const gantiSandi = useCallback(
    (sandiLama: string, sandiBaru: string) => {
      if (!pengguna || pengguna.sandi !== sandiLama) return false
      setAkun((lama) => lama.map((a) => (a.id === pengguna.id ? { ...a, sandi: sandiBaru } : a)))
      catat({ aksi: 'akun', rincian: `Mengganti kata sandi akun ${pengguna.nama}` })
      return true
    },
    [pengguna, catat],
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
      bukaKembaliKontrak,
      tambahDokumen,
      catatAdendum,
      tambahAkun,
      resetSandi,
      ubahAktifAkun,
      hapusAkun,
      ubahEmailNotifikasi,
      ubahProfil,
      gantiSandi,
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
      bukaKembaliKontrak,
      tambahDokumen,
      catatAdendum,
      tambahAkun,
      resetSandi,
      ubahAktifAkun,
      hapusAkun,
      ubahEmailNotifikasi,
      ubahProfil,
      gantiSandi,
      notifikasiDibaca,
      tandaiDibaca,
    ],
  )

  return <KonteksData.Provider value={nilai}>{children}</KonteksData.Provider>
}

export default PenyediaData
