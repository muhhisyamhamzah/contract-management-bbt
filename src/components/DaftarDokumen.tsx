// Isi tab "Dokumen" di Detail kontrak: daftar file PDF dan tombol unggah.
// Sementara belum ada backend, membuka dan mengunggah hanya memunculkan toast.

import { dokumenContoh } from '../data/rincianContoh'
import { formatTanggalSingkat } from '../lib/format'
import { useToast } from '../lib/toast'
import type { Kontrak } from '../types/kontrak'
import Ikon from './Ikon'

type Props = {
  kontrak: Kontrak
}

function DaftarDokumen({ kontrak }: Props) {
  const tampilkanToast = useToast()

  return (
    <>
      {dokumenContoh(kontrak).map((dokumen) => (
        <button
          key={dokumen.nama}
          type="button"
          onClick={() => tampilkanToast(`Membuka ${dokumen.nama} (contoh)`)}
          className="flex cursor-pointer items-center gap-3 rounded-2xl border-none bg-white p-3 text-left text-teks shadow-kotak"
        >
          <span className="flex size-11 flex-none items-center justify-center rounded-xl bg-lembut text-[11px] font-extrabold text-aksi">
            PDF
          </span>
          <span className="flex min-w-0 flex-1 flex-col gap-0.5">
            <span className="truncate font-semibold text-judul">{dokumen.nama}</span>
            <span className="text-[12px] text-teks-lembut">
              {dokumen.ukuran} · {formatTanggalSingkat(dokumen.tanggal)}
            </span>
          </span>
          <Ikon nama="unduh" ukuran={18} className="flex-none text-teks-lembut" />
        </button>
      ))}

      <button
        type="button"
        onClick={() => tampilkanToast('Pilih file atau foto dokumen')}
        className="h-12 cursor-pointer rounded-[14px] border-[1.5px] border-dashed border-aksen bg-white font-semibold text-aksi"
      >
        + Unggah dokumen
      </button>
    </>
  )
}

export default DaftarDokumen
