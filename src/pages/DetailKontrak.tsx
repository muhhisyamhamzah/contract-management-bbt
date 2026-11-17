// Halaman detail satu kontrak. Alamatnya /kontrak/:id, misalnya /kontrak/5.
// Isi: header (kembali, status, nama, penyedia, tombol Ubah dan Tandai selesai, menu hapus),
// data kontrak + jadwal pengingat, critical point, dokumen PDF, monitoring dan catatan, riwayat perubahan.

import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import BadgeStatus from '../components/BadgeStatus'
import DaftarCriticalPoint from '../components/DaftarCriticalPoint'
import DaftarDokumen from '../components/DaftarDokumen'
import DialogKonfirmasi from '../components/DialogKonfirmasi'
import KepalaHalaman from '../components/KepalaHalaman'
import Ikon from '../components/Ikon'
import JadwalPengingat from '../components/JadwalPengingat'
import KartuBagian from '../components/KartuBagian'
import KeadaanKosong from '../components/KeadaanKosong'
import MenuDropdown from '../components/MenuDropdown'
import RiwayatKontrak from '../components/RiwayatKontrak'
import { useData } from '../lib/data'
import { formatPeriode, formatRupiah, formatTanggal } from '../lib/format'
import { useKembali } from '../lib/navigasi'
import { hitungStatus, teksJarakHari, teksSisaHari } from '../lib/status'
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
  const { kontrak: semua, riwayat, hapusKontrak, tandaiSelesai, tandaiCriticalSelesai, tambahDokumen } = useData()
  // Kalau halaman dibuka langsung lewat alamat, tombol Kembali menuju daftar kontrak.
  const kembali = useKembali('/kontrak')

  const [konfirmasiHapus, setKonfirmasiHapus] = useState(false)
  const [konfirmasiSelesai, setKonfirmasiSelesai] = useState(false)
  const [keteranganSelesai, setKeteranganSelesai] = useState('')

  const kontrak = semua.find((k) => k.id === id)

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
  const riwayatKontrak = riwayat.filter((r) => r.kontrakId === kontrak.id)
  const criticalAktif = kontrak.criticalPoint.filter((b) => b.status === 'aktif').length

  const dataKontrak: [string, string][] = [
    ['Nomor PKS', kontrak.nomorPks],
    ['Tanggal PKS', formatTanggal(kontrak.tanggalPks)],
    ['Nilai kontrak', formatRupiah(kontrak.nilai)],
    ['Awal kontrak', formatTanggal(kontrak.tanggalMulai)],
    ['Akhir kontrak', formatTanggal(kontrak.tanggalBerakhir)],
    ['Periode', formatPeriode(kontrak.tanggalMulai, kontrak.tanggalBerakhir)],
  ]

  const catatan: [string, string][] = [
    ['Monitoring', kontrak.monitoring],
    ['Catatan', kontrak.catatan],
    ['Keterangan', kontrak.keterangan],
  ]

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
          <>
            <Link to={`/kontrak/${kontrak.id}/ubah`} className={KELAS_TOMBOL_KEDUA}>
              <Ikon nama="pensil" ukuran={17} />
              Ubah
            </Link>
            {!sudahSelesai && (
              <button
                type="button"
                onClick={() => {
                  setKeteranganSelesai('')
                  setKonfirmasiSelesai(true)
                }}
                className={KELAS_TOMBOL_UTAMA}
              >
                <Ikon nama="centang" ukuran={17} tebal={2.5} />
                Tandai selesai
              </button>
            )}
            <MenuDropdown
              labelTombol="Menu lainnya"
              isiTombol={<Ikon nama="titikTiga" />}
              kelasTombol="flex size-11 cursor-pointer items-center justify-center rounded-full border border-garis-input bg-white text-judul hover:bg-latar"
              lebar={230}
              item={[
                { label: 'Unduh semua dokumen', onPilih: () => tampilkanToast('Dokumen diunduh (contoh)') },
                { label: 'Hapus kontrak', bahaya: true, onPilih: () => setKonfirmasiHapus(true) },
              ]}
            />
          </>
        }
      />

      <main id="konten" className={`${KELAS_WADAH} grid gap-5 pb-4 lg:grid-cols-[minmax(0,1fr)_330px]`}>
        <div className="flex min-w-0 flex-col gap-5">
          {sudahSelesai && (
            <div role="status" className="flex gap-3 rounded-[20px] bg-selesai-latar p-4 text-selesai-teks">
              <Ikon nama="centangLingkaran" ukuran={20} className="flex-none" />
              <span>
                <strong>Kontrak sudah ditandai selesai.</strong> Pengingat untuk kontrak ini sudah berhenti.
                {kontrak.keteranganSelesai && <> Keterangan: {kontrak.keteranganSelesai}</>}
              </span>
            </div>
          )}
          {(status === 'lewat' || status === 'segera') && (
            <div
              role="status"
              className={`flex gap-3 rounded-[20px] p-4 ${status === 'lewat' ? 'bg-lewat-latar text-lewat-teks' : 'bg-segera-latar text-segera-teks'}`}
            >
              <Ikon nama="info" ukuran={20} className="flex-none" />
              <span>
                <strong>Perlu keputusan.</strong> Perpanjang lewat adendum, atau tandai selesai kalau tidak dilanjutkan.
              </span>
            </div>
          )}

          <KartuBagian id="data-kontrak" judul="Data kontrak">
            <dl className="m-0 grid grid-cols-2 gap-x-6 gap-y-4 md:grid-cols-3">
              {dataKontrak.map(([label, nilai]) => (
                <div key={label} className="flex flex-col gap-0.5">
                  <dt className="text-[13px] text-teks-lembut">{label}</dt>
                  <dd className="m-0 text-[15px] font-semibold text-judul">{nilai}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-6 border-t border-garis-lembut pt-5">
              <h3 className="m-0 text-[15px] font-semibold text-judul">Jadwal pengingat</h3>
              <p className="m-0 mt-0.5 mb-3 text-[13px] text-teks-lembut">Dikirim ke seluruh tim pengadaan dan kepala divisi umum.</p>
              {sudahSelesai ? (
                <p className="m-0 text-teks-lembut">Pengingat berhenti karena kontrak sudah selesai.</p>
              ) : (
                <JadwalPengingat kontrak={kontrak} />
              )}
            </div>
          </KartuBagian>

          <KartuBagian
            id="critical-point"
            judul="Critical point"
            keterangan={kontrak.criticalPoint.length > 0 ? `${criticalAktif} aktif` : undefined}
            aksi={
              <Link to={`/kontrak/${kontrak.id}/ubah#critical-point`} className={KELAS_TAUTAN_AKSI}>
                <Ikon nama="tambah" ukuran={15} tebal={2.5} /> Tambah
              </Link>
            }
          >
            <DaftarCriticalPoint
              daftar={kontrak.criticalPoint}
              onTandaiSelesai={(butirId, penanganan) => {
                tandaiCriticalSelesai(kontrak.id, butirId, penanganan)
                tampilkanToast('Critical point ditandai selesai.')
              }}
            />
          </KartuBagian>

          <KartuBagian id="dokumen" judul="Dokumen PDF" keterangan={`${kontrak.dokumen.length} file`}>
            <DaftarDokumen daftar={kontrak.dokumen} onUnggah={(dokumen) => tambahDokumen(kontrak.id, dokumen)} />
          </KartuBagian>
        </div>

        <div className="flex min-w-0 flex-col gap-5">
          <KartuBagian id="monitoring" judul="Monitoring dan catatan">
            <dl className="m-0 flex flex-col gap-4">
              {catatan.map(([label, nilai]) => (
                <div key={label} className="flex flex-col gap-0.5">
                  <dt className="text-[13px] text-teks-lembut">{label}</dt>
                  <dd className={`m-0 leading-relaxed ${nilai ? 'font-semibold text-judul' : 'text-teks-lembut'}`}>
                    {nilai || 'Belum diisi'}
                  </dd>
                </div>
              ))}
            </dl>
          </KartuBagian>

          <KartuBagian id="riwayat" judul="Riwayat">
            <RiwayatKontrak daftar={riwayatKontrak} pesanKosong="Belum ada perubahan sejak kontrak dicatat." />
          </KartuBagian>
        </div>
      </main>

      <DialogKonfirmasi
        terbuka={konfirmasiSelesai}
        judul="Tandai kontrak selesai?"
        pesan={`"${kontrak.nama}" akan ditutup dan pengingatnya berhenti. Akhir kontrak ${formatTanggal(kontrak.tanggalBerakhir)} (${teksJarakHari(kontrak.tanggalBerakhir)}).`}
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
          value={keteranganSelesai}
          onChange={(e) => setKeteranganSelesai(e.target.value)}
          rows={3}
          placeholder="Contoh: Pekerjaan diterima lengkap, BAST sudah ditandatangani."
          className={`${KELAS_ISIAN} mt-1.5 py-2.5`}
        />
      </DialogKonfirmasi>

      <DialogKonfirmasi
        terbuka={konfirmasiHapus}
        judul="Hapus kontrak ini?"
        pesan={`"${kontrak.nama}" (${kontrak.nomorPks}) beserta dokumen dan critical point-nya akan dihapus permanen. Tindakan ini tidak bisa dibatalkan, tapi tetap tercatat di riwayat perubahan.`}
        labelKonfirmasi="Hapus permanen"
        bahaya
        onKonfirmasi={hapus}
        onBatal={() => setKonfirmasiHapus(false)}
      />
    </>
  )
}

export default DetailKontrak
