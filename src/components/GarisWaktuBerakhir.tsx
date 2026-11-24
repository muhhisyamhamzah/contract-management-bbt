// Garis waktu "Kontrak berakhir" di Beranda (24 Nov 2026): 12 bulan ke depan, satu kolom per bulan.
// Setiap kontrak digambar sebagai satu kotak kecil seperti kavling di mozaik, berwarna status kontraknya saat ini,
// jadi bulan yang sibuk langsung terlihat. Kolom yang berisi kontrak membuka daftar Kontrak untuk bulan itu
// (/kontrak?bulan=YYYY-MM). Tanpa library grafik.

import { Link } from 'react-router-dom'
import type { BulanBerakhir } from '../lib/beranda'
import { formatBulan } from '../lib/beranda'
import { formatRupiahSingkat } from '../lib/format'
import { hitungStatus, TAMPILAN_STATUS } from '../lib/status'
import type { StatusKontrak } from '../types/kontrak'
import KartuBagian from './KartuBagian'

/** Kotak paling banyak per kolom; sisanya ditulis "+n" supaya tinggi kolom tetap. */
const MAKS_KOTAK = 8

/** Urutan keterangan warna. */
const URUTAN_STATUS: StatusKontrak[] = ['lewat', 'segera', 'berjalan', 'selesai']

type Props = {
  /** Class tambahan untuk panel, misalnya flex-1. */
  kelas?: string
  daftar: BulanBerakhir[]
}

function GarisWaktuBerakhir({ daftar, kelas }: Props) {
  const statusTampil = new Set(daftar.flatMap((b) => b.kontrak.map((k) => hitungStatus(k))))
  const jumlah = daftar.reduce((total, b) => total + b.kontrak.length, 0)

  return (
    <KartuBagian kelas={kelas} judul="Kontrak berakhir" keterangan={`${jumlah} kontrak dalam ${daftar.length} bulan ke depan`}>
      <ol className="m-0 grid list-none grid-cols-6 gap-x-1.5 gap-y-4 p-0 md:grid-cols-12">
        {daftar.map((bulan, i) => {
          const tahunBaru = i === 0 || bulan.tanggal.getMonth() === 0
          const isi = (
            <>
              <span className={`text-[13px] font-bold ${bulan.kontrak.length > 0 ? 'text-judul' : 'text-teks-lembut'}`}>
                {bulan.kontrak.length}
              </span>
              {/* Kotak kavling, disusun dari bawah ke atas. */}
              <span aria-hidden="true" className="flex h-[92px] flex-col-reverse items-center gap-1">
                {bulan.kontrak.slice(0, MAKS_KOTAK).map((k) => (
                  <span key={k.id} className={`size-2.5 flex-none rounded-[3px] ${TAMPILAN_STATUS[hitungStatus(k)].kelasBar}`} />
                ))}
                {bulan.kontrak.length > MAKS_KOTAK && (
                  <span className="text-[11px] leading-none font-semibold text-teks-lembut">+{bulan.kontrak.length - MAKS_KOTAK}</span>
                )}
              </span>
              <span className="border-t border-garis pt-1.5 text-[12px] text-teks-lembut">
                {bulan.tanggal.toLocaleDateString('id-ID', { month: 'short' })}
                {tahunBaru && <span className="block text-[11px]">{bulan.tanggal.getFullYear()}</span>}
              </span>
            </>
          )
          const kelasKolom = 'flex h-full min-h-11 flex-col items-stretch gap-1.5 rounded-xl px-0.5 py-1.5 text-center'
          return (
            <li key={bulan.kunci}>
              {bulan.kontrak.length > 0 ? (
                <Link
                  to={`/kontrak?bulan=${bulan.kunci}`}
                  aria-label={`${formatBulan(bulan.kunci)}: ${bulan.kontrak.length} kontrak berakhir, total ${formatRupiahSingkat(bulan.nilai)}`}
                  title={`${bulan.kontrak.length} kontrak, ${formatRupiahSingkat(bulan.nilai)}`}
                  className={`${kelasKolom} no-underline transition-[background-color] duration-150 hover:bg-latar motion-reduce:transition-none`}
                >
                  {isi}
                </Link>
              ) : (
                <span className={kelasKolom}>
                  <span className="sr-only">{formatBulan(bulan.kunci)}: tidak ada kontrak berakhir.</span>
                  <span aria-hidden="true" className="contents">
                    {isi}
                  </span>
                </span>
              )}
            </li>
          )
        })}
      </ol>
      {statusTampil.size > 0 && (
        <p className="m-0 mt-4 flex flex-wrap gap-x-4 gap-y-1 text-[12px] text-teks-lembut">
          {URUTAN_STATUS.filter((s) => statusTampil.has(s)).map((s) => (
            <span key={s} className="inline-flex items-center gap-1.5">
              <span aria-hidden="true" className={`size-2.5 rounded-[3px] ${TAMPILAN_STATUS[s].kelasBar}`} />
              {TAMPILAN_STATUS[s].label}
            </span>
          ))}
          <span>Klik bulan untuk melihat kontraknya.</span>
        </p>
      )}
    </KartuBagian>
  )
}

export default GarisWaktuBerakhir
