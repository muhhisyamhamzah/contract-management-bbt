// Halaman Admin (hanya admin): akun pengguna dan riwayat perubahan.
// Admin bisa menambah akun, mereset kata sandi (kata sandi sementara tampil sekali), dan
// menonaktifkan / mengaktifkan akun. Hapus kontrak permanen, jadi tidak ada tab arsip.
// Akun yang keluar dinonaktifkan dulu dengan alasan (Hisyam 19 Nov 2026), lalu dilihat lewat filter "Nonaktif"
// lengkap dengan alasan, kapan, dan oleh siapa. Akun nonaktif boleh dihapus permanen; akun aktif tidak.
// Riwayat menyimpan nama sebagai teks, jadi jejak "siapa mengubah apa" tetap terbaca setelah akun dihapus.

import { useRef, useState, type KeyboardEvent } from 'react'
import BarisAkun from '../components/BarisAkun'
import ChipFilter from '../components/ChipFilter'
import DialogKonfirmasi from '../components/DialogKonfirmasi'
import DialogEmailNotifikasi from '../components/DialogEmailNotifikasi'
import DialogTambahAkun from '../components/DialogTambahAkun'
import KepalaHalaman from '../components/KepalaHalaman'
import Ikon from '../components/Ikon'
import KartuSandiSementara from '../components/KartuSandiSementara'
import RiwayatKontrak from '../components/RiwayatKontrak'
import { ALASAN_NONAKTIF } from '../lib/akun'
import { useData, usePengguna } from '../lib/data'
import { useJudulHalaman } from '../lib/judulHalaman'
import { KELAS_ISIAN, KELAS_KOTAK, KELAS_TOMBOL_UTAMA, KELAS_WADAH } from '../lib/tataLetak'
import { useToast } from '../lib/toast'
import type { Akun } from '../types/kontrak'

type Tab = 'akun' | 'riwayat'

const DAFTAR_TAB: { id: Tab; label: string }[] = [
  { id: 'akun', label: 'Akun pengguna' },
  { id: 'riwayat', label: 'Riwayat perubahan' },
]

type SaringAkun = 'semua' | 'aktif' | 'nonaktif'

const DAFTAR_SARING: { id: SaringAkun; label: string }[] = [
  { id: 'semua', label: 'Semua' },
  { id: 'aktif', label: 'Aktif' },
  { id: 'nonaktif', label: 'Nonaktif' },
]

type IsiKartuSandi = { nama: string; email: string; sandi: string; judul: string }

