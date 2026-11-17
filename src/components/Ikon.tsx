// Kumpulan ikon garis (SVG), supaya tidak perlu library ikon tambahan.
// Ikon 3D atau gambar ikon dari luar sudah DITOLAK, jangan dipakai.
// Ikon selalu dekoratif (aria-hidden). Teks atau aria-label diberikan oleh pemakainya.

import type { ReactNode } from 'react'

const daftarIkon = {
  // Navigasi
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

  // Ikon status kontrak
  play: <path d="M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM10 8.5l5 3.5-5 3.5z" />,
  jam: <path d="M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 7v5l3 2" />,
  peringatan: <path d="M12 3l9 16H3zM12 10v4M12 17v.5" />,
  centangLingkaran: <path d="M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM8 12l3 3 5-6" />,
  dokumen: <path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9zM14 3v6h6" />,

  // Arah dan aksi
  kanan: <path d="M9 5l7 7-7 7" />,
  kiri: <path d="M15 5l-7 7 7 7" />,
  bawah: <path d="M6 9l6 6 6-6" />,
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
  centang: <path d="M5 12l5 5 9-10" />,
  sampah: <path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" />,

  // Form, akun, dan admin
  pensil: <path d="M4 20h4L19 9l-4-4L4 16zM13.5 6.5l4 4" />,
  kalender: (
    <>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 10h18M8 3v4M16 3v4" />
    </>
  ),
  salin: (
    <>
      <rect x="9" y="9" width="11" height="11" rx="2" />
      <path d="M5 15V5a1 1 0 0 1 1-1h10" />
    </>
  ),
  mata: (
    <>
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  mataTutup: <path d="M3 3l18 18M10.6 5.1A10 10 0 0 1 12 5c6.5 0 10 7 10 7a17 17 0 0 1-3.2 4.1M6.6 6.6A17 17 0 0 0 2 12s3.5 7 10 7a9.7 9.7 0 0 0 5.4-1.6M9.9 9.9a3 3 0 0 0 4.2 4.2" />,
  kunci: (
    <>
      <rect x="4" y="10" width="16" height="11" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </>
  ),
  pengguna: (
    <>
      <circle cx="9" cy="8" r="3.5" />
      <path d="M3 20c0-3.3 2.7-5.5 6-5.5s6 2.2 6 5.5M16 4.5a3.5 3.5 0 0 1 0 7M18 14.6c1.8.7 3 2.6 3 5.4" />
    </>
  ),
  perisai: <path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6zM9 12l2 2 4-4" />,
  riwayat: <path d="M3 12a9 9 0 1 0 3-6.7L3 8M3 3v5h5M12 7v5l3 2" />,
  catatan: <path d="M5 4h14v16H5zM9 9h6M9 13h6M9 17h3" />,
  email: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 7l9 6 9-6" />
    </>
  ),
  keluar: <path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3M10 17l5-5-5-5M15 12H4" />,
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
