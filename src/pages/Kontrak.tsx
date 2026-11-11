// Halaman daftar Kontrak: pencarian, chip filter status, dropdown urutan, dan daftar kartu.
//
// Filter, kata kunci, dan urutan disimpan di alamat, misalnya /kontrak?status=lewat&q=hukum&urut=nilai.
// Jadi kotak status di Beranda bisa langsung membuka daftar terfilter, dan tombol Back
// mengembalikan filter sebelumnya.

import { useLocation, useSearchParams } from 'react-router-dom'
import ChipFilter from '../components/ChipFilter'
import HeaderGelombang from '../components/HeaderGelombang'
import Ikon from '../components/Ikon'
import KartuKontrak from '../components/KartuKontrak'
import MenuDropdown from '../components/MenuDropdown'
import { kontrakContoh } from '../data/kontrakContoh'
import {
  bacaFilter,
  bacaUrutan,
  LABEL_URUTAN,
  saringDanUrutkan,
  URUTAN_FILTER,
  type FilterStatus,
  type Urutan,
} from '../lib/daftarKontrak'
import { hitungJumlahPerStatus, TAMPILAN_STATUS } from '../lib/status'

function Kontrak() {
  const [parameter, setParameter] = useSearchParams()
  const location = useLocation()

  const filter = bacaFilter(parameter.get('status'))
  const kataKunci = parameter.get('q') ?? ''
  const urutan = bacaUrutan(parameter.get('urut'))

  // Kalau dibuka dari kotak pencarian di Beranda, kursor langsung di kotak pencarian.
  const fokusCari = Boolean((location.state as { fokusCari?: boolean } | null)?.fokusCari)

  const daftar = kontrakContoh
  const jumlah = hitungJumlahPerStatus(daftar)
  const hasil = saringDanUrutkan(daftar, filter, kataKunci, urutan)

  /** Mengubah satu parameter di alamat. Nilai kosong atau bawaan dihapus supaya alamat tetap rapi. */
  function ubahParameter(nama: string, nilai: string, bawaan: string) {
    setParameter(
      (lama) => {
        const baru = new URLSearchParams(lama)
        if (!nilai || nilai === bawaan) baru.delete(nama)
        else baru.set(nama, nilai)
        return baru
      },
      // Mengetik di pencarian tidak menambah riwayat Back untuk setiap huruf.
      { replace: nama === 'q' },
    )
  }

  function labelFilter(f: FilterStatus) {
    return f === 'semua' ? 'Semua' : TAMPILAN_STATUS[f].label
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
      <HeaderGelombang>
        <h1 className="m-0 text-[22px] font-bold">Kontrak</h1>
        <span className="text-[13px] text-white/80">{daftar.length} kontrak tercatat</span>
      </HeaderGelombang>

      {/* Kotak pencarian, menumpuk di gelombang header */}
      <label className="relative z-20 mx-5 -mt-9 flex h-[52px] flex-none items-center gap-3 rounded-[14px] bg-white px-4 shadow-kotak">
        <Ikon nama="cari" ukuran={20} className="flex-none text-aksi" />
        <input
          type="search"
          value={kataKunci}
          onChange={(event) => ubahParameter('q', event.target.value, '')}
          placeholder="Cari judul, nomor, atau mitra"
          aria-label="Cari kontrak"
          autoFocus={fokusCari}
          className="min-w-0 flex-1 border-none bg-transparent text-[14px] text-teks outline-none placeholder:text-teks-lembut [&::-webkit-search-cancel-button]:hidden"
        />
        {kataKunci && (
          <button
            type="button"
            aria-label="Hapus kata kunci"
            onClick={() => ubahParameter('q', '', '')}
            className="-mr-2 flex size-11 flex-none cursor-pointer items-center justify-center rounded-xl border-none bg-transparent text-teks-lembut"
          >
            <Ikon nama="tutup" ukuran={18} />
          </button>
        )}
      </label>

      {/* Chip filter dan urutan: menempel di atas saat daftar di-scroll */}
      <div className="sticky top-0 z-10 flex flex-none flex-col gap-3 bg-latar pt-4 pb-3">
        <div className="flex gap-2 overflow-x-auto px-5 pb-0.5">
          {URUTAN_FILTER.map((f) => (
            <ChipFilter
              key={f}
              label={labelFilter(f)}
              jumlah={f === 'semua' ? daftar.length : jumlah[f]}
              aktif={filter === f}
              kelasTeks={f === 'semua' ? 'text-judul' : TAMPILAN_STATUS[f].kelasTeks}
              onPilih={() => ubahParameter('status', f, 'semua')}
            />
          ))}
        </div>

        <div className="flex items-center justify-between px-5">
          <span aria-live="polite" className="text-[13px] text-teks-lembut">
            {hasil.length} kontrak
          </span>
          <MenuDropdown
            isiTombol={
              <>
                <Ikon nama="urutkan" ukuran={14} tebal={2.5} />
                {LABEL_URUTAN[urutan]}
              </>
            }
            kelasTombol="flex h-9 cursor-pointer items-center gap-1.5 rounded-xl border border-garis bg-white px-3 text-[13px] font-semibold text-judul"
            judul="Urutkan berdasarkan"
            item={(Object.keys(LABEL_URUTAN) as Urutan[]).map((u) => ({
              label: LABEL_URUTAN[u],
              terpilih: urutan === u,
              onPilih: () => ubahParameter('urut', u, 'berakhir'),
            }))}
          />
        </div>
      </div>

      {/* Daftar kartu */}
      <div className="flex flex-col gap-3 px-5 pb-6">
        {hasil.map((kontrak) => (
          <KartuKontrak key={kontrak.id} kontrak={kontrak} />
        ))}

        {hasil.length === 0 && (
          <div className="flex flex-col items-center gap-2 px-4 py-12 text-center text-teks-lembut">
            <span className="mb-1 flex size-14 items-center justify-center rounded-full bg-white text-aksi shadow-kotak">
              <Ikon nama="cari" ukuran={24} />
            </span>
            <span className="font-semibold text-judul">Tidak ada kontrak yang cocok</span>
            <span>Coba kata kunci atau filter lain.</span>
            {(filter !== 'semua' || kataKunci) && (
              <button
                type="button"
                onClick={() => setParameter({}, { replace: true })}
                className="mt-2 h-11 cursor-pointer rounded-xl border border-garis bg-white px-4 font-semibold text-aksi"
              >
                Hapus filter
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default Kontrak
