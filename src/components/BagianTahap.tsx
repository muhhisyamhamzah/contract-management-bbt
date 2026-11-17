// Satu kelompok tahap di halaman Kontrak dan Critical point, misalnya "H-1 bulan":
// judul, satu kalimat penjelasan (pengganti halaman Pengingat), lalu panel berisi daftar.
// Kalau kosong, panel menampilkan pesan pengganti. id dipakai pil lompat cepat di atas halaman.

import type { ReactNode } from 'react'
import { KELAS_KOTAK } from '../lib/tataLetak'

type Props = {
  id: string
  judul: string
  keterangan: string
  kosong: boolean
  pesanKosong: string
  children: ReactNode
}

function BagianTahap({ id, judul, keterangan, kosong, pesanKosong, children }: Props) {
  return (
    // scroll-mt: saat dilompati dari pil di atas, judul tidak tertutup navigasi yang menempel.
    <section id={id} aria-labelledby={`${id}-judul`} className="flex scroll-mt-40 flex-col gap-3">
      <div>
        <h2 id={`${id}-judul`} className="m-0 text-[22px] text-judul">
          {judul}
        </h2>
        <p className="m-0 mt-1 text-[14px] text-teks-lembut">{keterangan}</p>
      </div>
      <div className={`${KELAS_KOTAK} px-5 py-1 md:px-7`}>
        {kosong ? <p className="m-0 py-5 text-[14px] text-teks-lembut">{pesanKosong}</p> : <ul className="m-0 list-none p-0">{children}</ul>}
      </div>
    </section>
  )
}

export default BagianTahap
