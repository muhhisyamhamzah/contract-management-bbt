// Tombol "Filter" + panelnya di halaman Kontrak (24 Nov 2026). Berisi filter tambahan di luar chip status:
// status adendum, tanggal berakhir, nilai, riwayat adendum, dan BAST. Setiap pilihan langsung berlaku (alamat ikut
// berubah), jadi tidak ada tombol "Terapkan". Angka di tombol = jumlah filter tambahan yang aktif.
// Desktop: panel di bawah tombol, rata kanan. HP: panel menempel di bawah layar supaya tidak terpotong.
// Tinggi panel dibatasi (paling tinggi 440px atau 70% layar); isinya di-scroll di dalam panel.
// Pilihan berupa radio asli (dibungkus pil), jadi tombol panah dan pembaca layar bekerja seperti biasa.

import { useId, type ReactNode } from 'react'
import {
  LABEL_BAST,
  LABEL_BERAKHIR,
  LABEL_NILAI,
  LABEL_RIWAYAT,
  type FilterKontrak,
} from '../lib/filterKontrak'
import { usePopover } from '../lib/popover'
import { STATUS_PERPANJANGAN } from '../lib/status'
import { KELAS_ISIAN, KELAS_TOMBOL_KEDUA } from '../lib/tataLetak'
import Ikon from './Ikon'

type Props = {
  filter: FilterKontrak
  jumlahAktif: number
  /** Mengubah beberapa parameter alamat sekaligus. null = parameter dihapus. */
  onUbah: (perubahan: Record<string, string | null>) => void
  onHapusSemua: () => void
}

type PropsGrup = {
  judul: string
  nama: string
  nilai: string | null
  pilihan: Record<string, string>
  onPilih: (nilai: string | null) => void
  children?: ReactNode
}

/** Satu kelompok pilihan: "Semua" + pilihan lainnya, berupa pil radio. */
function GrupPilihan({ judul, nama, nilai, pilihan, onPilih, children }: PropsGrup) {
  const semua: [string | null, string][] = [[null, 'Semua'], ...Object.entries(pilihan)]
  return (
    <fieldset className="m-0 min-w-0 border-0 border-t border-garis-lembut p-0 pt-2.5 first:border-t-0 first:pt-0">
      <legend className="float-left mb-0.5 w-full p-0 text-[13px] font-semibold text-judul">{judul}</legend>
      <div className="clear-both flex flex-wrap gap-x-1.5">
        {semua.map(([kunci, label]) => {
          const dipilih = nilai === kunci
          return (
            // Area sentuh tetap 44px (label), pil yang terlihat 32px supaya panel ringkas.
            <label key={kunci ?? 'semua'} className="group flex min-h-11 cursor-pointer items-center">
              <input
                type="radio"
                name={nama}
                checked={dipilih}
                onChange={() => onPilih(kunci)}
                className="peer sr-only"
              />
              <span
                className={`flex h-8 items-center rounded-full border px-3 text-[13px] transition-[background-color,border-color] duration-150 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-aksi motion-reduce:transition-none ${
                  dipilih ? 'border-galaxy-900 bg-lembut font-semibold text-judul' : 'border-garis bg-white text-teks group-hover:border-garis-input'
                }`}
              >
                {label}
              </span>
            </label>
          )
        })}
      </div>
      {children}
    </fieldset>
  )
}

