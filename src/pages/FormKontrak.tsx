// Halaman Tambah kontrak (/tambah) dan Ubah kontrak (/kontrak/:id/ubah): SATU halaman form, 4 bagian.
// 1 Data kontrak, 2 Waktu dan nilai, 3 Critical point dan catatan, 4 PDF PKS (wajib).
//
// Alur (Flowchart 2): isi → periksa (kolom wajib, tanggal masuk akal, nomor PKS ganda, PDF) →
// ringkasan sebagai konfirmasi → simpan → riwayat dicatat → buka Detail.
// Kesalahan ditandai per kolom (pesan + aria-describedby), dan fokus pindah ke kolom pertama yang salah.
//
// `tertanam`: dipakai halaman Ubah data (/ubah-data/:id). Form tampil tanpa kepala halaman dan wadah sendiri,
// Batal kembali ke /ubah-data, dan setelah simpan tetap di halaman Ubah data.

import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import BagianForm from '../components/BagianForm'
import DialogKonfirmasi from '../components/DialogKonfirmasi'
import EditorCriticalPoint from '../components/EditorCriticalPoint'
import KepalaHalaman from '../components/KepalaHalaman'
import Ikon from '../components/Ikon'
import IsianForm from '../components/IsianForm'
import KeadaanKosong from '../components/KeadaanKosong'
import UnggahPdf from '../components/UnggahPdf'
import { useData } from '../lib/data'
import { formatPeriode, formatRupiah, formatTanggal, formatTanggalSingkat } from '../lib/format'
import {
  DATA_AWAL,
  dariKontrak,
  denganTitikRibuan,
  hanyaAngka,
  keKontrak,
  periksaForm,
  URUTAN_KOLOM,
  type DataFormKontrak,
  type KolomForm,
} from '../lib/formKontrak'
import { useKembali } from '../lib/navigasi'
import { jadwalPengingat } from '../lib/status'
import { KELAS_ISIAN, KELAS_KOTAK, KELAS_TOMBOL_KEDUA, KELAS_TOMBOL_UTAMA, KELAS_WADAH } from '../lib/tataLetak'
import { useToast } from '../lib/toast'

/** id elemen yang difokus saat kolom itu salah. */
function idKolom(kolom: KolomForm, data: DataFormKontrak): string {
  if (kolom === 'criticalPoint') {
    const kosong = data.criticalPoint.find((b) => !b.ringkasan.trim())
    return kosong ? `cp-${kosong.id}-ringkasan` : 'critical-point'
  }
  return `isian-${kolom}`
}

type Props = {
  /** Form ditanam di halaman Ubah data (tanpa kepala halaman sendiri). */
  tertanam?: boolean
}

