// Rekap jumlah kontrak per status di Beranda, berupa pil yang bisa diklik (arah "Kavling", DESIGN.md).
// Setiap pil membuka daftar Kontrak yang sudah difilter, misalnya /kontrak?status=lewat.
// (24 Nov 2026) Setiap pil juga menampilkan total nilai kontraknya, misalnya "3 Segera habis · Rp 4,2 M".

import { Link } from 'react-router-dom'
import { formatRupiahSingkat } from '../lib/format'
import { TAMPILAN_STATUS } from '../lib/status'
import type { StatusKontrak } from '../types/kontrak'

/** Urutan pil: yang paling mendesak dulu. */
const URUTAN: StatusKontrak[] = ['lewat', 'segera', 'berjalan', 'selesai']

type Props = {
  jumlah: Record<StatusKontrak, number>
  /** Jumlah semua kontrak (Hisyam 19 Nov 2026), tampil paling depan dan membuka daftar tanpa filter. */
  total: number
  /** Total nilai kontrak per status. */
  nilai: Record<StatusKontrak, number>
}

function RingkasanStatus({ jumlah, total, nilai }: Props) {
  const nilaiTotal = Object.values(nilai).reduce((a, b) => a + b, 0)
  return (
    <ul aria-label="Jumlah kontrak per status" className="m-0 flex list-none flex-wrap justify-center gap-2 p-0">
      <li>
        <Link
          to="/kontrak"
          className="flex min-h-11 items-center gap-2 rounded-full border border-galaxy-900 bg-white px-4 text-[14px] font-semibold text-judul no-underline transition-[background-color] duration-150 hover:bg-lembut hover:text-judul motion-reduce:transition-none"
        >
          <span className="text-[16px] font-bold">{total}</span>
          Total kontrak
          <NilaiPil nilai={nilaiTotal} />
        </Link>
      </li>
      {URUTAN.map((status) => (
        <li key={status}>
          <Link
            to={`/kontrak?status=${status}`}
            className="flex min-h-11 items-center gap-2 rounded-full border border-garis bg-white px-4 text-[14px] text-teks no-underline transition-[border-color] duration-150 hover:border-garis-input hover:text-teks motion-reduce:transition-none"
          >
            <span aria-hidden="true" className={`size-2.5 rounded-[3px] ${TAMPILAN_STATUS[status].kelasBar}`} />
            <span className="text-[16px] font-bold text-judul">{jumlah[status]}</span>
            {TAMPILAN_STATUS[status].label}
            {jumlah[status] > 0 && <NilaiPil nilai={nilai[status]} />}
          </Link>
        </li>
      ))}
    </ul>
  )
}

/** Total nilai di ujung pil, lebih lembut dari jumlahnya. */
function NilaiPil({ nilai }: { nilai: number }) {
  return (
    <span className="border-l border-garis pl-2 text-[13px] font-normal text-teks-lembut">
      <span className="sr-only">, senilai </span>
      {formatRupiahSingkat(nilai)}
    </span>
  )
}

export default RingkasanStatus
