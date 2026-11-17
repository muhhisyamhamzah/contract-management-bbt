// Satu baris kontrak di daftar (Beranda, Kontrak, Pengingat): kotak kalender tanggal akhir,
// nama, penyedia, nomor PKS, nilai, dan pil sisa waktu. Diklik untuk membuka detailnya.
// Desktop: kolom sejajar. HP: kalender di kiri, info bertumpuk di kanan.

import { Link } from 'react-router-dom'
import { formatRupiahSingkat } from '../lib/format'
import { hitungStatus, TAMPILAN_STATUS, teksSisaHari } from '../lib/status'
import type { Kontrak } from '../types/kontrak'
import BadgeStatus from './BadgeStatus'
import Ikon from './Ikon'
import KotakKalender from './KotakKalender'

type Props = {
  kontrak: Kontrak
  /** Tampilkan juga nomor PKS di HP (di desktop selalu tampil sebagai kolom). */
  denganNomor?: boolean
}

function BarisKontrak({ kontrak, denganNomor = false }: Props) {
  const status = hitungStatus(kontrak)
  const tampilan = TAMPILAN_STATUS[status]

  return (
    <li className="border-b border-garis-lembut last:border-b-0">
      <Link
        to={`/kontrak/${kontrak.id}`}
        className="group -mx-3 flex items-center gap-4 rounded-2xl px-3 py-3.5 text-teks no-underline transition-[background-color] duration-150 hover:bg-latar hover:text-teks motion-reduce:transition-none"
      >
        <KotakKalender tanggal={kontrak.tanggalBerakhir} kelasPita={tampilan.kelasPita} />

        <span className="grid min-w-0 flex-1 gap-x-6 gap-y-1 md:grid-cols-[minmax(0,1fr)_150px_96px_128px] md:items-center">
          <span className="flex min-w-0 flex-col gap-0.5">
            <span className="text-[15px] font-semibold text-judul">{kontrak.nama}</span>
            <span className="text-[13px] text-teks-lembut">{kontrak.penyedia}</span>
            {denganNomor && <span className="text-[13px] text-teks-lembut md:hidden">{kontrak.nomorPks}</span>}
          </span>
          <span className="hidden text-[13px] text-teks-lembut md:block">{kontrak.nomorPks}</span>
          <span className="flex items-center gap-3 md:contents">
            <span className="text-[14px] font-semibold text-judul md:text-right">{formatRupiahSingkat(kontrak.nilai)}</span>
            <span className="md:flex md:justify-end">
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
