// Halaman Ubah data (/ubah-data dan /ubah-data/:id), untuk admin dan pengguna.
// Kiri: daftar kontrak (bisa dicari). Kanan: form ubah kontrak yang sama dengan /kontrak/:id/ubah
// (validasi per kolom, nomor PKS unik, PDF, konfirmasi sebelum simpan, riwayat tercatat).
// Form diberi key={id} supaya isiannya dibuat ulang saat berpindah kontrak.

import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Ikon from '../components/Ikon'
import KepalaHalaman from '../components/KepalaHalaman'
import KotakKalender from '../components/KotakKalender'
import { useData } from '../lib/data'
import { cocokKataKunci, urutkanPalingCepatHabis } from '../lib/daftarKontrak'
import { formatWaktu } from '../lib/format'
import { hitungStatus, TAMPILAN_STATUS } from '../lib/status'
import { KELAS_KOTAK, KELAS_TOMBOL_KEDUA, KELAS_WADAH } from '../lib/tataLetak'
import FormKontrak from './FormKontrak'

function UbahData() {
  const { id } = useParams()
  const { kontrak, riwayat } = useData()
  const [kataKunci, setKataKunci] = useState('')

  const daftar = urutkanPalingCepatHabis(kontrak.filter((k) => cocokKataKunci(k, kataKunci)))
  const terpilih = id ? kontrak.find((k) => k.id === id) : undefined
  const perubahanTerakhir = terpilih ? riwayat.find((r) => r.kontrakId === terpilih.id) : undefined

  return (
    <>
      <KepalaHalaman
        judul="Ubah data"
        keterangan="Pilih kontrak di kiri, lalu ubah datanya. Bisa dipakai admin dan pengguna. Setiap perubahan tercatat di riwayat."
      />

      <main id="konten" className={`${KELAS_WADAH} grid items-start gap-5 pb-4 lg:grid-cols-[340px_minmax(0,1fr)]`}>
        <nav aria-label="Pilih kontrak" className={`${KELAS_KOTAK} flex flex-col gap-2 p-3 lg:sticky lg:top-32`}>
          <label className="flex h-11 items-center gap-2 rounded-full border border-garis-input bg-white px-4 focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-aksi">
            <Ikon nama="cari" ukuran={18} className="flex-none text-teks-lembut" />
            <span className="sr-only">Cari kontrak</span>
            <input
              type="search"
              value={kataKunci}
              onChange={(e) => setKataKunci(e.target.value)}
              placeholder="Cari kontrak"
              className="min-w-0 flex-1 border-none bg-transparent text-[14px] text-teks outline-none focus-visible:outline-none"
            />
          </label>
          {daftar.length > 0 ? (
            <ul className="m-0 flex max-h-[60vh] list-none flex-col gap-1 overflow-y-auto p-0">
              {daftar.map((k) => {
                const aktif = k.id === id
                return (
                  <li key={k.id}>
                    <Link
                      to={`/ubah-data/${k.id}`}
                      aria-current={aktif ? 'page' : undefined}
                      className={`flex items-center gap-3 rounded-2xl px-2.5 py-2 no-underline transition-[background-color] duration-150 motion-reduce:transition-none ${
                        aktif ? 'bg-lembut text-judul hover:text-judul' : 'text-teks hover:bg-latar hover:text-teks'
                      }`}
                    >
                      <KotakKalender tanggal={k.tanggalBerakhir} kelasPita={TAMPILAN_STATUS[hitungStatus(k)].kelasPita} />
                      <span className="flex min-w-0 flex-col">
                        <span className="text-[14px] font-semibold text-judul">{k.nama}</span>
                        <span className="text-[12px] text-teks-lembut">{k.nomorPks}</span>
                      </span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          ) : (
            <p className="m-0 px-2 py-4 text-[14px] text-teks-lembut">Tidak ada kontrak yang cocok.</p>
          )}
        </nav>

        <section aria-label="Form ubah data" className="min-w-0">
          {terpilih ? (
            <div className="flex flex-col gap-3">
              <div className="flex flex-wrap items-center justify-between gap-3 px-1">
                <div className="min-w-0">
                  <h2 className="m-0 text-[22px] text-judul">{terpilih.nama}</h2>
                  {perubahanTerakhir && (
                    <p className="m-0 mt-0.5 text-[13px] text-teks-lembut">
                      Terakhir diubah {perubahanTerakhir.oleh}, {formatWaktu(perubahanTerakhir.waktu)}
                    </p>
                  )}
                </div>
                <Link to={`/kontrak/${terpilih.id}`} className={KELAS_TOMBOL_KEDUA}>
                  Buka detail
                </Link>
              </div>
              <FormKontrak key={terpilih.id} tertanam />
            </div>
          ) : (
            <div className={`${KELAS_KOTAK} px-6 py-12 text-center`}>
              <Ikon nama="pensil" ukuran={28} className="mx-auto mb-2 block text-aksi" />
              <p className="m-0 text-[16px] font-semibold text-judul">
                {id ? 'Kontrak tidak ditemukan' : 'Pilih kontrak yang ingin diubah'}
              </p>
              <p className="m-0 mt-1 text-teks-lembut">
                {id ? 'Mungkin sudah dihapus. Pilih kontrak lain di daftar.' : 'Daftar kontrak ada di sebelah kiri (di HP, di atas).'}
              </p>
            </div>
          )}
        </section>
      </main>
    </>
  )
}

export default UbahData
