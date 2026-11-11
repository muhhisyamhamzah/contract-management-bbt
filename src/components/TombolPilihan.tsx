// Tombol pilihan yang bisa aktif/tidak (misalnya jenis kontrak PKS / SPK / Lainnya,
// atau pengingat 30 / 60 / 90 hari). Pilihan aktif berlatar navy.

type Props = {
  label: string
  aktif: boolean
  onPilih: () => void
  /** Class bentuk tambahan, misalnya "rounded-full px-4" atau "rounded-[14px]". */
  className?: string
}

function TombolPilihan({ label, aktif, onPilih, className = 'rounded-full px-4' }: Props) {
  return (
    <button
      type="button"
      aria-pressed={aktif}
      onClick={onPilih}
      className={`h-[44px] cursor-pointer border font-semibold transition-colors duration-150 motion-reduce:transition-none ${className} ${
        aktif ? 'border-aksi bg-aksi text-white' : 'border-garis-input bg-white text-judul'
      }`}
    >
      {label}
    </button>
  )
}

export default TombolPilihan
