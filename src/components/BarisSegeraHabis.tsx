// Satu baris di daftar "Segera habis" pada Beranda: kotak kalender tanggal berakhir,
// judul, tanggal berakhir, mitra, dan badge sisa hari. Diklik untuk membuka detail.

import { Link } from 'react-router-dom'
import { formatTanggalSingkat } from '../lib/format'
import { teksSisaHari } from '../lib/status'
import type { Kontrak } from '../types/kontrak'
import BadgeStatus from './BadgeStatus'
import Ikon from './Ikon'
import KotakKalender from './KotakKalender'

type Props = {
  kontrak: Kontrak
}

function BarisSegeraHabis({ kontrak }: Props) {
  return (
    <Link
      to={`/kontrak/${kontrak.id}`}
      className="flex items-center gap-3 border-b border-garis-lembut py-3.5 text-teks no-underline hover:text-teks"
    >
      <KotakKalender tanggal={kontrak.tanggalBerakhir} />

      <span className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="flex items-start justify-between gap-2">
          <span className="text-[14px] font-semibold text-judul">{kontrak.judul}</span>
          <BadgeStatus status="segera">{teksSisaHari(kontrak)}</BadgeStatus>
        </span>
        <span className="flex items-center gap-1.5 text-[12px] text-teks-lembut">
          <Ikon nama="jam" ukuran={13} /> Berakhir {formatTanggalSingkat(kontrak.tanggalBerakhir)}
        </span>
        <span className="flex items-center gap-1.5 text-[12px] text-teks-lembut">
          <Ikon nama="dokumen" ukuran={13} /> {kontrak.mitra}
        </span>
      </span>
    </Link>
  )
}

export default BarisSegeraHabis
