// Dialog "Unduh Excel" (permintaan atasan, 20 Nov 2026): pilih kontrak yang diunduh, lalu satu tombol Unduh Excel.
// Pilihan: kontrak yang sedang dibuka (hanya dari Detail), semua kontrak, atau pilih sendiri (centang).
// Versi data (Hisyam 23 Nov 2026): satu kontrak bisa punya banyak dokumen (PKS + beberapa adendum). Per kontrak yang
// dicentang, pilih dokumen mana yang diunduh datanya: satu saja (misalnya dokumen 4 dari 7) atau beberapa sekaligus.
// Bawaannya dokumen terbaru. "Semua kontrak" memakai satu pilihan untuk semuanya: terbaru saja atau semua versi.
// File dibuat di browser tanpa library (src/lib/excel.ts, src/lib/rekapExcel.ts).

import { useId, useState } from 'react'
import DialogKonfirmasi from './DialogKonfirmasi'
import { useData } from '../lib/data'
import { urutkanPalingCepatHabis } from '../lib/daftarKontrak'
import { unduhBlob } from '../lib/excel'
import { formatTanggalSingkat } from '../lib/format'
import { buatRekapExcel, namaFileRekap, versiTerpilih, type PilihanUnduh, type PilihanVersi } from '../lib/rekapExcel'
import { hitungStatus, TAMPILAN_STATUS } from '../lib/status'
import { KELAS_ISIAN } from '../lib/tataLetak'
import { useToast } from '../lib/toast'
import { daftarVersi } from '../lib/versiKontrak'
import type { Kontrak } from '../types/kontrak'

type Cakupan = 'ini' | 'semua' | 'pilih'

type Props = {
  terbuka: boolean
  /** Kontrak yang sedang dibuka (dari halaman Detail). Kalau ada, pilihan "Kontrak ini" tampil dan terpilih. */
  kontrakIni?: Kontrak
  /** Versi awal untuk kontrak ini: id PKS/adendum, misalnya Adendum 2 kalau dokumen itu sedang dibuka di Detail. */
  versiAwal?: string
  onTutup: () => void
}

function DialogUnduhExcel({ terbuka, kontrakIni, versiAwal, onTutup }: Props) {
  // Isi dialog dipasang ulang setiap dibuka, supaya pilihan kembali ke bawaan.
  return terbuka ? <IsiDialog kontrakIni={kontrakIni} versiAwal={versiAwal} onTutup={onTutup} /> : null
}

/** Id dokumen versi terbaru, pilihan bawaan setiap kontrak. */
function idTerbaru(k: Kontrak): string[] {
  const id = daftarVersi(k).at(-1)?.dokumen?.id
  return id ? [id] : []
}

/**
 * Kotak centang per PKS/adendum untuk satu kontrak: boleh satu atau beberapa.
 * Tidak tampil kalau kontrak hanya punya satu versi (belum ada adendum).
 */
