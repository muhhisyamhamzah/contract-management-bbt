// Satu kelompok di halaman Pengingat (misalnya "Sudah lewat"): judul berwarna,
// jumlah kontrak, lalu daftar kartu. Kalau kosong, tampil pesan pengganti.

import type { Kontrak } from '../types/kontrak'
import KartuPengingat from './KartuPengingat'

type Props = {
  judul: string
  /** Warna judul kelompok, misalnya text-lewat-teks. */
  kelasJudul: string
  daftar: Kontrak[]
  pesanKosong: string
}

function KelompokPengingat({ judul, kelasJudul, daftar, pesanKosong }: Props) {
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

export default KelompokPengingat
