// Label kecil berbentuk pil dengan warna sesuai status kontrak (latar muda + teks gelap, minimal 5,4:1).
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
      className={`inline-flex flex-none items-center gap-1.5 rounded-full px-3 py-1 text-[13px] font-bold whitespace-nowrap ${tampilan.kelasBadge} ${className}`}
    >
      {children ?? tampilan.label}
    </span>
  )
}

export default BadgeStatus
