// Kotak tanggal berbentuk kalender meja: pita berwarna berisi bulan, tanggal besar, nama hari.
// Contoh: Des / 4 / Jumat. Bulan ditulis huruf biasa (DESIGN.md: tanpa huruf kapital semua). Warna pita mengikuti status kontrak (TAMPILAN_STATUS.kelasPita).

import { keTanggal } from '../lib/format'

type Props = {
  /** Tanggal format "YYYY-MM-DD". */
  tanggal: string
  /** Class warna pita bulan, dari TAMPILAN_STATUS[status].kelasPita. */
  kelasPita: string
  /** Ukuran lebih besar, misalnya di kartu ringkasan. */
  besar?: boolean
}

function KotakKalender({ tanggal, kelasPita, besar = false }: Props) {
  const tgl = keTanggal(tanggal)

  return (
    <span
      role="img"
      aria-label={tgl.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
      className={`flex flex-none flex-col overflow-hidden rounded-xl border border-garis bg-white text-center ${
        besar ? 'w-[72px]' : 'w-[54px]'
      }`}
    >
      <span aria-hidden="true" className={`py-0.5 text-[11px] leading-[16px] font-bold ${kelasPita}`}>
        {tgl.toLocaleDateString('id-ID', { month: 'short' })}
      </span>
      <span
        aria-hidden="true"
        className={`pt-1 leading-none font-bold text-galaxy-900 ${besar ? 'text-[28px]' : 'text-[20px]'}`}
      >
        {tgl.getDate()}
      </span>
      <span aria-hidden="true" className="pt-0.5 pb-1.5 text-[11px] text-teks-lembut">
        {tgl.toLocaleDateString('id-ID', { weekday: 'long' })}
      </span>
    </span>
  )
}

export default KotakKalender
