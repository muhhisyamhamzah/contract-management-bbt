// Rekap jumlah kontrak per status di Beranda, berupa pil yang bisa diklik (arah "Kavling", DESIGN.md).
// Setiap pil membuka halaman Rekap yang sudah difilter, misalnya /rekap?status=lewat.

import { Link } from 'react-router-dom'
import { TAMPILAN_STATUS } from '../lib/status'
import type { StatusKontrak } from '../types/kontrak'

/** Urutan pil: yang paling mendesak dulu. */
const URUTAN: StatusKontrak[] = ['lewat', 'segera', 'berjalan', 'selesai']

type Props = {
  jumlah: Record<StatusKontrak, number>
}

function RingkasanStatus({ jumlah }: Props) {
  return (
    <ul aria-label="Jumlah kontrak per status" className="m-0 flex list-none flex-wrap justify-center gap-2 p-0">
      {URUTAN.map((status) => (
        <li key={status}>
          <Link
            to={`/rekap?status=${status}`}
            className="flex min-h-11 items-center gap-2 rounded-full border border-garis bg-white px-4 text-[14px] text-teks no-underline transition-[border-color] duration-150 hover:border-garis-input hover:text-teks motion-reduce:transition-none"
          >
            <span aria-hidden="true" className={`size-2.5 rounded-[3px] ${TAMPILAN_STATUS[status].kelasBar}`} />
            <span className="text-[16px] font-bold text-judul">{jumlah[status]}</span>
            {TAMPILAN_STATUS[status].label}
          </Link>
        </li>
      ))}
    </ul>
  )
}

export default RingkasanStatus
