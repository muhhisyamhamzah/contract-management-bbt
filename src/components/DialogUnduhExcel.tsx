// Dialog "Unduh Excel" (permintaan atasan, 20 Nov 2026): pilih kontrak yang diunduh, lalu satu tombol Unduh Excel.
// Pilihan: kontrak yang sedang dibuka (hanya dari Detail), semua kontrak, atau pilih sendiri (centang).
// File dibuat di browser tanpa library (src/lib/excel.ts, src/lib/rekapExcel.ts).

import { useId, useState } from 'react'
import DialogKonfirmasi from './DialogKonfirmasi'
import { useData } from '../lib/data'
import { urutkanPalingCepatHabis } from '../lib/daftarKontrak'
import { unduhBlob } from '../lib/excel'
import { buatRekapExcel, namaFileRekap } from '../lib/rekapExcel'
import { hitungStatus, TAMPILAN_STATUS } from '../lib/status'
import { useToast } from '../lib/toast'
import type { Kontrak } from '../types/kontrak'

type Cakupan = 'ini' | 'semua' | 'pilih'

type Props = {
  terbuka: boolean
  /** Kontrak yang sedang dibuka (dari halaman Detail). Kalau ada, pilihan "Kontrak ini" tampil dan terpilih. */
  kontrakIni?: Kontrak
  onTutup: () => void
}

function DialogUnduhExcel({ terbuka, kontrakIni, onTutup }: Props) {
  // Isi dialog dipasang ulang setiap dibuka, supaya pilihan kembali ke bawaan.
  return terbuka ? <IsiDialog kontrakIni={kontrakIni} onTutup={onTutup} /> : null
}

function IsiDialog({ kontrakIni, onTutup }: Omit<Props, 'terbuka'>) {
  const { kontrak } = useData()
  const tampilkanToast = useToast()
  const id = useId()
  const [cakupan, setCakupan] = useState<Cakupan>(kontrakIni ? 'ini' : 'semua')
  const [terpilih, setTerpilih] = useState<Set<string>>(() => new Set(kontrakIni ? [kontrakIni.id] : []))

  const daftar = urutkanPalingCepatHabis(kontrak)
  const semuaTercentang = terpilih.size === daftar.length
  const yangDiunduh =
    cakupan === 'ini' && kontrakIni ? [kontrakIni] : cakupan === 'semua' ? daftar : daftar.filter((k) => terpilih.has(k.id))

  const pilihan: { nilai: Cakupan; label: string; keterangan: string }[] = [
    ...(kontrakIni
      ? [{ nilai: 'ini' as const, label: 'Kontrak ini saja', keterangan: kontrakIni.nama }]
      : []),
    { nilai: 'semua', label: 'Semua kontrak', keterangan: `${daftar.length} kontrak` },
    { nilai: 'pilih', label: 'Pilih kontrak', keterangan: 'Centang kontrak yang mau diunduh' },
  ]

  function ubahCentang(idKontrak: string) {
    setTerpilih((lama) => {
      const baru = new Set(lama)
      if (baru.has(idKontrak)) baru.delete(idKontrak)
      else baru.add(idKontrak)
      return baru
    })
  }

  function unduh() {
    unduhBlob(buatRekapExcel(yangDiunduh), namaFileRekap(yangDiunduh))
    tampilkanToast(yangDiunduh.length === 1 ? 'Excel diunduh: 1 kontrak' : `Excel diunduh: ${yangDiunduh.length} kontrak`)
    onTutup()
  }

  return (
    <DialogKonfirmasi
      terbuka
      lebar
      judul="Unduh Excel"
      pesan="File berisi data kontrak, ketentuan kontrak, status adendum, dan daftar dokumen. Bisa dibuka di Excel atau Google Sheets."
      labelKonfirmasi={yangDiunduh.length > 1 ? `Unduh Excel (${yangDiunduh.length})` : 'Unduh Excel'}
      konfirmasiNonaktif={yangDiunduh.length === 0}
      onKonfirmasi={unduh}
      onBatal={onTutup}
    >
      <fieldset className="m-0 flex min-w-0 flex-col gap-2 border-0 p-0">
        <legend className="mb-2 p-0 text-[14px] font-semibold text-judul">Kontrak yang diunduh</legend>
        {pilihan.map((p) => {
          const dipilih = cakupan === p.nilai
          return (
            <label
              key={p.nilai}
              className={`flex min-h-14 cursor-pointer items-center gap-3.5 rounded-xl border px-4 py-2.5 transition-[background-color,border-color] duration-150 motion-reduce:transition-none ${
                dipilih ? 'border-aksi bg-lembut' : 'border-garis-input bg-white hover:bg-latar'
              }`}
            >
              <input
                type="radio"
                name={`${id}-cakupan`}
                value={p.nilai}
                checked={dipilih}
                onChange={() => setCakupan(p.nilai)}
                className="size-5 flex-none cursor-pointer accent-aksi"
              />
              <span className="flex min-w-0 flex-col">
                <span className="font-semibold text-judul">{p.label}</span>
                <span className="text-[13px] break-words text-teks-lembut">{p.keterangan}</span>
              </span>
            </label>
          )
        })}
      </fieldset>

      {cakupan === 'pilih' && (
        <fieldset className="m-0 mt-4 flex min-w-0 flex-col border-0 p-0">
          <legend className="sr-only">Pilih kontrak</legend>
          <div className="mb-1 flex items-center justify-between gap-3">
            <span aria-live="polite" className="text-[13px] text-teks-lembut">
              {terpilih.size} dari {daftar.length} kontrak dipilih
            </span>
            <button
              type="button"
              onClick={() => setTerpilih(semuaTercentang ? new Set() : new Set(daftar.map((k) => k.id)))}
              className="min-h-11 cursor-pointer border-none bg-transparent px-1 text-[13px] font-semibold text-aksi hover:text-aksi-tua"
            >
              {semuaTercentang ? 'Kosongkan pilihan' : 'Pilih semua'}
            </button>
          </div>
          <div className="max-h-[min(40vh,320px)] overflow-y-auto rounded-xl border border-garis-input">
            {daftar.map((k) => {
              const status = hitungStatus(k)
              return (
                <label
                  key={k.id}
                  className="flex min-h-12 cursor-pointer items-center gap-3 border-t border-garis-lembut px-4 py-2 first:border-t-0 hover:bg-latar"
                >
                  <input
                    type="checkbox"
                    checked={terpilih.has(k.id)}
                    onChange={() => ubahCentang(k.id)}
                    className="size-5 flex-none cursor-pointer accent-aksi"
                  />
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="font-semibold break-words text-judul">{k.nama}</span>
                    <span className="text-[13px] break-words text-teks-lembut">
                      {k.nomorPks}, {TAMPILAN_STATUS[status].label.toLowerCase()}
                    </span>
                  </span>
                </label>
              )
            })}
          </div>
          {terpilih.size === 0 && <p className="m-0 mt-2 text-[13px] text-teks-lembut">Centang minimal satu kontrak untuk mengunduh.</p>}
        </fieldset>
      )}
    </DialogKonfirmasi>
  )
}

export default DialogUnduhExcel
