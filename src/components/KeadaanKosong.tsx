// Tampilan saat daftar kosong atau pencarian tidak menemukan hasil.

import type { ReactNode } from 'react'
import Ikon, { type NamaIkon } from './Ikon'

type Props = {
  ikon: NamaIkon
  judul: string
  pesan: string
  /** Tombol atau tautan, misalnya "Hapus filter". */
  aksi?: ReactNode
  /** Warna ikon. Bawaan navy. */
  kelasIkon?: string
}

function KeadaanKosong({ ikon, judul, pesan, aksi, kelasIkon = 'text-aksi' }: Props) {
  return (
    <div className="flex flex-col items-center gap-2 px-6 py-12 text-center">
      <span className={`mb-1 flex size-14 items-center justify-center rounded-full bg-lembut ${kelasIkon}`}>
        <Ikon nama={ikon} ukuran={26} />
      </span>
      <span className="text-[16px] font-semibold text-judul">{judul}</span>
      <span className="max-w-[420px] text-teks-lembut">{pesan}</span>
      {aksi && <div className="mt-3">{aksi}</div>}
    </div>
  )
}

export default KeadaanKosong
