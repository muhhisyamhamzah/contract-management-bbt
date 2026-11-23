// Halaman detail satu kontrak. Alamatnya /kontrak/:id, misalnya /kontrak/5.
// Isi: header (kembali, status, nama, penyedia, tombol Ubah, Catat adendum, Tandai selesai, menu hapus).
// "Catat adendum" membuka /kontrak/:id/adendum: perpanjangan dicatat di kontrak ini, bukan kontrak baru.
// Tata letak dua kolom (gaya referensi dari Hisyam, 18 Nov 2026):
// - kiri: data kontrak (ringkas), ketentuan kontrak yang terisi, riwayat (kalau ada)
// Disederhanakan (Hisyam 18 Nov 2026): tanpa banner keputusan, tanpa garis jadwal pengingat,
// nama/penyedia/nomor PKS tidak diulang karena sudah ada di judul.
// - kanan: dropdown dokumen bernomor (PKS awal, adendum, ...), tombol unggah, lalu pratinjau file

import { useState, type ReactNode } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import BadgeStatus from '../components/BadgeStatus'
import DaftarDokumen from '../components/DaftarDokumen'
import DialogKonfirmasi from '../components/DialogKonfirmasi'
import KepalaHalaman from '../components/KepalaHalaman'
import Ikon from '../components/Ikon'
import KartuBagian from '../components/KartuBagian'
import KeadaanKosong from '../components/KeadaanKosong'
import PratinjauDokumen from '../components/PratinjauDokumen'
import MenuDropdown from '../components/MenuDropdown'
import DialogUnduhExcel from '../components/DialogUnduhExcel'
import RiwayatKontrak from '../components/RiwayatKontrak'
import { useData } from '../lib/data'
import { useJudulHalaman } from '../lib/judulHalaman'
import { formatPeriode, formatRupiah, formatTanggal, formatTanggalSingkat } from '../lib/format'
import { useKembali } from '../lib/navigasi'
import { hitungStatus, jadwalPengingat, LABEL_KETENTUAN, STATUS_PERPANJANGAN, teksJarakHari, teksSisaHari } from '../lib/status'
import { cariVersi } from '../lib/versiKontrak'
import TabelBanding, { type BarisBanding } from '../components/TabelBanding'
import type { KetentuanKontrak, VersiKontrak } from '../types/kontrak'
import { urutkanDokumen } from '../lib/daftarKontrak'
import StatusAdendum from '../components/StatusAdendum'
import {
  KELAS_ISIAN,
  KELAS_KOTAK,
  KELAS_TAUTAN_AKSI,
  KELAS_TOMBOL_UTAMA,
  KELAS_TOMBOL_KEDUA,
  KELAS_WADAH,
} from '../lib/tataLetak'
import { useToast } from '../lib/toast'

