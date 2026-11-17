// Bagian form untuk mengisi critical point (klausul berisiko): bisa 0, 1, atau lebih butir.
// Tiap butir: jenis, pasal, ringkasan, dan tanggal penting (opsional, ikut diingatkan kalau diisi).

import { butirBaru } from '../lib/formKontrak'
import { LABEL_CRITICAL_POINT } from '../lib/status'
import { KELAS_ISIAN, KELAS_TOMBOL_KEDUA } from '../lib/tataLetak'
import type { CriticalPoint, JenisCriticalPoint } from '../types/kontrak'
import Ikon from './Ikon'

type Props = {
  daftar: CriticalPoint[]
  ubah: (daftar: CriticalPoint[]) => void
  /** Pesan kesalahan bagian ini (misalnya ringkasan kosong). */
  galat?: string
}

function EditorCriticalPoint({ daftar, ubah, galat }: Props) {
  function ubahButir(id: string, perubahan: Partial<CriticalPoint>) {
    ubah(daftar.map((b) => (b.id === id ? { ...b, ...perubahan } : b)))
  }

  return (
    <div className="flex flex-col gap-3">
      {daftar.length === 0 && (
        <p className="m-0 rounded-2xl border border-dashed border-garis-input px-4 py-4 text-teks-lembut">
          Belum ada critical point. Tambahkan klausul berisiko dari PKS, terutama pasal pengakhiran kontrak dan denda.
        </p>
      )}

      {daftar.map((butir, i) => {
        const nomor = i + 1
        const ringkasanKosong = Boolean(galat) && !butir.ringkasan.trim()
        const awalan = `cp-${butir.id}`
        return (
          <fieldset key={butir.id} className="m-0 flex min-w-0 flex-col gap-3 border-0 border-t border-garis-lembut p-0 pt-4 first:border-t-0 first:pt-0">
            <legend className="sr-only">Critical point ke-{nomor}</legend>
            <div className="flex items-center justify-between gap-2">
              <span aria-hidden="true" className="text-[13px] font-bold text-judul">
                Critical point {nomor}
                {butir.status === 'selesai' && <span className="font-normal text-teks-lembut"> · sudah selesai</span>}
              </span>
              <button
                type="button"
                onClick={() => ubah(daftar.filter((b) => b.id !== butir.id))}
                className="-my-1.5 flex min-h-11 cursor-pointer items-center gap-1.5 rounded-full border-none bg-transparent px-3 text-[13px] font-semibold text-hapus-teks hover:bg-hapus-latar"
              >
                <Ikon nama="sampah" ukuran={15} />
                Hapus<span className="sr-only"> critical point ke-{nomor}</span>
              </button>
            </div>

            <div className="grid gap-3 sm:grid-cols-[200px_minmax(0,1fr)_190px]">
              <div className="flex flex-col gap-1.5">
                <label htmlFor={`${awalan}-jenis`} className="text-[13px] font-semibold text-judul">
                  Jenis
                </label>
                <select
                  id={`${awalan}-jenis`}
                  value={butir.jenis}
                  onChange={(e) => ubahButir(butir.id, { jenis: e.target.value as JenisCriticalPoint })}
                  className={`${KELAS_ISIAN} h-11`}
                >
                  {(Object.keys(LABEL_CRITICAL_POINT) as JenisCriticalPoint[]).map((j) => (
                    <option key={j} value={j}>
                      {LABEL_CRITICAL_POINT[j]}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor={`${awalan}-pasal`} className="text-[13px] font-semibold text-judul">
                  Rujukan pasal <span className="font-normal text-teks-lembut">(opsional)</span>
                </label>
                <input
                  id={`${awalan}-pasal`}
                  type="text"
                  value={butir.pasal}
                  onChange={(e) => ubahButir(butir.id, { pasal: e.target.value })}
                  placeholder="Contoh: Pasal 12"
                  className={`${KELAS_ISIAN} h-11`}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor={`${awalan}-tanggal`} className="text-[13px] font-semibold text-judul">
                  Tanggal penting <span className="font-normal text-teks-lembut">(opsional)</span>
                </label>
                <input
                  id={`${awalan}-tanggal`}
                  type="date"
                  value={butir.tanggalPenting}
                  aria-describedby={`${awalan}-tanggal-petunjuk`}
                  onChange={(e) => ubahButir(butir.id, { tanggalPenting: e.target.value })}
                  className={`${KELAS_ISIAN} h-11`}
                />
                <span id={`${awalan}-tanggal-petunjuk`} className="sr-only">
                  Kalau diisi, ikut diingatkan 3, 2, dan 1 bulan sebelumnya.
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor={`${awalan}-ringkasan`} className="text-[13px] font-semibold text-judul">
                Ringkasan <span className="text-hapus-teks" aria-hidden="true">*</span>
              </label>
              <textarea
                id={`${awalan}-ringkasan`}
                rows={2}
                value={butir.ringkasan}
                aria-required
                aria-invalid={ringkasanKosong}
                aria-describedby={ringkasanKosong ? 'galat-critical-point' : undefined}
                onChange={(e) => ubahButir(butir.id, { ringkasan: e.target.value })}
                placeholder="Contoh: Kontrak bisa diakhiri kalau penyedia melanggar dan tidak memperbaiki dalam 10 hari kerja."
                className={`${KELAS_ISIAN} py-2.5`}
              />
            </div>
          </fieldset>
        )
      })}

      {galat && (
        <span id="galat-critical-point" className="flex items-start gap-1.5 text-[13px] font-semibold text-hapus-teks">
          <Ikon nama="info" ukuran={16} className="mt-px flex-none" />
          {galat}
        </span>
      )}

      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={() => ubah([...daftar, butirBaru('pengakhiran')])} className={KELAS_TOMBOL_KEDUA}>
          <Ikon nama="tambah" ukuran={16} tebal={2.5} /> Pengakhiran kontrak
        </button>
        <button type="button" onClick={() => ubah([...daftar, butirBaru('denda')])} className={KELAS_TOMBOL_KEDUA}>
          <Ikon nama="tambah" ukuran={16} tebal={2.5} /> Denda
        </button>
        <button type="button" onClick={() => ubah([...daftar, butirBaru('lainnya')])} className={KELAS_TOMBOL_KEDUA}>
          <Ikon nama="tambah" ukuran={16} tebal={2.5} /> Lainnya
        </button>
      </div>
    </div>
  )
}

export default EditorCriticalPoint
