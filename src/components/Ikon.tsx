// Kumpulan ikon garis sederhana (SVG), supaya tidak perlu library ikon tambahan.
// Ikon selalu dekoratif (aria-hidden). Teks atau aria-label diberikan oleh pemakainya.

const daftarPath = {
  beranda: 'M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1v-9.5Z',
  kontrak: 'M7 3h7l5 5v12a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Zm7 0v5h5M9 13h6M9 17h6',
  tambah: 'M12 5v14M5 12h14',
  pengingat: 'M6 16V11a6 6 0 1 1 12 0v5l2 2H4l2-2Zm4 4a2 2 0 0 0 4 0',
  profil: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-8 9a8 8 0 0 1 16 0',
} as const

export type NamaIkon = keyof typeof daftarPath

type Props = {
  nama: NamaIkon
  className?: string
}

function Ikon({ nama, className = 'size-6' }: Props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <path d={daftarPath[nama]} />
    </svg>
  )
}

export default Ikon
