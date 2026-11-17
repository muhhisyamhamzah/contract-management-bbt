// Ringkasan jumlah kontrak di Beranda: Perlu perhatian, Berjalan, Selesai (tiga kartu, desain v4).
// [TERBUKA] Bentuk ringkasan Beranda belum diputuskan (lihat CLAUDE.md). Komponen ini sengaja terpisah
// supaya mudah diganti, misalnya dengan kalender besar kontrak yang paling cepat habis.

import { Link } from 'react-router-dom'
import { BATAS_HARI_SEGERA, TAMPILAN_STATUS } from '../lib/status'
import type { NamaIkon } from './Ikon'
import Ikon from './Ikon'

type Props = {
  perluPerhatian: number
  berjalan: number
  selesai: number
}

type Kartu = {
  angka: number
  judul: string
  keterangan: string
  ikon: NamaIkon
  ke: string
  kelasIkonGradasi: string
  kelasHiasan: string
}

function RingkasanStatus({ perluPerhatian, berjalan, selesai }: Props) {
  const bulan = Math.round(BATAS_HARI_SEGERA / 30)
  const kartu: Kartu[] = [
    {
      angka: perluPerhatian,
      judul: 'Perlu perhatian',
      keterangan: `Lewat atau habis dalam ${bulan} bulan`,
      ikon: TAMPILAN_STATUS.segera.ikon,
      ke: '/pengingat',
      kelasIkonGradasi: TAMPILAN_STATUS.segera.kelasIkonGradasi,
      kelasHiasan: TAMPILAN_STATUS.segera.kelasHiasan,
    },
    {
      angka: berjalan,
      judul: 'Berjalan',
      keterangan: `Masih lebih dari ${bulan} bulan`,
      ikon: TAMPILAN_STATUS.berjalan.ikon,
      ke: '/kontrak?status=berjalan',
      kelasIkonGradasi: TAMPILAN_STATUS.berjalan.kelasIkonGradasi,
      kelasHiasan: TAMPILAN_STATUS.berjalan.kelasHiasan,
    },
    {
      angka: selesai,
      judul: 'Selesai',
      keterangan: 'Sudah ditutup',
      ikon: TAMPILAN_STATUS.selesai.ikon,
      ke: '/kontrak?status=selesai',
      kelasIkonGradasi: TAMPILAN_STATUS.selesai.kelasIkonGradasi,
      kelasHiasan: TAMPILAN_STATUS.selesai.kelasHiasan,
    },
  ]

  return (
    <section aria-label="Ringkasan kontrak" className="grid grid-cols-1 gap-3 sm:grid-cols-3 md:gap-5">
      {kartu.map((k, i) => (
        <Link
          key={k.judul}
          to={k.ke}
          className="group relative flex items-center gap-4 overflow-hidden rounded-2xl border border-garis bg-white p-5 text-teks no-underline shadow-kotak transition-transform duration-200 hover:-translate-y-0.5 hover:text-teks motion-reduce:transition-none sm:flex-col sm:items-start sm:gap-3 md:p-6"
        >
          {/* Hiasan lingkaran samar di pojok kanan atas */}
          <span aria-hidden="true" className={`absolute -top-8 -right-8 size-24 rounded-full ${k.kelasHiasan}`} />

          <span
            aria-hidden="true"
            style={{ animationDelay: `${i * 80}ms` }}
            className={`relative flex size-11 flex-none items-center justify-center rounded-[14px] bg-linear-135 text-white shadow-md inset-shadow-[0_1px_0_rgb(255_255_255/0.45)] motion-safe:animate-meletup ${k.kelasIkonGradasi}`}
          >
            <Ikon nama={k.ikon} ukuran={22} tebal={2.2} />
          </span>

          <span className="relative flex flex-col">
            <span className="text-[30px] leading-none font-bold text-judul md:text-[34px]">{k.angka}</span>
            <span className="mt-1.5 font-semibold text-judul">{k.judul}</span>
            <span className="text-[13px] text-teks-lembut">{k.keterangan}</span>
          </span>
        </Link>
      ))}
    </section>
  )
}

export default RingkasanStatus
