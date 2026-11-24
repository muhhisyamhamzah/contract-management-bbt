// Halaman Kontrak: semua kontrak (termasuk yang selesai) dalam satu tabel.
// Gabungan halaman Kontrak (dikelompokkan per tahap pengingat) dan Rekap, 18 Nov 2026: satu daftar saja,
// supaya pengguna tidak menebak harus membuka yang mana. Klik baris membuka halaman Detail kontrak.
//
// Susunan mengikuti halaman daftar kontrak acuan (repo contract-management, 24 Nov 2026), karena tabel dan
// penempatannya lebih mudah dipahami:
//   1. Toolbar satu baris: kotak cari, Urutkan, Unduh Excel.
//   2. Chip status dengan ikon dan jumlah.
//   3. Panel tabel: kepala "N kontrak · total nilai", tabel (mulai 1280px) atau daftar bertumpuk (di bawahnya),
//      lalu pembagian halaman.
// Tombol "Tambah kontrak" tetap di navigasi atas (satu tombol utama per layar), tidak diulang di toolbar.
//
// Filter, kata kunci, urutan, dan halaman disimpan di alamat, misalnya /kontrak?status=lewat&q=hukum&urut=nilai&hal=2.
// Jadi pil ringkasan di Beranda bisa langsung membuka daftar terfilter, dan tombol Back mengembalikan filter sebelumnya.

import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import BarisKontrak from '../components/BarisKontrak'
import ChipFilter from '../components/ChipFilter'
import DialogKonfirmasi from '../components/DialogKonfirmasi'
import DialogUnduhExcel from '../components/DialogUnduhExcel'
import Ikon from '../components/Ikon'
import ItemDaftarKontrak from '../components/ItemDaftarKontrak'
import KeadaanKosong from '../components/KeadaanKosong'
import KepalaHalaman from '../components/KepalaHalaman'
import MenuDropdown from '../components/MenuDropdown'
import PenomoranHalaman from '../components/PenomoranHalaman'
import { bacaBulan, formatBulan } from '../lib/beranda'
import { useData } from '../lib/data'
import {
  bacaFilter,
  bacaHalaman,
  bacaPerHalaman,
  bacaUrutan,
  LABEL_URUTAN,
  PILIHAN_PER_HALAMAN,
  saringDanUrutkan,
  URUTAN_FILTER,
  type FilterStatus,
  type Urutan,
} from '../lib/daftarKontrak'
import { formatRupiahSingkat } from '../lib/format'
import { useJudulHalaman } from '../lib/judulHalaman'
import { hitungJumlahPerStatus, TAMPILAN_STATUS } from '../lib/status'
import { KELAS_KOTAK, KELAS_TOMBOL_KEDUA, KELAS_WADAH } from '../lib/tataLetak'
import { useToast } from '../lib/toast'
import type { Kontrak as DataKontrak } from '../types/kontrak'

/** Judul kolom tabel (layar lebar). Urutannya sama dengan sel di BarisKontrak. */
const JUDUL_KOLOM: { label: string; kelas?: string }[] = [
  { label: 'Kontrak', kelas: 'pl-6 pr-4' },
  { label: 'Penyedia' },
  { label: 'Berakhir' },
  { label: 'Nilai', kelas: 'px-4 text-center' },
  { label: 'Sisa kontrak' },
  { label: 'Status' },
  { label: 'Adendum' },
]