function PanelFilterKontrak({ filter, jumlahAktif, onUbah, onHapusSemua }: Props) {
  const { terbuka, setTerbuka, wadah, tombol } = usePopover()
  const id = useId()

  function tutup() {
    setTerbuka(false)
    tombol.current?.focus()
  }

  const labelAdendum = Object.fromEntries(
    Object.entries(STATUS_PERPANJANGAN).map(([kunci, { label }]) => [kunci, label]),
  )

  return (
    <div ref={wadah} className="relative">
      <button
        ref={tombol}
        type="button"
        aria-expanded={terbuka}
        aria-controls={id}
        onClick={() => setTerbuka(!terbuka)}
        className={`${KELAS_TOMBOL_KEDUA} h-12 text-[13px] ${jumlahAktif > 0 ? 'border-galaxy-900 bg-lembut hover:bg-lembut' : ''}`}
      >
        <Ikon nama="filter" ukuran={15} tebal={2.5} />
        Filter
        {jumlahAktif > 0 && (
          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-galaxy-900 px-1.5 text-[11px] font-bold text-white">
            <span className="sr-only">, </span>
            {jumlahAktif}
            <span className="sr-only"> aktif</span>
          </span>
        )}
      </button>

      {terbuka && (
        <div
          id={id}
          role="group"
          aria-label="Filter kontrak"
          className="fixed inset-x-3 bottom-3 z-30 flex max-h-[min(70vh,440px)] flex-col rounded-[20px] border border-garis bg-white text-teks shadow-menu-tebal md:absolute md:inset-x-auto md:top-[calc(100%+6px)] md:right-0 md:bottom-auto md:w-[380px]"
        >
          <div className="flex items-center justify-between border-b border-garis px-5 py-2">
            <span className="text-[15px] font-bold text-judul">Filter kontrak</span>
            <button
              type="button"
              aria-label="Tutup filter"
              onClick={tutup}
              className="flex size-11 cursor-pointer items-center justify-center rounded-full border-none bg-transparent text-teks-lembut hover:bg-latar hover:text-judul"
            >
              <Ikon nama="tutup" ukuran={18} />
            </button>
          </div>

          {/* Isi di-scroll di dalam panel; kepala dan tombol bawah tetap terlihat. */}
          <div className="flex min-h-0 flex-col gap-2.5 overflow-y-auto overscroll-y-contain px-5 py-3">
            <GrupPilihan
              judul="Status adendum"
              nama="filter-adendum"
              nilai={filter.adendum}
              pilihan={labelAdendum}
              onPilih={(n) => onUbah({ adendum: n })}
            />

            <GrupPilihan
              judul="Tanggal berakhir"
              nama="filter-berakhir"
              nilai={filter.berakhir}
              pilihan={LABEL_BERAKHIR}
              // Pilihan tanggal menggantikan filter bulan dari Beranda, supaya tidak bertumpuk.
              onPilih={(n) => onUbah({ berakhir: n, bulan: null, ...(n === 'rentang' ? {} : { dari: null, sampai: null }) })}
            >
              {filter.berakhir === 'rentang' && (
                <div className="mt-2.5 grid grid-cols-2 gap-2.5">
                  <label className="flex flex-col gap-1 text-[12px] font-semibold text-teks-lembut">
                    Dari
                    <input
                      type="date"
                      value={filter.dari ?? ''}
                      max={filter.sampai ?? undefined}
                      onChange={(e) => onUbah({ dari: e.target.value || null })}
                      className={`${KELAS_ISIAN} h-11`}
                    />
                  </label>
                  <label className="flex flex-col gap-1 text-[12px] font-semibold text-teks-lembut">
                    Sampai
                    <input
                      type="date"
                      value={filter.sampai ?? ''}
                      min={filter.dari ?? undefined}
                      onChange={(e) => onUbah({ sampai: e.target.value || null })}
                      className={`${KELAS_ISIAN} h-11`}
                    />
                  </label>
                </div>
              )}
            </GrupPilihan>

            <GrupPilihan
              judul="Nilai kontrak"
              nama="filter-nilai"
              nilai={filter.nilai}
              pilihan={LABEL_NILAI}
              onPilih={(n) => onUbah({ nilai: n })}
            />

            <GrupPilihan
              judul="Riwayat adendum"
              nama="filter-riwayat"
              nilai={filter.riwayat}
              pilihan={LABEL_RIWAYAT}
              onPilih={(n) => onUbah({ riwayat: n })}
            />

            <GrupPilihan
              judul="Dokumen BAST"
              nama="filter-bast"
              nilai={filter.bast}
              pilihan={LABEL_BAST}
              onPilih={(n) => onUbah({ bast: n })}
            />
          </div>

          <div className="flex items-center justify-between gap-2 border-t border-garis px-5 py-3">
            <button
              type="button"
              onClick={onHapusSemua}
              disabled={jumlahAktif === 0}
              className="min-h-11 cursor-pointer border-none bg-transparent px-1 text-[13px] font-semibold text-aksi hover:text-aksi-tua disabled:cursor-not-allowed disabled:text-teks-lembut"
            >
              Hapus semua filter
            </button>
            <button type="button" onClick={tutup} className={KELAS_TOMBOL_KEDUA}>
              Selesai
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default PanelFilterKontrak