function PilihVersi({ kontrak, nilai, onUbah }: { kontrak: Kontrak; nilai: string[]; onUbah: (v: string[]) => void }) {
  const versi = daftarVersi(kontrak)
  if (versi.length < 2) return null
  const semuaId = versi.flatMap((v) => (v.dokumen ? [v.dokumen.id] : []))
  const semuaDipilih = nilai.length === semuaId.length

  function ubah(id: string) {
    // Disimpan urut seperti daftar dokumen, supaya baris di Excel juga urut dari dokumen paling lama.
    onUbah(semuaId.filter((x) => (x === id ? !nilai.includes(id) : nilai.includes(x))))
  }

  return (
    <fieldset className="m-0 flex min-w-0 flex-col gap-1.5 border-0 p-0">
      <legend className="mb-1.5 p-0 text-[13px] font-semibold text-judul">
        Dokumen yang diunduh<span className="sr-only">, {kontrak.nama}</span>
        <span className="font-normal text-teks-lembut">
          {' '}
          ({nilai.length} dari {versi.length} dipilih)
        </span>
      </legend>
      <div className="grid gap-1.5 sm:grid-cols-2">
        {versi.map((v) => {
          const id = v.dokumen?.id ?? ''
          const dipilih = nilai.includes(id)
          return (
            <label
              key={id}
              className={`flex min-h-11 cursor-pointer items-center gap-2.5 rounded-xl border px-3 py-1.5 text-[13px] ${
                dipilih ? 'border-aksi bg-white' : 'border-garis-input bg-white hover:bg-latar'
              }`}
            >
              <input
                type="checkbox"
                checked={dipilih}
                onChange={() => ubah(id)}
                className="size-[18px] flex-none cursor-pointer accent-aksi"
              />
              <span className="flex min-w-0 flex-col">
                <span className="font-semibold text-judul">
                  {v.nomor}. {v.label}
                  {v.terbaru ? <span className="font-normal text-teks-lembut"> (terbaru)</span> : null}
                </span>
                <span className="text-[12px] text-teks-lembut">
                  {formatTanggalSingkat(v.mulai)}
                  {v.data ? '' : ', data tidak tercatat'}
                </span>
              </span>
            </label>
          )
        })}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-x-3">
        {nilai.length === 0 ? (
          <p className="m-0 text-[13px] font-semibold text-hapus-teks">Centang minimal satu dokumen.</p>
        ) : (
          <span />
        )}
        <button
          type="button"
          onClick={() => onUbah(semuaDipilih ? idTerbaru(kontrak) : semuaId)}
          className="min-h-11 cursor-pointer border-none bg-transparent px-1 text-[13px] font-semibold text-aksi hover:text-aksi-tua"
        >
          {semuaDipilih ? 'Terbaru saja' : 'Centang semua dokumen'}
        </button>
      </div>
    </fieldset>
  )
}

