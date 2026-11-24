// Satu baris tabel di halaman Kontrak (layar lebar, mulai 1280px). Susunan kolom mengikuti halaman daftar kontrak
// acuan (repo contract-management, 24 Nov 2026), karena tabel dan penempatannya lebih mudah dipahami:
// Kontrak (nama + nomor PKS) | Penyedia | Berakhir | Nilai | Sisa kontrak (teks + garis) | Status | Adendum | aksi.
//
// - Nama kontrak adalah tautan asli ke Detail (bisa dibuka dengan keyboard). Klik di bagian lain baris juga
//   membuka Detail, hanya sebagai kemudahan untuk tetikus.
// - Status kontrak (pil berwarna) dan status adendum (teks + ikon) sengaja di kolom berbeda (23 Nov 2026).
// - Tombol aksi: Ubah dan Hapus. Hapus selalu lewat dialog konfirmasi di halaman Kontrak.
// Layar lebih kecil memakai ItemDaftarKontrak.

import { Link, useNavigate } from 'react-router-dom'
import { formatRupiah, formatRupiahSingkat, formatTanggalSingkat } from '../lib/format'
import { hitungProgres, hitungStatus, TAMPILAN_STATUS, tampilkanStatusAdendum, teksSisaHari } from '../lib/status'
import type { Kontrak } from '../types/kontrak'
import BadgeStatus from './BadgeStatus'
import Ikon from './Ikon'
import StatusAdendum from './StatusAdendum'

type Props = {
  kontrak: Kontrak
  onHapus: (kontrak: Kontrak) => void
}

/** Tombol ikon kecil di kolom aksi. Area klik 40px; tabel ini hanya tampil di layar lebar (tetikus). */
const KELAS_TOMBOL_IKON =
  'flex size-10 cursor-pointer items-center justify-center rounded-full border-none bg-transparent text-teks-lembut no-underline transition-[background-color,color] duration-150 motion-reduce:transition-none'

function BarisKontrak({ kontrak, onHapus }: Props) {
  const navigate = useNavigate()
  const status = hitungStatus(kontrak)
  const tampilan = TAMPILAN_STATUS[status]
  const progres = hitungProgres(kontrak)
  const jumlahAdendum = kontrak.dokumen.filter((d) => d.jenis === 'Adendum').length
  const alamatDetail = `/kontrak/${kontrak.id}`

  return (
    <tr
      onClick={() => navigate(alamatDetail)}
      className="group cursor-pointer border-t border-garis-lembut transition-[background-color] duration-150 hover:bg-latar motion-reduce:transition-none"
    >
      <td className="max-w-[300px] py-3.5 pr-4 pl-6 align-middle">
        <Link
          to={alamatDetail}
          onClick={(e) => e.stopPropagation()}
          className="block text-[14px] font-semibold text-judul no-underline group-hover:text-aksi hover:text-aksi"
        >
          {kontrak.nama}
        </Link>
        <span className="mt-0.5 flex items-center gap-1.5 text-[12px] text-teks-lembut">
          {kontrak.nomorPks}
          <span aria-hidden="true">·</span>
          <Ikon nama="dokumen" ukuran={13} className="flex-none" />
          {kontrak.dokumen.length} file
        </span>
      </td>
      <td className="max-w-[200px] px-4 py-3.5 text-[13px] text-teks">{kontrak.penyedia}</td>
      <td className="px-4 py-3.5 whitespace-nowrap">
        <span className="block text-[13px] font-semibold text-judul">{formatTanggalSingkat(kontrak.tanggalBerakhir)}</span>
        <span className="block text-[12px] text-teks-lembut">mulai {formatTanggalSingkat(kontrak.tanggalMulai)}</span>
      </td>
      <td className="px-4 py-3.5 text-right text-[14px] font-bold whitespace-nowrap text-judul" title={formatRupiah(kontrak.nilai)}>
        {formatRupiahSingkat(kontrak.nilai)}
      </td>
      <td className="w-[150px] px-4 py-3.5">
        <span className={`mb-1.5 block text-[12px] font-semibold whitespace-nowrap ${status === 'berjalan' ? 'text-teks' : tampilan.kelasTeks}`}>
          {teksSisaHari(kontrak)}
        </span>
        {/* Garis masa kontrak: berapa persen masa kontrak sudah dilalui. Selalu bersama teks sisa waktu di atasnya. */}
        <span
          role="img"
          aria-label={`Masa kontrak sudah berjalan ${progres} persen`}
          className="block h-1.5 overflow-hidden rounded-full bg-garis-lembut"
        >
          <span className={`block h-full rounded-full ${tampilan.kelasBar}`} style={{ width: `${progres}%` }} />
        </span>
      </td>
      <td className="px-4 py-3.5">
        <BadgeStatus status={status} />
      </td>
      <td className="px-4 py-3.5">
        {tampilkanStatusAdendum(kontrak) ? (
          <StatusAdendum perpanjangan={kontrak.perpanjangan} />
        ) : (
          <span className="text-[13px] text-teks-lembut">
            <span aria-hidden="true">–</span>
            <span className="sr-only">Belum perlu diputuskan</span>
          </span>
        )}
        {jumlahAdendum > 0 && <span className="mt-0.5 block text-[12px] text-teks-lembut">{jumlahAdendum} adendum</span>}
      </td>
      <td className="py-3.5 pr-4 pl-2" onClick={(e) => e.stopPropagation()}>
        <span className="flex justify-end gap-0.5">
          <Link
            to={`/kontrak/${kontrak.id}/ubah`}
            aria-label={`Ubah ${kontrak.nama}`}
            title="Ubah"
            className={`${KELAS_TOMBOL_IKON} hover:bg-lembut hover:text-judul`}
          >
            <Ikon nama="pensil" ukuran={17} />
          </Link>
          <button
            type="button"
            onClick={() => onHapus(kontrak)}
            aria-label={`Hapus ${kontrak.nama}`}
            title="Hapus"
            className={`${KELAS_TOMBOL_IKON} hover:bg-hapus-latar hover:text-hapus-teks`}
          >
            <Ikon nama="sampah" ukuran={17} />
          </button>
        </span>
      </td>
    </tr>
  )
}

export default BarisKontrak
