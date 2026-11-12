// Kotak bergaris putus-putus untuk memilih file (PDF atau foto) di form Tambah kontrak.
// Input file asli menutupi seluruh kotak tapi tidak terlihat, jadi seluruh kotak bisa diketuk.

import Ikon, { type NamaIkon } from './Ikon'

type Props = {
  label: string
  ikon: NamaIkon
  accept: string
  /** "environment" membuka kamera belakang HP. */
  capture?: 'environment'
  onPilih: (namaFile: string) => void
}

function PilihFile({ label, ikon, accept, capture, onPilih }: Props) {
  return (
    <label className="relative flex cursor-pointer flex-col items-center gap-2 rounded-[18px] border-[1.5px] border-dashed border-aksen bg-white px-2 py-[18px] text-center text-[13px] font-semibold text-judul focus-within:ring-2 focus-within:ring-aksi/30">
      <span className="flex size-11 items-center justify-center rounded-[14px] bg-lembut text-aksi">
        <Ikon nama={ikon} />
      </span>
      {label}
      <input
        type="file"
        accept={accept}
        capture={capture}
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) onPilih(file.name)
        }}
        className="absolute inset-0 cursor-pointer opacity-0"
      />
    </label>
  )
}

export default PilihFile
