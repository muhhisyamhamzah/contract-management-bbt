// Isi tab "Riwayat" di Detail kontrak: garis waktu kejadian dari yang terbaru.

import { riwayatContoh } from '../data/rincianContoh'
import { formatTanggalSingkat } from '../lib/format'
import type { JenisRiwayat, Kontrak } from '../types/kontrak'

/** Warna titik tiap jenis kejadian. */
const WARNA_TITIK: Record<JenisRiwayat, string> = {
  lunas: 'bg-berjalan',
  selesai: 'bg-aksi',
  dicatat: 'bg-selesai',
}

type Props = {
  kontrak: Kontrak
}

function RiwayatKontrak({ kontrak }: Props) {
  const riwayat = riwayatContoh(kontrak)

  return (
    <section className="rounded-2xl bg-white p-4 shadow-kotak">
      <ol className="m-0 list-none p-0">
        {riwayat.map((kejadian, i) => (
          <li key={`${kejadian.judul}-${kejadian.tanggal}`} className="flex gap-3">
            {/* Titik dan garis penghubung */}
            <div aria-hidden="true" className="flex flex-col items-center">
              <div className={`mt-[3px] size-3 rounded-full ${WARNA_TITIK[kejadian.jenis]}`} />
              {i < riwayat.length - 1 && <div className="w-0.5 flex-1 bg-garis" />}
            </div>
            <div className="flex flex-col gap-0.5 pb-4">
              <span className="font-semibold text-judul">{kejadian.judul}</span>
              <span className="text-[12px] text-teks-lembut">
                {kejadian.oleh} · {formatTanggalSingkat(kejadian.tanggal)}
              </span>
            </div>
          </li>
        ))}
      </ol>
    </section>
  )
}

export default RiwayatKontrak
