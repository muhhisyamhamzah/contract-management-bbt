// Pilihan "Status adendum" di form ubah: empat pilihan tersusun ke bawah (radio), bukan dropdown
// (Hisyam 18 Nov 2026). Label dan ikon sama persis dengan yang tampil di daftar dan Detail (STATUS_PERPANJANGAN),
// jadi yang dipilih di sini adalah yang dilihat pengguna lain (23 Nov 2026: dulu dua set label berbeda).
// Tidak dipakai di Tambah kontrak: kontrak baru selalu "Belum diproses".

import { STATUS_PERPANJANGAN } from '../lib/status'
import type { Perpanjangan } from '../types/kontrak'
import Ikon from './Ikon'

/** Penjelasan singkat tiap pilihan. [ASUMSI] Teks usulan, belum dikonfirmasi Hisyam. */
const KETERANGAN: Record<Perpanjangan, string> = {
  belum: 'Belum ada keputusan diperpanjang atau tidak.',
  proses: 'Adendum perpanjangan sedang disiapkan.',
  diperpanjang: 'Adendum perpanjangan sudah ditandatangani.',
  tidak: 'Kontrak tidak dilanjutkan setelah tanggal akhir.',
}

type Props = {
  nilai: Perpanjangan
  onUbah: (nilai: Perpanjangan) => void
}

function PilihanPerpanjangan({ nilai, onUbah }: Props) {
  return (
    <fieldset className="m-0 flex min-w-0 flex-col gap-2 border-0 p-0">
      <legend className="sr-only">Status adendum</legend>
      {(Object.keys(STATUS_PERPANJANGAN) as Perpanjangan[]).map((pilihan) => {
        const dipilih = pilihan === nilai
        const { label, ikon, kelasIkon } = STATUS_PERPANJANGAN[pilihan]
        return (
          <label
            key={pilihan}
            className={`flex min-h-14 cursor-pointer items-center gap-3.5 rounded-xl border px-4 py-3 transition-[background-color,border-color] duration-150 motion-reduce:transition-none ${
              dipilih ? 'border-aksi bg-lembut' : 'border-garis-input bg-white hover:bg-latar'
            }`}
          >
            <input
              type="radio"
              name="perpanjangan"
              value={pilihan}
              checked={dipilih}
              onChange={() => onUbah(pilihan)}
              className="size-5 flex-none cursor-pointer accent-aksi"
            />
            <span className="flex min-w-0 flex-col">
              <span className="inline-flex items-center gap-1.5 font-semibold text-judul">
                <Ikon nama={ikon} ukuran={15} tebal={2.5} className={`flex-none ${kelasIkon}`} />
                {label}
              </span>
              <span className="text-[13px] text-teks-lembut">{KETERANGAN[pilihan]}</span>
            </span>
          </label>
        )
      })}
    </fieldset>
  )
}

export default PilihanPerpanjangan
