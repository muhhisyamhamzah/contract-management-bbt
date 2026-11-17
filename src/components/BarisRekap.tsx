// Satu baris di halaman Rekap: ringkasan kontrak dalam satu baris (No, kontrak, nomor PKS, masa kontrak,
// nilai, status, jumlah PDF). Diklik untuk membuka rincian lengkap dan daftar PDF yang bisa diunduh,
// tanpa pindah halaman. Tombol pembuka memakai <button aria-expanded> supaya bisa dipakai lewat keyboard.

import { Link } from 'react-router-dom'
import {
  formatPeriode,
  formatRupiah,
  formatRupiahSingkat,
  formatTanggal,
  formatTanggalSingkat,
  formatUkuranFile,
} from '../lib/format'
import { hitungStatus, teksSisaHari } from '../lib/status'
import { useToast } from '../lib/toast'
import type { Kontrak } from '../types/kontrak'
import BadgeStatus from './BadgeStatus'
import Ikon from './Ikon'

type Props = {
  kontrak: Kontrak
  nomor: number
  terbuka: boolean
  onBukaTutup: () => void
}

/** Kolom desktop: No | Kontrak | Nomor PKS | Masa kontrak | Nilai | Status | Dokumen | panah. */
const KOLOM = 'md:grid-cols-[32px_minmax(0,2.2fr)_150px_200px_110px_130px_70px_24px]'

function BarisRekap({ kontrak, nomor, terbuka, onBukaTutup }: Props) {
  const tampilkanToast = useToast()
  const status = hitungStatus(kontrak)
  const idRinci = `rinci-${kontrak.id}`
  const criticalAktif = kontrak.criticalPoint.filter((b) => b.status === 'aktif').length

  const data: [string, string][] = [
    ['Nomor PKS', kontrak.nomorPks],
    ['Tanggal PKS', formatTanggal(kontrak.tanggalPks)],
    ['Nilai kontrak', formatRupiah(kontrak.nilai)],
    ['Awal kontrak', formatTanggal(kontrak.tanggalMulai)],
    ['Akhir kontrak', formatTanggal(kontrak.tanggalBerakhir)],
    ['Periode', formatPeriode(kontrak.tanggalMulai, kontrak.tanggalBerakhir)],
    ['Monitoring', kontrak.monitoring || 'Belum diisi'],
    ['Catatan', kontrak.catatan || 'Belum diisi'],
    ['Critical point', kontrak.criticalPoint.length > 0 ? `${criticalAktif} aktif dari ${kontrak.criticalPoint.length}` : 'Tidak ada'],
  ]

  return (
    <li className="border-t border-garis-lembut first:border-t-0">
      <button
        type="button"
        aria-expanded={terbuka}
        aria-controls={idRinci}
        onClick={onBukaTutup}
        className={`grid w-full cursor-pointer grid-cols-[minmax(0,1fr)_auto_20px] items-center gap-x-3 gap-y-1 border-none px-4 py-3 text-left text-[14px] text-teks transition-[background-color] duration-150 hover:bg-latar motion-reduce:transition-none md:min-h-[58px] md:gap-x-4 md:px-6 md:py-2 ${KOLOM} ${
          terbuka ? 'bg-lembut hover:bg-lembut' : 'bg-transparent'
        }`}
      >
        <span className="hidden text-teks-lembut md:block">{nomor}</span>
        <span className="flex min-w-0 flex-col">
          <span className="text-[15px] font-semibold text-judul">{kontrak.nama}</span>
          <span className="text-[13px] text-teks-lembut">{kontrak.penyedia}</span>
        </span>
        <span className="hidden text-[13px] text-teks-lembut md:block">{kontrak.nomorPks}</span>
        <span className="hidden text-[13px] text-teks-lembut md:block">
          {formatTanggalSingkat(kontrak.tanggalMulai)} sampai {formatTanggalSingkat(kontrak.tanggalBerakhir)}
        </span>
        <span className="col-start-1 row-start-2 text-[14px] font-bold text-judul md:col-auto md:row-auto md:text-right">
          {formatRupiahSingkat(kontrak.nilai)}
        </span>
        <span className="col-start-2 row-span-2 row-start-1 md:col-auto md:row-auto md:flex md:justify-end">
          <BadgeStatus status={status}>{teksSisaHari(kontrak)}</BadgeStatus>
        </span>
        <span className="hidden text-[13px] text-teks-lembut md:block">{kontrak.dokumen.length} PDF</span>
        <Ikon
          nama="bawah"
          ukuran={18}
          className={`col-start-3 row-span-2 row-start-1 text-teks-lembut transition-transform duration-150 motion-reduce:transition-none md:col-auto md:row-auto ${
            terbuka ? 'rotate-180' : ''
          }`}
        />
      </button>

      {terbuka && (
        <div
          id={idRinci}
          className="grid gap-6 border-t border-garis bg-lembut px-4 pt-4 pb-5 md:grid-cols-[minmax(0,1fr)_340px] md:px-6 md:pl-[72px]"
        >
          <div>
            <dl className="m-0 grid grid-cols-2 gap-x-6 gap-y-3.5 md:grid-cols-3">
              {data.map(([label, nilai]) => (
                <div key={label} className="flex min-w-0 flex-col gap-0.5">
                  <dt className="text-[12px] text-teks-lembut">{label}</dt>
                  <dd className="m-0 text-[14px] font-semibold break-words text-judul">{nilai}</dd>
                </div>
              ))}
            </dl>
            <Link
              to={`/kontrak/${kontrak.id}`}
              className="mt-4 inline-flex min-h-11 items-center gap-1 text-[14px] font-semibold text-aksi no-underline hover:text-aksi-tua"
            >
              Buka halaman detail kontrak
              <Ikon nama="kanan" ukuran={14} tebal={2.5} />
            </Link>
          </div>

          <div>
            <h3 className="m-0 mb-2.5 text-[14px] text-judul">Dokumen PDF</h3>
            {kontrak.dokumen.length > 0 ? (
              <ul className="m-0 flex list-none flex-col gap-2 p-0">
                {kontrak.dokumen.map((dokumen) => (
                  <li key={dokumen.id} className="flex items-center gap-3 rounded-2xl border border-garis bg-white py-2 pr-2 pl-3.5">
                    <Ikon nama="dokumen" ukuran={20} className="flex-none text-aksi" />
                    <span className="flex min-w-0 flex-1 flex-col">
                      <span className="truncate text-[14px] font-semibold text-judul">{dokumen.nama}</span>
                      <span className="text-[12px] text-teks-lembut">
                        {dokumen.jenis}, {formatUkuranFile(dokumen.ukuran)}
                      </span>
                    </span>
                    <button
                      type="button"
                      onClick={() => tampilkanToast(`Mengunduh ${dokumen.nama} (contoh)`)}
                      className="min-h-11 flex-none cursor-pointer rounded-full border-none bg-transparent px-3 text-[13px] font-semibold text-aksi hover:bg-lembut"
                    >
                      Unduh<span className="sr-only"> {dokumen.nama}</span>
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="m-0 text-[14px] text-teks-lembut">Belum ada dokumen.</p>
            )}
          </div>
        </div>
      )}
    </li>
  )
}

export default BarisRekap
