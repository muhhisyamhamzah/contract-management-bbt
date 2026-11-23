// Panel pratinjau dokumen di Detail kontrak (gaya referensi dari Hisyam, 18 Nov 2026):
// nama file + ukuran, tombol "Buka di tab baru" dan "Unduh", lalu file ditampilkan langsung di halaman.
// Semua jenis file boleh diunggah, tapi browser hanya bisa menampilkan PDF dan gambar (<iframe> bawaan,
// tanpa library tambahan). File lain (Word, Excel, dll.) cukup diunduh.
// Dokumen contoh di purwarupa tidak punya file, jadi yang tampil adalah keterangan pengganti.

import { formatTanggalSingkat, formatUkuranFile } from '../lib/format'
import { KELAS_TOMBOL_KEDUA } from '../lib/tataLetak'
import { useToast } from '../lib/toast'
import type { Dokumen } from '../types/kontrak'
import Ikon from './Ikon'

/** Jenis file yang bisa ditampilkan langsung oleh browser. */
const BISA_DIPRATINJAU = /\.(pdf|png|jpe?g|gif|webp|svg)$/i

type Props = {
  dokumen: Dokumen | undefined
}

function PratinjauDokumen({ dokumen }: Props) {
  const tampilkanToast = useToast()

  if (!dokumen) {
    return (
      <div className="flex min-h-[320px] items-center justify-center rounded-2xl border border-dashed border-garis-input bg-latar p-6 text-center text-teks-lembut">
        Belum ada dokumen.
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="m-0 text-[16px] font-bold break-words text-judul">{dokumen.nama}</p>
          <p className="m-0 mt-0.5 text-[13px] text-teks-lembut">
            {dokumen.jenis}, {formatUkuranFile(dokumen.ukuran)}, diunggah {formatTanggalSingkat(dokumen.tanggal)}
          </p>
        </div>
        <div className="flex flex-none gap-2">
          {dokumen.url ? (
            <>
              <a
                href={dokumen.url}
                target="_blank"
                rel="noreferrer"
                aria-label={`Buka ${dokumen.nama} di tab baru`}
                className={`${KELAS_TOMBOL_KEDUA} w-11 px-0`}
              >
                <Ikon nama="bukaTab" ukuran={18} />
              </a>
              <a href={dokumen.url} download={dokumen.nama} className={KELAS_TOMBOL_KEDUA}>
                <Ikon nama="unduh" ukuran={18} />
                Unduh
              </a>
            </>
          ) : (
            <button
              type="button"
              onClick={() => tampilkanToast(`Mengunduh ${dokumen.nama} (contoh)`)}
              className={KELAS_TOMBOL_KEDUA}
            >
              <Ikon nama="unduh" ukuran={18} />
              Unduh
            </button>
          )}
        </div>
      </div>

      {dokumen.url && BISA_DIPRATINJAU.test(dokumen.nama) ? (
        <iframe
          title={`Pratinjau ${dokumen.nama}`}
          src={dokumen.url}
          className="h-[70vh] min-h-[420px] w-full rounded-2xl border border-garis bg-latar"
        />
      ) : dokumen.url ? (
        <div className="flex min-h-[240px] flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-garis-input bg-latar p-6 text-center">
          <Ikon nama="dokumen" ukuran={32} className="text-aksi" />
          <p className="m-0 font-semibold text-judul">Jenis file ini tidak bisa ditampilkan di halaman</p>
          <p className="m-0 max-w-[44ch] text-[14px] text-teks-lembut">Unduh file untuk membukanya.</p>
        </div>
      ) : (
        <div className="flex min-h-[420px] flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-garis-input bg-latar p-6 text-center">
          <Ikon nama="dokumen" ukuran={32} className="text-aksi" />
          <p className="m-0 font-semibold text-judul">Pratinjau dokumen tampil di sini</p>
          <p className="m-0 max-w-[44ch] text-[14px] text-teks-lembut">
            Dokumen contoh belum punya file. File yang Anda unggah di halaman ini langsung bisa dilihat. Setelah backend
            siap, semua file diambil dari penyimpanan kantor.
          </p>
        </div>
      )}
    </div>
  )
}

export default PratinjauDokumen
