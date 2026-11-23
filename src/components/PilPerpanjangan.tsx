// Pil "Status kontrak" yang dihitung dari isian perpanjangan kontrak
// (Menunggu keputusan, Proses melakukan adendum, Sudah dilakukan adendum, Tidak diperpanjang).
// Label dan warna diambil dari STATUS_PERPANJANGAN di src/lib/status.ts.

import { STATUS_PERPANJANGAN } from '../lib/status'
import type { Perpanjangan } from '../types/kontrak'

type Props = {
  perpanjangan: Perpanjangan
}

function PilPerpanjangan({ perpanjangan }: Props) {
  const { label, kelas } = STATUS_PERPANJANGAN[perpanjangan]
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-[13px] font-semibold whitespace-nowrap ${kelas}`}>
      {label}
    </span>
  )
}

export default PilPerpanjangan
