// Kartu kontrak di Agenda Beranda (pilihan "A: kartu bergrid", disetujui Hisyam 17 Nov 2026):
// kotak kalender tanggal akhir, angka sisa hari besar sebagai pusat perhatian, nama dan penyedia,
// status adendum, nomor PKS, dan nilai. Seluruh kartu adalah tautan ke Detail.
// Garis masa kontrak dihapus 23 Nov 2026: tanpa label, garis itu mudah dibaca sebagai "sisa waktu", padahal sisa waktu
// sudah ditunjukkan kotak kalender (tanggal akhir) dan angka besar (hari lagi / hari lewat).

import { Link } from 'react-router-dom'
import { formatRupiahSingkat } from '../lib/format'
import { hitungSisaHari, hitungStatus, TAMPILAN_STATUS } from '../lib/status'
import type { Kontrak } from '../types/kontrak'
import KotakKalender from './KotakKalender'
import StatusAdendum from './StatusAdendum'

type Props = {
  kontrak: Kontrak
}

function KartuKontrak({ kontrak }: Props) {
  const status = hitungStatus(kontrak)
  const tampilan = TAMPILAN_STATUS[status]
  const sisa = hitungSisaHari(kontrak.tanggalBerakhir)
  const keteranganSisa = sisa < 0 ? 'hari lewat' : sisa === 0 ? 'berakhir hari ini' : 'hari lagi'

  return (
    <Link
      to={`/kontrak/${kontrak.id}`}
      className="flex h-full flex-col gap-3.5 rounded-[20px] border border-garis bg-white p-5 text-teks no-underline transition-[border-color] duration-150 hover:border-garis-input hover:text-teks motion-reduce:transition-none md:rounded-3xl"
    >
      <span className="flex items-start justify-between gap-3">
        <KotakKalender tanggal={kontrak.tanggalBerakhir} kelasPita={tampilan.kelasPita} />
        <span className={`text-right leading-none ${tampilan.kelasTeks}`}>
          <span className="block text-[44px] font-extrabold tracking-[-0.03em]">{Math.abs(sisa)}</span>
          <span className="text-[13px] font-semibold">{keteranganSisa}</span>
        </span>
      </span>

      <span className="flex flex-col gap-0.5">
        <span className="text-[16px] font-bold text-judul">{kontrak.nama}</span>
        <span className="text-[13px] text-teks-lembut">{kontrak.penyedia}</span>
      </span>

      {/* Status adendum (Hisyam 18 Nov 2026) */}
      <span className="flex">
        <StatusAdendum perpanjangan={kontrak.perpanjangan} />
      </span>

      <span className="mt-auto flex items-baseline justify-between gap-3">
        {/* Nomor PKS yang mengalah kalau panjang; nilai rupiah tidak pernah terpatah (impeccable harden). */}
        <span className="min-w-0 text-[13px] text-teks-lembut">{kontrak.nomorPks}</span>
        <span className="flex-none text-[15px] font-bold whitespace-nowrap text-judul">{formatRupiahSingkat(kontrak.nilai)}</span>
      </span>
    </Link>
  )
}

export default KartuKontrak
