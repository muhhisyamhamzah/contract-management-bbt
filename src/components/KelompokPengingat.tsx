// Satu kelompok di halaman Pengingat (misalnya "Sudah lewat, perlu keputusan"): judul berwarna,
// jumlah kontrak, lalu daftar kontrak. Kalau kosong, tampil pesan pengganti.

import { KELAS_KOTAK } from '../lib/tataLetak'
import type { Kontrak } from '../types/kontrak'
import BarisKontrak from './BarisKontrak'

type Props = {
  id: string
  judul: string
  kelasJudul: string
  kelasTitik: string
  kelasKotak: string
  daftar: Kontrak[]
  pesanKosong: string
}

function KelompokPengingat({ id, judul, kelasJudul, kelasTitik, kelasKotak, daftar, pesanKosong }: Props) {
  return (
    <section aria-labelledby={id} className="flex flex-col gap-3">
      <h2 id={id} className={`m-0 flex items-center gap-2 px-1 text-[13px] font-bold tracking-[0.05em] uppercase ${kelasJudul}`}>
        <span aria-hidden="true" className={`size-2 rounded-full ${kelasTitik}`} />
        {judul}
        <span className="rounded-full bg-white px-2 py-0.5 text-[12px] tracking-normal text-judul shadow-kotak">
          {daftar.length}
        </span>
      </h2>
      <div className={`${KELAS_KOTAK} px-4 md:px-7 ${kelasKotak}`}>
        {daftar.length > 0 ? (
          <ul className="m-0 list-none p-0">
            {daftar.map((k) => (
              <BarisKontrak key={k.id} kontrak={k} />
            ))}
          </ul>
        ) : (
          <p className="m-0 py-6 text-center text-teks-lembut">{pesanKosong}</p>
        )}
      </div>
    </section>
  )
}

export default KelompokPengingat