function FormKontrak({ tertanam = false }: Props) {
  const { id } = useParams()
  const navigate = useNavigate()
  const tampilkanToast = useToast()
  const { kontrak: semua, simpanKontrak } = useData()
  const lama = id ? semua.find((k) => k.id === id) : undefined
  const modeUbah = Boolean(id)
  const kembali = useKembali(modeUbah && id ? `/kontrak/${id}` : '/')
  const batal = tertanam ? () => navigate('/ubah-data') : kembali

  const [data, setData] = useState<DataFormKontrak>(() => (lama ? dariKontrak(lama) : DATA_AWAL))
  // Kesalahan baru ditampilkan setelah pengguna mencoba menyimpan, lalu ikut diperbarui saat mengetik.
  const [sudahDicoba, setSudahDicoba] = useState(false)
  const [konfirmasi, setKonfirmasi] = useState(false)

  if (modeUbah && !lama) {
    return (
      <>
        <KepalaHalaman judul="Kontrak tidak ditemukan" />
        <main id="konten" className={`${KELAS_WADAH}`}>
          <div className={KELAS_KOTAK}>
            <KeadaanKosong
              ikon="cari"
              judul="Kontrak tidak ditemukan"
              pesan="Mungkin sudah dihapus atau alamatnya salah."
              aksi={
                <Link to="/kontrak" className={KELAS_TOMBOL_KEDUA}>
                  Kembali ke daftar kontrak
                </Link>
              }
            />
          </div>
        </main>
      </>
    )
  }

  const galat = sudahDicoba ? periksaForm(data, semua, lama?.id) : {}
  const jumlahGalat = Object.keys(galat).length

  function ubah<K extends keyof DataFormKontrak>(kolom: K, nilai: DataFormKontrak[K]) {
    setData((sebelum) => ({ ...sebelum, [kolom]: nilai }))
  }

  function kirim(event: FormEvent) {
    event.preventDefault()
    setSudahDicoba(true)
    const hasil = periksaForm(data, semua, lama?.id)
    const pertama = URUTAN_KOLOM.find((kolom) => hasil[kolom])
    if (pertama) {
      // Tunggu satu frame supaya pesan kesalahan sudah tergambar sebelum fokus pindah.
      requestAnimationFrame(() => {
        const el = document.getElementById(idKolom(pertama, data))
        el?.focus()
        el?.scrollIntoView({ block: 'center', behavior: 'smooth' })
      })
      return
    }
    setKonfirmasi(true)
  }

  function simpan() {
    const idKontrak = lama?.id ?? `k-${Date.now()}`
    simpanKontrak(keKontrak(data, idKontrak, lama), !lama)
    setKonfirmasi(false)
    tampilkanToast(modeUbah ? 'Perubahan kontrak tersimpan.' : 'Kontrak tersimpan.')
    if (tertanam) return
    navigate(`/kontrak/${idKontrak}`, { replace: true })
  }

  const tanggalSah = data.tanggalMulai && data.tanggalBerakhir && data.tanggalBerakhir > data.tanggalMulai
  const jadwal = data.tanggalBerakhir ? jadwalPengingat(data.tanggalBerakhir) : []

  const ringkasan: [string, string][] = [
    ['Nama kontrak', data.nama],
    ['Penyedia', data.penyedia],
    ['Nomor PKS', data.nomorPks],
    ['Tanggal PKS', data.tanggalPks ? formatTanggal(data.tanggalPks) : '-'],
    ['Masa kontrak', tanggalSah ? `${formatTanggalSingkat(data.tanggalMulai)} sampai ${formatTanggalSingkat(data.tanggalBerakhir)}` : '-'],
    ['Nilai kontrak', data.nilai ? formatRupiah(Number(data.nilai)) : '-'],
    ['Critical point', data.criticalPoint.length > 0 ? `${data.criticalPoint.length} butir` : 'Tidak ada'],
    ['PDF PKS', data.filePks?.nama ?? data.namaPksLama],
  ]

  const isiForm = (
    <>
        <form noValidate onSubmit={kirim} className={`${KELAS_KOTAK} p-5 md:p-10`}>
          {jumlahGalat > 0 && (
            <div role="alert" className="mb-7 flex gap-3 rounded-2xl bg-hapus-latar px-4 py-3.5 text-hapus-teks">
              <Ikon nama="peringatan" ukuran={20} className="flex-none" />
              <span className="text-[14px]">
                <strong>Ada {jumlahGalat} isian yang perlu diperbaiki.</strong> Kolom yang salah ditandai merah, lengkap
                dengan cara memperbaikinya.
              </span>
            </div>
          )}

          <BagianForm nomor={1} judul="Data kontrak">
            <IsianForm id="isian-nama" label="Nama kontrak" wajib galat={galat.nama}>
              {(props) => (
                <input
                  {...props}
                  type="text"
                  value={data.nama}
                  onChange={(e) => ubah('nama', e.target.value)}
                  placeholder="Contoh: Pemeliharaan jaringan kantor"
                  className={`${KELAS_ISIAN} h-12`}
                />
              )}
            </IsianForm>
            <IsianForm id="isian-penyedia" label="Penyedia" wajib galat={galat.penyedia}>
              {(props) => (
                <input
                  {...props}
                  type="text"
                  value={data.penyedia}
                  onChange={(e) => ubah('penyedia', e.target.value)}
                  placeholder="Nama perusahaan atau instansi penyedia"
                  className={`${KELAS_ISIAN} h-12`}
                />
              )}
            </IsianForm>
            <div className="grid gap-5 md:grid-cols-2">
              <IsianForm
                id="isian-nomorPks"
                label="Nomor PKS"
                wajib
                galat={galat.nomorPks}
                petunjuk="Nomor PKS harus unik. Nomor yang sudah tercatat akan ditolak."
              >
                {(props) => (
                  <input
                    {...props}
                    type="text"
                    value={data.nomorPks}
                    onChange={(e) => ubah('nomorPks', e.target.value)}
                    placeholder="Contoh: 045/BBT/PKS/2026"
                    className={`${KELAS_ISIAN} h-12`}
                  />
                )}
              </IsianForm>
              <IsianForm id="isian-tanggalPks" label="Tanggal PKS" wajib galat={galat.tanggalPks}>
                {(props) => (
                  <input
                    {...props}
                    type="date"
                    value={data.tanggalPks}
                    onChange={(e) => ubah('tanggalPks', e.target.value)}
                    className={`${KELAS_ISIAN} h-12`}
                  />
                )}
              </IsianForm>
            </div>
          </BagianForm>

          <BagianForm nomor={2} judul="Waktu dan nilai">
            <div className="grid gap-5 md:grid-cols-3">
              <IsianForm id="isian-tanggalMulai" label="Awal kontrak" wajib galat={galat.tanggalMulai}>
                {(props) => (
                  <input
                    {...props}
                    type="date"
                    value={data.tanggalMulai}
                    onChange={(e) => ubah('tanggalMulai', e.target.value)}
                    className={`${KELAS_ISIAN} h-12`}
                  />
                )}
              </IsianForm>
              <IsianForm id="isian-tanggalBerakhir" label="Akhir kontrak" wajib galat={galat.tanggalBerakhir}>
                {(props) => (
                  <input
                    {...props}
                    type="date"
                    value={data.tanggalBerakhir}
                    min={data.tanggalMulai || undefined}
                    onChange={(e) => ubah('tanggalBerakhir', e.target.value)}
                    className={`${KELAS_ISIAN} h-12`}
                  />
                )}
              </IsianForm>
              <IsianForm id="isian-nilai" label="Nilai kontrak" wajib galat={galat.nilai}>
                {(props) => (
                  <span className="relative flex">
                    <span aria-hidden="true" className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 font-semibold text-teks-lembut">
                      Rp
                    </span>
                    <input
                      {...props}
                      type="text"
                      inputMode="numeric"
                      value={denganTitikRibuan(data.nilai)}
                      onChange={(e) => ubah('nilai', hanyaAngka(e.target.value))}
                      placeholder="0"
                      className={`${KELAS_ISIAN} h-12 pl-11 text-right font-semibold`}
                    />
                  </span>
                )}
              </IsianForm>
            </div>

            <div aria-live="polite" className="flex flex-col gap-2 rounded-2xl bg-lembut px-4 py-3.5 text-[14px] text-aksi-tua sm:flex-row sm:items-center sm:gap-6">
              <span className="flex items-center gap-2">
                <Ikon nama="pengingat" ukuran={18} className="flex-none" />
                {tanggalSah ? (
                  <span>
                    Pengingat otomatis: <strong>{jadwal.map((t) => formatTanggalSingkat(t.tanggal)).join(', ')}</strong>
                  </span>
                ) : (
                  <span>Pengingat otomatis dikirim 3, 2, dan 1 bulan sebelum akhir kontrak.</span>
                )}
              </span>
              {tanggalSah && (
                <span className="sm:ml-auto">
                  Periode: <strong>{formatPeriode(data.tanggalMulai, data.tanggalBerakhir)}</strong>
                </span>
              )}
            </div>
          </BagianForm>

          <BagianForm
            nomor={3}
            id="critical-point"
            judul="Critical point dan catatan"
            keterangan="Klausul berisiko di PKS, terutama pengakhiran kontrak dan denda. Boleh lebih dari satu, boleh juga kosong."
          >
            <EditorCriticalPoint
              daftar={data.criticalPoint}
              ubah={(daftar) => ubah('criticalPoint', daftar)}
              galat={galat.criticalPoint}
            />
            <div className="grid gap-5 md:grid-cols-3">
              <IsianForm id="isian-monitoring" label="Monitoring">
                {(props) => (
                  <textarea
                    {...props}
                    rows={3}
                    value={data.monitoring}
                    onChange={(e) => ubah('monitoring', e.target.value)}
                    placeholder="Contoh: Uji coba 80%"
                    className={`${KELAS_ISIAN} py-2.5`}
                  />
                )}
              </IsianForm>
              <IsianForm id="isian-catatan" label="Catatan">
                {(props) => (
                  <textarea
                    {...props}
                    rows={3}
                    value={data.catatan}
                    onChange={(e) => ubah('catatan', e.target.value)}
                    className={`${KELAS_ISIAN} py-2.5`}
                  />
                )}
              </IsianForm>
              <IsianForm id="isian-keterangan" label="Keterangan">
                {(props) => (
                  <textarea
                    {...props}
                    rows={3}
                    value={data.keterangan}
                    onChange={(e) => ubah('keterangan', e.target.value)}
                    className={`${KELAS_ISIAN} py-2.5`}
                  />
                )}
              </IsianForm>
            </div>
          </BagianForm>

          <BagianForm nomor={4} judul="PDF PKS *" keterangan="Wajib sebagai bukti kontrak. Adendum dan BAST bisa diunggah nanti di halaman detail.">
            <UnggahPdf
              id="isian-filePks"
              file={data.filePks}
              namaLama={data.namaPksLama}
              onPilih={(file) => ubah('filePks', file)}
              galat={galat.filePks}
            />
          </BagianForm>

          <div className="mt-2 flex flex-col-reverse gap-2.5 pt-6 sm:flex-row sm:justify-end">
            <button type="button" onClick={batal} className={`${KELAS_TOMBOL_KEDUA} h-12 px-6`}>
              Batal
            </button>
            <button type="submit" className={`${KELAS_TOMBOL_UTAMA} h-12 px-6`}>
              <Ikon nama="centang" ukuran={18} tebal={2.5} />
              {modeUbah ? 'Simpan perubahan' : 'Simpan kontrak'}
            </button>
          </div>
        </form>

      <DialogKonfirmasi
        terbuka={konfirmasi}
        lebar
        judul={modeUbah ? 'Simpan perubahan kontrak?' : 'Simpan kontrak ini?'}
        pesan="Periksa sekali lagi. Pengingat akan dijadwalkan otomatis dari tanggal akhir kontrak."
        labelKonfirmasi={modeUbah ? 'Simpan perubahan' : 'Simpan kontrak'}
        labelBatal="Periksa lagi"
        onKonfirmasi={simpan}
        onBatal={() => setKonfirmasi(false)}
      >
        <dl className="m-0 flex flex-col rounded-2xl bg-latar px-4 py-1">
          {ringkasan.map(([label, nilai]) => (
            <div key={label} className="flex justify-between gap-4 border-b border-garis-lembut py-2.5 last:border-b-0">
              <dt className="text-[13px] text-teks-lembut">{label}</dt>
              <dd className="m-0 text-right text-[14px] font-semibold break-words text-judul">{nilai || '-'}</dd>
            </div>
          ))}
        </dl>
      </DialogKonfirmasi>
    </>
  )

  if (tertanam) return isiForm

  return (
    <>
      <KepalaHalaman
        atas={
          modeUbah ? (
            <button
              type="button"
              onClick={batal}
              className="mb-1 -ml-2 inline-flex min-h-11 w-fit cursor-pointer items-center gap-1 rounded-full border-none bg-transparent px-2 text-[14px] font-semibold text-aksi hover:bg-lembut"
            >
              <Ikon nama="kiri" ukuran={18} tebal={2.5} />
              {lama?.nama}
            </button>
          ) : undefined
        }
        judul={modeUbah ? 'Ubah kontrak' : 'Tambah kontrak'}
        keterangan="Isi sesuai dokumen PKS. Kolom bertanda * wajib diisi."
      />

      <main id="konten" className={`${KELAS_WADAH} pb-4`}>{isiForm}</main>
    </>
  )
}

export default FormKontrak
