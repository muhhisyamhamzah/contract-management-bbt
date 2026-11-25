// Panel "Pengingat bulan ini" di Beranda (24 Nov 2026): pengingat 3/2/1 bulan yang jatuh pada bulan kalender ini,
// sama dengan jadwal pengingat di Detail kontrak. Kotak kalender berisi tanggal pengingatnya, bukan tanggal akhir.

import { Link } from 'react-router-dom'
import type { PengingatBulanIni } from '../lib/beranda'
import { formatTanggalSingkat } from '../lib/format'
import { hitungStatus, TAMPILAN_STATUS, teksJarakHari } from '../lib/status'
import KartuBagian from './KartuBagian'
import KotakKalender from './KotakKalender'

type Props = {
  /** Class tambahan untuk panel, misalnya flex-1. */
  kelas?: string
  daftar: PengingatBulanIni[]
  /** Nama bulan ini, misalnya "November 2026". */
  namaBulan: string
}

function PanelPengingatBulanIni({ daftar, namaBulan, kelas }: Props) {
  return (
    <KartuBagian kelas={kelas} judul="Pengingat bulan ini" keterangan={namaBulan}>
      {daftar.length === 0 ? (
        <p className="m-0 py-2 text-[14px] text-teks-lembut">Tidak ada pengingat yang jatuh bulan ini.</p>
      ) : (
        <ul className="m-0 flex list-none flex-col p-0">
          {daftar.map(({ kontrak, bulan, tanggal, terkirim }) => (
            <li key={`${kontrak.id}-${bulan}`} className="border-t border-garis-lembut first:border-t-0">
              <Link
                to={`/kontrak/${kontrak.id}`}
                className="flex items-center gap-3.5 py-3 text-teks no-underline hover:text-teks [&:hover_.nama]:text-aksi"
              >
                <KotakKalender tanggal={tanggal} kelasPita={TAMPILAN_STATUS[hitungStatus(kontrak)].kelasPita} />
                <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="nama text-[14px] font-semibold text-judul">{kontrak.nama}</span>
                  <span className="text-[13px] text-teks-lembut">
                    Pengingat {bulan} bulan sebelum berakhir <span className="whitespace-nowrap">{formatTanggalSingkat(kontrak.tanggalBerakhir)}</span>
                  </span>
                </span>
                <span className={`flex-none text-[13px] font-semibold ${terkirim ? 'text-teks-lembut' : 'text-aksi'}`}>
                  {terkirim ? 'Terkirim' : teksJarakHari(tanggal)}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </KartuBagian>
  )
}

export default PanelPengingatBulanIni
