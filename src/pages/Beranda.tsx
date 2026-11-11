// Halaman Beranda: ringkasan kondisi semua kontrak.
// Isi dari atas ke bawah: header navy bergelombang (judul aplikasi, sapaan, tanggal, lonceng,
// profil), kotak pencarian, 6 kotak "Ringkasan kontrak", daftar "Segera habis", dan total nilai.

import { Link } from 'react-router-dom'
import BarisSegeraHabis from '../components/BarisSegeraHabis'
import Ikon from '../components/Ikon'
import KotakRingkasan from '../components/KotakRingkasan'
import { kontrakContoh } from '../data/kontrakContoh'
import { formatRupiahSingkat, formatTanggalHariIni } from '../lib/format'
import {
  BATAS_HARI_SEGERA,
  hitungJumlahPerStatus,
  hitungSisaHari,
  hitungStatus,
  TAMPILAN_STATUS,
} from '../lib/status'
import { useToast } from '../lib/toast'
import type { StatusKontrak } from '../types/kontrak'

/** Urutan 4 kotak status di Ringkasan kontrak. */
const URUTAN_KOTAK_STATUS: StatusKontrak[] = ['segera', 'lewat', 'berjalan', 'selesai']

/** Gaya kotak ikon navy untuk kotak Tambah dan Pengingat. */
const GRADASI_NAVY = 'from-galaxy-700 to-galaxy-900 shadow-galaxy-700/40'

