// Status adendum yang dihitung dari isian perpanjangan kontrak
// (Belum diproses, Sedang diproses, Sudah diperpanjang, Tidak diperpanjang).
// Label, ikon, dan warna ikon diambil dari STATUS_PERPANJANGAN di src/lib/status.ts.
//
// Sengaja BUKAN pil (23 Nov 2026, dulu bernama PilPerpanjangan): berupa teks biasa dengan ikon kecil berwarna.
// Pil hanya untuk status kontrak (BadgeStatus). Waktu keduanya sama-sama pil dan bertumpuk di satu kolom,
// pengguna membacanya sebagai satu informasi walau warnanya sudah dibedakan.

import { STATUS_PERPANJANGAN } from '../lib/status'
import type { Perpanjangan } from '../types/kontrak'
import Ikon from './Ikon'

type Props = {
  perpanjangan: Perpanjangan
}

function StatusAdendum({ perpanjangan }: Props) {
  const { label, ikon, kelasIkon } = STATUS_PERPANJANGAN[perpanjangan]
  return (
    <span className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-teks">
      <Ikon nama={ikon} ukuran={15} tebal={2.5} className={`flex-none ${kelasIkon}`} />
      {label}
    </span>
  )
}

export default StatusAdendum
