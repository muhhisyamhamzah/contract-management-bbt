// Satu bagian bernomor di form kontrak, misalnya "1 Data kontrak". Nomor dipakai karena urutan pengisian memang berarti.

import type { ReactNode } from 'react'

type Props = {
  nomor: number
  judul: string
  /** Kalimat penjelasan di bawah judul. */
  keterangan?: string
  id?: string
  children: ReactNode
}

function BagianForm({ nomor, judul, keterangan, id, children }: Props) {
  return (
    <section id={id} aria-labelledby={`${id ?? `bagian-${nomor}`}-judul`} className="flex flex-col gap-5 border-b border-garis-lembut py-7 first:pt-0 last:border-b-0 last:pb-0">
      <div className="flex items-start gap-3">
        <span aria-hidden="true" className="flex size-8 flex-none items-center justify-center rounded-full bg-lembut text-[14px] font-bold text-galaxy-900">
          {nomor}
        </span>
        <div className="flex flex-col gap-0.5 pt-0.5">
          <h2 id={`${id ?? `bagian-${nomor}`}-judul`} className="m-0 text-[20px] text-judul">
            {judul}
          </h2>
          {keterangan && <p className="m-0 text-[13px] text-teks-lembut">{keterangan}</p>}
        </div>
      </div>
      {children}
    </section>
  )
}

export default BagianForm
