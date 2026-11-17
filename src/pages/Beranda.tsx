// Halaman Beranda (arah "Kavling", DESIGN.md; disetujui Hisyam 17 Nov 2026).
// Isi dari atas ke bawah: navigasi pil, judul rata tengah berupa kalimat tugas, kotak cari pil,
// rekap status berupa pil, "Agenda kontrak" berupa kartu (sudah lewat + habis dalam 90 hari),
// dan critical point terdekat dalam garis masa per bulan dengan penanda "Hari ini".

import { useState, type FormEvent } from 'react'
import type { CriticalPoint, Kontrak } from '../types/kontrak'
import { Link, useNavigate } from 'react-router-dom'
import KartuKontrak from '../components/KartuKontrak'
import BadgeStatus from '../components/BadgeStatus'
import Ikon from '../components/Ikon'
import KeadaanKosong from '../components/KeadaanKosong'
import KepalaHalaman from '../components/KepalaHalaman'
import KotakKalender from '../components/KotakKalender'
import RingkasanStatus from '../components/RingkasanStatus'
import { useData } from '../lib/data'
import { urutkanPalingCepatHabis } from '../lib/daftarKontrak'
import { formatRupiahSingkat, formatTanggalHariIni, keTanggal } from '../lib/format'
import {
  BATAS_HARI_SEGERA,
  hitungJumlahPerStatus,
  hitungSisaHari,
  hitungStatus,
  LABEL_CRITICAL_POINT,
  perluPerhatian,
  TAMPILAN_STATUS,
} from '../lib/status'
import { KELAS_KOTAK, KELAS_TAUTAN_AKSI, KELAS_TOMBOL_UTAMA, KELAS_WADAH } from '../lib/tataLetak'

/** Critical point yang tanggal pentingnya jatuh dalam sekian hari ke depan ikut tampil di Beranda. */
const HARI_CRITICAL_TERDEKAT = BATAS_HARI_SEGERA

/** Kata penekanan di judul: Source Serif 4 miring (paling banyak satu per judul). */
const KELAS_PENEKANAN = 'font-judul font-normal tracking-[-0.01em] text-galaxy-900'

function teksSisa(sisa: number): string {
  if (sisa < 0) return `Lewat ${Math.abs(sisa)} hari`
  if (sisa === 0) return 'Hari ini'
  return `${sisa} hari lagi`
}

type ButirTerdekat = { kontrak: Kontrak; butir: CriticalPoint; sisa: number }

/** Mengelompokkan critical point per bulan tanggal penting. Garis "Hari ini" tampil sebelum kelompok pertama yang belum lewat. */
function kelompokBulan(daftar: ButirTerdekat[]) {
  const kelompok: { kunci: string; judul: string; lewat: boolean; tampilkanHariIni: boolean; isi: ButirTerdekat[] }[] = []
  let hariIniSudah = false
  for (const item of daftar) {
    const tgl = keTanggal(item.butir.tanggalPenting)
    const kunci = `${tgl.getFullYear()}-${tgl.getMonth()}-${item.sisa < 0 ? 'lewat' : 'nanti'}`
    let grup = kelompok.find((g) => g.kunci === kunci)
    if (!grup) {
      const tampilkanHariIni = !hariIniSudah && item.sisa >= 0 && kelompok.length > 0
      if (item.sisa >= 0) hariIniSudah = true
      grup = {
        kunci,
        judul: tgl.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }),
        lewat: item.sisa < 0,
        tampilkanHariIni,
        isi: [],
      }
      kelompok.push(grup)
    }
    grup.isi.push(item)
  }
  return kelompok
}

