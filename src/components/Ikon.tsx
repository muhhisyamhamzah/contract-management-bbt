// Kumpulan ikon garis (SVG). Bentuknya disalin dari docs/prototipe-referensi.html,
// supaya tidak perlu library ikon tambahan.
// Ikon selalu dekoratif (aria-hidden). Teks atau aria-label diberikan oleh pemakainya.

import type { ReactNode } from 'react'

const daftarIkon = {
  // Navigasi bawah
  beranda: <path d="M3 11l9-8 9 8v9a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z" />,
  kontrak: (
    <>
      <path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
      <path d="M14 3v6h6M8 13h8M8 17h5" />
    </>
  ),
  tambah: <path d="M12 5v14M5 12h14" />,
  pengingat: (
    <>
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10 21h4" />
    </>
  ),
  profil: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4 4-6 8-6s8 2 8 6" />
    </>
  ),

  // Ikon status kontrak
  play: <path d="M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM10 8.5l5 3.5-5 3.5z" />,
  jam: <path d="M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 7v5l3 2" />,
  peringatan: <path d="M12 3l9 16H3zM12 10v4M12 17v.5" />,
  centangLingkaran: <path d="M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM8 12l3 3 5-6" />,
  dokumen: <path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9zM14 3v6h6" />,

  // Arah dan aksi
  kanan: <path d="M9 5l7 7-7 7" />,
  kiri: <path d="M15 5l-7 7 7 7" />,
  tutup: <path d="M6 6l12 12M18 6L6 18" />,
  titikTiga: (
    <>
      <circle cx="12" cy="5" r="1" />
      <circle cx="12" cy="12" r="1" />
      <circle cx="12" cy="19" r="1" />
    </>
  ),
  cari: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3.5-3.5" />
    </>
  ),
  urutkan: <path d="M7 4v16M3 16l4 4 4-4M17 20V4M13 8l4-4 4 4" />,
  info: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v6M12 16.5v.5" />
    </>
  ),
  unduh: <path d="M12 4v12M7 11l5 5 5-5M5 20h14" />,
  unggah: <path d="M12 16V4M7 9l5-5 5 5M4 20h16" />,
  kamera: (
    <>
      <rect x="3" y="7" width="18" height="13" rx="2" />
      <circle cx="12" cy="13.5" r="3.5" />
      <path d="M8 7l2-3h4l2 3" />
    </>
  ),
  centang: <path d="M5 12l5 5 9-10" />,
  sampah: <path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" />,
} satisfies Record<string, ReactNode>

export type NamaIkon = keyof typeof daftarIkon

type Props = {
  nama: NamaIkon
  /** Lebar dan tinggi dalam piksel. */
  ukuran?: number
  /** Ketebalan garis. Referensi memakai 2, dan 2.5 untuk panah dan tanda +. */
  tebal?: number
  className?: string
}

function Ikon({ nama, ukuran = 22, tebal = 2, className }: Props) {
  return (
    <svg
      width={ukuran}
      height={ukuran}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={tebal}
      aria-hidden="true"
      className={className}
    >
      {daftarIkon[nama]}
    </svg>
  )
}

export default Ikon
