// Kotak unggah PDF PKS di form: bisa ditarik-lepas (drag and drop) atau pilih lewat tombol.
// File diperiksa: hanya PDF, maksimal 10 MB. Kalau ditolak, pesannya tampil di bawah kotak.

import { useState, type DragEvent } from 'react'
import { formatUkuranFile } from '../lib/format'
import { periksaPdf, type FileDipilih } from '../lib/formKontrak'
import Ikon from './Ikon'

type Props = {
  /** id tombol "Pilih file", supaya fokus bisa dipindah ke sini saat PDF belum ada. */
  id: string
  file: FileDipilih | null
  /** Nama PDF yang sudah tersimpan (form ubah). */
  namaLama: string
  onPilih: (file: FileDipilih | null) => void
  /** Pesan kesalahan dari pemeriksaan form (misalnya PDF belum diunggah). */
  galat?: string
}

function UnggahPdf({ id, file, namaLama, onPilih, galat }: Props) {
  const [galatFile, setGalatFile] = useState('')
  const [diseret, setDiseret] = useState(false)

  function terima(berkas: File | undefined) {
    if (!berkas) return
    const pesan = periksaPdf(berkas)
    setGalatFile(pesan)
    if (!pesan) onPilih({ nama: berkas.name, ukuran: berkas.size })
  }

  function saatLepas(event: DragEvent) {
    event.preventDefault()
    setDiseret(false)
    terima(event.dataTransfer.files[0])
  }

  const pesanGalat = galatFile || galat
  const idGalat = `${id}-galat`

  return (
    <div className="flex flex-col gap-2">
      <div
        onDragOver={(e) => {
          e.preventDefault()
          setDiseret(true)
        }}
        onDragLeave={() => setDiseret(false)}
        onDrop={saatLepas}
        className={`flex flex-col gap-4 rounded-2xl border-2 border-dashed p-4 transition-[background-color,border-color,color] duration-150 motion-reduce:transition-none sm:flex-row sm:items-center md:p-5 ${
          pesanGalat ? 'border-hapus bg-hapus-latar/40' : diseret ? 'border-aksi bg-lembut' : 'border-aksen bg-lembut/50'
        }`}
      >
        <span aria-hidden="true" className="flex size-12 flex-none items-center justify-center rounded-xl bg-white text-aksi shadow-kotak">
          <Ikon nama={file ? 'centang' : 'unggah'} ukuran={22} tebal={file ? 2.5 : 2} />
        </span>
        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
          {file ? (
            <>
              <span className="truncate font-semibold text-judul">{file.nama}</span>
              <span className="text-[13px] text-teks-lembut">{formatUkuranFile(file.ukuran)} · siap disimpan</span>
            </>
          ) : namaLama ? (
            <>
              <span className="truncate font-semibold text-judul">{namaLama}</span>
              <span className="text-[13px] text-teks-lembut">Sudah tersimpan. Pilih file lain kalau ingin mengganti.</span>
            </>
          ) : (
            <>
              <span className="font-semibold text-judul">Tarik file ke sini atau pilih file</span>
              <span className="text-[13px] text-teks-lembut">Hanya PDF, maksimal 10 MB</span>
            </>
          )}
        </span>
        <span className="flex flex-none gap-2">
          {file && (
            <button
              type="button"
              onClick={() => onPilih(null)}
              className="h-11 cursor-pointer rounded-xl border border-garis-input bg-white px-3.5 font-semibold text-hapus-teks"
            >
              Batalkan
            </button>
          )}
          {/* Label berperan sebagai tombol: input file asli tersembunyi tapi tetap bisa difokus. */}
          <label className="relative inline-flex h-11 cursor-pointer items-center rounded-xl border border-garis-input bg-white px-4 font-semibold text-judul focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-aksi hover:bg-latar">
            {file || namaLama ? 'Ganti file' : 'Pilih file'}
            <span className="sr-only"> PDF PKS</span>
            <input
              id={id}
              type="file"
              accept="application/pdf,.pdf"
              aria-invalid={Boolean(pesanGalat)}
              aria-describedby={pesanGalat ? idGalat : undefined}
              onChange={(e) => {
                terima(e.target.files?.[0])
                e.target.value = ''
              }}
              className="absolute inset-0 cursor-pointer opacity-0"
            />
          </label>
        </span>
      </div>

      {pesanGalat && (
        <span id={idGalat} role={galatFile ? 'alert' : undefined} className="flex items-start gap-1.5 text-[13px] font-semibold text-hapus-teks">
          <Ikon nama="info" ukuran={16} className="mt-px flex-none" />
          {pesanGalat}
        </span>
      )}
    </div>
  )
}

export default UnggahPdf