function Kontrak() {
  const [unduhExcel, setUnduhExcel] = useState(false)
  const [akanDihapus, setAkanDihapus] = useState<DataKontrak | null>(null)
  useJudulHalaman('Kontrak')
  const { kontrak, hapusKontrak } = useData()
  const tampilkanToast = useToast()
  const [parameter, setParameter] = useSearchParams()

  const filter = bacaFilter(parameter.get('status'))
  const kataKunci = parameter.get('q') ?? ''
  const urutan = bacaUrutan(parameter.get('urut'))
  const perHalaman = bacaPerHalaman(parameter.get('per'))
  // ?bulan=YYYY-MM: kontrak yang berakhir di bulan itu (dibuka dari garis waktu Beranda, 24 Nov 2026).
  const bulan = bacaBulan(parameter.get('bulan'))

  const jumlah = hitungJumlahPerStatus(kontrak)
  const hasil = saringDanUrutkan(kontrak, filter, kataKunci, urutan).filter(
    (k) => !bulan || k.tanggalBerakhir.startsWith(bulan),
  )
  const totalNilai = hasil.reduce((total, k) => total + k.nilai, 0)
  const jumlahHalaman = Math.max(1, Math.ceil(hasil.length / perHalaman))
  const halaman = bacaHalaman(parameter.get('hal'), jumlahHalaman)
  const tampil = hasil.slice((halaman - 1) * perHalaman, halaman * perHalaman)

  /**
   * Mengubah satu parameter di alamat. Nilai kosong atau bawaan dihapus supaya alamat tetap rapi.
   * Mengubah cari, filter, urutan, atau jumlah per halaman selalu kembali ke halaman 1.
   */
  function ubahParameter(nama: string, nilai: string, bawaan: string) {
    setParameter(
      (lama) => {
        const baru = new URLSearchParams(lama)
        if (!nilai || nilai === bawaan) baru.delete(nama)
        else baru.set(nama, nilai)
        if (nama !== 'hal') baru.delete('hal')
        return baru
      },
      // Mengetik di pencarian tidak menambah riwayat Back untuk setiap huruf.
      { replace: nama === 'q' },
    )
  }

  function labelFilter(f: FilterStatus) {
    return f === 'semua' ? 'Semua' : TAMPILAN_STATUS[f].label
  }

  function hapus() {
    if (!akanDihapus) return
    hapusKontrak(akanDihapus.id)
    setAkanDihapus(null)
    tampilkanToast('Kontrak dihapus.')
  }

  const adaFilter = filter !== 'semua' || kataKunci !== '' || bulan !== null

  return (
    <>
      <KepalaHalaman
        judul="Kontrak"
        keterangan="Semua kontrak, dari yang paling cepat habis. Klik kontrak untuk melihat detail, mengubah data, atau mencatat adendum."
      />
      <DialogUnduhExcel terbuka={unduhExcel} onTutup={() => setUnduhExcel(false)} />

      <main id="konten" className={`${KELAS_WADAH} flex flex-col gap-4 pb-4`}>
        {/* 1. Toolbar: cari, urutkan, unduh Excel dalam satu baris (di HP turun bertumpuk). */}
        <div className="flex flex-wrap items-center gap-2.5">
          <label className="flex h-12 min-w-[260px] flex-1 items-center gap-3 rounded-full border border-garis-input bg-white pr-1.5 pl-5 shadow-pil focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-aksi">
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
                className="flex size-10 flex-none cursor-pointer items-center justify-center rounded-full border-none bg-transparent text-teks-lembut hover:bg-latar hover:text-judul"
              >
                <Ikon nama="tutup" ukuran={18} />
              </button>
            )}
          </label>

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
            kelasTombol={`${KELAS_TOMBOL_KEDUA} h-12 text-[13px]`}
            judul="Urutkan berdasarkan"
            item={(Object.keys(LABEL_URUTAN) as Urutan[]).map((u) => ({
              label: LABEL_URUTAN[u],
              terpilih: urutan === u,
              onPilih: () => ubahParameter('urut', u, 'berakhir'),
            }))}
          />

          {kontrak.length > 0 && (
            <button type="button" onClick={() => setUnduhExcel(true)} className={`${KELAS_TOMBOL_KEDUA} h-12`}>
              <Ikon nama="unduh" ukuran={17} /> Unduh Excel
            </button>
          )}
        </div>

        {/* 2. Chip status, dengan ikon yang sama dengan badge di tabel. */}
        <div role="group" aria-label="Filter status" className="flex flex-wrap gap-x-2">
          {URUTAN_FILTER.map((f) => (
            <ChipFilter
              key={f}
              label={labelFilter(f)}
              jumlah={f === 'semua' ? kontrak.length : jumlah[f]}
              aktif={filter === f}
              onPilih={() => ubahParameter('status', f, 'semua')}
              ikon={f === 'semua' ? undefined : TAMPILAN_STATUS[f].ikon}
              kelasIkon={f === 'semua' ? undefined : TAMPILAN_STATUS[f].kelasTeks}
            />
          ))}
          {/* Filter bulan dari garis waktu Beranda: tampil sebagai chip aktif yang bisa dihapus. */}
          {bulan && (
            <button
              type="button"
              onClick={() => ubahParameter('bulan', '', '')}
              aria-label={`Hapus filter berakhir ${formatBulan(bulan)}`}
              className="group flex min-h-11 flex-none cursor-pointer items-center border-none bg-transparent p-0"
            >
              <span className="flex h-[38px] items-center gap-2 rounded-full border border-galaxy-900 bg-lembut px-3.5 text-[13px] font-semibold text-galaxy-900">
                <Ikon nama="kalender" ukuran={14} tebal={2.5} className="flex-none" />
                Berakhir {formatBulan(bulan)}
                <Ikon nama="tutup" ukuran={14} tebal={2.5} className="flex-none" />
              </span>
            </button>
          )}
        </div>

        {/* 3. Panel tabel */}
        <div className={`${KELAS_KOTAK} overflow-clip`}>
          <p aria-live="polite" className="m-0 border-b border-garis px-5 py-3.5 text-[13px] text-teks-lembut md:px-6">
            <span className="font-semibold text-judul">{hasil.length}</span> kontrak
            {kataKunci && <> untuk “{kataKunci}”</>}
            {bulan && <> berakhir {formatBulan(bulan)}</>}
            {hasil.length > 0 && (
              <>
                {' '}
                · total nilai <span className="font-semibold text-judul">{formatRupiahSingkat(totalNilai)}</span>
              </>
            )}
          </p>

          {hasil.length > 0 ? (
            <>
              {/* Layar lebar: tabel asli */}
              <table className="hidden w-full border-collapse text-left xl:table">
                <thead>
                  <tr className="text-[12px] font-semibold text-teks-lembut">
                    {JUDUL_KOLOM.map((k) => (
                      <th key={k.label} scope="col" className={`py-3 font-semibold ${k.kelas ?? 'px-4'}`}>
                        {k.label}
                      </th>
                    ))}
                    <th scope="col" className="py-3 pr-4 pl-2">
                      <span className="sr-only">Aksi</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {tampil.map((k) => (
                    <BarisKontrak key={k.id} kontrak={k} onHapus={setAkanDihapus} />
                  ))}
                </tbody>
              </table>

              {/* Di bawah 1280px: daftar bertumpuk */}
              <ul className="m-0 list-none p-0 xl:hidden">
                {tampil.map((k) => (
                  <ItemDaftarKontrak key={k.id} kontrak={k} />
                ))}
              </ul>

              {hasil.length > PILIHAN_PER_HALAMAN[0] && (
                <PenomoranHalaman
                  halaman={halaman}
                  jumlahHalaman={jumlahHalaman}
                  perHalaman={perHalaman}
                  onUbahHalaman={(h) => ubahParameter('hal', String(h), '1')}
                  onUbahPerHalaman={(n) => ubahParameter('per', String(n), String(PILIHAN_PER_HALAMAN[0]))}
                />
              )}
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

      <DialogKonfirmasi
        terbuka={akanDihapus !== null}
        judul="Hapus kontrak ini?"
        pesan={
          akanDihapus &&
          `"${akanDihapus.nama}" (${akanDihapus.nomorPks}) beserta semua dokumennya akan dihapus permanen. Tindakan ini tidak bisa dibatalkan, tapi tetap tercatat di riwayat perubahan.`
        }
        labelKonfirmasi="Hapus permanen"
        bahaya
        onKonfirmasi={hapus}
        onBatal={() => setAkanDihapus(null)}
      />
    </>
  )
}

export default Kontrak