function IsiDialog({ kontrakIni, versiAwal, onTutup }: Omit<Props, 'terbuka'>) {
  const { kontrak } = useData()
  const tampilkanToast = useToast()
  const id = useId()
  const [cakupan, setCakupan] = useState<Cakupan>(kontrakIni ? 'ini' : 'semua')
  const [terpilih, setTerpilih] = useState<Set<string>>(() => new Set(kontrakIni ? [kontrakIni.id] : []))
  /** Dokumen terpilih per kontrak (id kontrak -> id PKS/adendum). Yang belum diatur berarti dokumen terbaru. */
  const [versi, setVersi] = useState<Record<string, string[]>>(() =>
    kontrakIni && versiAwal ? { [kontrakIni.id]: [versiAwal] } : {},
  )
  /** Versi untuk pilihan "Semua kontrak". */
  const [versiSemua, setVersiSemua] = useState<'terbaru' | 'semua'>('terbaru')

  const daftar = urutkanPalingCepatHabis(kontrak)
  const semuaTercentang = terpilih.size === daftar.length
  const versiDari = (k: Kontrak) => versi[k.id] ?? idTerbaru(k)
  const aturVersi = (k: Kontrak, v: string[]) => setVersi((lama) => ({ ...lama, [k.id]: v }))
  /** Kontrak dengan banyak versi tapi tanpa dokumen tercentang: tombol Unduh dimatikan. */
  const pilihanVersi = (k: Kontrak): PilihanVersi => (daftarVersi(k).length < 2 ? 'terbaru' : versiDari(k))

  const yangDiunduh: PilihanUnduh[] =
    cakupan === 'ini' && kontrakIni
      ? [{ kontrak: kontrakIni, versi: pilihanVersi(kontrakIni) }]
      : cakupan === 'semua'
        ? daftar.map((k) => ({ kontrak: k, versi: versiSemua }))
        : daftar.filter((k) => terpilih.has(k.id)).map((k) => ({ kontrak: k, versi: pilihanVersi(k) }))
  const jumlahBaris = yangDiunduh.reduce((n, p) => n + versiTerpilih(p).length, 0)
  const adaTanpaDokumen = yangDiunduh.some((p) => versiTerpilih(p).length === 0)

  const pilihan: { nilai: Cakupan; label: string; keterangan: string }[] = [
    ...(kontrakIni ? [{ nilai: 'ini' as const, label: 'Kontrak ini saja', keterangan: kontrakIni.nama }] : []),
    { nilai: 'semua', label: 'Semua kontrak', keterangan: `${daftar.length} kontrak` },
    { nilai: 'pilih', label: 'Pilih kontrak dan dokumen', keterangan: 'Centang kontrak, lalu pilih dokumen ke berapa yang diunduh (satu atau beberapa)' },
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
    const kontrakTeks = `${yangDiunduh.length} kontrak`
    tampilkanToast(jumlahBaris > yangDiunduh.length ? `Excel diunduh: ${kontrakTeks}, ${jumlahBaris} versi data` : `Excel diunduh: ${kontrakTeks}`)
    onTutup()
  }

  return (
    <DialogKonfirmasi
      terbuka
      lebar
      judul="Unduh Excel"
      pesan="File berisi data kontrak, ketentuan kontrak, status adendum, dan daftar dokumen. Bisa dibuka di Excel atau Google Sheets."
      labelKonfirmasi={yangDiunduh.length > 1 ? `Unduh Excel (${yangDiunduh.length})` : 'Unduh Excel'}
      konfirmasiNonaktif={yangDiunduh.length === 0 || adaTanpaDokumen}
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

      {cakupan === 'ini' && kontrakIni && (
        <div className="mt-4">
          <PilihVersi kontrak={kontrakIni} nilai={versiDari(kontrakIni)} onUbah={(v) => aturVersi(kontrakIni, v)} />
        </div>
      )}

      {cakupan === 'semua' && (
        <div className="mt-4 flex min-w-0 flex-col gap-1">
          <label htmlFor={`${id}-versi-semua`} className="text-[13px] font-semibold text-judul">
            Versi data tiap kontrak
          </label>
          <select
            id={`${id}-versi-semua`}
            value={versiSemua}
            onChange={(e) => setVersiSemua(e.target.value as 'terbaru' | 'semua')}
            className={`${KELAS_ISIAN} h-11`}
          >
            <option value="terbaru">Data terbaru saja (satu baris per kontrak)</option>
            <option value="semua">Semua versi (satu baris per PKS dan adendum)</option>
          </select>
        </div>
      )}

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
          <div className="max-h-[min(44vh,360px)] overflow-y-auto rounded-xl border border-garis-input">
            {daftar.map((k) => {
              const status = hitungStatus(k)
              const dicentang = terpilih.has(k.id)
              const jumlahVersi = daftarVersi(k).length
              return (
                <div key={k.id} className={`border-t border-garis-lembut first:border-t-0 ${dicentang ? 'bg-latar' : ''}`}>
                  <label className="flex min-h-12 cursor-pointer items-center gap-3 px-4 py-2 hover:bg-latar">
                    <input
                      type="checkbox"
                      checked={dicentang}
                      onChange={() => ubahCentang(k.id)}
                      className="size-5 flex-none cursor-pointer accent-aksi"
                    />
                    <span className="flex min-w-0 flex-1 flex-col">
                      <span className="font-semibold break-words text-judul">{k.nama}</span>
                      <span className="text-[13px] break-words text-teks-lembut">
                        {k.nomorPks}, {TAMPILAN_STATUS[status].label.toLowerCase()}
                        {jumlahVersi > 1 ? `, ${jumlahVersi} dokumen PKS dan adendum` : ''}
                      </span>
                    </span>
                  </label>
                  {/* Pilihan dokumen hanya untuk kontrak yang dicentang dan punya lebih dari satu PKS/adendum. */}
                  {dicentang && jumlahVersi > 1 && (
                    <div className="pr-4 pb-3 pl-4 sm:pl-12">
                      <PilihVersi kontrak={k} nilai={versiDari(k)} onUbah={(v) => aturVersi(k, v)} />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
          {terpilih.size === 0 && <p className="m-0 mt-2 text-[13px] text-teks-lembut">Centang minimal satu kontrak untuk mengunduh.</p>}
        </fieldset>
      )}

      {yangDiunduh.length > 0 && jumlahBaris > yangDiunduh.length && (
        <p className="m-0 mt-3 text-[13px] text-teks-lembut">
          File berisi {jumlahBaris} baris data dari {yangDiunduh.length} kontrak. Total nilai hanya menjumlah data terbaru.
        </p>
      )}
    </DialogKonfirmasi>
  )
}

export default DialogUnduhExcel
