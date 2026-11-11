// Lingkaran hitung mundur di header Detail kontrak (di atas latar biru gelap).
// Angka di tengah = sisa hari. Panjang garis cincin = sisa masa kontrak:
// makin dekat tanggal berakhir, makin pendek garisnya.

import { hitungProgres, hitungSisaHari, hitungStatus, TAMPILAN_STATUS, teksSisaHari } from '../lib/status'
import type { Kontrak } from '../types/kontrak'

const UKURAN = 92
const JARI_JARI = 38
const KELILING = 2 * Math.PI * JARI_JARI
/** Panjang minimal garis (4%), supaya cincin tidak hilang sama sekali saat hampir habis. */
const PORSI_MINIMAL = 0.04

type Props = {
  kontrak: Kontrak
}

function CincinHari({ kontrak }: Props) {
  const status = hitungStatus(kontrak)
  const sisaHari = hitungSisaHari(kontrak.tanggalBerakhir)

  // Kontrak lewat atau selesai digambar penuh; selain itu sesuai sisa masa kontrak.
  const porsi =
    status === 'lewat' || status === 'selesai'
      ? 1
      : Math.max((100 - hitungProgres(kontrak)) / 100, PORSI_MINIMAL)

  const angka = status === 'selesai' ? '✓' : String(Math.abs(sisaHari))
  const keterangan =
    status === 'lewat' ? 'hari lewat' : status === 'selesai' ? 'selesai' : 'hari lagi'

  return (
    <div className="relative size-[92px] flex-none">
      <svg
        width={UKURAN}
        height={UKURAN}
        viewBox={`0 0 ${UKURAN} ${UKURAN}`}
        role="img"
        aria-label={teksSisaHari(kontrak)}
      >
        {/* Lintasan cincin (transparan) */}
        <circle
          cx={UKURAN / 2}
          cy={UKURAN / 2}
          r={JARI_JARI}
          fill="none"
          strokeWidth={9}
          className="stroke-white/15"
        />
        {/* Garis sisa waktu, mulai dari atas (diputar -90 derajat) */}
        <circle
          cx={UKURAN / 2}
          cy={UKURAN / 2}
          r={JARI_JARI}
          fill="none"
          strokeWidth={9}
          strokeLinecap="round"
          strokeDasharray={`${(KELILING * porsi).toFixed(1)} ${KELILING.toFixed(1)}`}
          transform={`rotate(-90 ${UKURAN / 2} ${UKURAN / 2})`}
          className={TAMPILAN_STATUS[status].kelasCincin}
        />
      </svg>

      <span
        aria-hidden="true"
        className="absolute inset-0 flex flex-col items-center justify-center leading-[1.1]"
      >
        <span className="text-[24px] font-extrabold">{angka}</span>
        <span className="text-[11px] text-teks-header">{keterangan}</span>
      </span>
    </div>
  )
}

export default CincinHari
