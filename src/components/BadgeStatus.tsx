// Label kecil berbentuk pil dengan warna sesuai status kontrak.
// Contoh: "18 hari lagi" di kartu kontrak, atau "Segera habis" di Detail.

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
      className={`flex-none rounded-full px-2 py-0.5 text-[11px] font-semibold ${tampilan.kelasBadge} ${className}`}
    >
      {children ?? tampilan.label}
    </span>
  )
}

export default BadgeStatus
