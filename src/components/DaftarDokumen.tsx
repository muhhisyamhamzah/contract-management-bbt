// Dokumen kontrak di Detail: daftar pilihan (dropdown) bernomor dari dokumen paling lama ke paling baru,
// misalnya 1. PKS awal, 2. Adendum 1, ... 6. Adendum 5 (Hisyam 18 Nov 2026), ditambah tombol unggah.
// Memilih dokumen menampilkannya di pratinjau. PKS lama tidak pernah dihapus, jadi riwayatnya tetap ada.
// Semua jenis file boleh diunggah. Belum ada backend: file yang diunggah di sesi ini disimpan
// sebagai alamat sementara browser (bisa dipratinjau dan diunduh); dokumen contoh tidak punya file.

import { useId, useRef } from 'react'
import { urutkanDokumen } from '../lib/daftarKontrak'
import { formatTanggalSingkat, hariIniTeks } from '../lib/format'
import { KELAS_ISIAN, KELAS_TAUTAN_AKSI } from '../lib/tataLetak'
import { useToast } from '../lib/toast'
import type { Dokumen, JenisDokumen } from '../types/kontrak'
import Ikon from './Ikon'

type Props = {
  daftar: Dokumen[]
  onUnggah: (dokumen: Dokumen) => void
  /** Dipanggil saat dokumen lain dipilih untuk dipratinjau. */
  onPilih: (id: string) => void
  /** Dokumen yang sedang dipratinjau. */
  terpilihId?: string
}

/** Sebutan dokumen di daftar: PKS pertama = "PKS awal", PKS berikutnya = "PKS pengganti". */
function sebutan(dokumen: Dokumen, sudahAdaPks: boolean): string {
  if (dokumen.jenis === 'PKS utama') return sudahAdaPks ? 'PKS pengganti' : 'PKS awal'
  return dokumen.jenis
}

/** Menebak jenis dokumen dari nama file. Nanti diganti pilihan jenis saat backend ada. */
function tebakJenis(nama: string): JenisDokumen {
  const kecil = nama.toLowerCase()
  if (kecil.includes('adendum') || kecil.includes('addendum')) return 'Adendum'
  if (kecil.includes('bast')) return 'BAST'
  return 'Lainnya'
}

function DaftarDokumen({ daftar, onUnggah, onPilih, terpilihId }: Props) {
  const tampilkanToast = useToast()
  const urut = urutkanDokumen(daftar)
  const masukanFile = useRef<HTMLInputElement>(null)
  const id = useId()

  function pilihFile(file: File | undefined) {
    if (!file) return
    onUnggah({
      id: `d-${Date.now()}`,
      nama: file.name,
      jenis: tebakJenis(file.name),
      ukuran: file.size,
      tanggal: hariIniTeks(),
      url: URL.createObjectURL(file),
    })
    tampilkanToast(`${file.name} terunggah.`)
  }

  return (
    <div className="flex flex-col gap-3">
      {urut.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <label htmlFor={`${id}-pilih`} className="text-[13px] font-semibold text-judul">
            Dokumen kontrak <span className="font-normal text-teks-lembut">({urut.length} file, urut dari yang paling lama)</span>
          </label>
          <select
            id={`${id}-pilih`}
            value={terpilihId}
            onChange={(e) => onPilih(e.target.value)}
            className={`${KELAS_ISIAN} h-12 font-semibold`}
          >
            {urut.map((dokumen, i) => {
              const sudahAdaPks = urut.slice(0, i).some((d) => d.jenis === 'PKS utama')
              return (
                <option key={dokumen.id} value={dokumen.id}>
                  {i + 1}. {dokumen.nama} ({sebutan(dokumen, sudahAdaPks)}, {formatTanggalSingkat(dokumen.tanggal)})
                </option>
              )
            })}
          </select>
        </div>
      )}

      <div>
        <input
          ref={masukanFile}
          id={id}
          type="file"
          className="sr-only"
          tabIndex={-1}
          aria-hidden="true"
          onChange={(e) => {
            pilihFile(e.target.files?.[0])
            e.target.value = ''
          }}
        />
        <button type="button" onClick={() => masukanFile.current?.click()} className={KELAS_TAUTAN_AKSI}>
          <Ikon nama="unggah" ukuran={16} tebal={2.5} /> Unggah file tambahan (adendum, BAST)
        </button>
      </div>
    </div>
  )
}

export default DaftarDokumen
