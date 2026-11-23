// Halaman Beranda (arah "Kavling", DESIGN.md; disetujui Hisyam 17 Nov 2026).
// Isi dari atas ke bawah: navigasi pil, judul rata tengah berupa kalimat tugas, kotak cari pil,
// rekap status berupa pil, dan "Agenda kontrak" berupa kartu (sudah lewat + habis dalam 90 hari).
// Bagian "Critical point terdekat" dihapus bersama pengingat critical point (Hisyam 18 Nov 2026).

import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import KartuKontrak from '../components/KartuKontrak'
import Ikon from '../components/Ikon'
import KeadaanKosong from '../components/KeadaanKosong'
import KepalaHalaman from '../components/KepalaHalaman'
import RingkasanStatus from '../components/RingkasanStatus'
import { useData } from '../lib/data'
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
  const { kontrak } = useData()
  const navigate = useNavigate()
  const [kataKunci, setKataKunci] = useState('')
  useJudulHalaman('Beranda')

  const jumlah = hitungJumlahPerStatus(kontrak)
  const perhatian = urutkanPalingCepatHabis(kontrak.filter((k) => perluPerhatian(k)))
  const nilaiPerhatian = perhatian.reduce((total, k) => total + k.nilai, 0)

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

      <main id="konten" className={`${KELAS_WADAH} relative flex flex-col gap-12 pb-6 md:gap-16`}>
        {/* Pembuka rata tengah. Jarak atas memberi ruang untuk mozaik yang memudar (teks tidak di atas mozaik). */}
        <section aria-labelledby="judul-beranda" className="flex flex-col items-center pt-12 text-center md:pt-28">
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
          <p className="m-0 mt-4 max-w-[560px] text-[16px] text-balance text-teks-lembut">
            {perhatian.length > 0
              ? `${jumlah.lewat} sudah lewat tanggal akhir dan ${jumlah.segera} habis dalam ${BATAS_HARI_SEGERA} hari, senilai ${formatRupiahSingkat(nilaiPerhatian)}.`
              : `Tidak ada kontrak yang sudah lewat atau habis dalam ${BATAS_HARI_SEGERA} hari.`}
          </p>

          {/* Kotak cari pil: membuka daftar Kontrak dengan kata kunci */}
          <form
            role="search"
            onSubmit={cari}
            className="mt-7 flex w-full max-w-[560px] items-center gap-2 rounded-full border border-garis-input bg-white py-1.5 pr-1.5 pl-5 shadow-pil focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-aksi"
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

          <div className="mt-6">
            <RingkasanStatus jumlah={jumlah} total={kontrak.length} />
          </div>
        </section>

        <section aria-labelledby="judul-agenda" className="flex flex-col gap-4">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 id="judul-agenda" className="m-0 text-[26px] text-judul">
              Agenda <em className={KELAS_PENEKANAN}>kontrak</em>
            </h2>
            <Link to="/kontrak" className={KELAS_TAUTAN_AKSI}>
              Lihat kontrak
              <Ikon nama="kanan" ukuran={14} tebal={2.5} />
            </Link>
          </div>
          {perhatian.length > 0 ? (
            <ul className="m-0 grid list-none gap-4 p-0 md:grid-cols-2 xl:grid-cols-3">
              {perhatian.map((k) => (
                <li key={k.id}>
                  <KartuKontrak kontrak={k} />
                </li>
              ))}
            </ul>
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
