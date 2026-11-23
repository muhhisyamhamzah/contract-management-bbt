// Halaman Tambah kontrak (/tambah) dan Ubah kontrak (/kontrak/:id/ubah): SATU halaman form, 4 bagian.
// 1 Data kontrak, 2 Waktu dan nilai, 3 Ketentuan kontrak (4 kolom), 4 File PKS (wajib).
// Form ubah: ditambah bagian "Perpanjangan kontrak" paling atas (pilihan ke bawah), jadi bagian lain bergeser satu nomor.
// Mengunggah PKS baru di form ubah TIDAK menghapus PKS lama: semuanya tetap ada di riwayat dokumen.
//
// Alur (Flowchart 2): isi → periksa (kolom wajib, tanggal masuk akal, nomor PKS ganda, file PKS) →
// ringkasan sebagai konfirmasi → simpan → riwayat dicatat → buka Detail.
// Kesalahan ditandai per kolom (pesan + aria-describedby), dan fokus pindah ke kolom pertama yang salah.
// Perpanjangan lewat adendum sebaiknya dicatat di halaman Catat adendum (/kontrak/:id/adendum), supaya file,
// tanggal akhir, dan status berubah bersama. Form ini mengingatkan hal itu saat "Sudah diperpanjang" dipilih.

import { useState, type FormEvent } from 'react'
import type { KetentuanKontrak } from '../types/kontrak'
import { Link, useNavigate, useParams } from 'react-router-dom'
import BagianForm from '../components/BagianForm'
import DialogKonfirmasi from '../components/DialogKonfirmasi'
import KepalaHalaman from '../components/KepalaHalaman'
import Ikon from '../components/Ikon'
import IsianForm from '../components/IsianForm'
import KeadaanKosong from '../components/KeadaanKosong'
import UnggahFile from '../components/UnggahFile'
import PilihanPerpanjangan from '../components/PilihanPerpanjangan'
import { useData } from '../lib/data'
import { useJudulHalaman } from '../lib/judulHalaman'
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
} from '../lib/formKontrak'
import { useKembali } from '../lib/navigasi'
import { jadwalPengingat, LABEL_KETENTUAN, LABEL_PERPANJANGAN, STATUS_PERPANJANGAN } from '../lib/status'
import { KELAS_ISIAN, KELAS_KOTAK, KELAS_TOMBOL_KEDUA, KELAS_TOMBOL_UTAMA, KELAS_WADAH } from '../lib/tataLetak'
import { useToast } from '../lib/toast'

function FormKontrak() {
  const { id } = useParams()
  const navigate = useNavigate()
  const tampilkanToast = useToast()
  const { kontrak: semua, simpanKontrak } = useData()
  const lama = id ? semua.find((k) => k.id === id) : undefined
  const modeUbah = Boolean(id)
  const kembali = useKembali(modeUbah && id ? `/kontrak/${id}` : '/')
  useJudulHalaman(modeUbah ? (lama ? `Ubah kontrak, ${lama.nama}` : 'Kontrak tidak ditemukan') : 'Tambah kontrak')
  const batal = kembali

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
        const el = document.getElementById(`isian-${pertama}`)
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
    navigate(`/kontrak/${idKontrak}`, { replace: true })
  }

  const tanggalSah = data.tanggalMulai && data.tanggalBerakhir && data.tanggalBerakhir > data.tanggalMulai
  const jadwal = data.tanggalBerakhir ? jadwalPengingat(data.tanggalBerakhir) : []

  /** Di form ubah, bagian Perpanjangan kontrak menjadi nomor 1, jadi nomor bagian lain bergeser satu. */
  const geser = modeUbah ? 1 : 0
  const jumlahKetentuan = Object.values(data.ketentuan).filter((isi) => isi.trim()).length
  const ringkasan: [string, string][] = [
    ['Nama kontrak', data.nama],
    ['Penyedia', data.penyedia],
    ['Nomor PKS', data.nomorPks],
    ['Tanggal PKS', data.tanggalPks ? formatTanggal(data.tanggalPks) : '-'],
    ['Masa kontrak', tanggalSah ? `${formatTanggalSingkat(data.tanggalMulai)} sampai ${formatTanggalSingkat(data.tanggalBerakhir)}` : '-'],
    ['Nilai kontrak', data.nilai ? formatRupiah(Number(data.nilai)) : '-'],
    ['Ketentuan kontrak', jumlahKetentuan > 0 ? `${jumlahKetentuan} dari 4 kolom diisi` : 'Belum diisi'],
    ...(modeUbah
      ? [['Perpanjangan kontrak', `${LABEL_PERPANJANGAN[data.perpanjangan]} (${STATUS_PERPANJANGAN[data.perpanjangan].label})`] as [string, string]]
      : []),
    ['File PKS', data.filePks?.nama ?? data.namaPksLama],
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

          {/* Perpanjangan kontrak hanya saat mengubah, dan diletakkan paling atas (Hisyam 18 Nov 2026).
              Kontrak baru selalu "Belum diproses". */}
          {modeUbah && (
            <BagianForm nomor={1} id="perpanjangan" judul="Perpanjangan kontrak">
              <PilihanPerpanjangan nilai={data.perpanjangan} onUbah={(nilai) => ubah('perpanjangan', nilai)} />
              {/* Status "sudah diperpanjang" tanpa tanggal akhir baru membuat data bertentangan
                  (misalnya "Sudah dilakukan adendum" tapi "Habis 18 hari lagi"). Arahkan ke Catat adendum. */}
              {lama && data.perpanjangan === 'diperpanjang' && data.tanggalBerakhir === lama.tanggalBerakhir && (
                <p role="status" className="m-0 flex items-start gap-2.5 rounded-2xl bg-lembut px-4 py-3 text-[14px] text-aksi-tua">
                  <Ikon nama="info" ukuran={18} className="mt-px flex-none" />
                  <span>
                    Akhir kontrak belum berubah. Kalau ada adendum perpanjangan,{' '}
                    <Link to={`/kontrak/${lama.id}/adendum`} className="font-semibold">
                      catat lewat Catat adendum
                    </Link>{' '}
                    supaya file, akhir kontrak, dan pengingat ikut diperbarui.
                  </span>
                </p>
              )}
            </BagianForm>
          )}

          <BagianForm nomor={geser + 1} judul="Data kontrak">
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

          <BagianForm nomor={geser + 2} judul="Waktu dan nilai">
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
            nomor={geser + 3}
            id="ketentuan"
            judul="Ketentuan kontrak"
          >
            {/* Empat kolom bertumpuk ke bawah, lebar penuh dan sama, di semua halaman (Hisyam 18 Nov 2026). */}
            <div className="grid gap-4">
              {(Object.keys(LABEL_KETENTUAN) as (keyof KetentuanKontrak)[]).map((kolom) => (
                <IsianForm key={kolom} id={`isian-ketentuan-${kolom}`} label={LABEL_KETENTUAN[kolom]}>
                  {(props) => (
                    <textarea
                      {...props}
                      rows={4}
                      value={data.ketentuan[kolom]}
                      onChange={(e) => ubah('ketentuan', { ...data.ketentuan, [kolom]: e.target.value })}
                      className={`${KELAS_ISIAN} py-2.5`}
                    />
                  )}
                </IsianForm>
              ))}
            </div>
          </BagianForm>

          <BagianForm nomor={geser + 4} judul="File PKS *" keterangan="Kalau PKS berganti, unggah yang baru. PKS lama tetap tersimpan di daftar dokumen.">
            <UnggahFile
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