function DetailKontrak() {
  const { id } = useParams()
  const navigate = useNavigate()
  const tampilkanToast = useToast()
  const { kontrak: semua, riwayat, hapusKontrak, tandaiSelesai, bukaKembaliKontrak, tambahDokumen } = useData()
  // Kalau halaman dibuka langsung lewat alamat, tombol Kembali menuju daftar kontrak.
  const kembali = useKembali('/kontrak')

  const [konfirmasiHapus, setKonfirmasiHapus] = useState(false)
  const [konfirmasiSelesai, setKonfirmasiSelesai] = useState(false)
  const [konfirmasiBuka, setKonfirmasiBuka] = useState(false)
  const [unduhExcel, setUnduhExcel] = useState(false)
  const [keteranganSelesai, setKeteranganSelesai] = useState('')
  // Dokumen yang sedang dipratinjau. Kosong berarti dokumen pertama (biasanya PKS utama).
  const [dokumenDilihat, setDokumenDilihat] = useState<string | null>(null)

  const kontrak = semua.find((k) => k.id === id)
  useJudulHalaman(kontrak ? kontrak.nama : 'Kontrak tidak ditemukan')

  if (!kontrak) {
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

  const status = hitungStatus(kontrak)
  const sudahSelesai = status === 'selesai'
  // Tombol utama mengikuti keadaan (impeccable critique/polish, 19 Nov 2026). Dulu "Tandai selesai" selalu navy,
  // juga pada kontrak yang baru diperpanjang, sehingga tindakan yang sulit dibatalkan menjadi yang paling menonjol.
  // - berjalan: tidak ada tombol utama;
  // - segera habis / lewat: keputusan perpanjang (Catat adendum) atau Tandai selesai. Yang sudah diputuskan di
  //   Status adendum menjadi tombol utama; kalau belum diputuskan, keduanya setara.
  const perluKeputusan = status === 'segera' || status === 'lewat'
  const tombolUtama: 'adendum' | 'selesai' | null = !perluKeputusan
    ? null
    : kontrak.perpanjangan === 'proses'
      ? 'adendum'
      : kontrak.perpanjangan === 'tidak'
        ? 'selesai'
        : null
  // Kontrak yang mendekati / melewati akhir tapi perpanjangannya belum diputuskan mendapat kotak keputusan di atas
  // isi halaman ("Kontrak ini lewat 8 hari. Diperpanjang?"). Tombol Catat adendum dan Tandai selesai pindah ke kotak
  // itu supaya tidak ganda di kepala halaman (impeccable clarify, 19 Nov 2026).
  const tampilKeputusan = perluKeputusan && kontrak.perpanjangan === 'belum'
  const kalimatSisa = status === 'lewat' ? teksSisaHari(kontrak).toLowerCase() : `habis ${teksJarakHari(kontrak.tanggalBerakhir)}`
  // Tandai selesai mengubah status adendum yang belum diputuskan / sedang diproses menjadi "Tidak diperpanjang".
  const selesaiMengubahAdendum = kontrak.perpanjangan === 'belum' || kontrak.perpanjangan === 'proses'
  const riwayatKontrak = riwayat.filter((r) => r.kontrakId === kontrak.id)
  const jumlahAdendum = kontrak.dokumen.filter((d) => d.jenis === 'Adendum').length

  const pengingat = jadwalPengingat(kontrak.tanggalBerakhir)
  const dataKontrak: [string, ReactNode][] = [
    ['Tanggal PKS', formatTanggal(kontrak.tanggalPks)],
    [
      'Masa kontrak',
      `${formatTanggalSingkat(kontrak.tanggalMulai)} sampai ${formatTanggalSingkat(kontrak.tanggalBerakhir)} (${formatPeriode(kontrak.tanggalMulai, kontrak.tanggalBerakhir)})`,
    ],
    ['Nilai kontrak', formatRupiah(kontrak.nilai)],
    // Jumlah hari selalu ditulis (juga untuk kontrak yang masih lama), bukan hanya "Berjalan".
    ['Sisa kontrak', sudahSelesai ? 'Sudah selesai' : status === 'lewat' ? teksSisaHari(kontrak) : teksJarakHari(kontrak.tanggalBerakhir)],
    ['Status adendum', <StatusAdendum perpanjangan={kontrak.perpanjangan} />],
    ['Jumlah adendum', jumlahAdendum > 0 ? `${jumlahAdendum} kali` : 'Belum ada'],
    ['Pengingat', sudahSelesai ? 'Berhenti' : pengingat.map((t) => formatTanggalSingkat(t.tanggal)).join(', ')],
  ]
  // Bawaan: dokumen paling baru (PKS atau adendum terakhir) yang tampil di pratinjau.
  const dokumenTerpilih = kontrak.dokumen.find((d) => d.id === dokumenDilihat) ?? urutkanDokumen(kontrak.dokumen).at(-1)

  const ketentuanTerisi = (Object.keys(LABEL_KETENTUAN) as (keyof typeof LABEL_KETENTUAN)[]).filter((kolom) =>
    kontrak.ketentuan[kolom].trim(),
  )

  // --- Versi dokumen yang dibuka (permintaan atasan, 20 Nov 2026) ---
  // Kalau dokumen yang dibuka bukan versi terbaru (misalnya Adendum 2), data kontrak, ketentuan, dan riwayat
  // ditampilkan berdampingan: saat dokumen itu berlaku, dan terbaru. Lihat src/lib/versiKontrak.ts.
  const versiDibuka = dokumenTerpilih ? cariVersi(kontrak, dokumenTerpilih) : null
  const banding = versiDibuka && !versiDibuka.terbaru ? versiDibuka : null
  const labelVersi = !banding
    ? ''
    : banding.dokumenVersi.jenis === 'Adendum'
      ? `Adendum ke-${banding.jumlahAdendum}`
      : banding.jumlahAdendum === 0
        ? 'PKS awal'
        : 'PKS pengganti'
  const isiBanding = banding?.data
  const masa = (v: VersiKontrak) =>
    `${formatTanggalSingkat(v.tanggalMulai)} sampai ${formatTanggalSingkat(v.tanggalBerakhir)} (${formatPeriode(v.tanggalMulai, v.tanggalBerakhir)})`
  const barisDataBanding: BarisBanding[] = !isiBanding || !banding
    ? []
    : [
        ['Nama kontrak', isiBanding.nama, kontrak.nama],
        ['Penyedia', isiBanding.penyedia, kontrak.penyedia],
        ['Nomor PKS', isiBanding.nomorPks, kontrak.nomorPks],
        ['Tanggal PKS', formatTanggal(isiBanding.tanggalPks), formatTanggal(kontrak.tanggalPks)],
        ['Masa kontrak', masa(isiBanding), masa(kontrak)],
        ['Nilai kontrak', formatRupiah(isiBanding.nilai), formatRupiah(kontrak.nilai)],
        ['Status adendum', STATUS_PERPANJANGAN[isiBanding.perpanjangan].label, STATUS_PERPANJANGAN[kontrak.perpanjangan].label],
        [
          'Jumlah adendum',
          banding.jumlahAdendum > 0 ? `${banding.jumlahAdendum} kali` : 'Belum ada',
          jumlahAdendum > 0 ? `${jumlahAdendum} kali` : 'Belum ada',
        ],
      ]
  const barisKetentuanBanding: BarisBanding[] = !isiBanding
    ? []
    : (Object.keys(LABEL_KETENTUAN) as (keyof KetentuanKontrak)[]).map((kolom) => [
        LABEL_KETENTUAN[kolom],
        isiBanding.ketentuan[kolom].trim() || '-',
        kontrak.ketentuan[kolom].trim() || '-',
      ])
  // Riwayat dibagi dua: sampai versi ini berlaku (sebelum versi berikutnya), lalu sesudahnya sampai terbaru.
  const riwayatSampaiVersi = banding
    ? riwayatKontrak.filter((r) => !banding.sampai || r.waktu.slice(0, 10) < banding.sampai)
    : []
  const riwayatSesudahVersi = banding ? riwayatKontrak.filter((r) => !riwayatSampaiVersi.includes(r)) : []

  function hapus() {
    if (!kontrak) return
    setKonfirmasiHapus(false)
    hapusKontrak(kontrak.id)
    tampilkanToast('Kontrak dihapus.')
    navigate('/kontrak', { replace: true })
  }

  return (
    <>
      <KepalaHalaman
        atas={
          <div className="mb-1 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={kembali}
              className="-ml-2 inline-flex min-h-11 cursor-pointer items-center gap-1 rounded-full border-none bg-transparent px-2 text-[14px] font-semibold text-aksi hover:bg-lembut"
            >
              <Ikon nama="kiri" ukuran={18} tebal={2.5} />
              Kontrak
            </button>
            <BadgeStatus status={status}>
              {status === 'segera' ? `Habis ${teksSisaHari(kontrak)}` : teksSisaHari(kontrak)}
            </BadgeStatus>
          </div>
        }
        judul={kontrak.nama}
        keterangan={
          <span className="flex flex-wrap gap-x-5 gap-y-0.5">
            <span>{kontrak.penyedia}</span>
            <span>Nomor PKS {kontrak.nomorPks}</span>
          </span>
        }
        aksi={
          // Tombol utama (navy) mengikuti keadaan kontrak, lihat `tombolUtama` di atas.
          // HP: Ubah dan Catat adendum berdua di baris pertama (lebar sama), Tandai selesai melebar di baris kedua
          // bersama menu. Urutan yang terlihat = urutan Tab = urutan di laptop (impeccable polish, 19 Nov 2026).
          // Mulai sm: satu baris. Kolom: [setengah lebar][sisa][44px menu] (gap-2.5 = 10px), jadi Ubah (kolom 1)
          // dan Catat adendum (kolom 2+3) tepat setengah lebar, Tandai selesai (kolom 1+2) + menu (kolom 3).
          <div className="grid w-full grid-cols-[calc(50%-5px)_1fr_44px] gap-2.5 sm:flex sm:w-auto sm:items-center">
            <Link
              to={`/kontrak/${kontrak.id}/ubah`}
              className={`${KELAS_TOMBOL_KEDUA} ${sudahSelesai || tampilKeputusan ? 'col-span-2' : ''}`}
            >
              <Ikon nama="pensil" ukuran={17} />
              Ubah
            </Link>
            {!sudahSelesai && !tampilKeputusan && (
              <Link
                to={`/kontrak/${kontrak.id}/adendum`}
                className={`${tombolUtama === 'adendum' ? KELAS_TOMBOL_UTAMA : KELAS_TOMBOL_KEDUA} col-span-2`}
              >
                <Ikon nama="kalender" ukuran={17} />
                Catat adendum
              </Link>
            )}
            {!sudahSelesai && !tampilKeputusan && (
              <button
                type="button"
                onClick={() => {
                  setKeteranganSelesai('')
                  setKonfirmasiSelesai(true)
                }}
                className={`${tombolUtama === 'selesai' ? KELAS_TOMBOL_UTAMA : KELAS_TOMBOL_KEDUA} col-span-2`}
              >
                <Ikon nama="centang" ukuran={17} tebal={2.5} />
                Tandai selesai
              </button>
            )}
            <span className="flex">
              <MenuDropdown
                labelTombol="Menu lainnya"
                isiTombol={<Ikon nama="titikTiga" />}
                kelasTombol="flex size-11 cursor-pointer items-center justify-center rounded-full border border-garis-input bg-white text-judul hover:bg-latar"
                lebar={230}
                item={[
                  ...(sudahSelesai ? [{ label: 'Buka kembali kontrak', onPilih: () => setKonfirmasiBuka(true) }] : []),
                  { label: 'Unduh Excel data kontrak', onPilih: () => setUnduhExcel(true) },
                  { label: 'Unduh semua dokumen', onPilih: () => tampilkanToast('Dokumen diunduh (contoh)') },
                  { label: 'Hapus kontrak', bahaya: true, onPilih: () => setKonfirmasiHapus(true) },
                ]}
              />
            </span>
          </div>
        }
      />

      <main id="konten" className={`${KELAS_WADAH} grid items-start gap-5 pb-4 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]`}>
        {tampilKeputusan && (
          <section
            aria-labelledby="judul-keputusan"
            className={`flex flex-col gap-3 rounded-[20px] p-4 md:flex-row md:items-center md:justify-between md:gap-6 md:px-6 lg:col-span-2 ${
              status === 'lewat' ? 'bg-lewat-latar text-lewat-teks' : 'bg-segera-latar text-segera-teks'
            }`}
          >
            <div className="flex gap-3">
              <Ikon nama="peringatan" ukuran={20} className="mt-0.5 flex-none" />
              <div className="flex flex-col gap-0.5">
                <h2 id="judul-keputusan" className="m-0 text-[16px] font-bold tracking-normal">
                  Kontrak ini {kalimatSisa}. Diperpanjang?
                </h2>
                <p className="m-0 text-[14px]">
                  Kalau diperpanjang, catat adendumnya supaya akhir kontrak dan pengingat ikut pindah. Kalau tidak, tandai
                  selesai.
                </p>
              </div>
            </div>
            {/* HP: bertumpuk selebar kotak (label tombol panjang); mulai sm: berdampingan. */}
            <div className="flex flex-col gap-2.5 sm:flex-row md:flex-none">
              <Link to={`/kontrak/${kontrak.id}/adendum`} className={KELAS_TOMBOL_KEDUA}>
                <Ikon nama="kalender" ukuran={17} />
                Ya, catat adendum
              </Link>
              <button
                type="button"
                onClick={() => {
                  setKeteranganSelesai('')
                  setKonfirmasiSelesai(true)
                }}
                className={KELAS_TOMBOL_KEDUA}
              >
                <Ikon nama="centang" ukuran={17} tebal={2.5} />
                Tidak, tandai selesai
              </button>
            </div>
          </section>
        )}
        <div className="flex min-w-0 flex-col gap-5">
          {sudahSelesai && (
            <div role="status" className="flex gap-3 rounded-[20px] bg-selesai-latar p-4 text-selesai-teks">
              <Ikon nama="centangLingkaran" ukuran={20} className="flex-none" />
              <span>
                <strong>Kontrak sudah ditandai selesai.</strong> Pengingat untuk kontrak ini sudah berhenti.
                {kontrak.keteranganSelesai && <> Keterangan: {kontrak.keteranganSelesai}</>}{' '}
                {/* Salah tutup bisa dibatalkan di sini atau lewat menu ⋮ (impeccable harden, 19 Nov 2026). */}
                <button
                  type="button"
                  onClick={() => setKonfirmasiBuka(true)}
                  className="inline cursor-pointer border-none bg-transparent p-0 font-semibold text-selesai-teks underline underline-offset-2"
                >
                  Buka kembali kontrak
                </button>
              </span>
            </div>
          )}

          {banding && dokumenTerpilih && (
            <div role="status" className="flex flex-col gap-3 rounded-[20px] bg-lembut p-4 text-aksi-tua">
              <span className="flex gap-3">
                <Ikon nama="riwayat" ukuran={20} className="mt-0.5 flex-none" />
                <span>
                  Anda membuka <strong className="break-words">{dokumenTerpilih.nama}</strong>.{' '}
                  {isiBanding ? (
                    <>
                      Data di bawah membandingkan kontrak saat {labelVersi} berlaku ({formatTanggalSingkat(banding.mulai)}
                      {banding.sampai ? ` sampai ${formatTanggalSingkat(banding.sampai)}` : ''}) dengan data terbaru.
                    </>
                  ) : (
                    <>Data kontrak saat {labelVersi} berlaku tidak tercatat, jadi yang tampil adalah data terbaru.</>
                  )}
                </span>
              </span>
              <button
                type="button"
                onClick={() => setDokumenDilihat(null)}
                className={`${KELAS_TOMBOL_KEDUA} self-start`}
              >
                Lihat dokumen terbaru
              </button>
            </div>
          )}

          <KartuBagian
            id="data-kontrak"
            judul="Data kontrak"
            keterangan={isiBanding ? `Saat ${labelVersi} dan terbaru` : undefined}
          >
            {isiBanding ? (
              <TabelBanding judulKiri={`Saat ${labelVersi}`} judulKanan="Terbaru" kosongBerubah baris={barisDataBanding} />
            ) : (
            /* Label di kiri, isi di kanan (gaya referensi). Di HP tetap berdampingan, isi boleh turun baris. */
            <dl className="m-0">
              {dataKontrak.map(([label, nilai]) => (
                <div key={label} className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b border-garis-lembut py-3 last:border-b-0">
                  <dt className="flex-none text-[14px] text-teks-lembut">{label}</dt>
                  <dd className="m-0 ml-auto text-right text-[15px] font-semibold break-words text-judul">{nilai}</dd>
                </div>
              ))}
            </dl>
            )}
          </KartuBagian>

          <KartuBagian
            id="ketentuan"
            judul="Ketentuan kontrak"
            keterangan={isiBanding ? `Saat ${labelVersi} dan terbaru` : undefined}
            aksi={
              <Link to={`/kontrak/${kontrak.id}/ubah#ketentuan`} className={KELAS_TAUTAN_AKSI}>
                <Ikon nama="pensil" ukuran={15} /> Ubah<span className="sr-only"> ketentuan kontrak</span>
              </Link>
            }
          >
            {isiBanding ? (
              <TabelBanding judulKiri={`Saat ${labelVersi}`} judulKanan="Terbaru" kosongBerubah baris={barisKetentuanBanding} />
            ) : ketentuanTerisi.length > 0 ? (
              <dl className="m-0 flex flex-col gap-4">
                {ketentuanTerisi.map((kolom) => (
                  <div key={kolom} className="flex flex-col gap-0.5">
                    <dt className="text-[13px] font-semibold text-teks-lembut">{LABEL_KETENTUAN[kolom]}</dt>
                    <dd className="m-0 max-w-[72ch] leading-relaxed text-judul">{kontrak.ketentuan[kolom]}</dd>
                  </div>
                ))}
              </dl>
            ) : (
              <p className="m-0 text-teks-lembut">Belum ada ketentuan.</p>
            )}
          </KartuBagian>

          {riwayatKontrak.length > 0 &&
            (banding ? (
              <KartuBagian id="riwayat" judul="Riwayat" keterangan={`Sampai ${labelVersi} dan sesudahnya`}>
                <div className="flex flex-col gap-6">
                  <section aria-labelledby="riwayat-sampai" className="flex flex-col gap-3">
                    <h3 id="riwayat-sampai" className="m-0 text-[15px] text-judul">
                      Sampai {labelVersi} berlaku ({riwayatSampaiVersi.length})
                    </h3>
                    <RiwayatKontrak daftar={riwayatSampaiVersi} pesanKosong="Belum ada catatan sampai versi ini." />
                  </section>
                  <section aria-labelledby="riwayat-sesudah" className="flex flex-col gap-3 border-t border-garis-lembut pt-5">
                    <h3 id="riwayat-sesudah" className="m-0 text-[15px] text-judul">
                      Sesudahnya sampai terbaru ({riwayatSesudahVersi.length})
                    </h3>
                    <RiwayatKontrak daftar={riwayatSesudahVersi} pesanKosong="Tidak ada perubahan sesudah versi ini." />
                  </section>
                </div>
              </KartuBagian>
            ) : (
              <KartuBagian id="riwayat" judul="Riwayat">
                <RiwayatKontrak daftar={riwayatKontrak} pesanKosong="Belum ada perubahan sejak kontrak dicatat." />
              </KartuBagian>
            ))}
        </div>

        {/* Kolom kanan: pilihan dokumen, unggah, dan pratinjau */}
        <div className="flex min-w-0 flex-col gap-5">
          <KartuBagian id="dokumen" judul="Dokumen" keterangan={`${kontrak.dokumen.length} file`}>
            <div className="mb-5 border-b border-garis-lembut pb-5">
              <DaftarDokumen
                daftar={kontrak.dokumen}
                terpilihId={dokumenTerpilih?.id}
                onPilih={setDokumenDilihat}
                onUnggah={(dokumen) => {
                  tambahDokumen(kontrak.id, dokumen)
                  setDokumenDilihat(dokumen.id)
                }}
              />
            </div>
            <PratinjauDokumen dokumen={dokumenTerpilih} />
          </KartuBagian>
        </div>
      </main>

      <DialogKonfirmasi
        terbuka={konfirmasiSelesai}
        judul="Tandai kontrak selesai?"
        pesan={`"${kontrak.nama}" akan ditutup dan pengingatnya berhenti. Akhir kontrak ${formatTanggal(kontrak.tanggalBerakhir)} (${teksJarakHari(kontrak.tanggalBerakhir)}).${
          selesaiMengubahAdendum ? ' Status adendum menjadi "Tidak diperpanjang".' : ''
        } Kalau salah tutup, kontrak bisa dibuka kembali.`}
        labelKonfirmasi="Tandai selesai"
        konfirmasiNonaktif={!keteranganSelesai.trim()}
        onKonfirmasi={() => {
          tandaiSelesai(kontrak.id, keteranganSelesai.trim())
          setKonfirmasiSelesai(false)
          tampilkanToast('Kontrak ditandai selesai.')
        }}
        onBatal={() => setKonfirmasiSelesai(false)}
      >
        <label htmlFor="isian-keterangan-selesai" className="text-[13px] font-semibold text-judul">
          Keterangan <span className="text-hapus-teks">*</span>
        </label>
        <textarea
          id="isian-keterangan-selesai"
          aria-describedby={keteranganSelesai.trim() ? undefined : 'petunjuk-keterangan-selesai'}
          value={keteranganSelesai}
          onChange={(e) => setKeteranganSelesai(e.target.value)}
          rows={3}
          placeholder="Contoh: Pekerjaan diterima lengkap, BAST sudah ditandatangani."
          className={`${KELAS_ISIAN} mt-1.5 py-2.5`}
        />
        {/* Tombol Tandai selesai mati sampai keterangan diisi; petunjuk ini menjelaskan kenapa (sama dengan dialog Nonaktifkan). */}
        {!keteranganSelesai.trim() && (
          <span id="petunjuk-keterangan-selesai" className="mt-1 block text-[12px] text-teks-lembut">
            Isi keterangan untuk melanjutkan.
          </span>
        )}
      </DialogKonfirmasi>

      <DialogKonfirmasi
        terbuka={konfirmasiBuka}
        judul="Buka kembali kontrak ini?"
        pesan={`"${kontrak.nama}" aktif lagi dan pengingatnya berjalan kembali sesuai akhir kontrak ${formatTanggal(kontrak.tanggalBerakhir)}.${
          kontrak.perpanjangan === 'tidak' ? ' Status adendum kembali menjadi "Belum diproses".' : ''
        } Langkah ini dicatat di riwayat.`}
        labelKonfirmasi="Buka kembali"
        onKonfirmasi={() => {
          bukaKembaliKontrak(kontrak.id)
          setKonfirmasiBuka(false)
          tampilkanToast('Kontrak dibuka kembali.')
        }}
        onBatal={() => setKonfirmasiBuka(false)}
      />

      <DialogKonfirmasi
        terbuka={konfirmasiHapus}
        judul="Hapus kontrak ini?"
        pesan={`"${kontrak.nama}" (${kontrak.nomorPks}) beserta semua dokumennya akan dihapus permanen. Tindakan ini tidak bisa dibatalkan, tapi tetap tercatat di riwayat perubahan.`}
        labelKonfirmasi="Hapus permanen"
        bahaya
        onKonfirmasi={hapus}
        onBatal={() => setKonfirmasiHapus(false)}
      />
      {/* Kalau dokumen lama sedang dibuka, versi datanya langsung terpilih di dialog (Hisyam 23 Nov 2026). */}
      <DialogUnduhExcel
        terbuka={unduhExcel}
        kontrakIni={kontrak}
        versiAwal={banding?.dokumenVersi.id}
        onTutup={() => setUnduhExcel(false)}
      />
    </>
  )
}

export default DetailKontrak
