// Satu baris di halaman Kontrak: ringkasan kontrak dalam satu baris (No, kontrak, nomor PKS, masa kontrak,
// nilai, status sisa waktu + status adendum, jumlah dokumen). Seluruh baris adalah tautan ke halaman Detail kontrak
// (Hisyam 18 Nov 2026: tidak ada rincian yang terbuka di bawah baris).
// Status adendum hanya tampil kalau berarti (lihat tampilkanStatusAdendum), supaya kolom status tidak ramai.

import { Link } from 'react-router-dom'
import { formatRupiah, formatRupiahSingkat, formatTanggalSingkat } from '../lib/format'
import { hitungStatus, STATUS_PERPANJANGAN, tampilkanStatusAdendum, teksSisaHari } from '../lib/status'
import type { Kontrak } from '../types/kontrak'
import BadgeStatus from './BadgeStatus'
import Ikon from './Ikon'
import PilPerpanjangan from './PilPerpanjangan'

type Props = {
  kontrak: Kontrak
  nomor: number
}

/** Kolom desktop: No | Kontrak | Nomor PKS | Masa kontrak | Nilai | Status | Dokumen | panah. */
const KOLOM = 'lg:grid-cols-[32px_minmax(0,2fr)_140px_180px_100px_200px_56px_24px]'

function BarisKontrak({ kontrak, nomor }: Props) {
  const status = hitungStatus(kontrak)
  const adendum = tampilkanStatusAdendum(kontrak)
  // Pembaca layar: nama tautan cukup nama, penyedia, dan status (diawali teks yang terlihat, WCAG 2.5.3).
  // Rincian lain dibacakan sebagai keterangan tambahan, bukan bagian nama tautan (impeccable harden, 19 Nov 2026).
  const namaTautan = `${kontrak.nama}, ${kontrak.penyedia}. ${teksSisaHari(kontrak)}${
    adendum ? `, ${STATUS_PERPANJANGAN[kontrak.perpanjangan].label}` : ''
  }`
  const idRincian = `rincian-kontrak-${kontrak.id}`

  return (
    <li className="border-t border-garis-lembut first:border-t-0">
      {/* hidden: tidak dibaca sebagai teks lepas, tapi tetap dipakai sebagai keterangan tautan lewat aria-describedby. */}
      <span id={idRincian} hidden>
        Nomor PKS {kontrak.nomorPks}. Masa kontrak {formatTanggalSingkat(kontrak.tanggalMulai)} sampai{' '}
        {formatTanggalSingkat(kontrak.tanggalBerakhir)}. Nilai {formatRupiah(kontrak.nilai)}. {kontrak.dokumen.length} file.
      </span>
      <Link
        to={`/kontrak/${kontrak.id}`}
        aria-label={namaTautan}
        aria-describedby={idRincian}
        className={`group grid w-full grid-cols-[minmax(0,1fr)_20px] items-center gap-x-3 gap-y-1 px-4 py-3 text-left text-[14px] text-teks no-underline transition-[background-color] duration-150 hover:bg-latar hover:text-teks motion-reduce:transition-none lg:min-h-[68px] lg:gap-x-4 lg:px-6 lg:py-2 ${KOLOM}`}
      >
        <span className="hidden text-teks-lembut lg:block">{nomor}</span>
        <span className="flex min-w-0 flex-col">
          <span className="text-[15px] font-semibold text-judul">{kontrak.nama}</span>
          <span className="text-[13px] text-teks-lembut">{kontrak.penyedia}</span>
        </span>
        <span className="hidden text-[13px] text-teks-lembut lg:block">{kontrak.nomorPks}</span>
        {/* Dua baris yang disengaja (awal di atas, akhir di bawah), supaya tidak terpotong di tengah tanggal. */}
        <span className="hidden flex-col text-[13px] text-teks-lembut lg:flex">
          <span>{formatTanggalSingkat(kontrak.tanggalMulai)}</span>
          <span>sampai {formatTanggalSingkat(kontrak.tanggalBerakhir)}</span>
        </span>
        <span className="col-start-1 row-start-2 text-[14px] font-bold text-judul lg:col-auto lg:row-auto lg:text-right">
          {formatRupiahSingkat(kontrak.nilai)}
        </span>
        {/* Status: sisa waktu + status adendum. Laptop: bertumpuk rata kanan di kolomnya. HP: baris sendiri di bawah
            nama dan nilai, supaya pil yang panjang tidak menekan nama kontrak sampai terpotong (impeccable polish). */}
        <span className="col-start-1 row-start-3 flex flex-wrap items-center gap-1.5 pt-0.5 lg:col-auto lg:row-auto lg:flex-col lg:flex-nowrap lg:items-end lg:gap-1 lg:pt-0">
          <BadgeStatus status={status}>{teksSisaHari(kontrak)}</BadgeStatus>
          {adendum && <PilPerpanjangan perpanjangan={kontrak.perpanjangan} />}
        </span>
        <span className="hidden text-[13px] text-teks-lembut lg:block">{kontrak.dokumen.length} file</span>
        <Ikon
          nama="kanan"
          ukuran={18}
          className="col-start-2 row-span-3 row-start-1 text-teks-lembut transition-transform duration-150 group-hover:translate-x-0.5 motion-reduce:transition-none lg:col-auto lg:row-auto"
        />
      </Link>
    </li>
  )
}

export default BarisKontrak
