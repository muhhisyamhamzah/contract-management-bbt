// Halaman Kontrak: semua kontrak (termasuk yang selesai) dalam satu tabel.
// Gabungan halaman Kontrak (dikelompokkan per tahap pengingat) dan Rekap, 18 Nov 2026: satu daftar saja,
// supaya pengguna tidak menebak harus membuka yang mana. Klik baris membuka halaman Detail kontrak.
//
// Filter, kata kunci, dan urutan disimpan di alamat, misalnya /kontrak?status=lewat&q=hukum&urut=nilai.
// Jadi pil ringkasan di Beranda bisa langsung membuka rekap terfilter, dan tombol Back
// mengembalikan filter sebelumnya.

import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import BarisKontrak from '../components/BarisKontrak'
import ChipFilter from '../components/ChipFilter'
import KepalaHalaman from '../components/KepalaHalaman'
import Ikon from '../components/Ikon'
import KeadaanKosong from '../components/KeadaanKosong'
import MenuDropdown from '../components/MenuDropdown'
import DialogUnduhExcel from '../components/DialogUnduhExcel'
import { useData } from '../lib/data'
import { useJudulHalaman } from '../lib/judulHalaman'
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
import { KELAS_KOTAK, KELAS_TOMBOL_KEDUA, KELAS_WADAH } from '../lib/tataLetak'

function Kontrak() {
  const [unduhExcel, setUnduhExcel] = useState(false)
  useJudulHalaman('Kontrak')
  const { kontrak } = useData()
  const [parameter, setParameter] = useSearchParams()

  const filter = bacaFilter(parameter.get('status'))
  const kataKunci = parameter.get('q') ?? ''
  const urutan = bacaUrutan(parameter.get('urut'))

  const jumlah = hitungJumlahPerStatus(kontrak)
  const hasil = saringDanUrutkan(kontrak, filter, kataKunci, urutan)

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

  const adaFilter = filter !== 'semua' || kataKunci !== ''

  return (
    <>
      <KepalaHalaman
        judul="Kontrak"
        keterangan="Semua kontrak, dari yang paling cepat habis. Klik kontrak untuk melihat detail, mengubah data, atau mencatat adendum."
        aksi={
          kontrak.length > 0 && (
            <button type="button" onClick={() => setUnduhExcel(true)} className={KELAS_TOMBOL_KEDUA}>
              <Ikon nama="unduh" ukuran={17} /> Unduh Excel
            </button>
          )
        }
      />
      <DialogUnduhExcel terbuka={unduhExcel} onTutup={() => setUnduhExcel(false)} />

      <main id="konten" className={`${KELAS_WADAH} flex flex-col gap-5 pb-4`}>
        {/* Pencarian, filter, dan urutan */}
        <div className="flex flex-col gap-2">
          <label className="flex h-[52px] items-center gap-3 rounded-full border border-garis-input bg-white pr-2 pl-5 shadow-pil focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-aksi">
            <Ikon nama="cari" ukuran={20} className="flex-none text-teks-lembut" />
            <span className="sr-only">Cari kontrak</span>
            <input
              type="search"
              value={kataKunci}
              onChange={(event) => ubahParameter('q', event.target.value, '')}
              placeholder="Cari nama, penyedia, atau nomor PKS"
              // Garis fokus digambar oleh label pembungkus (focus-within), supaya seluruh kotak tersorot.
              className="min-w-0 flex-1 border-none bg-transparent text-[15px] text-teks outline-none focus-visible:outline-none [&::-webkit-search-cancel-button]:hidden"
            />
            {kataKunci && (
              <button
                type="button"
                aria-label="Hapus kata kunci"
                onClick={() => ubahParameter('q', '', '')}
                className="flex size-11 flex-none cursor-pointer items-center justify-center rounded-full border-none bg-transparent text-teks-lembut hover:bg-latar hover:text-judul"
              >
                <Ikon nama="tutup" ukuran={18} />
              </button>
            )}
          </label>

          <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
            <div role="group" aria-label="Filter status" className="flex flex-wrap gap-x-2">
              {URUTAN_FILTER.map((f) => (
                <ChipFilter
                  key={f}
                  label={labelFilter(f)}
                  jumlah={f === 'semua' ? kontrak.length : jumlah[f]}
                  aktif={filter === f}
                  onPilih={() => ubahParameter('status', f, 'semua')}
                />
              ))}
            </div>

            <MenuDropdown
              isiTombol={
                <>
                  <Ikon nama="urutkan" ukuran={15} tebal={2.5} />
                  <span>
                    <span className="text-teks-lembut">Urutkan: </span>
                    {LABEL_URUTAN[urutan]}
                  </span>
                </>
              }
              kelasTombol="flex min-h-11 cursor-pointer items-center gap-2 rounded-full border-none bg-transparent px-3 text-[13px] font-semibold text-judul hover:bg-lembut"
              judul="Urutkan berdasarkan"
              item={(Object.keys(LABEL_URUTAN) as Urutan[]).map((u) => ({
                label: LABEL_URUTAN[u],
                terpilih: urutan === u,
                onPilih: () => ubahParameter('urut', u, 'berakhir'),
              }))}
            />
          </div>
        </div>

        <p aria-live="polite" className="m-0 -mb-2 px-1 text-[13px] text-teks-lembut">
          Menampilkan {hasil.length} dari {kontrak.length} kontrak
          {kataKunci && <> untuk “{kataKunci}”</>}
        </p>

        <div className={`${KELAS_KOTAK} overflow-clip`}>
          {hasil.length > 0 ? (
            <>
              {/* Judul kolom (desktop). Disembunyikan dari pembaca layar karena tiap baris sudah lengkap. */}
              <div
                aria-hidden="true"
                className="hidden min-h-11 items-center gap-x-4 border-b border-garis px-6 text-[12px] font-semibold text-teks-lembut lg:grid lg:grid-cols-[32px_minmax(0,2fr)_140px_180px_100px_200px_56px_24px]"
              >
                <span>No</span>
                <span>Kontrak</span>
                <span>Nomor PKS</span>
                <span>Masa kontrak</span>
                <span className="text-right">Nilai</span>
                <span className="text-right">Status dan adendum</span>
                <span>Dokumen</span>
                <span />
              </div>
              <ul className="m-0 list-none p-0">
                {hasil.map((k, i) => (
                  <BarisKontrak
                    key={k.id}
                    kontrak={k}
                    nomor={i + 1}
                  />
                ))}
              </ul>
            </>
          ) : kontrak.length === 0 ? (
            <KeadaanKosong
              ikon="kontrak"
              judul="Belum ada kontrak"
              pesan="Kontrak yang dicatat akan muncul di sini, lengkap dengan data dan dokumennya."
              aksi={
                <Link to="/tambah" className={KELAS_TOMBOL_KEDUA}>
                  <Ikon nama="tambah" ukuran={16} tebal={2.5} /> Tambah kontrak pertama
                </Link>
              }
            />
          ) : (
            <KeadaanKosong
              ikon="cari"
              judul="Tidak ada kontrak yang cocok"
              pesan="Coba kata kunci lain, misalnya sebagian nama penyedia atau nomor PKS."
              aksi={
                adaFilter && (
                  <button type="button" onClick={() => setParameter({}, { replace: true })} className={KELAS_TOMBOL_KEDUA}>
                    Hapus pencarian dan filter
                  </button>
                )
              }
            />
          )}
        </div>
      </main>
    </>
  )
}

export default Kontrak
