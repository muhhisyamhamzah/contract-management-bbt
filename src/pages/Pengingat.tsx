// Halaman Pengingat: kontrak yang perlu diputuskan (diperpanjang atau ditutup),
// dibagi dua kelompok: "Sudah lewat, perlu keputusan" lalu "Habis dalam 3 bulan".

import type { ReactNode } from 'react'
import HeaderGelombang from '../components/HeaderGelombang'
import KeadaanKosong from '../components/KeadaanKosong'
import KelompokPengingat from '../components/KelompokPengingat'
import { useData } from '../lib/data'
import { urutkanPalingCepatHabis } from '../lib/daftarKontrak'
import { BATAS_HARI_SEGERA, hitungStatus, TAHAP_PENGINGAT_BULAN } from '../lib/status'
import { KELAS_KOTAK, KELAS_WADAH } from '../lib/tataLetak'

function Pengingat() {
  const { kontrak } = useData()
  const sudahLewat = urutkanPalingCepatHabis(kontrak.filter((k) => hitungStatus(k) === 'lewat'))
  const segeraHabis = urutkanPalingCepatHabis(kontrak.filter((k) => hitungStatus(k) === 'segera'))
  const bulan = Math.round(BATAS_HARI_SEGERA / 30)

  let isi: ReactNode
  if (sudahLewat.length === 0 && segeraHabis.length === 0) {
    isi = (
      <div className={KELAS_KOTAK}>
        <KeadaanKosong
          ikon="centangLingkaran"
          kelasIkon="text-berjalan-teks"
          judul="Semua kontrak aman"
          pesan={`Tidak ada kontrak yang sudah lewat atau habis dalam ${bulan} bulan.`}
        />
      </div>
    )
  } else {
    isi = (
      <>
        <KelompokPengingat
          id="judul-lewat"
          judul="Sudah lewat, perlu keputusan"
          kelasJudul="text-lewat-teks"
          kelasTitik="bg-lewat"
          kelasKotak="border-lewat-garis-kartu"
          daftar={sudahLewat}
          pesanKosong="Tidak ada kontrak yang sudah lewat."
        />
        <KelompokPengingat
          id="judul-segera"
          judul={`Habis dalam ${bulan} bulan`}
          kelasJudul="text-segera-teks"
          kelasTitik="bg-segera"
          kelasKotak=""
          daftar={segeraHabis}
          pesanKosong={`Tidak ada kontrak yang habis dalam ${bulan} bulan.`}
        />
      </>
    )
  }

  return (
    <>
      <HeaderGelombang
        judul="Pengingat"
        keterangan={`Dikirim otomatis ${TAHAP_PENGINGAT_BULAN.join(', ').replace(/, (\d)$/, ', dan $1')} bulan sebelum kontrak habis, ke seluruh tim pengadaan dan kepala divisi umum.`}
      />
      <main id="konten" className={`${KELAS_WADAH} relative z-10 -mt-12 flex flex-col gap-8 pb-4`}>
        {isi}
      </main>
    </>
  )
}

export default Pengingat
