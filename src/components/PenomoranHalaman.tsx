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

// Tombol memakai aria-disabled, bukan disabled: tombol "berikutnya" yang menjadi disabled di halaman terakhir
// saat masih difokus membuang fokus di Safari dan Firefox (impeccable harden, 24 Nov 2026).
const KELAS_TOMBOL_HALAMAN =
  'flex size-11 cursor-pointer items-center justify-center rounded-full border border-garis-input bg-white text-judul transition-[background-color] duration-150 hover:bg-latar aria-disabled:cursor-not-allowed aria-disabled:opacity-60 aria-disabled:hover:bg-white motion-reduce:transition-none'

function PenomoranHalaman({ halaman, jumlahHalaman, perHalaman, onUbahHalaman, onUbahPerHalaman }: Props) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-garis px-5 py-3 text-[13px] text-teks-lembut md:px-6">
      <label className="flex items-center gap-2 whitespace-nowrap">
        Tampilkan
        <select
          value={perHalaman}
          onChange={(e) => onUbahPerHalaman(Number(e.target.value))}
          // KELAS_ISIAN memakai w-full untuk form; di sini lebar mengikuti isi. Dulu w-full dan w-auto dipasang bersamaan,
          // w-full menang, sehingga "per halaman" terpotong dua baris (impeccable polish, 25 Nov 2026).
          className={`${KELAS_ISIAN.replace('w-full ', '')} h-11 w-auto cursor-pointer pr-2`}
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
          aria-disabled={halaman <= 1}
          onClick={() => halaman > 1 && onUbahHalaman(halaman - 1)}
          className={KELAS_TOMBOL_HALAMAN}
        >
          <Ikon nama="kiri" ukuran={16} tebal={2.5} />
        </button>
        <button
          type="button"
          aria-label="Halaman berikutnya"
          aria-disabled={halaman >= jumlahHalaman}
          onClick={() => halaman < jumlahHalaman && onUbahHalaman(halaman + 1)}
          className={KELAS_TOMBOL_HALAMAN}
        >
          <Ikon nama="kanan" ukuran={16} tebal={2.5} />
        </button>
      </div>
    </div>
  )
}

export default PenomoranHalaman
