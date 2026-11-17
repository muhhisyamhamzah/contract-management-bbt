// Kepala setiap halaman setelah masuk: navigasi pil putih, lalu judul halaman (rata kiri) dengan aksi di kanan.
// Beranda menggambar judul tengahnya sendiri, jadi `judul` boleh kosong.
// Latar mozaik digambar oleh TataLetakWebsite, jadi tampil di semua halaman.

import type { ReactNode } from 'react'
import { KELAS_WADAH } from '../lib/tataLetak'
import NavAtas from './NavAtas'

type Props = {
  judul?: ReactNode
  /** Kalimat di bawah judul. */
  keterangan?: ReactNode
  /** Baris kecil di atas judul, misalnya tautan kembali dan status. */
  atas?: ReactNode
  /** Tombol di kanan judul (di HP pindah ke bawah judul). */
  aksi?: ReactNode
}

function KepalaHalaman({ judul, keterangan, atas, aksi }: Props) {
  return (
    <>
      {/* Navigasi ikut turun saat halaman di-scroll (sticky). Sengaja di luar <header>
          supaya tidak terbatas tinggi header. */}
      <div className={`${KELAS_WADAH} sticky top-0 z-30 pt-3 md:pt-4`}>
        <NavAtas />
      </div>

      {judul && (
        <header
          className={`${KELAS_WADAH} relative flex flex-none flex-col gap-4 pt-7 pb-5 md:flex-row md:items-end md:justify-between md:pt-10 md:pb-6`}
        >
          <div className="flex min-w-0 flex-col gap-1.5">
            {atas}
            <h1 className="m-0 text-[26px] leading-tight font-extrabold tracking-[-0.03em] text-judul md:text-[30px]">
              {judul}
            </h1>
            {keterangan && <p className="m-0 max-w-[68ch] text-[15px] text-teks-lembut">{keterangan}</p>}
          </div>
          {aksi && <div className="flex flex-none flex-wrap items-center gap-2.5">{aksi}</div>}
        </header>
      )}
    </>
  )
}

export default KepalaHalaman
