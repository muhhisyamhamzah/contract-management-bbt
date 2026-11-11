// Halaman detail satu kontrak. Alamatnya /kontrak/:id, misalnya /kontrak/1.
// Isi: header navy (tombol kembali, menu titik tiga, cincin sisa hari, judul, garis masa kontrak),
// tab Ringkasan / Dokumen / Riwayat, dan tombol bawah "Tandai selesai" dan "Perpanjang".

import { useRef, useState, type KeyboardEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import BadgeStatus from '../components/BadgeStatus'
import CincinHari from '../components/CincinHari'
import DaftarDokumen from '../components/DaftarDokumen'
import DialogKonfirmasi from '../components/DialogKonfirmasi'
import HeaderGelombang from '../components/HeaderGelombang'
import Ikon from '../components/Ikon'
import MenuDropdown from '../components/MenuDropdown'
import RingkasanKontrak from '../components/RingkasanKontrak'
import RiwayatKontrak from '../components/RiwayatKontrak'
import { kontrakContoh } from '../data/kontrakContoh'
import { formatTanggalSingkat } from '../lib/format'
import { useKembali } from '../lib/navigasi'
import { hitungProgres, hitungStatus, TAMPILAN_STATUS } from '../lib/status'
import { useToast } from '../lib/toast'

type Tab = 'ringkasan' | 'dokumen' | 'riwayat'

const DAFTAR_TAB: { id: Tab; label: string }[] = [
  { id: 'ringkasan', label: 'Ringkasan' },
  { id: 'dokumen', label: 'Dokumen' },
  { id: 'riwayat', label: 'Riwayat' },
]

function DetailKontrak() {
  const { id } = useParams()
  const navigate = useNavigate()
  const tampilkanToast = useToast()
  // Kalau halaman dibuka langsung lewat alamat, tombol Kembali menuju daftar kontrak.
  const kembali = useKembali('/kontrak')

  const [tab, setTab] = useState<Tab>('ringkasan')
  const [konfirmasiHapus, setKonfirmasiHapus] = useState(false)
  const tombolTab = useRef<(HTMLButtonElement | null)[]>([])

  const kontrak = kontrakContoh.find((k) => k.id === id)

  if (!kontrak) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-2 px-8 text-center text-teks-lembut">
        <span className="font-semibold text-judul">Kontrak tidak ditemukan</span>
        <span>Mungkin sudah dihapus atau alamatnya salah.</span>
        <Link to="/kontrak" className="mt-2 font-semibold">
          Kembali ke daftar kontrak
        </Link>
      </div>
    )
  }

  const status = hitungStatus(kontrak)
  const tampilan = TAMPILAN_STATUS[status]
  const progres = hitungProgres(kontrak)
  const sudahSelesai = status === 'selesai'

  /** Tombol panah kiri/kanan untuk berpindah tab (pola tab yang ramah keyboard). */
  function pindahTabDenganPanah(event: KeyboardEvent<HTMLButtonElement>, indeks: number) {
    if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return
    const arah = event.key === 'ArrowRight' ? 1 : -1
    const berikut = (indeks + arah + DAFTAR_TAB.length) % DAFTAR_TAB.length
    setTab(DAFTAR_TAB[berikut].id)
    tombolTab.current[berikut]?.focus()
  }

  function hapusKontrak() {
    setKonfirmasiHapus(false)
    // Belum ada backend: data contoh tidak benar-benar dihapus.
    tampilkanToast('Kontrak dihapus (contoh)')
    navigate('/kontrak', { replace: true })
  }

  return (
    <>
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
        <HeaderGelombang kelasBawah="pb-12">
          <div className="flex flex-col gap-[18px]">
            {/* Baris atas: kembali, judul, menu */}
            <div className="-mt-1.5 flex items-center justify-between">
              <button
                type="button"
                aria-label="Kembali"
                onClick={kembali}
                className="flex size-11 cursor-pointer items-center justify-center rounded-[14px] border-none bg-white/14 text-white"
              >
                <Ikon nama="kiri" />
              </button>
              <span className="font-semibold">Detail kontrak</span>
              <MenuDropdown
                labelTombol="Menu lainnya"
                isiTombol={<Ikon nama="titikTiga" />}
                kelasTombol="flex size-11 cursor-pointer items-center justify-center rounded-[14px] border-none bg-white/14 text-white"
                lebar={220}
                bayanganTebal
                item={[
                  { label: 'Edit data kontrak', onPilih: () => tampilkanToast('Membuka form edit') },
                  { label: 'Unduh semua dokumen', onPilih: () => tampilkanToast('Dokumen diunduh (contoh)') },
                  { label: 'Hapus kontrak', bahaya: true, onPilih: () => setKonfirmasiHapus(true) },
                ]}
              />
            </div>

            {/* Cincin sisa hari + status, judul, nomor */}
            <div className="flex items-center gap-4">
              <CincinHari kontrak={kontrak} />
              <div className="flex min-w-0 flex-1 flex-col items-start gap-1.5">
                <BadgeStatus status={status} />
                <h1 className="m-0 text-[18px] leading-snug font-bold">{kontrak.judul}</h1>
                <span className="text-[12px] text-white/70">{kontrak.nomor}</span>
              </div>
            </div>

            {/* Garis masa kontrak: mulai sampai berakhir */}
            <div className="flex flex-col gap-2">
              <div
                role="progressbar"
                aria-label="Masa kontrak yang sudah berjalan"
                aria-valuenow={progres}
                aria-valuemin={0}
                aria-valuemax={100}
                className="h-1.5 rounded-full bg-white/15"
              >
                <div className={`h-1.5 rounded-full ${tampilan.kelasBarHeader}`} style={{ width: `${progres}%` }} />
              </div>
              <div className="flex justify-between text-[12px] text-white/70">
                <span>Mulai {formatTanggalSingkat(kontrak.tanggalMulai)}</span>
                <span>Berakhir {formatTanggalSingkat(kontrak.tanggalBerakhir)}</span>
              </div>
            </div>
          </div>
        </HeaderGelombang>

        {/* Tab */}
        <div
          role="tablist"
          aria-label="Bagian detail kontrak"
          className="mx-5 mt-2 grid flex-none grid-cols-3 gap-1 rounded-[14px] bg-latar-tab p-1"
        >
          {DAFTAR_TAB.map((t, i) => {
            const aktif = tab === t.id
            return (
              <button
                key={t.id}
                ref={(el) => {
                  tombolTab.current[i] = el
                }}
                type="button"
                role="tab"
                id={`tab-${t.id}`}
                aria-selected={aktif}
                aria-controls={`panel-${t.id}`}
                tabIndex={aktif ? 0 : -1}
                onClick={() => setTab(t.id)}
                onKeyDown={(event) => pindahTabDenganPanah(event, i)}
                className={`h-10 cursor-pointer rounded-[11px] border-none text-[13px] font-semibold ${
                  aktif ? 'bg-white text-judul shadow-tab' : 'bg-transparent text-teks-lembut'
                }`}
              >
                {t.label}
              </button>
            )
          })}
        </div>

        <div
          role="tabpanel"
          id={`panel-${tab}`}
          aria-labelledby={`tab-${tab}`}
          className="flex flex-col gap-3.5 px-5 pt-4 pb-6"
        >
          {tab === 'ringkasan' && <RingkasanKontrak kontrak={kontrak} />}
          {tab === 'dokumen' && <DaftarDokumen kontrak={kontrak} />}
          {tab === 'riwayat' && <RiwayatKontrak kontrak={kontrak} />}
        </div>
      </div>

      {/* Tombol bawah */}
      <div className="grid flex-none grid-cols-2 gap-2.5 border-t border-garis bg-white px-5 pt-3 pb-[max(26px,env(safe-area-inset-bottom))]">
        <button
          type="button"
          disabled={sudahSelesai}
          onClick={() => tampilkanToast('Kontrak ditandai selesai (contoh)')}
          className="h-[50px] cursor-pointer rounded-[14px] border border-garis bg-white font-semibold text-judul disabled:cursor-not-allowed disabled:text-teks-lembut"
        >
          {sudahSelesai ? 'Sudah selesai' : 'Tandai selesai'}
        </button>
        <button
          type="button"
          onClick={() => tampilkanToast('Membuka form perpanjangan (adendum)')}
          className="h-[50px] cursor-pointer rounded-[14px] border-none bg-linear-135 from-galaxy-900 to-galaxy-700 font-semibold text-white shadow-tombol-tambah"
        >
          Perpanjang
        </button>
      </div>

      <DialogKonfirmasi
        terbuka={konfirmasiHapus}
        judul="Hapus kontrak ini?"
        pesan={`"${kontrak.judul}" beserta dokumen dan riwayatnya akan dihapus. Tindakan ini tidak bisa dibatalkan.`}
        labelKonfirmasi="Hapus"
        bahaya
        onKonfirmasi={hapusKontrak}
        onBatal={() => setKonfirmasiHapus(false)}
      />
    </>
  )
}

export default DetailKontrak
