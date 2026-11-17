// Daftar dokumen PDF di Detail kontrak, dengan tombol unggah.
// File diperiksa dulu: hanya PDF, maksimal 10 MB. Belum ada backend: yang disimpan hanya nama dan ukurannya,
// dan mengunduh hanya memunculkan toast "(contoh)".

import { useId, useRef, useState } from 'react'
import { formatTanggalSingkat, formatUkuranFile, hariIniTeks } from '../lib/format'
import { periksaPdf } from '../lib/formKontrak'
import { KELAS_TAUTAN_AKSI } from '../lib/tataLetak'
import { useToast } from '../lib/toast'
import type { Dokumen, JenisDokumen } from '../types/kontrak'
import Ikon from './Ikon'

type Props = {
  daftar: Dokumen[]
  onUnggah: (dokumen: Dokumen) => void
}

/** Menebak jenis dokumen dari nama file. Nanti diganti pilihan jenis saat backend ada. */
function tebakJenis(nama: string): JenisDokumen {
  const kecil = nama.toLowerCase()
  if (kecil.includes('adendum') || kecil.includes('addendum')) return 'Adendum'
  if (kecil.includes('bast')) return 'BAST'
  return 'Lainnya'
}

function DaftarDokumen({ daftar, onUnggah }: Props) {
  const tampilkanToast = useToast()
  const masukanFile = useRef<HTMLInputElement>(null)
  const [galat, setGalat] = useState('')
  const id = useId()

  function pilihFile(file: File | undefined) {
    if (!file) return
    const pesan = periksaPdf(file)
    setGalat(pesan)
    if (pesan) return
    onUnggah({ id: `d-${Date.now()}`, nama: file.name, jenis: tebakJenis(file.name), ukuran: file.size, tanggal: hariIniTeks() })
    tampilkanToast(`${file.name} terunggah.`)
  }

  return (
    <div className="flex flex-col gap-3">
      <ul className="m-0 list-none p-0">
        {daftar.map((dokumen) => (
          <li key={dokumen.id} className="border-b border-garis-lembut last:border-b-0">
            <button
              type="button"
              onClick={() => tampilkanToast(`Mengunduh ${dokumen.nama} (contoh)`)}
              className="-mx-3 flex w-[calc(100%+24px)] cursor-pointer items-center gap-3.5 rounded-2xl border-none bg-transparent px-3 py-3 text-left text-teks transition-[background-color] duration-150 hover:bg-latar motion-reduce:transition-none"
            >
              <Ikon nama="dokumen" ukuran={22} className="flex-none text-aksi" />
              <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="truncate font-semibold text-judul">{dokumen.nama}</span>
                <span className="text-[12px] text-teks-lembut">
                  {dokumen.jenis}, {formatUkuranFile(dokumen.ukuran)}, diunggah {formatTanggalSingkat(dokumen.tanggal)}
                </span>
              </span>
              <Ikon nama="unduh" ukuran={18} className="flex-none text-aksi" />
              <span className="sr-only">Unduh</span>
            </button>
          </li>
        ))}
      </ul>

      <div>
        <input
          ref={masukanFile}
          id={id}
          type="file"
          accept="application/pdf,.pdf"
          className="sr-only"
          tabIndex={-1}
          aria-hidden="true"
          onChange={(e) => {
            pilihFile(e.target.files?.[0])
            e.target.value = ''
          }}
        />
        <button type="button" onClick={() => masukanFile.current?.click()} className={KELAS_TAUTAN_AKSI}>
          <Ikon nama="unggah" ukuran={16} tebal={2.5} /> Unggah PDF tambahan (adendum, BAST)
        </button>
        <span className="ml-1 text-[12px] text-teks-lembut">Hanya PDF, maksimal 10 MB</span>
      </div>

      {galat && (
        <p role="alert" className="m-0 flex items-start gap-2 rounded-xl bg-hapus-latar px-3.5 py-3 text-[13px] font-semibold text-hapus-teks">
          <Ikon nama="peringatan" ukuran={16} className="mt-px flex-none" />
          {galat}
        </p>
      )}
    </div>
  )
}

export default DaftarDokumen
