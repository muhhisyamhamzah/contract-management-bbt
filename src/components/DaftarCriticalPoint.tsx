// Daftar critical point (klausul berisiko) di Detail kontrak. Tiap butir bisa ditandai selesai
// dengan keterangan penanganan.

import { useState } from 'react'
import { formatTanggal } from '../lib/format'
import { LABEL_CRITICAL_POINT, teksJarakHari } from '../lib/status'
import { KELAS_ISIAN } from '../lib/tataLetak'
import type { CriticalPoint } from '../types/kontrak'
import DialogKonfirmasi from './DialogKonfirmasi'
import Ikon from './Ikon'

/** Warna garis kiri tiap jenis. */
const WARNA_GARIS = {
  pengakhiran: 'bg-logo-tanah',
  denda: 'bg-logo-emas',
  lainnya: 'bg-aksi',
} as const

type Props = {
  daftar: CriticalPoint[]
  /** Dipanggil saat butir ditandai selesai. */
  onTandaiSelesai: (butirId: string, penanganan: string) => void
}

function DaftarCriticalPoint({ daftar, onTandaiSelesai }: Props) {
  const [target, setTarget] = useState<CriticalPoint | null>(null)
  const [penanganan, setPenanganan] = useState('')

  if (daftar.length === 0) {
    return (
      <p className="m-0 py-4 text-teks-lembut">
        Belum ada critical point. Tambahkan klausul berisiko seperti pengakhiran kontrak atau denda.
      </p>
    )
  }

  return (
    <>
      <ul className="m-0 list-none p-0">
        {daftar.map((butir) => {
          const selesai = butir.status === 'selesai'
          return (
            <li key={butir.id} className="flex gap-3 border-b border-garis-lembut py-4 first:pt-1 last:border-b-0 last:pb-0">
              <span aria-hidden="true" className={`mt-1.5 size-2.5 flex-none rounded-[3px] ${selesai ? 'bg-selesai' : WARNA_GARIS[butir.jenis]}`} />
              <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-1">
                  <span className="flex flex-wrap items-baseline gap-x-2">
                    <span className="font-bold text-judul">{LABEL_CRITICAL_POINT[butir.jenis]}</span>
                    {butir.pasal && <span className="text-teks-lembut">{butir.pasal}</span>}
                  </span>
                  {selesai ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-selesai-latar px-2.5 py-1 text-[12px] font-semibold text-selesai-teks">
                      <Ikon nama="centang" ukuran={13} tebal={2.5} /> Selesai
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setPenanganan('')
                        setTarget(butir)
                      }}
                      className="-my-2.5 min-h-11 cursor-pointer border-none bg-transparent px-1 text-[13px] font-semibold text-aksi hover:text-aksi-tua"
                    >
                      Tandai selesai
                      <span className="sr-only"> untuk {LABEL_CRITICAL_POINT[butir.jenis]} {butir.pasal}</span>
                    </button>
                  )}
                </div>
                <p className={`m-0 max-w-[72ch] leading-relaxed ${selesai ? 'text-teks-lembut' : 'text-teks'}`}>{butir.ringkasan}</p>
                {butir.tanggalPenting && !selesai && (
                  <span className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-segera-teks">
                    <Ikon nama="kalender" ukuran={15} />
                    {formatTanggal(butir.tanggalPenting)}, {teksJarakHari(butir.tanggalPenting)}. Ikut diingatkan.
                  </span>
                )}
                {selesai && butir.penanganan && (
                  <span className="text-[13px] text-teks-lembut">Penanganan: {butir.penanganan}</span>
                )}
              </div>
            </li>
          )
        })}
      </ul>

      <DialogKonfirmasi
        terbuka={target !== null}
        judul="Tandai critical point selesai?"
        pesan={target ? `${LABEL_CRITICAL_POINT[target.jenis]}${target.pasal ? ` (${target.pasal})` : ''}. Tulis singkat bagaimana klausul ini ditangani.` : ''}
        labelKonfirmasi="Tandai selesai"
        konfirmasiNonaktif={!penanganan.trim()}
        onKonfirmasi={() => {
          if (target) onTandaiSelesai(target.id, penanganan.trim())
          setTarget(null)
        }}
        onBatal={() => setTarget(null)}
      >
        <label htmlFor="isian-penanganan" className="text-[13px] font-semibold text-judul">
          Keterangan penanganan <span className="text-hapus-teks">*</span>
        </label>
        <textarea
          id="isian-penanganan"
          value={penanganan}
          onChange={(e) => setPenanganan(e.target.value)}
          rows={3}
          placeholder="Contoh: Serah terima tepat waktu, denda tidak berlaku."
          className={`${KELAS_ISIAN} mt-1.5 py-2.5`}
        />
      </DialogKonfirmasi>
    </>
  )
}

export default DaftarCriticalPoint
