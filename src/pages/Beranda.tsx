// Halaman Beranda (arah "Kavling", DESIGN.md; disetujui Hisyam 17 Nov 2026).
// Isi dari atas ke bawah: navigasi pil, judul rata tengah berupa kalimat tugas, kotak cari pil,
// rekap status berupa pil, dan "Agenda kontrak" berupa kartu (sudah lewat + habis dalam 90 hari).
// Bagian "Critical point terdekat" dihapus bersama pengingat critical point (Hisyam 18 Nov 2026).
// Dipadatkan 23 Nov 2026 supaya Agenda kontrak mulai terlihat tanpa scroll di laptop 1366x768:
// kalimat ringkasan di bawah judul dihapus (angkanya sudah ada di pil status), nilai rupiah pindah ke judul Agenda,
// jarak atas sama dengan halaman kerja (md:pt-21), dan jarak antarbagian dikurangi.
// (24 Nov 2026) Di bawah pembuka: dua kolom sama tinggi (kiri garis waktu Kontrak berakhir 12 bulan + Aktivitas
// terakhir; kanan Pengingat bulan ini + Adendum sedang diproses), lalu Agenda kontrak lebar penuh paling bawah. Pil status juga menampilkan total nilai. Hitungan: src/lib/beranda.ts.

import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import GarisWaktuBerakhir from '../components/GarisWaktuBerakhir'
import KartuBagian from '../components/KartuBagian'
import DaftarAgenda from '../components/DaftarAgenda'
import Ikon from '../components/Ikon'
import KeadaanKosong from '../components/KeadaanKosong'
import KepalaHalaman from '../components/KepalaHalaman'
import PanelAdendumDiproses from '../components/PanelAdendumDiproses'
import PanelPengingatBulanIni from '../components/PanelPengingatBulanIni'
import RingkasanStatus from '../components/RingkasanStatus'
import RiwayatKontrak from '../components/RiwayatKontrak'
import {
  adendumDiproses,
  aktivitasTerakhir,
  berakhirPerBulan,
  hitungNilaiPerStatus,
  pengingatBulanIni,
} from '../lib/beranda'
import { useData, usePengguna } from '../lib/data'
import { useJudulHalaman } from '../lib/judulHalaman'
import { urutkanPalingCepatHabis } from '../lib/daftarKontrak'
import { formatRupiahSingkat, formatTanggalHariIni } from '../lib/format'
import {
  BATAS_HARI_SEGERA,
  hitungJumlahPerStatus,
  perluPerhatian,
} from '../lib/status'
import { KELAS_KOTAK, KELAS_TAUTAN_AKSI, KELAS_TOMBOL_UTAMA, KELAS_WADAH } from '../lib/tataLetak'

/** Kata penekanan di judul: Source Serif 4 miring (paling banyak satu per judul). */
const KELAS_PENEKANAN = 'font-judul font-normal tracking-[-0.01em] text-galaxy-900'

