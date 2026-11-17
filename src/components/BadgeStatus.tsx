// Label kecil berbentuk pil dengan titik dan warna sesuai status kontrak.
// Contoh: "18 hari lagi" di daftar kontrak, atau "Segera habis" di Detail.

import type { ReactNode } from 'react'
import { TAMPILAN_STATUS } from '../lib/status'
import type { StatusKontrak } from '../types/kontrak'

type Props = {
  status: StatusKontrak
  /** Teks di dalam badge. Kalau kosong, memakai label status (misalnya "Berjalan"). */
  children?: ReactNode
  className?: string
}

function BadgeStatus({ status, children, className = '' }: Props) {
  const tampilan = TAMPILAN_STATUS[status]

  return (
    <span
      className={`inline-flex flex-none items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-semibold whitespace-nowrap ${tampilan.kelasBadge} ${className}`}
    >
      <span aria-hidden="true" className={`size-1.5 rounded-full ${tampilan.kelasBar}`} />
      {children ?? tampilan.label}
    </span>
  )
}

export default BadgeStatus
