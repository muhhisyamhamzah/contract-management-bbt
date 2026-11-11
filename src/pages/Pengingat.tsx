// Halaman Pengingat: kontrak yang perlu diputuskan (diperpanjang atau ditutup),
// dibagi dua kelompok: "Sudah lewat" dan "Habis dalam 30 hari".

import type { ReactNode } from 'react'
import HeaderGelombang from '../components/HeaderGelombang'
import Ikon from '../components/Ikon'
import KartuPengingat from '../components/KartuPengingat'
import { kontrakContoh } from '../data/kontrakContoh'
import { BATAS_HARI_SEGERA, hitungSisaHari, hitungStatus } from '../lib/status'
import type { Kontrak, StatusKontrak } from '../types/kontrak'

/** Kontrak dengan status tertentu, diurutkan dari sisa hari paling kecil (paling mendesak). */
function ambilUrut(daftar: Kontrak[], status: StatusKontrak): Kontrak[] {
  return daftar
    .filter((kontrak) => hitungStatus(kontrak) === status)
    .sort((a, b) => hitungSisaHari(a.tanggalBerakhir) - hitungSisaHari(b.tanggalBerakhir))
}

type PropsKelompok = {
  judul: string
  /** Warna judul kelompok, misalnya text-lewat-teks. */
  kelasJudul: string
  daftar: Kontrak[]
  pesanKosong: string
}

/** Satu kelompok pengingat: judul berwarna, jumlah, lalu daftar kartu. */
function KelompokPengingat({ judul, kelasJudul, daftar, pesanKosong }: PropsKelompok) {
  return (
    <section className="flex flex-col gap-2.5">
      <h2 className={`m-0 flex items-center gap-2 text-[12px] font-extrabold tracking-[0.06em] uppercase ${kelasJudul}`}>
        {judul}
        <span className="rounded-full bg-white px-2 py-0.5 text-[11px] tracking-normal shadow-kotak">
          {daftar.length}
        </span>
      </h2>
      {daftar.length > 0 ? (
        daftar.map((kontrak) => <KartuPengingat key={kontrak.id} kontrak={kontrak} />)
      ) : (
        <p className="m-0 rounded-2xl bg-white p-4 text-center text-[13px] text-teks-lembut shadow-kotak">
          {pesanKosong}
        </p>
      )}
    </section>
  )
}

function Pengingat() {
  const sudahLewat = ambilUrut(kontrakContoh, 'lewat')
  const segeraHabis = ambilUrut(kontrakContoh, 'segera')

  let isi: ReactNode
  if (sudahLewat.length === 0 && segeraHabis.length === 0) {
    isi = (
      <div className="flex flex-col items-center gap-2 px-4 py-12 text-center text-teks-lembut">
        <span className="mb-1 flex size-14 items-center justify-center rounded-full bg-white text-berjalan shadow-kotak">
          <Ikon nama="centangLingkaran" ukuran={26} />
        </span>
        <span className="font-semibold text-judul">Semua kontrak aman</span>
        <span>Tidak ada kontrak yang lewat atau habis dalam {BATAS_HARI_SEGERA} hari.</span>
      </div>
    )
  } else {
    isi = (
      <>
        <KelompokPengingat
          judul="Sudah lewat"
          kelasJudul="text-lewat-teks"
          daftar={sudahLewat}
          pesanKosong="Tidak ada kontrak yang sudah lewat."
        />
        <KelompokPengingat
          judul={`Habis dalam ${BATAS_HARI_SEGERA} hari`}
          kelasJudul="text-segera-teks"
          daftar={segeraHabis}
          pesanKosong={`Tidak ada kontrak yang habis dalam ${BATAS_HARI_SEGERA} hari.`}
        />
      </>
    )
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
      <HeaderGelombang kelasBawah="pb-12">
        <h1 className="m-0 text-[22px] font-bold">Pengingat</h1>
        <span className="text-[13px] text-white/80">
          Kontrak yang perlu diputuskan: diperpanjang atau ditutup.
        </span>
      </HeaderGelombang>

      <div className="flex flex-col gap-6 px-5 pt-3 pb-6">{isi}</div>
    </div>
  )
}

export default Pengingat