function Admin() {
  const pengguna = usePengguna()
  const { akun, riwayat, tambahAkun, resetSandi, ubahAktifAkun, hapusAkun } = useData()
  const tampilkanToast = useToast()

  const [tab, setTab] = useState<Tab>('akun')
  useJudulHalaman(tab === 'akun' ? 'Admin, akun pengguna' : 'Admin, riwayat perubahan')
  const tombolTab = useRef<(HTMLButtonElement | null)[]>([])
  const [dialogTambah, setDialogTambah] = useState(false)
  const [targetReset, setTargetReset] = useState<Akun | null>(null)
  const [targetNonaktif, setTargetNonaktif] = useState<Akun | null>(null)
  const [targetHapus, setTargetHapus] = useState<Akun | null>(null)
  const [targetEmail, setTargetEmail] = useState<Akun | null>(null)
  const [kartuSandi, setKartuSandi] = useState<IsiKartuSandi | null>(null)
  const [saring, setSaring] = useState<SaringAkun>('semua')
  const [alasanNonaktif, setAlasanNonaktif] = useState('')
  const [keteranganNonaktif, setKeteranganNonaktif] = useState('')

  const jumlahAktif = akun.filter((a) => a.aktif).length
  const jumlahSaring: Record<SaringAkun, number> = {
    semua: akun.length,
    aktif: jumlahAktif,
    nonaktif: akun.length - jumlahAktif,
  }
  const akunTampil = akun.filter((a) => saring === 'semua' || (saring === 'aktif' ? a.aktif : !a.aktif))

  /** Tombol panah kiri/kanan untuk berpindah tab (pola tab yang ramah keyboard). */
  function pindahTabDenganPanah(event: KeyboardEvent<HTMLButtonElement>, indeks: number) {
    if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return
    const arah = event.key === 'ArrowRight' ? 1 : -1
    const berikut = (indeks + arah + DAFTAR_TAB.length) % DAFTAR_TAB.length
    setTab(DAFTAR_TAB[berikut].id)
    tombolTab.current[berikut]?.focus()
  }

  return (
    <>
      <KepalaHalaman
        judul={tab === 'akun' ? 'Akun pengguna' : 'Riwayat perubahan'}
        keterangan={
          tab === 'akun'
            ? `${jumlahAktif} dari ${akun.length} akun aktif. Pegawai yang keluar atau pindah dinonaktifkan dulu dengan alasan; setelah itu akunnya bisa dihapus.`
            : 'Setiap perubahan pada kontrak dan akun: siapa, kapan, dan apa yang diubah.'
        }
        aksi={
          <button type="button" onClick={() => setDialogTambah(true)} className={KELAS_TOMBOL_UTAMA}>
            <Ikon nama="tambah" ukuran={18} tebal={2.5} />
            Tambah akun
          </button>
        }
      />

      <main id="konten" className={`${KELAS_WADAH} flex flex-col gap-5 pb-4`}>
        <div role="tablist" aria-label="Bagian admin" className="grid grid-cols-2 gap-1 rounded-full border border-garis bg-white p-1 md:w-[420px]">
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
                aria-controls={aktif ? `panel-${t.id}` : undefined}
                tabIndex={aktif ? 0 : -1}
                onClick={() => setTab(t.id)}
                onKeyDown={(event) => pindahTabDenganPanah(event, i)}
                className={`flex h-11 cursor-pointer items-center justify-center gap-2 rounded-full border-none text-[14px] font-semibold transition-[background-color,border-color,color] duration-150 motion-reduce:transition-none ${
                  aktif ? 'bg-galaxy-900 text-white' : 'bg-transparent text-teks hover:bg-latar'
                }`}
              >
                <Ikon nama={t.id === 'akun' ? 'pengguna' : 'riwayat'} ukuran={17} />
                {t.label}
              </button>
            )
          })}
        </div>

        <div role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`} className={`${KELAS_KOTAK} px-5 py-1 md:px-7`}>
          {tab === 'akun' ? (
            <>
              <div
                role="group"
                aria-label="Saring akun"
                className="flex flex-wrap gap-x-2 border-b border-garis-lembut py-3"
              >
                {DAFTAR_SARING.map((s) => (
                  <ChipFilter
                    key={s.id}
                    label={s.label}
                    jumlah={jumlahSaring[s.id]}
                    aktif={saring === s.id}
                    onPilih={() => setSaring(s.id)}
                  />
                ))}
              </div>
              {akunTampil.length === 0 && (
                <p className="m-0 py-6 text-teks-lembut">Tidak ada akun {saring === 'aktif' ? 'aktif' : 'nonaktif'}.</p>
              )}
              <ul className="m-0 list-none p-0">
                {akunTampil.map((a) => (
                  <BarisAkun
                    key={a.id}
                    akun={a}
                    diriSendiri={a.id === pengguna.id}
                    onResetSandi={() => setTargetReset(a)}
                    onHapus={() => setTargetHapus(a)}
                    onAturEmail={() => setTargetEmail(a)}
                    onUbahAktif={() => {
                      if (a.aktif) {
                        setAlasanNonaktif('')
                        setKeteranganNonaktif('')
                        setTargetNonaktif(a)
                      } else {
                        ubahAktifAkun(a.id, true)
                        tampilkanToast(`Akun ${a.nama} aktif lagi.`)
                      }
                    }}
                  />
                ))}
              </ul>
            </>
          ) : (
            <div className="pt-6">
              <RiwayatKontrak daftar={riwayat} />
            </div>
          )}
        </div>
      </main>

      <DialogEmailNotifikasi
        akun={targetEmail}
        diriSendiri={targetEmail?.id === pengguna.id}
        onTutup={() => setTargetEmail(null)}
      />
      <DialogTambahAkun
        terbuka={dialogTambah}
        onBatal={() => setDialogTambah(false)}
        onSimpan={(isi) => {
          const sandi = tambahAkun(isi)
          setDialogTambah(false)
          setKartuSandi({ ...isi, sandi, judul: 'Akun dibuat' })
        }}
      />

      <DialogKonfirmasi
        terbuka={targetReset !== null}
        judul="Reset kata sandi?"
        pesan={targetReset ? `Kata sandi lama ${targetReset.nama} tidak bisa dipakai lagi. Kata sandi sementara baru akan dibuat.` : ''}
        labelKonfirmasi="Reset sandi"
        onKonfirmasi={() => {
          if (targetReset) {
            const sandi = resetSandi(targetReset.id)
            setKartuSandi({ nama: targetReset.nama, email: targetReset.email, sandi, judul: 'Kata sandi direset' })
          }
          setTargetReset(null)
        }}
        onBatal={() => setTargetReset(null)}
      />

      <DialogKonfirmasi
        terbuka={targetNonaktif !== null}
        judul="Nonaktifkan akun?"
        pesan={
          targetNonaktif
            ? `${targetNonaktif.nama} tidak bisa masuk dan tidak menerima pengingat sampai akunnya diaktifkan lagi. Data kontrak tidak berubah.`
            : ''
        }
        labelKonfirmasi="Nonaktifkan"
        bahaya
        konfirmasiNonaktif={!alasanNonaktif}
        onKonfirmasi={() => {
          if (targetNonaktif && alasanNonaktif) {
            ubahAktifAkun(targetNonaktif.id, false, { alasan: alasanNonaktif, keterangan: keteranganNonaktif.trim() })
            tampilkanToast(`Akun ${targetNonaktif.nama} dinonaktifkan.`)
          }
          setTargetNonaktif(null)
        }}
        onBatal={() => setTargetNonaktif(null)}
      >
        {/* Alasan wajib, supaya admin lain tahu kenapa akun ini keluar (filter Nonaktif dan riwayat). */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="isian-alasan-nonaktif" className="text-[13px] font-semibold text-judul">
            Alasan <span className="text-hapus-teks">*</span>
          </label>
          <select
            id="isian-alasan-nonaktif"
            aria-describedby={alasanNonaktif ? undefined : 'petunjuk-alasan-nonaktif'}
            value={alasanNonaktif}
            onChange={(e) => setAlasanNonaktif(e.target.value)}
            className={`${KELAS_ISIAN} h-12`}
          >
            <option value="" disabled>
              Pilih alasan
            </option>
            {ALASAN_NONAKTIF.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
          {/* Tombol Nonaktifkan mati sampai alasan dipilih; petunjuk ini menjelaskan kenapa (impeccable clarify). */}
          {!alasanNonaktif && (
            <span id="petunjuk-alasan-nonaktif" className="text-[12px] text-teks-lembut">
              Pilih alasan untuk melanjutkan.
            </span>
          )}
        </div>
        <div className="mt-3 flex flex-col gap-1.5">
          <label htmlFor="isian-keterangan-nonaktif" className="text-[13px] font-semibold text-judul">
            Keterangan
          </label>
          <textarea
            id="isian-keterangan-nonaktif"
            rows={2}
            value={keteranganNonaktif}
            onChange={(e) => setKeteranganNonaktif(e.target.value)}
            className={`${KELAS_ISIAN} py-2.5`}
          />
        </div>
      </DialogKonfirmasi>

      <DialogKonfirmasi
        terbuka={targetHapus !== null}
        judul="Hapus akun ini?"
        pesan={
          targetHapus
            ? `Akun ${targetHapus.nama} (${targetHapus.email}) dihapus permanen dan tidak bisa dipulihkan. Kalau orang ini kembali, buat akun baru. Nama ${targetHapus.nama} di riwayat perubahan tetap tercatat.`
            : ''
        }
        labelKonfirmasi="Hapus permanen"
        bahaya
        onKonfirmasi={() => {
          if (targetHapus) {
            hapusAkun(targetHapus.id)
            tampilkanToast(`Akun ${targetHapus.nama} dihapus.`)
          }
          setTargetHapus(null)
        }}
        onBatal={() => setTargetHapus(null)}
      />

      <KartuSandiSementara isi={kartuSandi} onTutup={() => setKartuSandi(null)} />
    </>
  )
}

export default Admin
