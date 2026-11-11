// Label kecil berbentuk pil dengan warna sesuai status kontrak.
// Contoh: badge "Segera habis" di Detail, atau "18 hari lagi" di kartu kontrak.

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
      className={`rounded-full px-2.5 py-1 text-[12px] font-bold ${tampilan.kelasBadge} ${className}`}
    >
      {children ?? tampilan.label}
    </span>
  )
}

export default BadgeStatus
