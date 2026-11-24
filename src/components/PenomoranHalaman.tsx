// Pembagian halaman di bawah tabel Kontrak (pola halaman daftar kontrak acuan, 24 Nov 2026):
// "Tampilkan [10] per halaman" di kiri, "Halaman 1 dari 3" dengan tombol sebelumnya/berikutnya di kanan.

import { PILIHAN_PER_HALAMAN } from '../lib/daftarKontrak'
import { KELAS_ISIAN } from '../lib/tataLetak'
import Ikon from './Ikon'

type Props = {
  halaman: number
  jumlahHalaman: number
  perHalaman: number
  onUbahHalaman: (halaman: number) => void
  onUbahPerHalaman: (perHalaman: number) => void
}

const KELAS_TOMBOL_HALAMAN =
  'flex size-11 cursor-pointer items-center justify-center rounded-full border border-garis-input bg-white text-judul transition-[background-color] duration-150 hover:bg-latar disabled:cursor-not-allowed disabled:opacity-60 motion-reduce:transition-none'

function PenomoranHalaman({ halaman, jumlahHalaman, perHalaman, onUbahHalaman, onUbahPerHalaman }: Props) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-garis px-5 py-3 text-[13px] text-teks-lembut md:px-6">
      <label className="flex items-center gap-2">
        Tampilkan
        <select
          value={perHalaman}
          onChange={(e) => onUbahPerHalaman(Number(e.target.value))}
          className={`${KELAS_ISIAN} h-11 w-auto cursor-pointer pr-2`}
        >
          {PILIHAN_PER_HALAMAN.map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
        per halaman
      </label>
      <div className="flex items-center gap-2">
        <span aria-live="polite">
          Halaman <span className="font-semibold text-judul">{halaman}</span> dari {jumlahHalaman}
        </span>
        <button
          type="button"
          aria-label="Halaman sebelumnya"
          disabled={halaman <= 1}
          onClick={() => onUbahHalaman(halaman - 1)}
          className={KELAS_TOMBOL_HALAMAN}
        >
          <Ikon nama="kiri" ukuran={16} tebal={2.5} />
        </button>
        <button
          type="button"
          aria-label="Halaman berikutnya"
          disabled={halaman >= jumlahHalaman}
          onClick={() => onUbahHalaman(halaman + 1)}
          className={KELAS_TOMBOL_HALAMAN}
        >
          <Ikon nama="kanan" ukuran={16} tebal={2.5} />
        </button>
      </div>
    </div>
  )
}

export default PenomoranHalaman
