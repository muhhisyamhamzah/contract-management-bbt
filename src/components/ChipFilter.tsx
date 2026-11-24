// Satu chip filter berbentuk pil, misalnya "Segera habis 4".
// Chip aktif berlatar sorot dengan tepi navy (DESIGN.md). Area sentuhnya 44px walau pilnya terlihat 38px.
// Chip status boleh memakai ikon status berwarna (pola halaman daftar kontrak acuan, 24 Nov 2026), supaya chip
// filter langsung terhubung dengan badge di tabel.

import Ikon, { type NamaIkon } from './Ikon'

type Props = {
  label: string
  jumlah: number
  aktif: boolean
  onPilih: () => void
  /** Ikon di depan label, misalnya ikon status dari TAMPILAN_STATUS. */
  ikon?: NamaIkon
  /** Class warna ikon, misalnya TAMPILAN_STATUS[status].kelasTeks. */
  kelasIkon?: string
}

function ChipFilter({ label, jumlah, aktif, onPilih, ikon, kelasIkon = '' }: Props) {
  return (
    <button
      type="button"
      aria-pressed={aktif}
      onClick={onPilih}
      className="group flex min-h-11 flex-none cursor-pointer items-center border-none bg-transparent p-0"
    >
      <span
        className={`flex h-[38px] items-center gap-2 rounded-full border px-3.5 text-[13px] font-semibold transition-[background-color,border-color,color] duration-150 motion-reduce:transition-none ${
          aktif
            ? 'border-galaxy-900 bg-lembut text-galaxy-900'
            : 'border-garis bg-white text-judul group-hover:border-garis-input'
        }`}
      >
        {ikon && <Ikon nama={ikon} ukuran={14} tebal={2.5} className={`flex-none ${kelasIkon}`} />}
        {label}
        <span
          className={`rounded-full px-1.5 text-[12px] ${aktif ? 'bg-white text-galaxy-900' : 'bg-latar text-teks-lembut'}`}
        >
          {jumlah}
        </span>
      </span>
    </button>
  )
}

export default ChipFilter
