// Satu baris kontrak di daftar (Beranda, Kontrak, Pengingat): kotak kalender tanggal akhir,
// nama, penyedia, nomor PKS, nilai, dan badge sisa waktu. Diklik untuk membuka detailnya.

import { Link } from 'react-router-dom'
import { formatRupiahSingkat } from '../lib/format'
import { hitungStatus, TAMPILAN_STATUS, teksSisaHari } from '../lib/status'
import type { Kontrak } from '../types/kontrak'
import BadgeStatus from './BadgeStatus'
import Ikon from './Ikon'
import KotakKalender from './KotakKalender'

type Props = {
  kontrak: Kontrak
  /** Tampilkan nomor PKS di bawah penyedia. */
  denganNomor?: boolean
}

function BarisKontrak({ kontrak, denganNomor = false }: Props) {
  const status = hitungStatus(kontrak)
  const tampilan = TAMPILAN_STATUS[status]

  return (
    <li className="border-b border-garis-lembut last:border-b-0">
      <Link
        to={`/kontrak/${kontrak.id}`}
        className="group -mx-2 flex items-center gap-4 rounded-xl px-2 py-4 text-teks no-underline transition-[background-color,border-color,color] duration-150 hover:bg-latar hover:text-teks motion-reduce:transition-none"
      >
        <KotakKalender tanggal={kontrak.tanggalBerakhir} kelasPita={tampilan.kelasPita} />

        <span className="flex min-w-0 flex-1 flex-col gap-1 md:flex-row md:items-center md:gap-6">
          <span className="flex min-w-0 flex-1 flex-col gap-0.5">
            <span className="text-[15px] font-semibold text-judul">{kontrak.nama}</span>
            <span className="truncate text-[13px] text-teks-lembut">
              {kontrak.penyedia}
              {denganNomor && <> · {kontrak.nomorPks}</>}
            </span>
          </span>

          <span className="flex flex-none items-center gap-3 md:gap-6">
            <span className="text-[14px] font-semibold text-judul md:w-[92px] md:text-right">
              {formatRupiahSingkat(kontrak.nilai)}
            </span>
            <span className="md:flex md:w-[128px] md:justify-end">
              <BadgeStatus status={status}>{teksSisaHari(kontrak)}</BadgeStatus>
            </span>
          </span>
        </span>

        <Ikon
          nama="kanan"
          ukuran={18}
          className="flex-none text-teks-lembut transition-transform duration-150 group-hover:translate-x-0.5 motion-reduce:transition-none"
        />
      </Link>
    </li>
  )
}

export default BarisKontrak
