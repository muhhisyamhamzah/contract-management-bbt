// Label kecil berbentuk pil dengan warna sesuai status kontrak (latar muda + teks gelap, minimal 5,4:1).
// Contoh: "18 hari lagi" di daftar kontrak, atau "Segera habis" di Detail.
// Ada ikon status (dari TAMPILAN_STATUS) supaya status tidak hanya dibedakan lewat warna (23 Nov 2026):
// "Segera habis" (jam) dan "Sudah lewat" (segitiga peringatan) berwarna hangat yang mirip.

import type { ReactNode } from 'react'
import { TAMPILAN_STATUS } from '../lib/status'
import type { StatusKontrak } from '../types/kontrak'
import Ikon from './Ikon'

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
      className={`inline-flex flex-none items-center gap-1.5 rounded-full py-1 pr-3 pl-2.5 text-[13px] font-bold whitespace-nowrap ${tampilan.kelasBadge} ${className}`}
    >
      <Ikon nama={tampilan.ikon} ukuran={14} tebal={2.5} className="flex-none" />
      {children ?? tampilan.label}
    </span>
  )
}

export default BadgeStatus