function Beranda() {
  const tampilkanToast = useToast()

  const daftar = kontrakContoh
  const jumlah = hitungJumlahPerStatus(daftar)
  const butuhTindakan = jumlah.segera + jumlah.lewat

  // Daftar "Segera habis": yang paling cepat habis di atas.
  const segeraHabis = daftar
    .filter((kontrak) => hitungStatus(kontrak) === 'segera')
    .sort((a, b) => hitungSisaHari(a.tanggalBerakhir) - hitungSisaHari(b.tanggalBerakhir))

  // "Kontrak berjalan" di sini = semua kontrak yang belum ditandai selesai
  // (termasuk yang segera habis dan sudah lewat), sama dengan perhitungan referensi.
  const belumSelesai = daftar.filter((kontrak) => !kontrak.ditandaiSelesai)
  const totalNilai = belumSelesai.reduce((total, kontrak) => total + kontrak.nilai, 0)

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
      {/* Header navy dengan bawah bergelombang. Logo BBT hanya tampil di layar pembuka. */}
      <div className="relative flex-none bg-linear-135 from-galaxy-900 to-galaxy-700 px-5 pt-[max(56px,env(safe-area-inset-top))] pb-16 text-white">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col gap-1">
            <h1 className="m-0 text-[22px] font-bold">Contract Management</h1>
            <span className="text-[15px] font-semibold">Halo, [Nama admin] 👋</span>
            <span className="text-[13px] text-white/80">{formatTanggalHariIni()}</span>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/pengingat"
              aria-label={`Buka pengingat, ${butuhTindakan} kontrak butuh tindakan`}
              className="relative flex size-11 items-center justify-center text-white hover:text-white"
            >
              <Ikon nama="pengingat" ukuran={26} />
              {butuhTindakan > 0 && (
                <span
                  aria-hidden="true"
                  className="absolute top-0.5 right-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-hapus px-1 text-[10px] font-bold text-white"
                >
                  {butuhTindakan}
                </span>
              )}
            </Link>

            {/* Profil belum masuk MVP: sama seperti tombol Profil di navigasi bawah. */}
            <button
              type="button"
              aria-label="Profil"
              onClick={() => tampilkanToast('Halaman profil belum masuk desain MVP')}
              className="flex size-12 cursor-pointer items-center justify-center rounded-full border-none bg-logo-emas text-[18px] font-bold text-galaxy-900"
            >
              A
            </button>
          </div>
        </div>

        {/* Gelombang di bawah header */}
        <svg
          viewBox="0 0 390 36"
          preserveAspectRatio="none"
          aria-hidden="true"
          className="absolute -bottom-px left-0 block h-9 w-full"
        >
          <path d="M0 36 L0 22 C 90 6, 200 40, 300 18 C 340 9, 370 6, 390 4 L390 36 Z" className="fill-latar" />
        </svg>
      </div>

      {/* Kotak pencarian, menumpuk di gelombang header. Membuka daftar kontrak. */}
      <Link
        to="/kontrak"
        className="relative z-10 mx-5 -mt-9 flex h-[52px] flex-none items-center gap-3 rounded-[14px] bg-white px-4 text-[14px] text-teks-lembut shadow-kotak hover:text-teks-lembut"
      >
        <Ikon nama="cari" ukuran={20} className="text-aksi" />
        Cari judul, nomor, atau mitra...
      </Link>

      <div className="flex flex-col gap-6 px-5 pt-6 pb-6">
        {/* Ringkasan kontrak: 4 status + Tambah + Pengingat */}
        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="m-0 text-[17px] text-judul">Ringkasan kontrak</h2>
            <Link to="/kontrak" className="py-2 text-[13px] font-semibold text-aksi">
              Lihat semua
            </Link>
          </div>
          <div className="grid grid-cols-3 gap-2.5">
            {URUTAN_KOTAK_STATUS.map((status, i) => {
              const tampilan = TAMPILAN_STATUS[status]
              return (
                <KotakRingkasan
                  key={status}
                  judul={tampilan.label}
                  keterangan={`${jumlah[status]} kontrak`}
                  ikon={tampilan.ikon}
                  ke={`/kontrak?status=${status}`}
                  kelasIkonGradasi={tampilan.kelasIkonGradasi}
                  kelasHiasan={tampilan.kelasHiasan}
                  urutan={i}
                />
              )
            })}
            <KotakRingkasan
              judul="Tambah"
              keterangan="Kontrak baru"
              ikon="tambah"
              ke="/tambah"
              kelasIkonGradasi={GRADASI_NAVY}
              kelasHiasan="bg-galaxy-700/10"
              urutan={4}
            />
            <KotakRingkasan
              judul="Pengingat"
              keterangan={`${butuhTindakan} kontrak`}
              ikon="pengingat"
              ke="/pengingat"
              kelasIkonGradasi={GRADASI_NAVY}
              kelasHiasan="bg-logo-emas/15"
              urutan={5}
            />
          </div>
        </section>

        {/* Segera habis: daftar bertanggal */}
        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="m-0 text-[17px] text-judul">Segera habis</h2>
            <Link to="/kontrak?status=segera" className="py-2 text-[13px] font-semibold text-aksi">
              Lihat semua
            </Link>
          </div>
          <div className="flex flex-col rounded-2xl bg-white px-4 shadow-kotak">
            {segeraHabis.length > 0 ? (
              <>
                {segeraHabis.map((kontrak) => (
                  <BarisSegeraHabis key={kontrak.id} kontrak={kontrak} />
                ))}
                <Link
                  to="/kontrak?status=segera"
                  className="py-3 text-center text-[13px] font-semibold text-aksi"
                >
                  Lihat semua kontrak
                </Link>
              </>
            ) : (
              <p className="m-0 py-5 text-center text-[13px] text-teks-lembut">
                Tidak ada kontrak yang habis dalam {BATAS_HARI_SEGERA} hari.
              </p>
            )}
          </div>
        </section>

        {/* Total nilai kontrak yang belum selesai */}
        <section className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-kotak">
          <span
            aria-hidden="true"
            className={`flex size-10 flex-none items-center justify-center rounded-[14px] bg-linear-135 text-white shadow-md inset-shadow-[0_1px_0_rgb(255_255_255/0.45)] ${GRADASI_NAVY}`}
          >
            <Ikon nama="dokumen" ukuran={20} />
          </span>
          <span className="flex flex-1 flex-col">
            <span className="text-[12px] text-teks-lembut">Total nilai kontrak berjalan</span>
            <span className="text-[18px] font-bold text-judul">{formatRupiahSingkat(totalNilai)}</span>
          </span>
          <span className="rounded-full bg-latar px-2.5 py-1 text-[12px] font-semibold text-judul">
            {belumSelesai.length} kontrak
          </span>
        </section>
      </div>
    </div>
  )
}

export default Beranda
