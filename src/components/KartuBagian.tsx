// Kotak putih dengan judul berikon, dipakai untuk bagian-bagian di Detail kontrak dan Admin.
// Contoh: "Data kontrak", "Critical point", "Dokumen PDF".

import type { ReactNode } from 'react'
import { KELAS_KOTAK } from '../lib/tataLetak'
import Ikon, { type NamaIkon } from './Ikon'

type Props = {
  judul: string
  ikon: NamaIkon
  /** Tombol atau tautan di kanan judul, misalnya "+ Tambah". */
  aksi?: ReactNode
  /** Teks kecil di samping judul, misalnya jumlah. */
  keterangan?: ReactNode
  children: ReactNode
  id?: string
}

function KartuBagian({ judul, ikon, aksi, keterangan, children, id }: Props) {
  const idJudul = id ? `${id}-judul` : undefined
  return (
    <section id={id} aria-labelledby={idJudul} className={`${KELAS_KOTAK} p-5 md:p-7`}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <span aria-hidden="true" className="flex size-10 items-center justify-center rounded-xl bg-lembut text-aksi">
            <Ikon nama={ikon} ukuran={20} />
          </span>
          <h2 id={idJudul} className="m-0 text-[18px] text-judul">
            {judul}
          </h2>
          {keterangan && <span className="text-[13px] text-teks-lembut">{keterangan}</span>}
        </div>
        {aksi}
      </div>
      {children}
    </section>
  )
}

export default KartuBagian
