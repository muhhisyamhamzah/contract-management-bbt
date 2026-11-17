// Lonceng notifikasi di navigasi atas. Diklik membuka panel berisi pengingat yang sudah terkirim:
// pengingat 3/2/1 bulan, kontrak yang sudah lewat, dan critical point.

import { Link } from 'react-router-dom'
import { useData } from '../lib/data'
import { formatTanggalSingkat } from '../lib/format'
import { susunNotifikasi } from '../lib/notifikasi'
import { usePopover } from '../lib/popover'
import Ikon from './Ikon'

/** Warna titik tiap jenis notifikasi. */
const WARNA_TITIK = {
  pengingat: 'bg-segera',
  lewat: 'bg-lewat',
  critical: 'bg-aksi',
} as const

function PanelNotifikasi() {
  const { kontrak, notifikasiDibaca, tandaiDibaca } = useData()
  const { terbuka, setTerbuka, wadah, tombol } = usePopover()

  const semua = susunNotifikasi(kontrak)
  const belumDibaca = semua.filter((n) => !notifikasiDibaca.has(n.id))

  return (
    <div ref={wadah} className="relative">
      <button
        ref={tombol}
        type="button"
        aria-label={`Notifikasi, ${belumDibaca.length} belum dibaca`}
        aria-expanded={terbuka}
        aria-controls="panel-notifikasi"
        onClick={() => setTerbuka(!terbuka)}
        className="relative flex size-11 cursor-pointer items-center justify-center rounded-xl border-none bg-transparent text-white transition-[background-color,border-color,color] duration-150 hover:bg-white/10 motion-reduce:transition-none"
      >
        <Ikon nama="pengingat" ukuran={22} />
        {belumDibaca.length > 0 && (
          <span
            aria-hidden="true"
            className="absolute top-1.5 right-1.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full border-2 border-galaxy-900 bg-hapus px-1 text-[10px] font-bold text-white"
          >
            {belumDibaca.length > 9 ? '9+' : belumDibaca.length}
          </span>
        )}
      </button>

      {terbuka && (
        <div
          id="panel-notifikasi"
          role="region"
          aria-label="Notifikasi"
          className="absolute top-[calc(100%+8px)] -right-14 z-30 flex w-[min(380px,calc(100vw-24px))] flex-col overflow-hidden rounded-2xl border border-garis bg-white text-teks shadow-menu-tebal sm:right-0"
        >
          <div className="flex items-center justify-between gap-3 border-b border-garis-lembut px-4 py-2">
            <h2 className="m-0 text-[15px] text-judul">Notifikasi</h2>
            {belumDibaca.length > 0 && (
              <button
                type="button"
                onClick={() => tandaiDibaca(semua.map((n) => n.id))}
                className="min-h-11 cursor-pointer border-none bg-transparent px-1 text-[13px] font-semibold text-aksi"
              >
                Tandai semua dibaca
              </button>
            )}
          </div>

          {semua.length === 0 ? (
            <p className="m-0 px-4 py-8 text-center text-[13px] text-teks-lembut">
              Belum ada notifikasi. Pengingat muncul di sini 3, 2, dan 1 bulan sebelum kontrak habis.
            </p>
          ) : (
            <ul className="m-0 max-h-[420px] list-none overflow-y-auto p-1.5">
              {semua.map((n) => {
                const baru = !notifikasiDibaca.has(n.id)
                return (
                  <li key={n.id}>
                    <Link
                      to={`/kontrak/${n.kontrakId}`}
                      onClick={() => {
                        tandaiDibaca([n.id])
                        setTerbuka(false)
                      }}
                      className={`flex gap-3 rounded-xl px-3 py-3 text-teks no-underline hover:bg-latar hover:text-teks ${
                        baru ? 'bg-lembut/60' : ''
                      }`}
                    >
                      <span aria-hidden="true" className={`mt-1.5 size-2 flex-none rounded-full ${WARNA_TITIK[n.jenis]}`} />
                      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                        <span className="flex items-baseline justify-between gap-2">
                          <span className={`text-[13px] text-judul ${baru ? 'font-bold' : 'font-semibold'}`}>
                            {n.judul}
                            {baru && <span className="sr-only"> (belum dibaca)</span>}
                          </span>
                          <span className="flex-none text-[12px] text-teks-lembut">{formatTanggalSingkat(n.tanggal)}</span>
                        </span>
                        <span className="text-[13px] leading-snug text-teks-lembut">{n.isi}</span>
                      </span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}

export default PanelNotifikasi
