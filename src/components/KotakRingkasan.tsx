// Satu kotak di "Ringkasan kontrak" pada Beranda (misalnya "Segera habis · 3 kontrak").
// Ikon berada di kotak bergradasi dengan kilau dan bayangan berwarna, muncul dengan
// animasi meletup, dan bergerak sedikit saat disentuh supaya tidak terasa kaku.

import { Link } from 'react-router-dom'
import Ikon, { type NamaIkon } from './Ikon'

type Props = {
  judul: string
  keterangan: string
  ikon: NamaIkon
  /** Alamat tujuan saat diklik. */
  ke: string
  /** Gradasi + bayangan kotak ikon, misalnya dari TAMPILAN_STATUS.kelasIkonGradasi. */
  kelasIkonGradasi: string
  /** Warna hiasan lingkaran samar di pojok kanan atas. */
  kelasHiasan: string
  /** Urutan kotak (0, 1, 2, ...) supaya animasi muncul bergantian. */
  urutan?: number
}

function KotakRingkasan({ judul, keterangan, ikon, ke, kelasIkonGradasi, kelasHiasan, urutan = 0 }: Props) {
  return (
    <Link
      to={ke}
      className="group relative flex flex-col gap-2.5 overflow-hidden rounded-2xl bg-white p-3 text-teks no-underline shadow-kotak transition-transform duration-200 hover:text-teks active:scale-[0.97] motion-reduce:transition-none"
    >
      {/* Hiasan lingkaran samar di pojok kanan atas */}
      <span aria-hidden="true" className={`absolute -top-5 -right-5 size-16 rounded-full ${kelasHiasan}`} />

      <span
        aria-hidden="true"
        style={{ animationDelay: `${urutan * 70}ms` }}
        className={`relative flex size-11 items-center justify-center rounded-[14px] bg-linear-135 text-white shadow-md inset-shadow-[0_1px_0_rgb(255_255_255/0.45)] transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:-rotate-6 motion-safe:animate-meletup motion-reduce:transition-none ${kelasIkonGradasi}`}
      >
        <Ikon nama={ikon} ukuran={22} tebal={2.2} />
      </span>

      <span className="relative flex items-end justify-between gap-1">
        <span className="flex min-w-0 flex-col gap-0.5">
          <span className="text-[13px] font-semibold text-judul">{judul}</span>
          <span className="text-[11px] text-teks-lembut">{keterangan}</span>
        </span>
        <Ikon
          nama="kanan"
          ukuran={14}
          className="mb-0.5 flex-none text-teks-lembut transition-transform duration-200 group-hover:translate-x-0.5 motion-reduce:transition-none"
        />
      </span>
    </Link>
  )
}

export default KotakRingkasan