function Beranda() {
  const { kontrak } = useData()
  const navigate = useNavigate()
  const [kataKunci, setKataKunci] = useState('')

  const jumlah = hitungJumlahPerStatus(kontrak)
  const perhatian = urutkanPalingCepatHabis(kontrak.filter((k) => perluPerhatian(k)))
  const nilaiPerhatian = perhatian.reduce((total, k) => total + k.nilai, 0)

  // Critical point aktif yang punya tanggal penting dalam 90 hari ke depan (atau sudah lewat).
  const criticalTerdekat = kontrak
    .filter((k) => hitungStatus(k) !== 'selesai')
    .flatMap((k) =>
      k.criticalPoint
        .filter((b) => b.status === 'aktif' && b.tanggalPenting)
        .map((b) => ({ kontrak: k, butir: b, sisa: hitungSisaHari(b.tanggalPenting) })),
    )
    .filter((c) => c.sisa <= HARI_CRITICAL_TERDEKAT)
    .sort((a, b) => a.sisa - b.sisa)

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
        <section aria-labelledby="judul-beranda" className="flex flex-col items-center pt-10 text-center md:pt-16">
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
            <RingkasanStatus jumlah={jumlah} />
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

        {criticalTerdekat.length > 0 && (
          <section aria-labelledby="judul-critical" className="flex flex-col gap-4">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 id="judul-critical" className="m-0 text-[26px] text-judul">
                Critical point terdekat
              </h2>
              <Link to="/critical-point" className={KELAS_TAUTAN_AKSI}>
                Lihat semua
                <Ikon nama="kanan" ukuran={14} tebal={2.5} />
              </Link>
            </div>
            <div className={`${KELAS_KOTAK} px-5 pt-2 pb-5 md:px-7`}>
              {kelompokBulan(criticalTerdekat).map((grup, i) => (
                <div key={grup.kunci}>
                  {grup.tampilkanHariIni && (
                    <p className="m-0 mt-4 flex items-center gap-3 text-[13px] font-bold text-galaxy-900 before:h-0.5 before:flex-1 before:bg-galaxy-900 after:h-0.5 after:flex-1 after:bg-galaxy-900">
                      Hari ini, {formatTanggalHariIni()}
                    </p>
                  )}
                  <div className={`grid gap-x-6 gap-y-2 pt-4 md:grid-cols-[170px_minmax(0,1fr)] ${i > 0 && !grup.tampilkanHariIni ? 'mt-2' : ''}`}>
                    <h3 className="m-0 text-[16px] text-judul">
                      {grup.judul}
                      <span className="block text-[13px] font-normal text-teks-lembut">
                        {grup.lewat ? `${grup.isi.length} sudah lewat` : `${grup.isi.length} tanggal penting`}
                      </span>
                    </h3>
                    <ul className="m-0 list-none border-l-2 border-garis p-0 pl-6">
                      {grup.isi.map(({ kontrak: k, butir, sisa }) => {
                        const lewat = sisa < 0
                        return (
                          <li key={butir.id} className="relative">
                            <span
                              aria-hidden="true"
                              className={`absolute top-1/2 -left-[33px] size-3.5 -translate-y-1/2 rounded-full border-[3px] bg-white ${lewat ? 'border-lewat' : 'border-segera'}`}
                            />
                            <Link
                              to={`/kontrak/${k.id}#critical-point`}
                              className="-mx-3 flex flex-wrap items-center gap-x-4 gap-y-2 rounded-2xl px-3 py-3 text-teks no-underline transition-[background-color] duration-150 hover:bg-latar hover:text-teks motion-reduce:transition-none"
                            >
                              <KotakKalender
                                tanggal={butir.tanggalPenting}
                                kelasPita={lewat ? TAMPILAN_STATUS.lewat.kelasPita : TAMPILAN_STATUS.segera.kelasPita}
                              />
                              <span className="flex min-w-0 flex-[1_1_240px] flex-col gap-0.5">
                                <span className="flex flex-wrap items-baseline gap-x-2 text-[14px]">
                                  <span className="font-bold text-judul">{LABEL_CRITICAL_POINT[butir.jenis]}</span>
                                  {butir.pasal && <span className="text-teks-lembut">{butir.pasal}</span>}
                                </span>
                                <span className="max-w-[72ch] text-[14px] text-teks">{butir.ringkasan}</span>
                                <span className="text-[13px] text-teks-lembut">{k.nama}</span>
                              </span>
                              <BadgeStatus status={lewat ? 'lewat' : 'segera'}>{teksSisa(sisa)}</BadgeStatus>
                            </Link>
                          </li>
                        )
                      })}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </>
  )
}

export default Beranda
