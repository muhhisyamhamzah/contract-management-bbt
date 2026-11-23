// Halaman Catat adendum (/kontrak/:id/adendum). Dipakai saat kontrak diperpanjang lewat adendum.
// Kontrak lama yang diubah, BUKAN kontrak baru: nomor PKS tetap, adendum adalah dokumen dari kontrak yang sama.
//
// Satu form pendek menggantikan tiga langkah terpisah (unggah file, ubah tanggal akhir, ubah status perpanjangan),
// supaya tidak ada yang terlupa. Setelah disimpan:
// - file adendum masuk ke daftar dokumen sebagai nomor berikutnya,
// - akhir kontrak dan nilai kontrak diganti,
// - perpanjangan menjadi "Sudah diperpanjang",
// - pengingat 3, 2, 1 bulan ikut pindah (dihitung dari tanggal akhir yang baru),
// - riwayat mencatat tanggal akhir lama dan baru.
// Adendum yang TIDAK memperpanjang (misalnya hanya mengubah pasal) cukup diunggah lewat kartu Dokumen di Detail.

import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import BagianForm from '../components/BagianForm'
import DialogKonfirmasi from '../components/DialogKonfirmasi'
import Ikon from '../components/Ikon'
import IsianForm from '../components/IsianForm'
import KeadaanKosong from '../components/KeadaanKosong'
import KepalaHalaman from '../components/KepalaHalaman'
import TabelBanding from '../components/TabelBanding'
import UnggahFile from '../components/UnggahFile'
import { useData } from '../lib/data'
import { useJudulHalaman } from '../lib/judulHalaman'
import { formatPeriode, formatRupiah, formatTanggal, formatTanggalSingkat, geserTanggal, hariIniTeks } from '../lib/format'
import { denganTitikRibuan, hanyaAngka, type FileDipilih } from '../lib/formKontrak'
import { useKembali } from '../lib/navigasi'
import { jadwalPengingat, STATUS_PERPANJANGAN } from '../lib/status'
import { KELAS_ISIAN, KELAS_KOTAK, KELAS_TOMBOL_KEDUA, KELAS_TOMBOL_UTAMA, KELAS_WADAH } from '../lib/tataLetak'
import { useToast } from '../lib/toast'

type IsianAdendum = {
  file: FileDipilih | null
  tanggalAdendum: string
  tanggalBerakhir: string
  nilai: string
}

type KolomAdendum = keyof IsianAdendum
/** Urutan kolom di layar, untuk memindah fokus ke kolom pertama yang salah. */
const URUTAN: KolomAdendum[] = ['file', 'tanggalAdendum', 'tanggalBerakhir', 'nilai']

