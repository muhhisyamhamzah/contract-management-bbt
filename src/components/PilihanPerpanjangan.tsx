// Pilihan "Perpanjangan kontrak" di form ubah: empat pilihan tersusun ke bawah (radio), bukan dropdown
// (Hisyam 18 Nov 2026). Tiap pilihan menyebut status kontrak yang akan tampil.
// Tidak dipakai di Tambah kontrak: kontrak baru selalu "Belum diproses".

import { LABEL_PERPANJANGAN, STATUS_PERPANJANGAN } from '../lib/status'
import type { Perpanjangan } from '../types/kontrak'

type Props = {
  nilai: Perpanjangan
  onUbah: (nilai: Perpanjangan) => void
}

function PilihanPerpanjangan({ nilai, onUbah }: Props) {
  return (
    <fieldset className="m-0 flex min-w-0 flex-col gap-2 border-0 p-0">
      <legend className="sr-only">Perpanjangan kontrak</legend>
      {(Object.keys(LABEL_PERPANJANGAN) as Perpanjangan[]).map((pilihan) => {
        const dipilih = pilihan === nilai
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
              <span className="font-semibold text-judul">{LABEL_PERPANJANGAN[pilihan]}</span>
              <span className="text-[13px] text-teks-lembut">Status kontrak: {STATUS_PERPANJANGAN[pilihan].label}</span>
            </span>
          </label>
        )
      })}
    </fieldset>
  )
}

export default PilihanPerpanjangan
