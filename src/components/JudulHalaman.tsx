// Header putih dengan judul halaman, seperti di halaman Kontrak dan Pengingat pada referensi.
// Ruang atas 56px disediakan untuk status bar HP (jam, sinyal, baterai).

import type { ReactNode } from 'react'

type Props = {
  judul: string
  keterangan?: string
  /** Isi tambahan di bawah judul, misalnya kotak pencarian. */
  children?: ReactNode
}

function JudulHalaman({ judul, keterangan, children }: Props) {
  return (
    <header className="flex flex-none flex-col gap-1 border-b border-garis bg-white px-5 pt-[max(56px,env(safe-area-inset-top))] pb-3.5">
      <h1 className="m-0 text-[22px] font-extrabold text-judul">{judul}</h1>
      {keterangan && <span className="text-[13px] text-teks-lembut">{keterangan}</span>}
      {children}
    </header>
  )
}

export default JudulHalaman
