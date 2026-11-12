// Kartu satu kontrak di halaman Pengingat. Diklik untuk membuka detailnya.
// Kontrak yang sudah lewat diberi latar oranye muda supaya lebih menonjol.

import { Link } from 'react-router-dom'
import { hitungStatus, teksSisaHari } from '../lib/status'
import type { Kontrak } from '../types/kontrak'
import BadgeStatus from './BadgeStatus'
import Ikon from './Ikon'
import KotakKalender from './KotakKalender'

type Props = {
  kontrak: Kontrak
}

function KartuPengingat({ kontrak }: Props) {
  const status = hitungStatus(kontrak)
  const sudahLewat = status === 'lewat'

  return (
    <Link
      to={`/kontrak/${kontrak.id}`}
      className={`flex items-center gap-3 rounded-2xl p-3.5 text-teks no-underline shadow-kotak transition-transform duration-200 hover:text-teks active:scale-[0.98] motion-reduce:transition-none ${
        sudahLewat ? 'bg-lewat-kartu ring-1 ring-lewat-garis-kartu' : 'bg-white'
      }`}
    >
      <KotakKalender
        tanggal={kontrak.tanggalBerakhir}
        kelasPita={sudahLewat ? 'bg-logo-tanah text-white' : undefined}
      />

      <span className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="text-[14px] font-semibold text-judul">{kontrak.judul}</span>
        <span className="truncate text-[12px] text-teks-lembut">{kontrak.mitra}</span>
        <span className="mt-0.5 flex">
          <BadgeStatus status={status}>{teksSisaHari(kontrak)}</BadgeStatus>
        </span>
      </span>

      <Ikon nama="kanan" ukuran={18} className="flex-none text-teks-lembut" />
    </Link>
  )
}

export default KartuPengingat
