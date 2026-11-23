// Satu baris di halaman Kontrak: ringkasan kontrak dalam satu baris (No, kontrak, nomor PKS, masa kontrak,
// nilai, status sisa waktu, status adendum, jumlah dokumen). Seluruh baris adalah tautan ke halaman Detail kontrak
// (Hisyam 18 Nov 2026: tidak ada rincian yang terbuka di bawah baris).
// Status adendum punya kolom sendiri (23 Nov 2026), terpisah dari badge status kontrak: waktu keduanya bertumpuk
// di satu kolom, pengguna membacanya sebagai satu informasi. Status adendum hanya diisi kalau berarti
// (lihat tampilkanStatusAdendum); kalau tidak, kolomnya berisi tanda pisah.

import { Link } from 'react-router-dom'
import { formatRupiah, formatRupiahSingkat, formatTanggalSingkat } from '../lib/format'
import { hitungStatus, STATUS_PERPANJANGAN, tampilkanStatusAdendum, teksSisaHari } from '../lib/status'
import { KELAS_KOLOM_TABEL_KONTRAK } from '../lib/tataLetak'
import type { Kontrak } from '../types/kontrak'
import BadgeStatus from './BadgeStatus'
import Ikon from './Ikon'
import StatusAdendum from './StatusAdendum'

type Props = {
  kontrak: Kontrak
  nomor: number
}

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
      {/* Susunan bertumpuk (HP sampai di bawah 1280px), dua kolom (isi | panah):
          baris 1 nama + penyedia, baris 2 nilai, baris 3 status kontrak, baris 4 status adendum.
          Mulai xl: satu baris tabel mengikuti KELAS_KOLOM_TABEL_KONTRAK. */}
      <Link
        to={`/kontrak/${kontrak.id}`}
        aria-label={namaTautan}
        aria-describedby={idRincian}
        className={`group grid w-full grid-cols-[minmax(0,1fr)_20px] items-center gap-x-3 gap-y-1 px-4 py-3 text-left text-[14px] text-teks no-underline transition-[background-color] duration-150 hover:bg-latar hover:text-teks motion-reduce:transition-none md:px-6 xl:min-h-[68px] xl:gap-x-4 xl:py-2 ${KELAS_KOLOM_TABEL_KONTRAK}`}
      >
        <span className="hidden text-teks-lembut xl:block">{nomor}</span>
        <span className="flex min-w-0 flex-col">
          <span className="text-[15px] font-semibold text-judul">{kontrak.nama}</span>
          <span className="text-[13px] text-teks-lembut">{kontrak.penyedia}</span>
        </span>
        <span className="hidden text-[13px] text-teks-lembut xl:block">{kontrak.nomorPks}</span>
        {/* Dua baris yang disengaja (awal di atas, akhir di bawah), supaya tidak terpotong di tengah tanggal. */}
        <span className="hidden flex-col text-[13px] text-teks-lembut xl:flex">
          <span>{formatTanggalSingkat(kontrak.tanggalMulai)}</span>
          <span>sampai {formatTanggalSingkat(kontrak.tanggalBerakhir)}</span>
        </span>
        <span className="col-start-1 row-start-2 text-[14px] font-bold text-judul xl:col-auto xl:row-auto xl:text-center">
          {formatRupiahSingkat(kontrak.nilai)}
        </span>
        {/* Status kontrak (sisa waktu): pil berwarna. */}
        <span className="col-start-1 row-start-3 flex items-center pt-0.5 xl:col-auto xl:row-auto xl:justify-center xl:pt-0">
          <BadgeStatus status={status}>{teksSisaHari(kontrak)}</BadgeStatus>
        </span>
        {/* Status adendum: teks dengan ikon, kolom sendiri. Label panjang boleh turun ke baris kedua. */}
        {adendum ? (
          <span className="col-start-1 row-start-4 flex xl:col-auto xl:row-auto">
            <StatusAdendum perpanjangan={kontrak.perpanjangan} />
          </span>
        ) : (
          <span aria-hidden="true" className="hidden text-teks-lembut xl:block">
            –
          </span>
        )}
        <span className="hidden text-[13px] text-teks-lembut xl:block">{kontrak.dokumen.length} file</span>
        <Ikon
          nama="kanan"
          ukuran={18}
          className="col-start-2 row-span-4 row-start-1 text-teks-lembut transition-transform duration-150 group-hover:translate-x-0.5 motion-reduce:transition-none xl:col-auto xl:row-auto"
        />
      </Link>
    </li>
  )
}

export default BarisKontrak