function CatatAdendum() {
  const { id } = useParams()
  const navigate = useNavigate()
  const tampilkanToast = useToast()
  const { kontrak: semua, catatAdendum } = useData()
  const kontrak = semua.find((k) => k.id === id)
  const kembali = useKembali(id ? `/kontrak/${id}` : '/kontrak')
  useJudulHalaman(kontrak ? `Catat adendum, ${kontrak.nama}` : 'Kontrak tidak ditemukan')

  const [isian, setIsian] = useState<IsianAdendum>(() => ({
    file: null,
    tanggalAdendum: hariIniTeks(),
    tanggalBerakhir: '',
    nilai: kontrak ? String(kontrak.nilai) : '',
  }))
  const [sudahDicoba, setSudahDicoba] = useState(false)
  const [konfirmasi, setKonfirmasi] = useState(false)

  if (!kontrak) {
    return (
      <>
        <KepalaHalaman judul="Kontrak tidak ditemukan" />
        <main id="konten" className={KELAS_WADAH}>
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

  const ke = kontrak.dokumen.filter((d) => d.jenis === 'Adendum').length + 1

  function periksa(data: IsianAdendum): Partial<Record<KolomAdendum, string>> {
    const galat: Partial<Record<KolomAdendum, string>> = {}
    if (!data.file) galat.file = 'Unggah file adendum yang sudah ditandatangani.'
    if (!data.tanggalAdendum) galat.tanggalAdendum = 'Isi tanggal adendum, sesuai yang tertulis di dokumen.'
    if (!data.tanggalBerakhir) galat.tanggalBerakhir = 'Isi akhir kontrak yang baru, sesuai dokumen adendum.'
    else if (kontrak && data.tanggalBerakhir <= kontrak.tanggalBerakhir)
      galat.tanggalBerakhir = `Harus setelah akhir kontrak sekarang (${formatTanggal(kontrak.tanggalBerakhir)}). Kalau adendum tidak memperpanjang, unggah filenya lewat kartu Dokumen di halaman detail.`
    if (!data.nilai || Number(data.nilai) <= 0) galat.nilai = 'Isi nilai kontrak setelah adendum. Biarkan sama kalau tidak berubah.'
    return galat
  }

  const galat = sudahDicoba ? periksa(isian) : {}
  const jumlahGalat = Object.keys(galat).length

  function ubah<K extends KolomAdendum>(kolom: K, nilai: IsianAdendum[K]) {
    setIsian((lama) => ({ ...lama, [kolom]: nilai }))
  }

  function kirim(event: FormEvent) {
    event.preventDefault()
    setSudahDicoba(true)
    const hasil = periksa(isian)
    const pertama = URUTAN.find((kolom) => hasil[kolom])
    if (pertama) {
      requestAnimationFrame(() => {
        const el = document.getElementById(`isian-adendum-${pertama}`)
        el?.focus()
        el?.scrollIntoView({ block: 'center', behavior: 'smooth' })
      })
      return
    }
    setKonfirmasi(true)
  }

  function simpan() {
    if (!kontrak || !isian.file) return
    catatAdendum(kontrak.id, {
      dokumen: {
        nama: isian.file.nama,
        jenis: 'Adendum',
        ukuran: isian.file.ukuran,
        tanggal: isian.tanggalAdendum,
        url: isian.file.url,
      },
      tanggalBerakhir: isian.tanggalBerakhir,
      nilai: Number(isian.nilai),
    })
    setKonfirmasi(false)
    tampilkanToast('Adendum tersimpan.')
    navigate(`/kontrak/${kontrak.id}`, { replace: true })
  }

  // Perbandingan sebelum dan sesudah, ditampilkan langsung saat mengisi supaya akibatnya jelas.
  const akhirSah = Boolean(isian.tanggalBerakhir) && isian.tanggalBerakhir > kontrak.tanggalBerakhir
  const nilaiBaru = Number(isian.nilai) || 0
  const perbandingan: [string, string, string][] = [
    [
      'Akhir kontrak',
      formatTanggalSingkat(kontrak.tanggalBerakhir),
      akhirSah ? formatTanggalSingkat(isian.tanggalBerakhir) : '-',
    ],
    [
      'Masa kontrak',
      formatPeriode(kontrak.tanggalMulai, kontrak.tanggalBerakhir),
      akhirSah ? formatPeriode(kontrak.tanggalMulai, isian.tanggalBerakhir) : '-',
    ],
    ['Nilai kontrak', formatRupiah(kontrak.nilai), nilaiBaru ? formatRupiah(nilaiBaru) : '-'],
    [
      'Pengingat',
      jadwalPengingat(kontrak.tanggalBerakhir)
        .map((t) => formatTanggalSingkat(t.tanggal))
        .join(', '),
      akhirSah
        ? jadwalPengingat(isian.tanggalBerakhir)
            .map((t) => formatTanggalSingkat(t.tanggal))
            .join(', ')
        : '-',
    ],
    ['Status adendum', STATUS_PERPANJANGAN[kontrak.perpanjangan].label, STATUS_PERPANJANGAN.diperpanjang.label],
  ]

  // Tabel "Sekarang | Setelah adendum": laptop tabel, HP daftar bertumpuk (komponen bersama TabelBanding).
  const tabelPerbandingan = <TabelBanding judulKiri="Sekarang" judulKanan="Setelah adendum" baris={perbandingan} />

  return (
    <>
      <KepalaHalaman
        atas={
          <button
            type="button"
            onClick={kembali}
            className="mb-1 -ml-2 inline-flex min-h-11 w-fit cursor-pointer items-center gap-1 rounded-full border-none bg-transparent px-2 text-[14px] font-semibold text-aksi hover:bg-lembut"
          >
            <Ikon nama="kiri" ukuran={18} tebal={2.5} />
            {kontrak.nama}
          </button>
        }
        judul={`Catat adendum ke-${ke}`}
        keterangan={`Untuk kontrak yang diperpanjang. Data kontrak ${kontrak.nomorPks} diperbarui, tidak dibuat kontrak baru. Kolom bertanda * wajib diisi.`}
      />

      <main id="konten" className={`${KELAS_WADAH} pb-4`}>
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

          <BagianForm nomor={1} id="file-adendum" judul="Dokumen adendum *">
            <UnggahFile
              id="isian-adendum-file"
              file={isian.file}
              namaLama=""
              labelFile="adendum"
              onPilih={(file) => ubah('file', file)}
              galat={galat.file}
            />
            <IsianForm id="isian-adendum-tanggalAdendum" label="Tanggal adendum" wajib galat={galat.tanggalAdendum} className="sm:max-w-[280px]">
              {(props) => (
                <input
                  {...props}
                  type="date"
                  value={isian.tanggalAdendum}
                  onChange={(e) => ubah('tanggalAdendum', e.target.value)}
                  className={`${KELAS_ISIAN} h-12`}
                />
              )}
            </IsianForm>
          </BagianForm>

          <BagianForm nomor={2} id="perubahan" judul="Perubahan kontrak">
            <div className="grid gap-5 md:grid-cols-2">
              <IsianForm
                id="isian-adendum-tanggalBerakhir"
                label="Akhir kontrak baru"
                wajib
                galat={galat.tanggalBerakhir}
                petunjuk={`Sekarang ${formatTanggal(kontrak.tanggalBerakhir)}.`}
              >
                {(props) => (
                  <input
                    {...props}
                    type="date"
                    value={isian.tanggalBerakhir}
                    // Paling cepat sehari setelah akhir sekarang, sama dengan aturan pemeriksaan.
                    min={geserTanggal(kontrak.tanggalBerakhir, 1)}
                    onChange={(e) => ubah('tanggalBerakhir', e.target.value)}
                    className={`${KELAS_ISIAN} h-12`}
                  />
                )}
              </IsianForm>
              <IsianForm
                id="isian-adendum-nilai"
                label="Nilai kontrak setelah adendum"
                wajib
                galat={galat.nilai}
                petunjuk="Biarkan sama kalau nilai tidak berubah."
              >
                {(props) => (
                  <span className="relative flex">
                    <span aria-hidden="true" className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 font-semibold text-teks-lembut">
                      Rp
                    </span>
                    <input
                      {...props}
                      type="text"
                      inputMode="numeric"
                      value={denganTitikRibuan(isian.nilai)}
                      onChange={(e) => ubah('nilai', hanyaAngka(e.target.value))}
                      className={`${KELAS_ISIAN} h-12 pl-11 text-right font-semibold`}
                    />
                  </span>
                )}
              </IsianForm>
            </div>

            {/* Tabel tidak dijadikan live region: kalau iya, setiap ketikan di kolom nilai membuat pembaca layar
                membacakan ulang seluruh tabel. Yang diumumkan cukup satu kalimat, dan hanya saat tanggal berubah. */}
            <div className="flex flex-col gap-2">
              <p className="m-0 text-[13px] font-semibold text-judul">Yang berubah setelah disimpan</p>
              {tabelPerbandingan}
              <p aria-live="polite" className="sr-only">
                {akhirSah
                  ? `Akhir kontrak menjadi ${formatTanggal(isian.tanggalBerakhir)}. Pengingat pertama ${formatTanggal(jadwalPengingat(isian.tanggalBerakhir)[0].tanggal)}.`
                  : ''}
              </p>
            </div>
          </BagianForm>

          <div className="mt-2 flex flex-col-reverse gap-2.5 pt-6 sm:flex-row sm:justify-end">
            <button type="button" onClick={kembali} className={`${KELAS_TOMBOL_KEDUA} h-12 px-6`}>
              Batal
            </button>
            <button type="submit" className={`${KELAS_TOMBOL_UTAMA} h-12 px-6`}>
              <Ikon nama="centang" ukuran={18} tebal={2.5} />
              Simpan adendum
            </button>
          </div>
        </form>
      </main>

      <DialogKonfirmasi
        terbuka={konfirmasi}
        lebar
        judul={`Simpan adendum ke-${ke}?`}
        pesan={`Data "${kontrak.nama}" akan diperbarui seperti di bawah. Pengingat lama diganti dengan jadwal baru.`}
        labelKonfirmasi="Simpan adendum"
        labelBatal="Periksa lagi"
        onKonfirmasi={simpan}
        onBatal={() => setKonfirmasi(false)}
      >
        {tabelPerbandingan}
        {isian.file && <p className="m-0 mt-3 text-[13px] text-teks-lembut">File: {isian.file.nama}</p>}
      </DialogKonfirmasi>
    </>
  )
}

export default CatatAdendum
