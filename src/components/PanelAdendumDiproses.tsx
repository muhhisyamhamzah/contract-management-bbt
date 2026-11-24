// Panel "Adendum sedang diproses" di Beranda (24 Nov 2026): kontrak yang status adendumnya "Sedang diproses",
// dari yang paling cepat habis, supaya pekerjaan yang sedang berjalan tidak terlupa.

import { Link } from 'react-router-dom'
import { formatTanggalSingkat } from '../lib/format'
import { hitungStatus, TAMPILAN_STATUS, teksSisaHari } from '../lib/status'
import type { Kontrak } from '../types/kontrak'
import KartuBagian from './KartuBagian'

type Props = {
  /** Class tambahan untuk panel, misalnya flex-1. */
  kelas?: string
  daftar: Kontrak[]
}

function PanelAdendumDiproses({ daftar, kelas }: Props) {
  return (
    <KartuBagian kelas={kelas} judul="Adendum sedang diproses" keterangan={daftar.length > 0 ? `${daftar.length} kontrak` : undefined}>
      {daftar.length === 0 ? (
        <p className="m-0 py-2 text-[14px] text-teks-lembut">Tidak ada adendum yang sedang diproses.</p>
      ) : (
        <ul className="m-0 flex list-none flex-col p-0">
          {daftar.map((kontrak) => {
            const status = hitungStatus(kontrak)
            return (
              <li key={kontrak.id} className="border-t border-garis-lembut first:border-t-0">
                <Link
                  to={`/kontrak/${kontrak.id}`}
                  className="flex items-center gap-3.5 py-3 text-teks no-underline hover:text-teks [&:hover_.nama]:text-aksi"
                >
                  <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <span className="nama text-[14px] font-semibold text-judul">{kontrak.nama}</span>
                    <span className="text-[13px] text-teks-lembut">
                      {kontrak.penyedia} · berakhir {formatTanggalSingkat(kontrak.tanggalBerakhir)}
                    </span>
                  </span>
                  <span
                    className={`flex-none text-[13px] font-semibold ${status === 'berjalan' ? 'text-teks' : TAMPILAN_STATUS[status].kelasTeks}`}
                  >
                    {teksSisaHari(kontrak)}
                  </span>
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </KartuBagian>
  )
}

export default PanelAdendumDiproses