function Beranda() {
  const { kontrak, riwayat } = useData()
  const pengguna = usePengguna()
  const navigate = useNavigate()
  const [kataKunci, setKataKunci] = useState('')
  useJudulHalaman('Beranda')

  const jumlah = hitungJumlahPerStatus(kontrak)
  const perhatian = urutkanPalingCepatHabis(kontrak.filter((k) => perluPerhatian(k)))
  const nilaiPerhatian = perhatian.reduce((total, k) => total + k.nilai, 0)
  const hariIni = new Date()
  const namaBulanIni = hariIni.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })

  function cari(event: FormEvent) {
    event.preventDefault()
    const kata = kataKunci.trim()
    navigate(kata ? `/kontrak?q=${encodeURIComponent(kata)}` : '/kontrak')
  }

  const tombolTambah = (kelasTambahan = '') => (
    <Link to="/tambah" className={`${KELAS_TOMBOL_UTAMA} ${kelasTambahan}`}>
      <Ikon nama="tambah" ukuran={18} tebal={2.5} />
      Tambah kontrak
    </Link>
  )

  return (
    <>
      <KepalaHalaman />

      <main id="konten" className={`${KELAS_WADAH} relative flex flex-col gap-10 pb-6`}>
        {/* Pembuka rata tengah. Jarak atas sama dengan judul halaman kerja (md:pt-21): teks tidak di atas baris mozaik pekat. */}
        <section aria-labelledby="judul-beranda" className="flex flex-col items-center pt-12 text-center md:pt-21">
          <p className="m-0 text-[14px] text-teks-lembut">{formatTanggalHariIni()}</p>
          <h1
            id="judul-beranda"
            className="m-0 mt-2.5 max-w-[960px] text-[36px] leading-[1.05] font-extrabold tracking-[-0.035em] text-judul md:text-[60px]"
          >
            {perhatian.length > 0 ? (
              <>
                {perhatian.length} kontrak perlu <em className={KELAS_PENEKANAN}>ditindaklanjuti</em>
              </>
            ) : (
              <>
                Semua kontrak <em className={KELAS_PENEKANAN}>aman</em>
              </>
            )}
          </h1>
          {/* Kotak cari pil: membuka daftar Kontrak dengan kata kunci */}
          <form
            role="search"
            onSubmit={cari}
            className="mt-6 flex w-full max-w-[560px] items-center gap-2 rounded-full border border-garis-input bg-white py-1.5 pr-1.5 pl-5 shadow-pil focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-aksi"
          >
            <Ikon nama="cari" ukuran={20} className="flex-none text-teks-lembut" />
            <label htmlFor="cari-beranda" className="sr-only">
              Cari kontrak
            </label>
            <input
              id="cari-beranda"
              type="search"
              value={kataKunci}
              onChange={(e) => setKataKunci(e.target.value)}
              placeholder="Cari nama, penyedia, atau nomor PKS"
              className="h-11 min-w-0 flex-1 border-none bg-transparent text-[15px] text-teks outline-none"
            />
            <button
              type="submit"
              className="h-11 flex-none cursor-pointer rounded-full border-none bg-aksi px-5 font-semibold text-white transition-[background-color] duration-150 hover:bg-galaxy-900 motion-reduce:transition-none"
            >
              Cari
            </button>
          </form>

          {/* Di HP, tombol Tambah kontrak tidak muat di navigasi, jadi tampil di sini */}
          {tombolTambah('mt-4 md:hidden')}

          <div className="mt-5">
            <RingkasanStatus jumlah={jumlah} total={kontrak.length} nilai={hitungNilaiPerStatus(kontrak)} />
          </div>
        </section>

        {/* Dua kolom (24 Nov 2026) yang sama tinggi: panel terakhir di tiap kolom memanjang (flex-1) sampai dasar
            kolom, jadi tidak ada ruang kosong di bawah kolom yang lebih pendek.
            Kiri = garis waktu kontrak berakhir per bulan, lalu aktivitas tim.
            Kanan = pekerjaan yang sedang berjalan: pengingat bulan ini dan adendum yang sedang diproses.
            Di bawah 1024px bertumpuk. */}
        <div className="grid gap-5 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
          <div className="flex min-w-0 flex-col gap-5">
            <GarisWaktuBerakhir daftar={berakhirPerBulan(kontrak, hariIni)} />
            <KartuBagian
              kelas="flex-1"
              judul="Aktivitas terakhir"
              aksi={
                pengguna.peran === 'admin' ? (
                  <Link to="/admin" className={KELAS_TAUTAN_AKSI}>
                    Semua riwayat
                    <Ikon nama="kanan" ukuran={14} tebal={2.5} />
                  </Link>
                ) : undefined
              }
            >
              <RiwayatKontrak daftar={aktivitasTerakhir(riwayat)} pesanKosong="Belum ada perubahan kontrak." />
            </KartuBagian>
          </div>

          <aside aria-label="Pekerjaan berjalan" className="flex min-w-0 flex-col gap-5">
            <PanelPengingatBulanIni daftar={pengingatBulanIni(kontrak, hariIni)} namaBulan={namaBulanIni} />
            <PanelAdendumDiproses kelas="flex-1" daftar={adendumDiproses(kontrak, hariIni)} />
          </aside>
        </div>

        {/* Agenda kontrak paling bawah, lebar penuh, 3 kolom. Tinggi 2 baris kartu; sisanya di-scroll di dalam kotak. */}
        <section aria-labelledby="judul-agenda" className="flex flex-col gap-4">
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
              <h2 id="judul-agenda" className="m-0 text-[26px] text-judul">
                Agenda <em className={KELAS_PENEKANAN}>kontrak</em>
              </h2>
              {perhatian.length > 0 && (
                <p className="m-0 text-[14px] text-teks-lembut">
                  Sudah lewat dan habis dalam {BATAS_HARI_SEGERA} hari, senilai {formatRupiahSingkat(nilaiPerhatian)}
                </p>
              )}
            </div>
            <Link to="/kontrak" className={KELAS_TAUTAN_AKSI}>
              Lihat kontrak
              <Ikon nama="kanan" ukuran={14} tebal={2.5} />
            </Link>
          </div>
          {perhatian.length > 0 ? (
            <DaftarAgenda daftar={perhatian} />
          ) : (
            <div className={KELAS_KOTAK}>
              <KeadaanKosong
                ikon="centangLingkaran"
                kelasIkon="text-berjalan-teks"
                judul="Semua kontrak aman"
                pesan={`Tidak ada kontrak yang sudah lewat atau habis dalam ${BATAS_HARI_SEGERA} hari.`}
              />
            </div>
          )}
        </section>
      </main>
    </>
  )
}

export default Beranda
