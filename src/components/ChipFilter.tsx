// Satu chip filter berbentuk pil, misalnya "Segera habis · 3".
// Chip aktif berlatar navy tua; chip lain putih dengan teks berwarna sesuai statusnya.

type Props = {
  label: string
  jumlah: number
  aktif: boolean
  /** Warna teks saat tidak aktif, misalnya TAMPILAN_STATUS.segera.kelasTeks. */
  kelasTeks?: string
  onPilih: () => void
}

function ChipFilter({ label, jumlah, aktif, kelasTeks = 'text-judul', onPilih }: Props) {
  return (
    <button
      type="button"
      aria-pressed={aktif}
      onClick={onPilih}
      className={`flex h-9 flex-none cursor-pointer items-center rounded-full border px-3.5 text-[13px] font-semibold transition-colors duration-150 motion-reduce:transition-none ${
        aktif ? 'border-galaxy-900 bg-galaxy-900 text-white' : `border-garis bg-white ${kelasTeks}`
      }`}
    >
      {label} · {jumlah}
    </button>
  )
}

export default ChipFilter
