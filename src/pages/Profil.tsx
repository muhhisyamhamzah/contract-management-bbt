// Halaman Profil: identitas admin, ringkasan kerja, info akun, pengaturan pengingat, dan lainnya.
// Belum ada login dan backend: data akun memakai teks pengganti seperti "[Nama admin]",
// dan tombol yang belum berfungsi hanya memunculkan toast bertanda "(contoh)".

import { useState } from 'react'
import BarisProfil from '../components/BarisProfil'
import DialogKonfirmasi from '../components/DialogKonfirmasi'
import HeaderGelombang from '../components/HeaderGelombang'
import Ikon from '../components/Ikon'
import { kontrakContoh } from '../data/kontrakContoh'
import { hitungJumlahPerStatus } from '../lib/status'
import { useToast } from '../lib/toast'

/** Versi aplikasi yang ditampilkan di "Tentang aplikasi". */
const VERSI_APLIKASI = '0.1 (MVP)'

function Profil() {
  const tampilkanToast = useToast()
  const [konfirmasiKeluar, setKonfirmasiKeluar] = useState(false)

  const jumlah = hitungJumlahPerStatus(kontrakContoh)
  const ringkasan = [
    { angka: kontrakContoh.length, label: 'Kontrak tercatat' },
    { angka: jumlah.segera + jumlah.lewat, label: 'Butuh tindakan' },
    { angka: jumlah.selesai, label: 'Selesai' },
  ]

  function belumTersedia() {
    tampilkanToast('Pengaturan belum tersedia (contoh)')
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
      <HeaderGelombang kelasBawah="pb-16">
        <div className="flex items-center gap-4">
          <span
            aria-hidden="true"
            className="flex size-16 flex-none items-center justify-center rounded-full bg-logo-emas text-[26px] font-bold text-galaxy-900 ring-4 ring-white/15"
          >
            A
          </span>
          <div className="flex min-w-0 flex-col gap-0.5">
            <h1 className="m-0 text-[20px] font-bold">[Nama admin]</h1>
            <span className="text-[13px] text-white/80">Admin kontrak · [Unit kerja]</span>
          </div>
        </div>
      </HeaderGelombang>

      {/* Ringkasan kerja, menumpuk di gelombang header */}
      <section
        aria-label="Ringkasan kerja"
        className="relative z-20 mx-5 -mt-10 grid flex-none grid-cols-3 rounded-2xl bg-white py-3.5 shadow-kotak"
      >
        {ringkasan.map((r, i) => (
          <div
            key={r.label}
            className={`flex flex-col items-center gap-0.5 ${i > 0 ? 'border-l border-garis-lembut' : ''}`}
          >
            <span className="text-[20px] font-bold text-judul">{r.angka}</span>
            <span className="text-[11px] text-teks-lembut">{r.label}</span>
          </div>
        ))}
      </section>

      <div className="flex flex-col gap-5 px-5 pt-5 pb-6">
        <section className="flex flex-col gap-2">
          <h2 className="m-0 text-[15px] font-semibold text-judul">Info akun</h2>
          <div className="rounded-2xl bg-white px-4 shadow-kotak">
            <BarisProfil ikon="email" label="Email kantor" nilai="[Email kantor]" />
            <BarisProfil ikon="kartuId" label="NIP" nilai="[NIP]" />
            <BarisProfil ikon="gedung" label="Unit kerja" nilai="[Unit kerja]" terakhir />
          </div>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="m-0 text-[15px] font-semibold text-judul">Pengaturan pengingat</h2>
          <div className="rounded-2xl bg-white px-4 shadow-kotak">
            <BarisProfil
              ikon="pengingat"
              label="Pengingat bawaan"
              nilai="30 hari sebelum kontrak habis"
              onKlik={belumTersedia}
            />
            <BarisProfil
              ikon="info"
              label="Kanal pengingat"
              nilai="Belum ditentukan (notifikasi HP atau email)"
              onKlik={belumTersedia}
              terakhir
            />
          </div>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="m-0 text-[15px] font-semibold text-judul">Lainnya</h2>
          <div className="rounded-2xl bg-white px-4 shadow-kotak">
            <BarisProfil
              ikon="bantuan"
              label="Bantuan"
              nilai="Panduan memakai aplikasi"
              onKlik={() => tampilkanToast('Membuka panduan (contoh)')}
            />
            <BarisProfil
              ikon="dokumen"
              label="Tentang aplikasi"
              nilai={`Contract Management BBT · versi ${VERSI_APLIKASI}`}
              terakhir
            />
          </div>
        </section>

        <button
          type="button"
          onClick={() => setKonfirmasiKeluar(true)}
          className="flex h-[50px] cursor-pointer items-center justify-center gap-2 rounded-[14px] border border-garis bg-white font-semibold text-judul"
        >
          <Ikon nama="keluar" ukuran={20} />
          Keluar
        </button>
      </div>

      <DialogKonfirmasi
        terbuka={konfirmasiKeluar}
        judul="Keluar dari aplikasi?"
        pesan="Anda perlu masuk lagi untuk membuka data kontrak."
        labelKonfirmasi="Keluar"
        onKonfirmasi={() => {
          setKonfirmasiKeluar(false)
          tampilkanToast('Belum ada fitur masuk akun (contoh)')
        }}
        onBatal={() => setKonfirmasiKeluar(false)}
      />
    </div>
  )
}

export default Profil
