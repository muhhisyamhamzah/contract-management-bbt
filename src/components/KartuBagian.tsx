// Panel putih dengan judul, dipakai untuk bagian-bagian di Detail kontrak.
// Contoh: "Data kontrak", "Ketentuan kontrak", "Dokumen".
// Judul tanpa kotak ikon (DESIGN.md: tanpa kotak ikon berwarna di depan setiap judul). Isi dipisah garis, bukan kartu kecil.

import type { ReactNode } from 'react'
import { KELAS_KOTAK } from '../lib/tataLetak'

type Props = {
  judul: string
  /** Tombol atau tautan di kanan judul, misalnya "+ Tambah". */
  aksi?: ReactNode
  /** Teks kecil di samping judul, misalnya jumlah. */
  keterangan?: ReactNode
  children: ReactNode
  id?: string
  /** Class tambahan, misalnya flex-1 supaya panel mengisi tinggi kolom (Beranda). */
  kelas?: string
}

function KartuBagian({ judul, aksi, keterangan, children, id, kelas = '' }: Props) {
  const idJudul = id ? `${id}-judul` : undefined
  return (
    <section id={id} aria-labelledby={idJudul} className={`${KELAS_KOTAK} scroll-mt-40 px-5 pt-2 pb-5 md:px-7 md:pb-6 ${kelas}`}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-garis py-3">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
          <h2 id={idJudul} className="m-0 text-[20px] text-judul">
            {judul}
          </h2>
          {keterangan && <span className="text-[14px] text-teks-lembut">{keterangan}</span>}
        </div>
        {aksi}
      </div>
      {children}
    </section>
  )
}

export default KartuBagian
