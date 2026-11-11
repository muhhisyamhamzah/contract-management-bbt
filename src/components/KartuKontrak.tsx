// Kartu satu kontrak di daftar halaman Kontrak. Diklik untuk membuka detailnya.
// Isi: ikon status, judul, mitra, nilai singkat, dan badge sisa hari.

import { Link } from 'react-router-dom'
import { formatRupiahSingkat } from '../lib/format'
import { hitungStatus, TAMPILAN_STATUS, teksSisaHari } from '../lib/status'
import type { Kontrak } from '../types/kontrak'
import BadgeStatus from './BadgeStatus'
import Ikon from './Ikon'

type Props = {
  kontrak: Kontrak
}

function KartuKontrak({ kontrak }: Props) {
  const status = hitungStatus(kontrak)
  const tampilan = TAMPILAN_STATUS[status]

  return (
    <Link
      to={`/kontrak/${kontrak.id}`}
      className="flex w-full flex-none gap-3.5 rounded-[20px] border border-garis bg-white p-3.5 text-left text-teks no-underline hover:text-teks"
    >
      <span
        className={`flex size-[46px] flex-none items-center justify-center rounded-[14px] ${tampilan.kelasBadge}`}
      >
        <Ikon nama={tampilan.ikon} />
      </span>

      <span className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="text-[15px] font-bold text-judul">{kontrak.judul}</span>
        <span className="text-[12px] text-teks-lembut">{kontrak.mitra}</span>
        <span className="mt-1.5 flex items-center justify-between">
          <span className="text-[13px] font-bold">{formatRupiahSingkat(kontrak.nilai)}</span>
          <BadgeStatus status={status}>{teksSisaHari(kontrak)}</BadgeStatus>
        </span>
      </span>
    </Link>
  )
}

export default KartuKontrak
