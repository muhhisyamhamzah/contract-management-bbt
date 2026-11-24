// Satu kontrak di halaman Kontrak untuk layar di bawah 1280px (HP, tablet, laptop kecil), pengganti baris tabel.
// Susunan mengikuti tampilan HP halaman daftar kontrak acuan (24 Nov 2026):
//   nama + penyedia            [status]
//   Berakhir <tanggal>          <nilai>
//   garis masa kontrak
//   <sisa waktu>                <status adendum>
// Seluruh item adalah tautan ke Detail. Ubah dan Hapus ada di Detail (di layar kecil tidak ada tombol ikon per baris).

import { Link } from 'react-router-dom'
import { formatRupiah, formatRupiahSingkat, formatTanggalSingkat } from '../lib/format'
import { hitungProgres, hitungStatus, STATUS_PERPANJANGAN, TAMPILAN_STATUS, tampilkanStatusAdendum, teksSisaHari } from '../lib/status'
import type { Kontrak } from '../types/kontrak'
import BadgeStatus from './BadgeStatus'
import StatusAdendum from './StatusAdendum'

type Props = {
  kontrak: Kontrak
}

function ItemDaftarKontrak({ kontrak }: Props) {
  const status = hitungStatus(kontrak)
  const tampilan = TAMPILAN_STATUS[status]
  const progres = hitungProgres(kontrak)
  const adendum = tampilkanStatusAdendum(kontrak)
  const idRincian = `rincian-kontrak-${kontrak.id}`

  return (
    <li className="border-t border-garis-lembut first:border-t-0">
      {/* hidden: tidak dibaca sebagai teks lepas, tapi tetap dipakai sebagai keterangan tautan lewat aria-describedby. */}
      <span id={idRincian} hidden>
        Nomor PKS {kontrak.nomorPks}. Berakhir {formatTanggalSingkat(kontrak.tanggalBerakhir)}. Nilai{' '}
        {formatRupiah(kontrak.nilai)}.{adendum && ` Status adendum ${STATUS_PERPANJANGAN[kontrak.perpanjangan].label}.`}
      </span>
      <Link
        to={`/kontrak/${kontrak.id}`}
        aria-label={`${kontrak.nama}, ${kontrak.penyedia}. ${tampilan.label}, ${teksSisaHari(kontrak)}`}
        aria-describedby={idRincian}
        className="flex flex-col gap-2.5 px-5 py-4 text-teks no-underline transition-[background-color] duration-150 hover:bg-latar hover:text-teks motion-reduce:transition-none md:px-6"
      >
        <span className="flex items-start justify-between gap-3">
          <span className="flex min-w-0 flex-col">
            <span className="text-[15px] font-semibold text-judul">{kontrak.nama}</span>
            <span className="text-[13px] text-teks-lembut">{kontrak.penyedia}</span>
          </span>
          <BadgeStatus status={status} />
        </span>
        <span className="flex items-baseline justify-between gap-3 text-[13px] text-teks-lembut">
          <span>Berakhir {formatTanggalSingkat(kontrak.tanggalBerakhir)}</span>
          <span className="text-[14px] font-bold text-judul">{formatRupiahSingkat(kontrak.nilai)}</span>
        </span>
        <span aria-hidden="true" className="block h-1.5 overflow-hidden rounded-full bg-garis-lembut">
          <span className={`block h-full rounded-full ${tampilan.kelasBar}`} style={{ width: `${progres}%` }} />
        </span>
        <span className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
          <span className={`text-[13px] font-semibold ${status === 'berjalan' ? 'text-teks' : tampilan.kelasTeks}`}>
            {teksSisaHari(kontrak)}
          </span>
          {adendum && <StatusAdendum perpanjangan={kontrak.perpanjangan} />}
        </span>
      </Link>
    </li>
  )
}

export default ItemDaftarKontrak
