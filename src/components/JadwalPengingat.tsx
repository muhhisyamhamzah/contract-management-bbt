// Garis masa kontrak di Detail: dari awal sampai akhir kontrak, dengan titik untuk tiap tahap
// pengingat (3, 2, 1 bulan sebelum habis) dan penanda hari ini.

import { formatTanggal, formatTanggalSingkat, keTanggal } from '../lib/format'
import { hitungProgres, hitungStatus, jadwalPengingat, persenPadaGaris } from '../lib/status'
import type { Kontrak } from '../types/kontrak'

type Props = {
  kontrak: Kontrak
}

function JadwalPengingat({ kontrak }: Props) {
  const status = hitungStatus(kontrak)
  const progres = hitungProgres(kontrak)
  const jadwal = jadwalPengingat(kontrak.tanggalBerakhir)
  const selesai = status === 'selesai'

  return (
    <div className="flex flex-col gap-3">
      <div className="flex justify-between text-[12px] text-teks-lembut">
        <span>Awal {formatTanggalSingkat(kontrak.tanggalMulai)}</span>
        <span>Akhir {formatTanggalSingkat(kontrak.tanggalBerakhir)}</span>
      </div>

      <div className="relative py-2">
        <div
          role="progressbar"
          aria-label="Masa kontrak yang sudah berjalan"
          aria-valuenow={progres}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuetext={`${progres}% masa kontrak sudah berjalan`}
          className="h-2.5 overflow-hidden rounded-full bg-garis-lembut"
        >
          <div
            className={`h-full rounded-full ${
              selesai ? 'bg-selesai' : status === 'lewat' ? 'bg-lewat' : 'bg-segera'
            }`}
            style={{ width: `${progres}%` }}
          />
        </div>

        {/* Titik tahap pengingat (navy = sudah terkirim, putih = terjadwal) */}
        {!selesai &&
          jadwal.map((tahap) => (
            <span
              key={tahap.bulan}
              aria-hidden="true"
              title={`Pengingat ${tahap.bulan} bulan: ${formatTanggal(tahap.tanggal)}`}
              style={{ left: `${persenPadaGaris(kontrak, keTanggal(tahap.tanggal))}%` }}
              className={`absolute top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] ${
                tahap.terkirim ? 'border-white bg-galaxy-900' : 'border-galaxy-900 bg-white'
              }`}
            />
          ))}
      </div>

      {!selesai && (
        <ol className="m-0 grid list-none gap-x-6 gap-y-3 p-0 sm:grid-cols-3">
          {jadwal.map((tahap) => (
            <li
              key={tahap.bulan}
              className="flex items-center gap-2.5"
            >
              <span
                aria-hidden="true"
                className={`size-3 flex-none rounded-full border-[3px] ${
                  tahap.terkirim ? 'border-galaxy-900 bg-galaxy-900' : 'border-galaxy-900 bg-white'
                }`}
              />
              <span className="flex flex-col">
                <span className="text-[13px] font-semibold text-judul">Pengingat {tahap.bulan} bulan</span>
                <span className="text-[12px] text-teks-lembut">
                  {formatTanggalSingkat(tahap.tanggal)}, {tahap.terkirim ? 'sudah terkirim' : 'terjadwal'}
                </span>
              </span>
            </li>
          ))}
        </ol>
      )}
    </div>
  )
}

export default JadwalPengingat
