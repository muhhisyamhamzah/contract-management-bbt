// Halaman Pengingat: kontrak yang perlu diputuskan (diperpanjang atau ditutup),
// dibagi dua kelompok: "Sudah lewat" dan "Habis dalam 30 hari".

import type { ReactNode } from 'react'
import HeaderGelombang from '../components/HeaderGelombang'
import Ikon from '../components/Ikon'
import KelompokPengingat from '../components/KelompokPengingat'
import { kontrakContoh } from '../data/kontrakContoh'
import { BATAS_HARI_SEGERA, hitungSisaHari, hitungStatus } from '../lib/status'
import type { Kontrak, StatusKontrak } from '../types/kontrak'

/** Kontrak dengan status tertentu, diurutkan dari sisa hari paling kecil (paling mendesak). */
function ambilUrut(daftar: Kontrak[], status: StatusKontrak): Kontrak[] {
  return daftar
    .filter((kontrak) => hitungStatus(kontrak) === status)
    .sort((a, b) => hitungSisaHari(a.tanggalBerakhir) - hitungSisaHari(b.tanggalBerakhir))
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
