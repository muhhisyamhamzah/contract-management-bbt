// HALAMAN SEMENTARA untuk mengecek komponen bersama di browser (alamat /contoh-komponen).
// Hanya aktif saat `npm run dev`, tidak ikut ke versi build.
// Hapus file ini (dan route-nya di App.tsx) setelah semua halaman selesai.

import { useState } from 'react'
import BadgeStatus from '../components/BadgeStatus'
import CincinHari from '../components/CincinHari'
import Ikon from '../components/Ikon'
import KartuKontrak from '../components/KartuKontrak'
import MenuDropdown from '../components/MenuDropdown'
import { kontrakContoh } from '../data/kontrakContoh'
import { useToast } from '../lib/toast'

const PILIHAN_URUTAN = ['Paling cepat habis', 'Nilai terbesar', 'Nama A sampai Z']

function ContohKomponen() {
  const tampilkanToast = useToast()
  const [urutan, setUrutan] = useState(PILIHAN_URUTAN[0])

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto px-5 pt-14 pb-10">
      <h1 className="m-0 text-[22px] font-extrabold text-judul">Contoh komponen</h1>

      <section className="flex flex-col gap-3">
        <h2 className="m-0 text-[16px] text-judul">BadgeStatus</h2>
        <div className="flex flex-wrap gap-2">
          <BadgeStatus status="berjalan" />
          <BadgeStatus status="segera" />
          <BadgeStatus status="lewat" />
          <BadgeStatus status="selesai" />
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="m-0 text-[16px] text-judul">CincinHari (di atas header gelap)</h2>
        <div className="grid grid-cols-2 gap-3 rounded-[20px] bg-linear-160 from-galaxy-900 via-galaxy-700 via-70% to-aksi p-4 text-white">
          {['1', '4', '6', '8'].map((id) => {
            const kontrak = kontrakContoh.find((k) => k.id === id)!
            return (
              <div key={id} className="flex flex-col items-center gap-1">
                <CincinHari kontrak={kontrak} />
                <span className="text-center text-[11px] text-teks-header">{kontrak.judul}</span>
              </div>
            )
          })}
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="m-0 text-[16px] text-judul">MenuDropdown</h2>
        <div className="flex items-start justify-between">
          <MenuDropdown
            isiTombol={
              <>
                <Ikon nama="urutkan" ukuran={14} tebal={2.5} />
                {urutan}
              </>
            }
            kelasTombol="flex h-9 cursor-pointer items-center gap-1.5 rounded-xl border border-garis bg-white px-3 text-[13px] font-bold text-judul"
            judul="Urutkan berdasarkan"
            item={PILIHAN_URUTAN.map((label) => ({
              label,
              terpilih: urutan === label,
              onPilih: () => setUrutan(label),
            }))}
          />

          <div className="rounded-[14px] bg-galaxy-900 p-2">
            <MenuDropdown
              labelTombol="Menu lainnya"
              isiTombol={<Ikon nama="titikTiga" />}
              kelasTombol="flex size-11 cursor-pointer items-center justify-center rounded-[14px] border-none bg-white/14 text-white"
              lebar={220}
              bayanganTebal
              item={[
                { label: 'Edit data kontrak', onPilih: () => tampilkanToast('Membuka form edit') },
                { label: 'Unduh semua dokumen', onPilih: () => tampilkanToast('Dokumen diunduh (contoh)') },
                {
                  label: 'Hapus kontrak',
                  bahaya: true,
                  onPilih: () => tampilkanToast('Akan muncul konfirmasi sebelum dihapus'),
                },
              ]}
            />
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="m-0 text-[16px] text-judul">Toast</h2>
        <button
          type="button"
          onClick={() => tampilkanToast('Kontrak tersimpan. Pengingat aktif 30 hari sebelum habis.')}
          className="h-[50px] cursor-pointer rounded-[14px] border-none bg-aksi font-bold text-white"
        >
          Munculkan toast
        </button>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="m-0 text-[16px] text-judul">KartuKontrak (8 data contoh)</h2>
        {kontrakContoh.map((kontrak) => (
          <KartuKontrak key={kontrak.id} kontrak={kontrak} />
        ))}
      </section>
    </div>
  )
}

export default ContohKomponen
