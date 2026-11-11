// Kotak tanggal berbentuk kalender meja: pita berwarna berisi bulan, tanggal besar, nama hari lengkap.
// Contoh: NOV / 29 / Minggu. Pita emas (bawaan), atau oranye tanah untuk kontrak yang sudah lewat.

import { keTanggal } from '../lib/format'

type Props = {
  /** Tanggal format "YYYY-MM-DD". */
  tanggal: string
  /** Warna pita bulan. Bawaan emas; pakai 'bg-logo-tanah text-white' untuk kontrak yang sudah lewat. */
  kelasPita?: string
}

function KotakKalender({ tanggal, kelasPita = 'bg-logo-emas text-galaxy-900' }: Props) {
  const tgl = keTanggal(tanggal)

  return (
    <span
      role="img"
      aria-label={tgl.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}
      className="flex w-[54px] flex-none flex-col overflow-hidden rounded-xl bg-white text-center shadow-kotak ring-1 ring-garis"
    >
      <span aria-hidden="true" className={`py-0.5 text-[10px] font-bold tracking-wide uppercase ${kelasPita}`}>
        {tgl.toLocaleDateString('id-ID', { month: 'short' })}
      </span>
      <span aria-hidden="true" className="pt-1 text-[20px] leading-none font-bold text-galaxy-900">
        {tgl.getDate()}
      </span>
      <span aria-hidden="true" className="pt-0.5 pb-1.5 text-[10px] text-teks-lembut">
        {tgl.toLocaleDateString('id-ID', { weekday: 'long' })}
      </span>
    </span>
  )
}

export default KotakKalender
