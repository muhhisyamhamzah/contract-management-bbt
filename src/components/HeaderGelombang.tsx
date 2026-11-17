// Header navy dengan bagian bawah bergelombang, dipakai di semua halaman setelah masuk.
// Berisi navigasi atas, lalu judul halaman (dan tombol aksi di kanan).
// Konten halaman di bawahnya biasanya diberi margin negatif supaya menumpuk di gelombang.

import type { ReactNode } from 'react'
import { KELAS_WADAH } from '../lib/tataLetak'
import NavAtas from './NavAtas'

type Props = {
  judul: ReactNode
  /** Kalimat di bawah judul. */
  keterangan?: ReactNode
  /** Baris kecil di atas judul, misalnya tanggal atau tautan kembali. */
  atas?: ReactNode
  /** Tombol di kanan judul (di HP pindah ke bawah judul). */
  aksi?: ReactNode
}

function HeaderGelombang({ judul, keterangan, atas, aksi }: Props) {
  return (
    <header className="permukaan-gelap relative flex-none bg-linear-150 from-galaxy-900 via-galaxy-900 to-galaxy-700 pb-24 text-white">
      {/* Lapisan hiasan (tidak dibaca pembaca layar) */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* Cahaya biru muda, supaya biru tidak datar. (Cahaya emas sudah dicoba: tercampur navy jadi abu kusam.) */}
        <div className="absolute -top-40 right-[8%] size-[420px] rounded-full bg-aksen/30 blur-3xl" />
        <div className="absolute -bottom-32 -left-24 size-72 rounded-full bg-aksi/60 blur-3xl" />
        {/* Lingkaran garis tipis */}
        <div className="absolute -top-24 right-[12%] size-72 rounded-full border border-white/10" />
        <div className="absolute -top-44 right-[6%] size-[460px] rounded-full border border-white/[0.06]" />
        {/* Pola titik halus yang memudar ke kiri */}
        <div className="absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(rgb(255_255_255/0.09)_1px,transparent_1.5px)] bg-size-[14px_14px] [mask-image:linear-gradient(to_left,black,transparent)]" />
      </div>

      <div className="relative z-20">
        <NavAtas />
      </div>

      <div className={`${KELAS_WADAH} relative z-10 flex flex-col gap-5 pt-7 md:flex-row md:items-end md:justify-between md:pt-10`}>
        <div className="flex min-w-0 flex-col gap-1.5">
          {atas}
          <h1 className="m-0 text-[26px] leading-tight font-bold md:text-[32px]">{judul}</h1>
          {keterangan && <p className="m-0 text-[15px] text-teks-header">{keterangan}</p>}
        </div>
        {aksi && <div className="flex flex-none flex-wrap items-center gap-2.5">{aksi}</div>}
      </div>

      {/* Panel navigasi (notifikasi, menu akun) boleh keluar dari header, jadi header tidak memakai overflow-hidden. */}
      {/* Gelombang di bawah header, warnanya sama dengan latar halaman */}
      <svg
        viewBox="0 0 1440 60"
        preserveAspectRatio="none"
        aria-hidden="true"
        className="absolute -bottom-1 left-0 block h-11 w-full md:h-[60px]"
      >
        <path d="M0 60 L0 34 C 260 8, 520 52, 860 30 C 1100 14, 1300 8, 1440 6 L1440 60 Z" className="fill-latar" />
      </svg>
    </header>
  )
}

export default HeaderGelombang
