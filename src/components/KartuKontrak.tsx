// Kartu satu kontrak di daftar halaman Kontrak. Diklik untuk membuka detailnya.
// Isi: ikon status bergradasi, judul, mitra, nomor, nilai singkat, dan badge sisa hari.

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
      className="flex w-full flex-none gap-3 rounded-2xl bg-white p-3.5 text-left text-teks no-underline shadow-kotak transition-transform duration-200 hover:text-teks active:scale-[0.98] motion-reduce:transition-none"
    >
      <span
        aria-hidden="true"
        className={`flex size-11 flex-none items-center justify-center rounded-[14px] bg-linear-135 text-white shadow-md inset-shadow-[0_1px_0_rgb(255_255_255/0.45)] ${tampilan.kelasIkonGradasi}`}
      >
        <Ikon nama={tampilan.ikon} ukuran={22} tebal={2.2} />
      </span>

      <span className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="flex items-start justify-between gap-2">
          <span className="text-[14px] font-semibold text-judul">{kontrak.judul}</span>
          <BadgeStatus status={status}>{teksSisaHari(kontrak)}</BadgeStatus>
        </span>
        <span className="truncate text-[12px] text-teks-lembut">{kontrak.mitra}</span>
        <span className="mt-1 flex items-center justify-between gap-2 text-[12px]">
          <span className="truncate text-teks-lembut">{kontrak.nomor}</span>
          <span className="flex-none text-[13px] font-semibold text-judul">
            {formatRupiahSingkat(kontrak.nilai)}
          </span>
        </span>
      </span>
    </Link>
  )
}

export default KartuKontrak
